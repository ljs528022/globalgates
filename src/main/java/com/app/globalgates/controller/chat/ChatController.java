package com.app.globalgates.controller.chat;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Duration;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final MemberDAO memberDAO;
    private final MemberService memberService;
    private final S3Service s3Service;

    @GetMapping("/chat")
    public String chatPage(
            Authentication authentication,
            @RequestParam(required = false) Long partnerId,
            @RequestParam(required = false) Long conversationId,
            Model model
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return "redirect:/member/login";
        }

        Long memberId = userDetails.getId();
        MemberDTO currentMember = memberDAO.findByMemberId(memberId)
                .orElseThrow(() -> new IllegalStateException("회원 정보를 찾을 수 없습니다."));

        model.addAttribute("memberId", currentMember.getId());
        model.addAttribute("memberName", currentMember.getMemberName());
        model.addAttribute("memberHandle", currentMember.getMemberHandle());

        // 프로필 이미지
        String profileImageUrl = "/images/profile/default_image.png";
        try {
            MemberProfileFileDTO profileFile = memberService.getProfileFile(memberId);
            if (profileFile != null && profileFile.getFileName() != null) {
                String presignedUrl = s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10));
                currentMember.setFileName(presignedUrl);
                profileImageUrl = presignedUrl;
            }
        } catch (Exception ignored) {}
        model.addAttribute("profileImageUrl", profileImageUrl);
        model.addAttribute("member", currentMember);

        if (partnerId != null) {
            MemberDTO partnerMember = memberDAO.findByMemberId(partnerId).orElse(null);
            if (partnerMember != null) {
                model.addAttribute("partnerId", partnerMember.getId());
                model.addAttribute("partnerName", partnerMember.getMemberName());
                model.addAttribute("partnerHandle", partnerMember.getMemberHandle());
            }
        }
        if (conversationId != null) {
            model.addAttribute("conversationId", conversationId);
        }
        return "chat/chat";
    }
}
