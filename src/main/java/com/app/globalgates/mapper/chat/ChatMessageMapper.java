package com.app.globalgates.mapper.chat;

import com.app.globalgates.dto.chat.ChatMessageDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ChatMessageMapper {
//    메시지 저장
    void insert(ChatMessageDTO chatMessageDTO);
//    대화 내역 조회 (조인 결과 -> DTO)
    List<ChatMessageDTO> selectAllByConversationId(@Param("conversationId") Long conversationId,
                                                    @Param("memberId") Long memberId);
//    대화 내역 조회 (커서 기반 페이징)
    List<ChatMessageDTO> selectByConversationIdWithCursor(@Param("conversationId") Long conversationId,
                                                          @Param("memberId") Long memberId,
                                                          @Param("cursor") Long cursor,
                                                          @Param("pageSize") int pageSize);
//    내 계정에서만 메시지 삭제
    void softDeleteForMember(@Param("messageId") Long messageId, @Param("memberId") Long memberId);
//    사라진 메시지 활성 설정 조회 (member별 row, activated_at 포함)
    List<Map<String, Object>> selectActiveDisappearSettings();
//    윈도우 [activatedAt, expiresAt] 메시지 일괄 soft delete
    int softDeleteWindowedMessages(@Param("conversationId") Long conversationId,
                                   @Param("activatedAt") java.time.LocalDateTime activatedAt,
                                   @Param("expiresAt") java.time.LocalDateTime expiresAt);
//    만료된 disappear 설정 자동 비활성화
    void resetDisappearSetting(@Param("conversationId") Long conversationId,
                                @Param("memberId") Long memberId);
}
