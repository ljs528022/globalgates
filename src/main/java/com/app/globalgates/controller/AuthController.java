package com.app.globalgates.controller;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/**")
@Slf4j

public class AuthController implements AuthControllerDocs {
    private final MemberService memberService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate redisTemplate;
    private final HttpServletResponse response;
    private final S3Service s3Service;

    @PostMapping("oauth/join")
    public ResponseEntity<?> join(
            MemberDTO memberDTO,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {

        // 프론트에서 provider/providerId/profileURL/memberName/memberEmail/memberPhone 과
        // join.html 뒤쪽 모달에서 입력한 추가정보를 함께 전달받는다.
        log.info("oauth join memberDTO: {}", memberDTO);

        String uploadedKey = "";

        try {
            // 프로필 이미지를 직접 올린 경우 먼저 S3 업로드
            // DB 저장이 실패하면 아래 catch에서 삭제한다.
            if (file != null && !file.isEmpty()) {
                String todayPath = memberService.getTodayPath();
                uploadedKey = s3Service.uploadFile(file, todayPath);
            }

            // 회원 본체 저장, 사업자 정보 저장, 카테고리 저장, OAuth 연동 저장은 서비스가 담당
            memberService.joinOAuth(memberDTO, file, uploadedKey);

            // JWT 발급용 로그인 식별값은 기존 프로젝트 흐름과 맞춰 email 우선 사용
            String loginId = "";

            if (memberDTO.getMemberEmail() != null && !memberDTO.getMemberEmail().isBlank()) {
                loginId = memberDTO.getMemberEmail();
            } else if (memberDTO.getMemberPhone() != null && !memberDTO.getMemberPhone().isBlank()) {
                loginId = memberDTO.getMemberPhone();
            }

            String provider = memberDTO.getProvider().name().toLowerCase();

            // OAuth 회원도 가입 완료 후 일반 로그인과 동일하게 JWT 쿠키를 발급
            String accessToken = jwtTokenProvider.createAccessToken(loginId, provider);
            jwtTokenProvider.createRefreshToken(loginId, provider);

            return ResponseEntity.ok(Map.of(
                    "message", "SNS 회원가입 성공",
                    "redirectUrl", "/main/main",
                    "accessToken", accessToken
            ));

        } catch (Exception e) {
            // 업로드 후 저장 실패 시 S3 파일 정리
            if (!uploadedKey.isBlank()) {
                s3Service.deleteFile(uploadedKey);
            }

            log.error("oauth join failed", e);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "SNS 회원가입 실패: " + e.getMessage()));
        }
    }

    //    로그인
    @PostMapping("login")
    public ResponseEntity<?> login(@RequestBody MemberDTO memberDTO){
        log.info("memberDTO: {}", memberDTO);
        try {
            Map<String, String> tokenMap = new HashMap<>();

            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(memberDTO.getLoginId(), memberDTO.getMemberPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("authentication: {}", (CustomUserDetails) authentication.getPrincipal());

            String accessToken = jwtTokenProvider.createAccessToken(memberDTO.getMemberEmail());
            jwtTokenProvider.createRefreshToken(memberDTO.getMemberEmail());

            tokenMap.put("accessToken", accessToken);

            Cookie rememberEmailCookie = new Cookie("rememberEmail", memberDTO.getMemberEmail());
            Cookie rememberCookie = new Cookie("remember", String.valueOf(memberDTO.isRemember()));

            rememberEmailCookie.setPath("/");
            rememberCookie.setPath("/");

            if (memberDTO.isRemember()) {
                rememberEmailCookie.setMaxAge(60 * 60 * 24 * 30);
                response.addCookie(rememberEmailCookie);

                rememberCookie.setMaxAge(60 * 60 * 24 * 30);
                response.addCookie(rememberCookie);
            } else {
                rememberEmailCookie.setMaxAge(0);
                response.addCookie(rememberEmailCookie);

                rememberCookie.setMaxAge(0);
                response.addCookie(rememberCookie);
            }
            return ResponseEntity.ok(tokenMap);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인 실패: " + e.getMessage()));
        }
    }

    //    로그아웃
    //    setting의 계정 비활성화처럼 accessToken 상태가 이미 흔들린 직후에도 호출될 수 있으므로
    //    토큰이 없으면 서버측 토큰 정리는 건너뛰고 쿠키 제거만 수행한다.
    @PostMapping("logout")
    public void logout(@CookieValue(value="accessToken", required = false) String token){
        String username = null;

        if (token != null && !token.isBlank()) {
            username = jwtTokenProvider.getUsername(token);
            jwtTokenProvider.deleteRefreshToken(username);
            jwtTokenProvider.addToBlacklist(token);
        }

        Cookie deleteAccessCookie = new Cookie("accessToken", null);
        deleteAccessCookie.setPath("/");
        deleteAccessCookie.setMaxAge(0);

        response.addCookie(deleteAccessCookie);

        Cookie deleteRefreshCookie = new Cookie("refreshToken", null);
        deleteRefreshCookie.setPath("/");
        deleteRefreshCookie.setMaxAge(0);

        response.addCookie(deleteRefreshCookie);

        Cookie deleteRememberLoginIdCookie = new Cookie("rememberLoginId", null);
        deleteRememberLoginIdCookie.setPath("/");
        deleteRememberLoginIdCookie.setMaxAge(0);
        response.addCookie(deleteRememberLoginIdCookie);

//        회원 정보 삭제
        //        accessToken에서 username을 복원한 경우에만 member 캐시를 함께 비운다.
        if (username != null && !username.isBlank()) {
            redisTemplate.delete("member::" + username);
        }

//        여러 개의 key 가져오기
//        Set keys = redisTemplate.keys("posts::post_*");
//        if(keys != null && !keys.isEmpty()) {
//            redisTemplate.delete(keys);
//        }
    }

    //    정보 가져오기
    @GetMapping("info")
    public MemberDTO getMyInfo(HttpServletRequest request){
        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String memberEmail = jwtTokenProvider.getUsername(token);
        MemberDTO memberDTO = memberService.getMember(memberEmail);

        return memberDTO;
    }
}
