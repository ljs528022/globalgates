package com.app.globalgates.controller.member;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.MemberDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Tag(name = "Member", description = "Member API")
public interface MemberAPIControllerDocs {
    @Operation(
            summary = "회원 등록",
            description = "화면에서 받은 회원 정보로 회원가입을 한다.",
            parameters = {@Parameter(name = "memberDTO", description = "화면에서 입력한 회원 정보"),
                            @Parameter(name = "file", description = "화면에서 입력한 프로필 이미지")}
    )
    public ResponseEntity<?> join(MemberDTO memberDTO, @RequestParam(value = "file", required = false) MultipartFile file) throws IOException;

    @Operation(
            summary = "OAuth 회원 등록",
            description = "SNS 인증을 마친 사용자가 추가 정보를 입력하여 회원가입을 한다.",
            parameters = {@Parameter(name = "memberDTO", description = "화면에서 입력한 회원 정보"),
                            @Parameter(name = "file", description = "화면에서 입력한 프로필 이미지")}
    )
    public ResponseEntity<?> oauthJoin(MemberDTO memberDTO, @RequestParam(value = "file", required = false) MultipartFile file) throws IOException;

    @Operation(
            summary = "이메일 중복 검사",
            description = "입력한 이메일이 사용 가능한지 확인한다.",
            parameters = {@Parameter(name = "memberEmail", description = "검사할 이메일")}
    )
    public boolean checkEmail(@RequestParam String memberEmail);

    @Operation(
            summary = "휴대폰 번호 중복 검사",
            description = "입력한 휴대폰 번호가 사용 가능한지 확인한다.",
            parameters = {@Parameter(name = "memberPhone", description = "검사할 휴대폰 번호")}
    )
    public boolean checkPhone(@RequestParam String memberPhone);

    @Operation(
            summary = "아이디 중복 검사",
            description = "입력한 아이디(handle)가 사용 가능한지 확인한다.",
            parameters = {@Parameter(name = "memberHandle", description = "검사할 아이디")}
    )
    public boolean checkHandle(@RequestParam String memberHandle);

    @Operation(
            summary = "일반 회원 로그인",
            description = "이메일 또는 휴대폰 번호와 비밀번호로 로그인하여 토큰을 발급받는다.",
            parameters = {@Parameter(name = "memberDTO", description = "로그인 화면에서 입력한 인증 정보")}
    )
    public ResponseEntity<?> login(@RequestBody MemberDTO memberDTO);

    @Operation(
            summary = "재활성화 준비",
            description = "비활성화된 계정의 재활성화 가능 여부를 확인하고 마스킹된 연락처를 반환한다.",
            parameters = {@Parameter(name = "memberDTO", description = "로그인 식별값과 비밀번호")}
    )
    public ResponseEntity<?> prepareReactivation(@RequestBody MemberDTO memberDTO);

    @Operation(
            summary = "재활성화 완료",
            description = "인증코드 확인 후 비활성화된 계정을 복구하고 토큰을 발급한다.",
            parameters = {@Parameter(name = "memberDTO", description = "로그인 식별값과 비밀번호")}
    )
    public ResponseEntity<?> completeReactivation(@RequestBody MemberDTO memberDTO);

    @Operation(
            summary = "회원 정보 조회",
            description = "현재 로그인한 회원의 정보를 조회한다."
    )
    public MemberDTO getUserInfo(HttpServletRequest request);

    @Operation(
            summary = "프로필 수정",
            description = "회원의 프로필 텍스트, 프로필 이미지, 배너 이미지를 수정한다.",
            parameters = {@Parameter(name = "memberDTO", description = "수정할 회원 정보"),
                            @Parameter(name = "profileImage", description = "새 프로필 이미지"),
                            @Parameter(name = "bannerImage", description = "새 배너 이미지"),
                            @Parameter(name = "userDetails", description = "로그인한 유저의 정보")}
    )
    public ResponseEntity<?> updateProfile(MemberDTO memberDTO, @RequestParam(value = "profileImage", required = false) MultipartFile profileImage, @RequestParam(value = "bannerImage", required = false) MultipartFile bannerImage, @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException;
}
