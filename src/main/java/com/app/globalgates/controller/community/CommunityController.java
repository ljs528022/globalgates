package com.app.globalgates.controller.community;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.CommunityDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.service.CommunityService;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.Duration;

@Controller
@RequiredArgsConstructor
@RequestMapping("/community")
@Slf4j
public class CommunityController {

    private final CommunityService communityService;
    private final MemberService memberService;
    private final S3Service s3Service;

    private String resolveProfileImageUrl(Long memberId) {
        String url = "/images/profile/default_image.png";
        if (memberId == null) return url;
        try {
            MemberProfileFileDTO profileFile = memberService.getProfileFile(memberId);
            if (profileFile != null && profileFile.getFileName() != null) {
                url = s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10));
            }
        } catch (Exception e) {
            log.debug("프로필 이미지 조회 실패: memberId={}", memberId);
        }
        return url;
    }

    @GetMapping
    public String goToCommunityPage(@AuthenticationPrincipal CustomUserDetails userDetails,
                                    Model model) {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        model.addAttribute("memberId", memberId);
        model.addAttribute("profileImageUrl", resolveProfileImageUrl(memberId));
        return "community/community";
    }

    @GetMapping("/{id}")
    public String goToCommunityDetailPage(@PathVariable Long id,
                                          @AuthenticationPrincipal CustomUserDetails userDetails,
                                          Model model) {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        try {
            CommunityDTO community = communityService.getCommunityDetail(id, memberId);
            if ("inactive".equals(community.getCommunityStatus())) {
                return "redirect:/community";
            }
            model.addAttribute("communityName", community.getCommunityName());
        } catch (Exception e) {
            return "redirect:/community";
        }

        model.addAttribute("communityId", id);
        model.addAttribute("memberId", memberId);
        model.addAttribute("profileImageUrl", resolveProfileImageUrl(memberId));
        return "community/community-detailed";
    }
}
