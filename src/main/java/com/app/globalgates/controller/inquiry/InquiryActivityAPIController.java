package com.app.globalgates.controller.inquiry;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.service.InquiryActivityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@RestController
@RequestMapping("/api/inquiry/activity/**")
@RequiredArgsConstructor
@Slf4j
public class InquiryActivityAPIController {
    private final InquiryActivityService inquiryActivityService;

    @GetMapping("list/{page}")
    public ResponseEntity<?> getInquiryActivityList(@PathVariable int page,
                                                    @RequestParam(required = false) String startDate,
                                                    @RequestParam(required = false) String endDate,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요합니다."));
        }
        if (userDetails.getMemberRole() != MemberRole.EXPERT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "전문가 권한이 필요합니다."));
        }

        return ResponseEntity.ok(inquiryActivityService.getList(page, userDetails.getId(), startDate, endDate));
    }
}
