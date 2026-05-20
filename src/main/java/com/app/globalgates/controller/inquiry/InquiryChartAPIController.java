package com.app.globalgates.controller.inquiry;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.dto.ExpertChartDashboardDTO;
import com.app.globalgates.service.InquiryChartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/inquiry/chart")
@RequiredArgsConstructor
public class InquiryChartAPIController {
    private final InquiryChartService inquiryChartService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요합니다."));
        }
        if (userDetails.getMemberRole() != MemberRole.EXPERT) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "전문가 권한이 필요합니다."));
        }

        ExpertChartDashboardDTO dashboardDTO = inquiryChartService.getDashboard(userDetails.getId());
        return ResponseEntity.ok(dashboardDTO);
    }
}
