package com.app.globalgates.controller.subscribe;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.SubscriptionDTO;
import com.app.globalgates.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/subscriptions")
@Slf4j
public class SubscriptionAPIController implements SubscriptionAPIControllerDocs {
    private final SubscriptionService subscriptionService;

    //    구독하기 (구독 + 뱃지 + 멤버롤(expert일경우)
    @PostMapping("/subscribe")
    @LogStatusWithReturn
    public Long subscribe(@RequestBody SubscriptionDTO subscriptionDTO,
                          @AuthenticationPrincipal CustomUserDetails userDetails) {
        subscriptionDTO.setMemberId(userDetails.getId());
        log.info("구독해요~ {}", subscriptionDTO);
        return subscriptionService.subscribe(subscriptionDTO);
    }

    //    현재 구독 조회
    @GetMapping("/my")
    @LogStatusWithReturn
    public SubscriptionDTO my(@AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("지금 구독조회하는 회원id {}", userDetails.getId());
        return subscriptionService.findByMemberId(userDetails.getId()).orElse(null);
    }

    //    월간 구독 해지
    @PostMapping("/cancel")
    @LogStatus
    public void cancel(@RequestBody SubscriptionDTO subscriptionDTO,
                       @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("구독해지 요청.. 구독id {}", subscriptionDTO.getId());
        subscriptionService.cancel(subscriptionDTO.getId(), userDetails.getId());
    }

}
