package com.app.globalgates.service.mail;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    @Mock
    private JavaMailSender javaMailSender;

    @InjectMocks
    private MailService mailService;

    @Test
    void sendCode_sendsMailAndReturnsSixDigitCode() throws Exception {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        String code = mailService.sendCode("user@example.com");

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(javaMailSender).send(captor.capture());

        MimeMessage sentMessage = captor.getValue();
        assertTrue(code.matches("\\d{6}"));
        assertEquals("user@example.com", sentMessage.getAllRecipients()[0].toString());
        assertEquals("[globalgates] 이메일 인증번호", sentMessage.getSubject());

        Object content = ReflectionTestUtils.getField(sentMessage, "content");
        assertTrue(String.valueOf(content).contains(code));
    }
}
