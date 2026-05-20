package com.app.globalgates.service;

import com.app.globalgates.dto.chat.ChatMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsumerService {
    private final SimpMessagingTemplate messagingTemplate;

    // RabbitMQ 메시지를 WebSocket으로 전달.
    // 큐 이름은 AnonymousQueue가 부팅 시점에 생성한 임의 이름이므로 Bean 참조(#{chatQueue.name})로 받는다.
    @RabbitListener(queues = "#{chatQueue.name}")
    public void consume(ChatMessageDTO chatMessageDTO) {
        log.info("RabbitMQ 수신 - conversationId: {}, senderId: {}",
                chatMessageDTO.getConversationId(), chatMessageDTO.getSenderId());

        // WebSocket으로 해당 채팅방 구독자에게 전파
        messagingTemplate.convertAndSend(
                "/topic/room." + chatMessageDTO.getConversationId(),
                chatMessageDTO
        );
        log.info("WebSocket 전파 완료 - /topic/room.{}", chatMessageDTO.getConversationId());
    }
}
