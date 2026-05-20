package com.app.globalgates.controller.mail;

import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.mail.MailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MailControllerTest {

    @Mock
    private MailService mailService;

    @InjectMocks
    private MailController mailController;

    @Test
    void sendCode_returnsCodeFromService() {
        MemberDTO memberDTO = new MemberDTO();
        memberDTO.setMemberEmail("user@example.com");
        when(mailService.sendCode("user@example.com")).thenReturn("123456");

        String result = mailController.sendCode(memberDTO);

        assertEquals("123456", result);
        verify(mailService).sendCode("user@example.com");
    }
}
