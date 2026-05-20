package com.app.globalgates.controller;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.repository.MemberProfileFileDAO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.time.Duration;

@Controller
@RequiredArgsConstructor
@RequestMapping("/estimation/**")
public class EstimationController {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;
    private final MemberProfileFileDAO memberProfileFileDAO;
    private final S3Service s3Service;

    @Value("${google.maps.api-key:}")
    private String googleMapsApiKey;

    @GetMapping("list")
    public String goToList(@AuthenticationPrincipal CustomUserDetails userDetails,
                           HttpServletRequest request, Model model) {
        if (userDetails == null || userDetails.getMemberRole() != MemberRole.EXPERT) {
            return "redirect:/main/main";
        }
        model.addAttribute("member", getLoginMemberWithProfile(request));
        return "estimation/estimation-list";
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

    @GetMapping("regist")
    public String goToRegist(HttpServletRequest request, Model model) {
        // 견적요청 모달의 작성자 아바타에 로그인 사용자 프로필을 채워야 한다.
        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String loginId = jwtTokenProvider.getUsername(token);
        MemberDTO loginMember = memberService.getMember(loginId);

        String loginMemberProfileImageUrl = "/images/profile/default_image.png";
        MemberProfileFileDTO loginProfileFile = memberProfileFileDAO.findByMemberId(loginMember.getId());
        if (loginProfileFile != null) {
            try {
                loginMemberProfileImageUrl = s3Service.getPresignedUrl(
                        loginProfileFile.getFileName(), Duration.ofMinutes(10));
            } catch (Exception ignored) {
                // 변환 실패 시 default_image.png 그대로 둠.
            }
        }
        // 헤더 사이드바가 loginMember.fileName 으로 프로필 이미지를 읽으므로 같이 박아둔다.
        loginMember.setFileName(loginMemberProfileImageUrl);

        model.addAttribute("googleMapsApiKey", googleMapsApiKey);
        model.addAttribute("loginMember", loginMember);
        model.addAttribute("loginMemberProfileImageUrl", loginMemberProfileImageUrl);
        return "estimation/estimation-regist";
    }
}
