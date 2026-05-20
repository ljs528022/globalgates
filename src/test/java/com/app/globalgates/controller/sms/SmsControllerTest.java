package com.app.globalgates.controller.sms;

import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.sms.SmsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SmsControllerTest {

    @Mock
    private SmsService smsService;

    @InjectMocks
    private SmsController smsController;

    @Test
    void sendSms_returnsCodeFromService() {
        MemberDTO memberDTO = new MemberDTO();
        memberDTO.setMemberPhone("01012345678");
        when(smsService.sendSms("01012345678")).thenReturn("123456");

        String result = smsController.sendSms(memberDTO);

        assertEquals("123456", result);
        verify(smsService).sendSms("01012345678");
    }
}
