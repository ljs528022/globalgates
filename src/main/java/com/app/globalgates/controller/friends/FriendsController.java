package com.app.globalgates.controller.friends;

import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.service.FriendsService;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Duration;

@Controller
@RequiredArgsConstructor
@Slf4j
public class FriendsController {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;
    private final S3Service s3Service;
    private final FriendsService friendsService;

    @GetMapping("/friends")
    public String goToFriends(@RequestParam(required = false) Long profileId,
                              HttpServletRequest request,
                              Model model) {
        try {
            String token = jwtTokenProvider.parseTokenFromHeader(request);
            String loginId = jwtTokenProvider.getUsername(token);
            MemberDTO loginMember = memberService.getMember(loginId);

            // profileId 없거나 본인 id면 본인 페이지
            Long pageMemberId = profileId != null ? profileId : loginMember.getId();
            boolean isOwner = loginMember.getId().equals(pageMemberId);

            MemberDTO pageMember = isOwner
                    ? loginMember
                    : memberService.getMemberById(pageMemberId);

            // 헤더/사이드바용 로그인 사용자 프로필 이미지
            MemberProfileFileDTO profileFile = memberService.getProfileFile(loginMember.getId());
            if (profileFile != null && profileFile.getFileName() != null) {
                try {
                    loginMember.setFileName(s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10)));
                } catch (Exception e) {
                    loginMember.setFileName(null);
                }
            }

            // 탭에 표시할 카운트 (차단 필터 적용된 viewerId 기준)
            int followersCount = friendsService.getFollowersCount(pageMember.getId(), loginMember.getId());
            int followingsCount = friendsService.getFollowingsCount(pageMember.getId(), loginMember.getId());

            model.addAttribute("member", loginMember);     // 공통 헤더/모달 호환
            model.addAttribute("pageMember", pageMember);  // 친구 페이지 주인
            model.addAttribute("isOwner", isOwner);
            model.addAttribute("followersCount", followersCount);
            model.addAttribute("followingsCount", followingsCount);
        } catch (Exception e) {
            // 익셉션 묵살 금지 — 친구 페이지 진입 실패의 진짜 원인을 docker logs 로 추적할 수 있어야 한다.
            log.error("friends page resolve failed", e);
        }

        return "friends/friends";
    }
}
