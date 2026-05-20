package com.app.globalgates.repository.chat;

import com.app.globalgates.dto.chat.ChatMessageDTO;
import com.app.globalgates.mapper.chat.ChatMessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class ChatMessageDAO {
    private final ChatMessageMapper chatMessageMapper;

//    메시지 저장 (insert 후 DTO에 id 반환)
    public ChatMessageDTO save(ChatMessageDTO chatMessageDTO) {
        chatMessageMapper.insert(chatMessageDTO);
        return chatMessageDTO;
    }

//    대화 내역 조회
    public List<ChatMessageDTO> findAllByConversationId(Long conversationId, Long memberId) {
        return chatMessageMapper.selectAllByConversationId(conversationId, memberId);
    }

//    대화 내역 조회 (커서 기반 페이징)
    public List<ChatMessageDTO> findByConversationIdWithCursor(Long conversationId, Long memberId, Long cursor, int pageSize) {
        return chatMessageMapper.selectByConversationIdWithCursor(conversationId, memberId, cursor, pageSize);
    }

//    내 계정에서만 메시지 삭제
    public void softDeleteForMember(Long messageId, Long memberId) {
        chatMessageMapper.softDeleteForMember(messageId, memberId);
    }

//    사라진 메시지 설정이 활성화된 대화방 조회
    public List<Map<String, Object>> findActiveDisappearSettings() {
        return chatMessageMapper.selectActiveDisappearSettings();
    }

//    윈도우 [activatedAt, expiresAt] 메시지 일괄 soft delete
    public int softDeleteWindowedMessages(Long conversationId,
                                          java.time.LocalDateTime activatedAt,
                                          java.time.LocalDateTime expiresAt) {
        return chatMessageMapper.softDeleteWindowedMessages(conversationId, activatedAt, expiresAt);
    }

//    만료된 disappear 설정 자동 비활성화
    public void resetDisappearSetting(Long conversationId, Long memberId) {
        chatMessageMapper.resetDisappearSetting(conversationId, memberId);
    }
}
