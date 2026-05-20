package com.app.globalgates.service.chat;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.dto.chat.ChatReadReceiptDTO;
import com.app.globalgates.dto.chat.ChatRoomDTO;
import com.app.globalgates.repository.chat.ChatRoomDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRoomService {
    private final ChatRoomDAO chatRoomDAO;

//    채팅방 목록 조회
    public List<ChatRoomDTO> getRooms(Long memberId) {
        return chatRoomDAO.findAllByMemberId(memberId);
    }

//    회원이 채팅방 참여자인지 확인
    public boolean isMember(Long conversationId, Long memberId) {
        return chatRoomDAO.isMember(conversationId, memberId);
    }

//    채팅방 생성 또는 기존 방 반환
    @Transactional
    @LogStatusWithReturn
    public ChatRoomDTO createOrGetRoom(String title, Long senderId, Long invitedId) {
        Optional<ChatRoomDTO> existing = chatRoomDAO.findByMembers(senderId, invitedId);
        if (existing.isPresent()) {
            Long roomId = existing.get().getId();
            chatRoomDAO.saveSetting(roomId, senderId);
            chatRoomDAO.saveSetting(roomId, invitedId);
            chatRoomDAO.restoreConversation(roomId, senderId);
            log.info("기존 채팅방 반환: {}", roomId);
            return existing.get();
        }

        ChatRoomDTO param = ChatRoomDTO.builder().title(title).build();
        ChatRoomDTO newRoom = chatRoomDAO.saveConversation(param);
        log.info("새 채팅방 생성: {}", newRoom.getId());

        chatRoomDAO.saveConversationMemberRel(newRoom.getId(), senderId, invitedId);
        chatRoomDAO.saveSetting(newRoom.getId(), senderId);
        chatRoomDAO.saveSetting(newRoom.getId(), invitedId);

        return newRoom;
    }

//    상대방 정보 조회
    public Optional<ChatRoomDTO> getPartner(Long conversationId, Long memberId) {
        return chatRoomDAO.findPartnerByConversation(conversationId, memberId);
    }

//    채팅방 활성화
    @Transactional
    public void activateRoom(Long conversationId, Long memberId) {
        assertMember(conversationId, memberId);
        chatRoomDAO.saveSetting(conversationId, memberId);
    }

//    읽음 처리 + read receipt 반환 (WebSocket 브로드캐스트용)
    @Transactional
    public Optional<ChatReadReceiptDTO> markConversationAsRead(Long conversationId, Long memberId) {
        assertMember(conversationId, memberId);
        Long lastMessageId = chatRoomDAO.findLastMessageId(conversationId);
        if (lastMessageId == null) return Optional.empty();

        chatRoomDAO.saveLastReadMessageId(conversationId, memberId, lastMessageId);
        return Optional.of(
                ChatReadReceiptDTO.builder()
                        .conversationId(conversationId)
                        .readerId(memberId)
                        .lastReadMessageId(lastMessageId)
                        .build()
        );
    }

//    조용한 읽음 처리 (DB만 갱신, 브로드캐스트 X)
    @Transactional
    public void markConversationAsReadQuiet(Long conversationId, Long memberId) {
        assertMember(conversationId, memberId);
        Long lastMessageId = chatRoomDAO.findLastMessageId(conversationId);
        if (lastMessageId != null) {
            chatRoomDAO.saveLastReadMessageId(conversationId, memberId, lastMessageId);
        }
    }

//    별칭 수정
    @Transactional
    public void updateAlias(Long conversationId, Long memberId, String alias) {
        assertMember(conversationId, memberId);
        chatRoomDAO.updateAlias(conversationId, memberId, alias);
    }

    private void assertMember(Long conversationId, Long memberId) {
        if (!chatRoomDAO.isMember(conversationId, memberId)) {
            throw new SecurityException("해당 대화방에 접근할 수 없습니다.");
        }
    }

//    스크린샷 차단 토글
    @Transactional
    @LogStatusWithReturn
    public boolean toggleScreenBlock(Long conversationId, Long memberId) {
        boolean current = chatRoomDAO.isScreenBlocked(conversationId, memberId);
        boolean next = !current;
        chatRoomDAO.updateScreenBlocked(conversationId, memberId, next);
        return next;
    }

//    스크린샷 차단 상태 조회
    public boolean isScreenBlocked(Long conversationId, Long memberId) {
        return chatRoomDAO.isScreenBlocked(conversationId, memberId);
    }

//    대화방 soft delete
    @Transactional
    @LogStatus
    public void softDeleteConversation(Long conversationId, Long memberId) {
        chatRoomDAO.softDeleteConversation(conversationId, memberId);
    }

//    사라진 메시지 설정 변경
    @Transactional
    @LogStatusWithReturn
    public String updateDisappearMessage(Long conversationId, Long memberId, String setting) {
        chatRoomDAO.updateDisappearMessage(conversationId, memberId, setting);
        return setting;
    }

//    사라진 메시지 설정 조회
    public Map<String, Object> getDisappearMessage(Long conversationId, Long memberId) {
        return chatRoomDAO.getDisappearMessage(conversationId, memberId);
    }
}
