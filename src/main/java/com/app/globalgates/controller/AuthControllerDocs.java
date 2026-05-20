package com.app.globalgates.controller;

import com.app.globalgates.dto.MemberDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Tag(name = "Auth", description = "Auth API")
public interface AuthControllerDocs {

    @Operation(
            summary = "OAuth 회원가입",
            description = "SNS 소셜 로그인 후 추가 정보를 입력하여 회원가입을 완료한다. 완료 시 JWT 쿠키를 발급한다.",
            parameters = {
                    @Parameter(name = "memberDTO", description = "회원가입 정보 (provider, providerId, memberEmail 등)"),
                    @Parameter(name = "file", description = "프로필 이미지 (선택)")
            })
    public ResponseEntity<?> join(MemberDTO memberDTO, MultipartFile file) throws IOException;

    @Operation(
            summary = "일반 회원 로그인",
            description = "일반 회원이 로그인할 때 토큰 발급",
            parameters = {@Parameter(name="memberDTO", description = "로그인 화면에서 입력한 인증 정보")})
    public ResponseEntity<?> login(@RequestBody MemberDTO memberDTO);

    @Operation(
            summary = "로그아웃",
            description = "일반 회원과 SNS 회원의 로그인 정보를 모두 제거한다.",
            parameters = {@Parameter(name="token", description = "쿠키에 있는 accessToken")})
    public void logout(@CookieValue(value="accessToken", required = false) String token);

    @Operation(
            summary = "회원 정보",
            description = "일반 회원과 SNS 회원의 로그인 정보를 가져온다")
    public MemberDTO getMyInfo(HttpServletRequest request);
}
