package com.app.globalgates.controller.inquiry;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.time.Duration;

@Controller
@RequestMapping("/inquiry/activity/**")
@RequiredArgsConstructor
@Slf4j
public class InquiryActivityController {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;
    private final S3Service s3Service;

    @GetMapping("list")
    public String goToInquiryActivityList(@AuthenticationPrincipal CustomUserDetails userDetails,
                                          HttpServletRequest request, Model model) {
        if (userDetails == null || userDetails.getMemberRole() != MemberRole.EXPERT) {
            return "redirect:/main/main";
        }
        model.addAttribute("member", getLoginMemberWithProfile(request));
        return "inquiry/inquiry_active_list";
    }

    // JWT에서 로그인 멤버를 꺼내고 프로필 이미지 presigned URL까지 세팅 (사이드바 사용자 정보용)
    private MemberDTO getLoginMemberWithProfile(HttpServletRequest request) {
        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String loginId = jwtTokenProvider.getUsername(token);
        MemberDTO member = memberService.getMember(loginId);

        MemberProfileFileDTO profileFile = memberService.getProfileFile(member.getId());
        if (profileFile != null && profileFile.getFileName() != null) {
            try {
                member.setFileName(s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                member.setFileName(null);
            }
        }
        return member;
    }
}
