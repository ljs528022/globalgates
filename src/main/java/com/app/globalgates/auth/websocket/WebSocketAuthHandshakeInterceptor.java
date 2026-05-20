package com.app.globalgates.auth.websocket;

import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.repository.MemberDAO;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;
import java.util.Optional;

/**
 * SockJS handshake 시점에 JWT 쿠키를 검증해서 memberId/email을 session attribute에 심는다.
 * 검증 실패 시 handshake 자체를 거부.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthHandshakeInterceptor implements HandshakeInterceptor {

    public static final String ATTR_MEMBER_ID = "memberId";
    public static final String ATTR_MEMBER_LOGIN_INFO = "loginId";

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberDAO memberDAO;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {
        if (!(request instanceof ServletServerHttpRequest servletReq)) {
            return false;
        }
        HttpServletRequest httpReq = servletReq.getServletRequest();
        String token = readAccessToken(httpReq);
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            log.warn("[WS Handshake] 거부: 유효한 accessToken 쿠키 없음");
            return false;
        }
        String loginInfo = jwtTokenProvider.getUsername(token);
        Optional<MemberDTO> member = memberDAO.findMemberByLoginId(loginInfo);
        if (member.isEmpty()) {
            log.warn("[WS Handshake] 거부: loginInfo={} 회원 미존재", loginInfo);
            return false;
        }
        attributes.put(ATTR_MEMBER_ID, member.get().getId());
        attributes.put(ATTR_MEMBER_LOGIN_INFO, loginInfo);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // no-op
    }

    private String readAccessToken(HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if ("accessToken".equals(c.getName())) return c.getValue();
        }
        return null;
    }
}
