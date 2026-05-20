package com.app.globalgates.common.advice;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

/**
 * 모든 페이지(@Controller) 응답에 현재 로그인 회원을 model attribute "member"로 자동 주입한다.
 * 비로그인 또는 조회 실패 시 null. 헤더 fragment 등에서 발생하던 NPE를 근본 차단한다.
 * @RestController 는 제외(annotations 필터). 개별 컨트롤러가 동일 키로 덮어쓸 수 있다.
 */
@ControllerAdvice(annotations = Controller.class)
@RequiredArgsConstructor
@Slf4j
public class CurrentMemberModelAdvice {

    private final MemberService memberService;

    @ModelAttribute("member")
    public MemberDTO currentMember(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return null;
        try {
            return memberService.getMember(userDetails.getLoginId());
        } catch (Exception e) {
            log.debug("현재 회원 조회 실패: {}", e.getMessage());
            return null;
        }
    }
}
