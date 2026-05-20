package com.app.globalgates.service.chat;

import com.app.globalgates.repository.MessageReactionDAO;
import com.app.globalgates.repository.chat.ChatRoomDAO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MessageReactionServiceAuthorizationTest {

    @Mock
    private MessageReactionDAO messageReactionDAO;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ChatRoomDAO chatRoomDAO;

    @Test
    void addReactionRejectsNonMember() {
        MessageReactionService service = new MessageReactionService(messageReactionDAO, messagingTemplate, chatRoomDAO);
        when(messageReactionDAO.findConversationIdByMessageId(20L)).thenReturn(Optional.of(10L));
        when(chatRoomDAO.isMember(10L, 99L)).thenReturn(false);

        assertThatThrownBy(() -> service.addReaction(20L, 99L, "👍", 10L))
                .isInstanceOf(SecurityException.class);

        verify(messageReactionDAO, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void addReactionRejectsConversationMismatch() {
        MessageReactionService service = new MessageReactionService(messageReactionDAO, messagingTemplate, chatRoomDAO);
        when(messageReactionDAO.findConversationIdByMessageId(20L)).thenReturn(Optional.of(11L));

        assertThatThrownBy(() -> service.addReaction(20L, 99L, "👍", 10L))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
