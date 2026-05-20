package com.app.globalgates.auth.websocket;

import com.app.globalgates.repository.chat.ChatRoomDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * STOMP CONNECT/SUBSCRIBE 단계에서 인증/권한을 강제한다.
 *
 *  - CONNECT  : handshake 단계에서 attr에 심어진 memberId가 없으면 거부, 있으면 Principal 등록
 *  - SUBSCRIBE: destination 별로 허용 규칙 검사
 *      /topic/room.{N}{,.read,.reaction}    -> 회원이 방의 참여자여야 함
 *      /topic/user.{N}.restore              -> N == 인증된 memberId
 *      /topic/video-call.{N}                -> N == 인증된 memberId
 *      그 외 토픽                            -> 거부
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    private static final Pattern ROOM_TOPIC =
            Pattern.compile("^/topic/room\\.(\\d+)(?:\\.(read|reaction|screenshot-attempt|disappear))?$");
    private static final Pattern USER_RESTORE_TOPIC =
            Pattern.compile("^/topic/user\\.(\\d+)\\.restore$");
    private static final Pattern VIDEO_CALL_TOPIC =
            Pattern.compile("^/topic/video-call\\.(\\d+)$");

    private final ChatRoomDAO chatRoomDAO;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();
        if (command == null) return message;

        Long memberId = readMemberId(accessor);

        if (StompCommand.CONNECT.equals(command)) {
            if (memberId == null) {
                throw new MessagingException("WebSocket 인증 실패: memberId 미설정");
            }
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    memberId.toString(), null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
            accessor.setUser(auth);
            return message;
        }

        if (StompCommand.SUBSCRIBE.equals(command)) {
            if (memberId == null) {
                throw new MessagingException("WebSocket 구독 거부: 미인증 세션");
            }
            String destination = accessor.getDestination();
            if (destination == null || !isAllowedSubscription(destination, memberId)) {
                log.warn("[WS Subscribe] 거부: memberId={}, dest={}", memberId, destination);
                throw new MessagingException("구독 권한 없음: " + destination);
            }
        }

        return message;
    }

    private Long readMemberId(StompHeaderAccessor accessor) {
        Map<String, Object> attrs = accessor.getSessionAttributes();
        if (attrs == null) return null;
        Object v = attrs.get(WebSocketAuthHandshakeInterceptor.ATTR_MEMBER_ID);
        if (v instanceof Number n) return n.longValue();
        return null;
    }

    private boolean isAllowedSubscription(String destination, Long memberId) {
        Matcher m;

        m = ROOM_TOPIC.matcher(destination);
        if (m.matches()) {
            Long conversationId = Long.parseLong(m.group(1));
            return chatRoomDAO.isMember(conversationId, memberId);
        }

        m = USER_RESTORE_TOPIC.matcher(destination);
        if (m.matches()) {
            Long ownerId = Long.parseLong(m.group(1));
            return ownerId.equals(memberId);
        }

        m = VIDEO_CALL_TOPIC.matcher(destination);
        if (m.matches()) {
            Long ownerId = Long.parseLong(m.group(1));
            return ownerId.equals(memberId);
        }

        return false;
    }
}
