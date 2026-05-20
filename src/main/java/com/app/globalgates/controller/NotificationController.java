package com.app.globalgates.controller;

import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.time.Duration;

@Controller
@RequestMapping("/notification")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;
    private final S3Service s3Service;

    @GetMapping("")
    public String goToNotification(HttpServletRequest request, Model model) {
        Long memberId = 0L;
        try {
            String token = jwtTokenProvider.parseTokenFromHeader(request);
            String loginId = jwtTokenProvider.getUsername(token);
            MemberDTO member = memberService.getMember(loginId);
            memberId = member.getId();

            MemberProfileFileDTO profileFile = memberService.getProfileFile(memberId);
            if (profileFile != null && profileFile.getFileName() != null) {
                try {
                    member.setFileName(s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    member.setFileName(null);
                }
            }

            model.addAttribute("member", member);
        } catch (Exception e) {
            memberId = 0L;
            log.error("notification page member resolve failed", e);
        }

        model.addAttribute("memberId", memberId);
        return "notification/notification";
    }
}
