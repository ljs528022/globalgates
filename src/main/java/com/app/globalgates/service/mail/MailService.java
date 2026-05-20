package com.app.globalgates.service.mail;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    public String sendCode(String email) {
        String code = createCode();

        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");

            // 발신 주소는 기존 메일 계정 설정을 그대로 사용한다.
            if (senderEmail != null && !senderEmail.isBlank()) {
                helper.setFrom(senderEmail);
            }
            helper.setTo(email);
            helper.setSubject("[globalgates] 이메일 인증번호");
            helper.setText("인증번호는 [" + code + "] 입니다.", false);

            javaMailSender.send(mimeMessage);
        } catch (Exception e) {
            throw new RuntimeException("메일 발송 실패", e);
        }

        // 현재 구현은 프론트에서 인증번호를 비교하므로 코드를 그대로 반환한다.
        return code;
    }

    private String createCode() {
        StringBuilder code = new StringBuilder();
        Random random = new Random();

        // 6자리 숫자 인증번호 생성
        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }

        return code.toString();
    }
}
