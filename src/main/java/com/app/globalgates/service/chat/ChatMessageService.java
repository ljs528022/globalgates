package com.app.globalgates.service.chat;

import com.app.globalgates.dto.chat.ChatMessageDTO;
import com.app.globalgates.repository.chat.ChatMessageDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageService {
    private final ChatMessageDAO chatMessageDAO;

    private static final int DEFAULT_PAGE_SIZE = 50;

//    대화 내역 조회 (전체 - 하위 호환)
    public List<ChatMessageDTO> getMessages(Long conversationId, Long memberId) {
        log.info("대화 내역 조회 - conversationId: {}, memberId: {}", conversationId, memberId);
        return chatMessageDAO.findAllByConversationId(conversationId, memberId);
    }

//    대화 내역 조회 (커서 기반 페이징)
    public Map<String, Object> getMessagesWithCursor(Long conversationId, Long memberId, Long cursor, Integer pageSize) {
        int size = (pageSize != null && pageSize >= 1 && pageSize <= 100) ? pageSize : DEFAULT_PAGE_SIZE;
        log.info("[채팅 조회] conversationId: {}, memberId: {}, cursor: {}, pageSize: {}", conversationId, memberId, cursor, size);
        List<ChatMessageDTO> messages = chatMessageDAO.findByConversationIdWithCursor(conversationId, memberId, cursor, size + 1);

        boolean hasMore = messages.size() > size;
        if (hasMore) {
            messages = messages.subList(0, size);
        }
        log.info("[채팅 조회 결과] {}건 반환, hasMore: {}", messages.size(), hasMore);

        Map<String, Object> result = new HashMap<>();
        result.put("messages", messages);
        result.put("hasMore", hasMore);
        return result;
    }

//    내 계정에서만 메시지 삭제
    public void deleteMessageForMember(Long messageId, Long memberId) {
        log.info("[채팅 삭제] messageId: {}, memberId: {}", messageId, memberId);
        chatMessageDAO.softDeleteForMember(messageId, memberId);
    }
}
