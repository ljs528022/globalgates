package com.app.globalgates.service.sms;

import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.exception.SolapiMessageNotReceivedException;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class SmsService {

    // SolAPI에 등록된 발신번호를 사용해야 실제 발송이 된다.
    private static final String SENDER = "01099139076";

    @Value("${message.api-key}")
    private String apiKey;

    @Value("${message.api-secret-key}")
    private String apiSecretKey;

    private DefaultMessageService messageService;

    @PostConstruct
    private void init() {
        // 애플리케이션 시작 시 SolAPI 클라이언트를 한 번만 준비한다.
        this.messageService = SolapiClient.INSTANCE.createInstance(apiKey, apiSecretKey);
    }

    public String sendSms(String phone) {
        // 하이픈 없이 숫자만 남겨 SolAPI 요청 형식에 맞춘다.
        String normalizedPhone = phone == null ? "" : phone.replaceAll("\\D", "");
        String code = createCode();

        Message message = new Message();
        message.setFrom(SENDER);
        message.setTo(normalizedPhone);
        message.setText("[globalgates] 인증번호: " + code);

        try {
            messageService.send(message);
        } catch (SolapiMessageNotReceivedException e) {
            // SolAPI가 메시지를 정상 접수하지 못한 경우를 구분한다.
            throw new RuntimeException("문자 전송 실패", e);
        } catch (Exception e) {
            throw new RuntimeException("문자 전송 실패", e);
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
