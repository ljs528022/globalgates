package com.app.globalgates.mapper.chat;

import com.app.globalgates.dto.chat.ChatRoomDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Mapper
public interface ChatRoomMapper {
//    회원이 대화방 참여자인지 확인 (WebSocket 구독 권한 검증용)
    boolean selectIsMember(@Param("conversationId") Long conversationId,
                           @Param("memberId") Long memberId);
//    채팅방 목록 조회 (조인 결과 -> DTO)
    List<ChatRoomDTO> selectAllByMemberId(@Param("memberId") Long memberId);
//    두 회원 간 기존 채팅방 조회
    Optional<ChatRoomDTO> selectByMembers(@Param("senderId") Long senderId, @Param("invitedId") Long invitedId);
//    채팅방 생성
    void insertConversation(ChatRoomDTO chatRoomDTO);
//    채팅방 회원 관계 생성
    void insertConversationMemberRel(@Param("conversationId") Long conversationId,
                                      @Param("senderId") Long senderId,
                                      @Param("invitedId") Long invitedId);
//    채팅방 설정 생성
    void insertSetting(@Param("conversationId") Long conversationId,
                       @Param("memberId") Long memberId);
//    상대방 정보 조회 (조인 결과 -> DTO)
    Optional<ChatRoomDTO> selectPartnerByConversation(@Param("conversationId") Long conversationId,
                                                      @Param("memberId") Long memberId);
//    마지막 메시지 ID 조회
    Long selectLastMessageId(@Param("conversationId") Long conversationId);
//    읽음 처리
    void upsertLastReadMessageId(@Param("conversationId") Long conversationId,
                                 @Param("memberId") Long memberId,
                                 @Param("lastReadMessageId") Long lastReadMessageId);
//    별칭 수정
    void updateAlias(@Param("conversationId") Long conversationId,
                     @Param("memberId") Long memberId,
                     @Param("alias") String alias);
//    스크린샷 차단 상태 수정
    void updateScreenBlocked(@Param("conversationId") Long conversationId,
                             @Param("memberId") Long memberId,
                             @Param("blocked") boolean blocked);
//    스크린샷 차단 상태 조회
    boolean selectScreenBlocked(@Param("conversationId") Long conversationId,
                                @Param("memberId") Long memberId);
//    대화방 soft delete
    void softDeleteConversation(@Param("conversationId") Long conversationId,
                                @Param("memberId") Long memberId);
//    대화방 복원 (특정 회원)
    void restoreConversation(@Param("conversationId") Long conversationId,
                              @Param("memberId") Long memberId);
//    삭제 상태인 멤버 ID 목록 조회
    List<Long> selectDeletedMemberIds(@Param("conversationId") Long conversationId);
//    대화방 복원 (전체 참여자)
    void restoreAllMembers(@Param("conversationId") Long conversationId);
//    차단 시점 메시지 ID 저장
    void updateBlockedAfterMessageId(@Param("conversationId") Long conversationId,
                                      @Param("memberId") Long memberId,
                                      @Param("messageId") Long messageId);
//    차단 해제 시점 메시지 ID 저장
    void updateBlockReleasedMessageId(@Param("conversationId") Long conversationId,
                                       @Param("memberId") Long memberId,
                                       @Param("messageId") Long messageId);
//    사라진 메시지 설정 변경
    void updateDisappearMessage(@Param("conversationId") Long conversationId,
                                @Param("memberId") Long memberId,
                                @Param("setting") String setting);
//    사라진 메시지 설정 조회
    Map<String, Object> selectDisappearMessage(@Param("conversationId") Long conversationId,
                                               @Param("memberId") Long memberId);
}
