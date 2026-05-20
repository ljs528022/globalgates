package com.app.globalgates.service.chat;

import com.app.globalgates.repository.chat.ChatRoomDAO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatRoomServiceAuthorizationTest {

    @Mock
    private ChatRoomDAO chatRoomDAO;

    @InjectMocks
    private ChatRoomService chatRoomService;

    @Test
    void markConversationAsReadRejectsNonMember() {
        when(chatRoomDAO.isMember(10L, 99L)).thenReturn(false);

        assertThatThrownBy(() -> chatRoomService.markConversationAsRead(10L, 99L))
                .isInstanceOf(SecurityException.class);

        verify(chatRoomDAO, never()).saveLastReadMessageId(10L, 99L, 123L);
    }

    @Test
    void markConversationAsReadQuietRejectsNonMember() {
        when(chatRoomDAO.isMember(10L, 99L)).thenReturn(false);

        assertThatThrownBy(() -> chatRoomService.markConversationAsReadQuiet(10L, 99L))
                .isInstanceOf(SecurityException.class);

        verify(chatRoomDAO, never()).saveLastReadMessageId(10L, 99L, 123L);
    }
}
