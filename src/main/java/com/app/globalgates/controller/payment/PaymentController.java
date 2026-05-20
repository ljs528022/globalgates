package com.app.globalgates.controller.payment;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.dto.PaymentAdvertisementDTO;
import com.app.globalgates.dto.PaymentSubscribeDTO;
import com.app.globalgates.service.AdvertisementService;
import com.app.globalgates.service.PaymentAdvertisementService;
import com.app.globalgates.service.PaymentSubscribeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment/**")
@Slf4j
public class PaymentController {
    private final PaymentAdvertisementService paymentAdvertisementService;
    private final PaymentSubscribeService paymentSubscribeService;
    private final AdvertisementService advertisementService;

    // 결제 정보 저장
    @PostMapping("save")
    public ResponseEntity<?> save(@RequestBody PaymentAdvertisementDTO paymentAdvertisementDTO,
                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        paymentAdvertisementDTO.setMemberId(userDetails.getId());

        log.info("받아온 결제 정보: {}", paymentAdvertisementDTO);
        paymentAdvertisementService.save(paymentAdvertisementDTO);
        return ResponseEntity.ok("결제 정보 저장 성공!");
    }

    // 결제 상세 조회
    @GetMapping("detail")
    public ResponseEntity<?> detail(@RequestParam Long id) {
        PaymentAdvertisementDTO result = paymentAdvertisementService.findById(id);
        return ResponseEntity.ok(result);
    }

    // 가상계좌 웹훅 처리
    @PostMapping("webhook")
    public ResponseEntity<?> webhook(@RequestBody Map<String, Object> webhookData) {
        log.info("웹훅 수신: {}", webhookData);

        String receiptId    = (String) webhookData.get("receipt_id");
        String event        = (String) webhookData.get("event");

        // 입금 완료 이벤트만 처리
        if ("issued".equals(event) || "done".equals(event)) {
            String paidAt = (String) webhookData.get("purchased_at");
            paymentAdvertisementService.updateStatus(receiptId, PaymentStatus.COMPLETED, paidAt);
            log.info("가상계좌 입금 완료 처리: receiptId={}", receiptId);
        }

        return ResponseEntity.ok("webhook received");
    }

    // 구독 결제 정보 저장
    @PostMapping("subscribe/save")
    public void saveSubscribePayment(@RequestBody PaymentSubscribeDTO paymentSubscribeDTO,
                                     @AuthenticationPrincipal CustomUserDetails userDetails) {
        paymentSubscribeDTO.setMemberId(userDetails.getId());
        log.info("구독 결제 정보 저장: {}", paymentSubscribeDTO);
        paymentSubscribeService.save(paymentSubscribeDTO);
    }

    // 구독 결제 웹훅 처리
    @PostMapping("subscribe/webhook")
    public ResponseEntity<?> subscribeWebhook(@RequestBody Map<String, Object> webhookData) {
        log.info("구독 결제 웹훅 수신: {}", webhookData);

        String receiptId = (String) webhookData.get("receipt_id");
        String event = (String) webhookData.get("event");

        if ("issued".equals(event) || "done".equals(event)) {
            String paidAt = (String) webhookData.get("purchased_at");
            paymentSubscribeService.updateStatus(receiptId, PaymentStatus.COMPLETED, paidAt);
            log.info("구독 결제 완료 처리: receiptId={}", receiptId);
        }

        return ResponseEntity.ok("webhook received");
    }
}
