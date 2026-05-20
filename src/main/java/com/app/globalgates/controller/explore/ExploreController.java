package com.app.globalgates.controller.explore;

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

import java.time.Duration;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ExploreController {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;
    private final S3Service s3Service;

    @GetMapping("/explore")
    public String goTOExplorePage(HttpServletRequest request, Model model) {
        try {
            String token = jwtTokenProvider.parseTokenFromHeader(request);
            String loginId = jwtTokenProvider.getUsername(token);
            MemberDTO member = memberService.getMember(loginId);
            MemberProfileFileDTO profileFile = memberService.getProfileFile(member.getId());
            if (profileFile != null && profileFile.getFileName() != null) {
                try {
                    member.setFileName(s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10)));
                } catch (Exception e) {
                    member.setFileName(null);
                }
            }
            model.addAttribute("member", member);
        } catch (Exception e) {
            // 익셉션을 통째로 삼키면 템플릿에서 ${member.id} 가 NPE 를 던져 500 이 나도 원인 추적이 불가능하다.
            // 최소한 로그라도 남기고, 아래 explore 템플릿은 member null 을 허용하도록 표현식을 null-safe 로 두었다.
            log.error("explore page member resolve failed", e);
        }
        return "explore/explore";
    }

    @GetMapping("/explore/search")
    public String goToSearchPage(HttpServletRequest request, Model model) {
        try {
            String token = jwtTokenProvider.parseTokenFromHeader(request);
            String loginId = jwtTokenProvider.getUsername(token);
            MemberDTO member = memberService.getMember(loginId);
            MemberProfileFileDTO profileFile = memberService.getProfileFile(member.getId());
            if (profileFile != null && profileFile.getFileName() != null) {
                try {
                    member.setFileName(s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10)));
                } catch (Exception e) {
                    member.setFileName(null);
                }
            }
            model.addAttribute("member", member);
        } catch (Exception e) {
            // 익셉션을 통째로 삼키면 템플릿에서 ${member.id} 가 NPE 를 던져 500 이 나도 원인 추적이 불가능하다.
            // 최소한 로그라도 남기고, 아래 explore 템플릿은 member null 을 허용하도록 표현식을 null-safe 로 두었다.
            log.error("explore page member resolve failed", e);
        }
        return "explore/explore-result";
    }
}
