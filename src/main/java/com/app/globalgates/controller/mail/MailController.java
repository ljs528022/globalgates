package com.app.globalgates.controller.mail;

import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.mail.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
@Slf4j
public class MailController {

    private final MailService mailService;

    @PostMapping("/send-code")
    public String sendCode(@RequestBody MemberDTO memberDTO) {
        // 현재 join 화면은 프론트에서 인증번호를 비교하므로 생성된 코드를 그대로 반환한다.
        log.info("send email code to {}", memberDTO.getMemberEmail());
        return mailService.sendCode(memberDTO.getMemberEmail());
    }
}
