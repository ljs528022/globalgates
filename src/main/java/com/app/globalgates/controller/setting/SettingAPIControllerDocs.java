package com.app.globalgates.controller.setting;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.NotificationPreferenceDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@Tag(name = "Setting", description = "Setting API")
public interface SettingAPIControllerDocs {
    @Operation(
            summary = "비밀번호 확인",
            description = "현재 로그인한 사용자의 비밀번호가 일치하는지 확인한다."
    )
    public boolean checkPassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request);

    @Operation(
            summary = "비밀번호 변경",
            description = "현재 비밀번호를 확인한 뒤 새 비밀번호로 변경한다.",
            parameters = {@Parameter(name = "request", description = "currentPassword, nextPassword를 포함한 요청 데이터")}
    )
    public ResponseEntity<?> updatePassword(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, String> request);

    @Operation(
            summary = "아이디(handle) 변경",
            description = "현재 로그인한 사용자의 아이디를 변경한다.",
            parameters = {@Parameter(name = "request", description = "memberHandle을 포함한 요청 데이터")}
    )
    public ResponseEntity<?> updateHandle(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, String> request);

    @Operation(
            summary = "휴대폰 번호 변경",
            description = "현재 로그인한 사용자의 휴대폰 번호를 변경한다.",
            parameters = {@Parameter(name = "request", description = "memberPhone을 포함한 요청 데이터")}
    )
    public ResponseEntity<?> updatePhone(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, String> request);

    @Operation(
            summary = "이메일 변경",
            description = "현재 로그인한 사용자의 이메일을 변경한다.",
            parameters = {@Parameter(name = "request", description = "memberEmail을 포함한 요청 데이터")}
    )
    public ResponseEntity<?> updateEmail(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, String> request);

    @Operation(
            summary = "언어 변경",
            description = "현재 로그인한 사용자의 언어 설정을 변경한다.",
            parameters = {@Parameter(name = "request", description = "memberLanguage를 포함한 요청 데이터")}
    )
    public ResponseEntity<?> updateLanguage(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, String> request);

    @Operation(
            summary = "계정 비활성화",
            description = "비밀번호를 확인한 뒤 현재 로그인한 계정을 비활성화한다.",
            parameters = {@Parameter(name = "request", description = "memberPassword를 포함한 요청 데이터")}
    )
    public ResponseEntity<?> deactivate(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, String> request);

    @Operation(
            summary = "푸시 알림 마스터 토글",
            description = "푸시 알림 전체 on/off를 설정한다. 상세 푸시도 함께 변경된다.",
            parameters = {@Parameter(name = "request", description = "pushEnabled를 포함한 요청 데이터")}
    )
    public ResponseEntity<?> updatePushEnabled(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, Boolean> request);

    @Operation(
            summary = "푸시 알림 상세 설정",
            description = "개별 푸시 알림 항목의 on/off를 설정한다.",
            parameters = {@Parameter(name = "request", description = "각 푸시 알림 항목의 설정 정보")}
    )
    public ResponseEntity<?> updateNotificationPushPreference(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody NotificationPreferenceDTO request);

    @Operation(
            summary = "국가 변경",
            description = "현재 로그인한 사용자의 국가 설정을 변경한다.",
            parameters = {@Parameter(name = "request", description = "memberCountry를 포함한 요청 데이터")}
    )
    public ResponseEntity<?> updateCountry(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody Map<String, String> request);

    @Operation(
            summary = "차단 목록 조회",
            description = "현재 로그인한 사용자의 차단 목록을 페이징하여 조회한다.",
            parameters = {@Parameter(name = "page", description = "표시할 페이지 번호")}
    )
    public ResponseEntity<?> getBlockList(@PathVariable int page, @AuthenticationPrincipal CustomUserDetails userDetails);
}
