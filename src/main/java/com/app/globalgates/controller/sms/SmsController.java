package com.app.globalgates.controller.sms;

import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.sms.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class SmsController {

    private final SmsService smsService;

    @PostMapping("/send")
    public String sendSms(@RequestBody MemberDTO memberDTO) {
        // 현재 join 화면은 프론트에서 인증번호를 비교하므로 생성된 코드를 그대로 반환한다.
        log.info("send sms to {}", memberDTO.getMemberPhone());
        return smsService.sendSms(memberDTO.getMemberPhone());
    }
}
