package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.NotificationType;
import com.app.globalgates.config.RabbitmqConfig;
import com.app.globalgates.dto.NotificationDTO;
import com.app.globalgates.dto.chat.ChatMessageDTO;
import com.app.globalgates.dto.chat.ChatRoomDTO;
import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.repository.chat.ChatMessageDAO;
import com.app.globalgates.repository.chat.ChatRoomDAO;
import com.app.globalgates.service.chat.ChatFileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProducerService {
    private final ChatMessageDAO chatMessageDAO;
    private final ChatRoomDAO chatRoomDAO;
    private final RabbitTemplate rabbitTemplate;
    private final ChatFileService chatFileService;
    private final SimpMessagingTemplate messagingTemplate;
    private final BlockService blockService;
    private final NotificationService notificationService;

    private void sendMessageNotification(ChatMessageDTO saved) {
        chatRoomDAO.findPartnerByConversation(saved.getConversationId(), saved.getSenderId())
                .map(ChatRoomDTO::getInvitedId)
                .ifPresent(partnerId -> {
                    NotificationDTO noti = new NotificationDTO();
                    noti.setRecipientId(partnerId);
                    noti.setSenderId(saved.getSenderId());
                    noti.setNotificationType(NotificationType.MESSAGE);
                    noti.setTitle("메시지");
                    noti.setContent("새 메시지가 도착했습니다.");
                    noti.setTargetId(saved.getConversationId());
                    noti.setTargetType("conversation");
                    notificationService.createNotification(noti);
                });
    }

    private void validateNotBlocked(Long conversationId, Long senderId) {
        Optional<ChatRoomDTO> partner = chatRoomDAO.findPartnerByConversation(conversationId, senderId);
        if (partner.isEmpty()) {
            throw new IllegalStateException("대화방을 찾을 수 없습니다.");
        }
        Long partnerId = partner.get().getInvitedId();
        if (blockService.isBlockedEither(senderId, partnerId)) {
            throw new IllegalStateException("차단된 사용자에게 메시지를 보낼 수 없습니다.");
        }
    }

    @Transactional
    public ChatMessageDTO sendMessage(ChatMessageDTO chatMessageDTO) {
        validateNotBlocked(chatMessageDTO.getConversationId(), chatMessageDTO.getSenderId());
        ChatMessageDTO saved = chatMessageDAO.save(chatMessageDTO);
        log.info("메시지 DB 저장 완료 - id: {}", saved.getId());

        saved.setSenderName(chatMessageDTO.getSenderName());

//        복원 대상 멤버 조회 (is_deleted = true인 멤버)
        List<Long> deletedMemberIds = chatRoomDAO.findDeletedMemberIds(saved.getConversationId());

//        메시지 보내면 대화방의 모든 참여자 is_deleted 복원
        chatRoomDAO.restoreAllMembers(saved.getConversationId());

        rabbitTemplate.convertAndSend(
                RabbitmqConfig.CHAT_EXCHANGE,
                RabbitmqConfig.CHAT_ROUTING_KEY,
                saved
        );
        log.info("RabbitMQ 발행 완료 - conversationId: {}", saved.getConversationId());

//        삭제했던 멤버에게 방 복원 알림 (WebSocket 구독이 끊긴 상태이므로 사용자 채널로 전송)
        notifyRestoredMembers(deletedMemberIds, saved.getConversationId());

        sendMessageNotification(saved);

        return saved;
    }

    @Transactional
    public ChatMessageDTO sendMessageWithFile(ChatMessageDTO chatMessageDTO, MultipartFile file) throws IOException {
        validateNotBlocked(chatMessageDTO.getConversationId(), chatMessageDTO.getSenderId());
        ChatMessageDTO saved = chatMessageDAO.save(chatMessageDTO);
        log.info("메시지 DB 저장 완료 - id: {}", saved.getId());

        saved.setSenderName(chatMessageDTO.getSenderName());

        FileDTO fileDTO = chatFileService.uploadAndLink(file, saved.getId());
        saved.setFileId(fileDTO.getId());
        saved.setFileOriginalName(fileDTO.getOriginalName());
        saved.setFilePath(fileDTO.getFilePath());
        saved.setFileSize(fileDTO.getFileSize());
        saved.setFileContentType(fileDTO.getContentType().getValue());

//        복원 대상 멤버 조회 (is_deleted = true인 멤버)
        List<Long> deletedMemberIds = chatRoomDAO.findDeletedMemberIds(saved.getConversationId());

//        메시지 보내면 대화방의 모든 참여자 is_deleted 복원
        chatRoomDAO.restoreAllMembers(saved.getConversationId());

        rabbitTemplate.convertAndSend(
                RabbitmqConfig.CHAT_EXCHANGE,
                RabbitmqConfig.CHAT_ROUTING_KEY,
                saved
        );
        log.info("RabbitMQ 발행 완료 (파일 포함) - conversationId: {}", saved.getConversationId());

//        삭제했던 멤버에게 방 복원 알림
        notifyRestoredMembers(deletedMemberIds, saved.getConversationId());

        sendMessageNotification(saved);

        return saved;
    }

    private void notifyRestoredMembers(List<Long> memberIds, Long conversationId) {
        if (memberIds == null || memberIds.isEmpty()) return;
        Map<String, Long> payload = Map.of("conversationId", conversationId);
        for (Long memberId : memberIds) {
            messagingTemplate.convertAndSend("/topic/user." + memberId + ".restore", payload);
            log.info("방 복원 알림 전송 - memberId: {}, conversationId: {}", memberId, conversationId);
        }
    }
}
