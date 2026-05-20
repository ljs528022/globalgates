package com.app.globalgates.controller;

import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.Duration;

@Controller
@RequestMapping("/bookmark")
@RequiredArgsConstructor
public class BookmarkController {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;
    private final S3Service s3Service;

    @GetMapping("")
    public String goToBookmark(HttpServletRequest request, Model model) {
        Long memberId = 0L;
        String profileImageUrl = "/images/profile/default_image.png";
        try {
            String token = jwtTokenProvider.parseTokenFromHeader(request);
            String loginId = jwtTokenProvider.getUsername(token);
            MemberDTO member = memberService.getMember(loginId);
            memberId = member.getId();
            MemberProfileFileDTO profileFile = memberService.getProfileFile(memberId);
            if (profileFile != null && profileFile.getFileName() != null) {
                try {
                    String presignedUrl = s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10));
                    member.setFileName(presignedUrl);
                    profileImageUrl = presignedUrl;
                } catch (Exception e) {
                    member.setFileName(null);
                }
            }
            model.addAttribute("member", member);
        } catch (Exception e) {
            memberId = 0L;
        }

        model.addAttribute("memberId", memberId);
        model.addAttribute("profileImageUrl", profileImageUrl);
        return "bookmark/bookmark";
    }
}