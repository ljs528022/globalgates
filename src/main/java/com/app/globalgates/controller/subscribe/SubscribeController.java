package com.app.globalgates.controller.subscribe;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.SubscriptionDTO;
import com.app.globalgates.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
@Slf4j
public class SubscribeController {
    private final SubscriptionService subscriptionService;

    @GetMapping("/subscribe")
    public String goToSubscribe(@AuthenticationPrincipal CustomUserDetails userDetails, Model model) {
        log.info("깐트롤러 들어옴1");
        model.addAttribute("memberId", userDetails.getId());
        log.info("깐틀롤러 들어옴2");
        SubscriptionDTO mySubscription = subscriptionService.findByMemberId(userDetails.getId()).orElse(null);
        log.info("깐트롤러 들어옴3");
        log.info("깐트롤러 들어옴4 현재 얘구독통째로 = {}", mySubscription);
        model.addAttribute("mySubscription", mySubscription);
        return "subscribe/subscribe";
    }
}
