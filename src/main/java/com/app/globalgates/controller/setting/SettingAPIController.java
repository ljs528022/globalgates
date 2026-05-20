package com.app.globalgates.controller.setting;

import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.BlockDTO;
import com.app.globalgates.dto.BlockWithPagingDTO;
import com.app.globalgates.dto.MemberWithPagingDTO;
import com.app.globalgates.dto.NotificationPreferenceDTO;
import com.app.globalgates.service.BlockService;
import com.app.globalgates.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings/**")
@Slf4j
@RequiredArgsConstructor
public class SettingAPIController implements SettingAPIControllerDocs {

    private final MemberService memberService;
    private final BlockService blockService;

    // loginId를 프론트에서 받지 않고 인증 객체에서만 꺼내서 조회해서 유효성 검사를 한다.
    // 비밀번호는 access log / Referer / 브라우저 history에 남지 않도록 body로 받는다.
    @PostMapping("check-password")
    @LogStatusWithReturn
    public boolean checkPassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request) {
        return memberService.checkPassword(userDetails.getLoginId(), request.get("memberPassword"));
    }

    @PostMapping("password")
    @LogStatusWithReturn
    public ResponseEntity<?> updatePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request
    ) {
        try {
            memberService.updatePassword(
                    userDetails.getLoginId(),
                    request.get("currentPassword"),
                    request.get("nextPassword")
            );

            return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("handle")
    @LogStatusWithReturn
    public ResponseEntity<?> updateHandle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request
    ) {
        try {
            // 사용자 아이디 변경은 현재 로그인 사용자 기준으로만 처리한다.
            // 프런트에서 id를 받지 않아야 다른 계정 handle 변경 요청을 막을 수 있다.
            memberService.updateHandle(
                    userDetails.getLoginId(),
                    request.get("memberHandle")
            );

            return ResponseEntity.ok(Map.of("message", "사용자 아이디가 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("phone")
    @LogStatusWithReturn
    public ResponseEntity<?> updatePhone(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request
    ) {
        try {
            memberService.updatePhone(
                    userDetails.getLoginId(),
                    request.get("memberPhone")
            );

            return ResponseEntity.ok(Map.of("message", "휴대폰 번호가 저장되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("email")
    @LogStatusWithReturn
    public ResponseEntity<?> updateEmail(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request
    ) {
        try {
            memberService.updateEmail(
                    userDetails.getLoginId(),
                    request.get("memberEmail")
            );

            return ResponseEntity.ok(Map.of("message", "이메일이 저장되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // setting 화면의 언어 변경은 인증된 현재 사용자 기준으로만 처리한다.
    // 프런트가 선택한 단일 라벨 문자열을 그대로 받아 member_language에 저장한다.
    @PostMapping("language")
    @LogStatusWithReturn
    public ResponseEntity<?> updateLanguage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request
    ) {
        try {
            memberService.updateLanguage(
                    userDetails.getLoginId(),
                    request.get("memberLanguage")
            );

            return ResponseEntity.ok(Map.of("message", "언어가 저장되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 계정 비활성화는 현재 로그인 사용자 기준으로만 처리한다.
    // 비밀번호를 함께 받아 서버에서 최종 확인한 뒤 soft delete를 수행한다.
    @PostMapping("deactivate")
    @LogStatusWithReturn
    public ResponseEntity<?> deactivate(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request
    ) {
        try {
            memberService.deactivateMember(
                    userDetails.getLoginId(),
                    request.get("memberPassword")
            );

            return ResponseEntity.ok(Map.of("message", "계정이 비활성화되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 푸시 master on/off는 tbl_member.push_enabled 단일 컬럼만 바꾼다.
    // 상세 푸시 체크 상태와 분리해 두면 화면 상단 스위치의 응답이 더 단순해진다.
    @PostMapping("notifications/push-enabled")
    @LogStatusWithReturn
    public ResponseEntity<?> updatePushEnabled(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Boolean> request
    ) {
        try {
            memberService.updatePushEnabled(
                    userDetails.getLoginId(),
                    Boolean.TRUE.equals(request.get("pushEnabled"))
            );

            return ResponseEntity.ok(Map.of("message", "푸시 알림 설정이 저장되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }


    // 개별 푸시 알림 체크 상태는 별도 API로 저장한다.
    // master toggle과 저장 경로를 분리해도 실제 DB 행은 같은 회원 설정 한 건을 공유한다.
    @PostMapping("notifications/push-preferences")
    @LogStatusWithReturn
    public ResponseEntity<?> updateNotificationPushPreference(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody NotificationPreferenceDTO request
    ) {
        try {
            memberService.updateNotificationPushPreference(userDetails.getLoginId(), request);
            return ResponseEntity.ok(Map.of("message", "푸시 알림 설정이 저장되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // setting 화면의 국가 변경도 인증된 현재 사용자 기준으로만 처리한다.
    // 프런트는 선택된 국가 라벨 문자열 하나만 보내고, 서버는 현재 로그인 사용자 행만 갱신한다.
    @PostMapping("country")
    @LogStatusWithReturn
    public ResponseEntity<?> updateCountry(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request
    ) {
        try {
            memberService.updateCountry(
                    userDetails.getLoginId(),
                    request.get("memberCountry")
            );

            return ResponseEntity.ok(Map.of("message", "국가가 저장되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    //    차단 목록 조회
    @GetMapping("blocks/list/{page}")
    @LogStatusWithReturn
    public ResponseEntity<?> getBlockList(
            @PathVariable int page,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        BlockWithPagingDTO result = blockService.getBlockListByMemberId(page, userDetails.getId());
        return ResponseEntity.ok(result);
    }

}
