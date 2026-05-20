package com.app.globalgates.controller.member;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.dto.MemberSessionDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import java.io.IOException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/member/**")
@RequiredArgsConstructor
@Slf4j
public class MemberAPIController implements MemberAPIControllerDocs {
    private final MemberService memberService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final HttpServletResponse response;
    private final S3Service s3Service;

    //  회원가입
    @PostMapping("join")
    @LogStatus
    public ResponseEntity<?> join(MemberDTO memberDTO, @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        log.info("memberDTO {}", memberDTO);
        if (file != null && !file.isEmpty()) {
            String todayPath = memberService.getTodayPath();
            String uploadedKeys = "";

            try {
                log.info("S3 업로드 시작");
                String s3Key = s3Service.uploadFile(file, todayPath);
                uploadedKeys = s3Key;
                log.info("S3업로드 성공 : {}", uploadedKeys );
                log.info("회원저장 시작");
                memberService.join(memberDTO, file);
                log.info("회원 저장성공");
                log.info("파일 정보 저장");
                memberService.saveFile(memberDTO.getId(), file, s3Key);
                log.info("파일 정보 저장 성공");
            } catch (Exception e) {
                log.error("회원가입 파일 처리 실패. uploadedKey=[{}], memberId=[{}]",
                        uploadedKeys, memberDTO.getId(), e);
                s3Service.deleteFile(uploadedKeys);
                memberService.delete(memberDTO.getId());
                throw new RuntimeException("파일 업로드 실패", e);
            }

        } else {
            memberService.join(memberDTO, null);
        }
        return ResponseEntity.ok(Map.of("message", "회원가입 성공"));
    }

    @PostMapping("oauth/join")
    @LogStatusWithReturn
    public ResponseEntity<?> oauthJoin(
            MemberDTO memberDTO,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {
        // 프론트가 보내는 provider/providerId/profileURL/oauthJoin/memberName/memberEmail/memberPhone
        // + 추가정보를 받아서
        // OAuth 신규가입 전용 서비스로 넘김
        return ResponseEntity.ok(Map.of("message", "SNS 회원가입 성공"));
    }

    @GetMapping("check-email")
    @LogStatusWithReturn
    public boolean checkEmail(@RequestParam String memberEmail){
        return memberService.checkEmail(memberEmail);
    }
    @GetMapping("check-phone")
    @LogStatusWithReturn
    public boolean checkPhone(@RequestParam String memberPhone){
        return memberService.checkPhone(memberPhone);
    }
    @GetMapping("check-handle")
    @LogStatusWithReturn
    public boolean checkHandle(@RequestParam String memberHandle){
        // 아이디 모달에서 blur 시 중복검사를 호출한다.
        return memberService.checkHandle(memberHandle);
    }

    @GetMapping("check-company-name")
    @LogStatusWithReturn
    public boolean checkCompanyName(@RequestParam String companyName){
        return memberService.checkCompanyName(companyName);
    }

    @GetMapping("check-business-number")
    @LogStatusWithReturn
    public boolean checkBusinessNumber(@RequestParam String businessNumber){
        return memberService.checkBusinessNumber(businessNumber);
    }

    @PostMapping("login")
    @LogStatusWithReturn
    public ResponseEntity<?> login(@RequestBody MemberDTO memberDTO){
        log.info("memberDTO: {}", memberDTO);
        try{
            Map<String, String> tokenMap = new HashMap<>();

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(memberDTO.getLoginId(),memberDTO.getMemberPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("authentication: {}", (CustomUserDetails) authentication.getPrincipal());

            String accessToken = jwtTokenProvider.createAccessToken(memberDTO.getLoginId());
            jwtTokenProvider.createRefreshToken(memberDTO.getLoginId());

            tokenMap.put("accessToken", accessToken);

            Cookie rememberLoginIdCookie = new Cookie("rememberLoginId", memberDTO.getLoginId());

            rememberLoginIdCookie.setPath("/");
            rememberLoginIdCookie.setMaxAge(60 * 60 * 24 * 30);
            response.addCookie(rememberLoginIdCookie);

            return ResponseEntity.ok(tokenMap);
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인 실패"));
        }
    }

    // 일반 로그인은 그대로 두고, 재활성화는 로그인 실패 후 별도 흐름으로만 진입시킨다.
    // 여기서는 inactive 계정인지와 비밀번호 일치 여부만 확인해 확인 모달용 최소 정보만 내려준다.
    @PostMapping("reactivation/prepare")
    @LogStatusWithReturn
    public ResponseEntity<?> prepareReactivation(@RequestBody MemberDTO memberDTO) {
        try {
            MemberDTO member = memberService.getInactiveMemberForReactivation(
                    memberDTO.getLoginId(),
                    memberDTO.getMemberPassword()
            );

            boolean useEmail = memberDTO.getLoginId() != null && memberDTO.getLoginId().contains("@");

            return ResponseEntity.ok(Map.of(
                    "useEmail", useEmail,
                    "maskedTarget", memberService.getMaskedReactivationTarget(memberDTO.getLoginId(), member)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 인증코드 확인이 끝난 뒤 inactive 상태만 active로 복구하고,
    // 기존 로그인과 같은 인증 매니저 흐름으로 access/refresh 토큰 발급까지 마무리한다.
    @PostMapping("reactivation/complete")
    @LogStatusWithReturn
    public ResponseEntity<?> completeReactivation(@RequestBody MemberDTO memberDTO) {
        try {
            memberService.reactivateMember(
                    memberDTO.getLoginId(),
                    memberDTO.getMemberPassword()
            );

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            memberDTO.getLoginId(),
                            memberDTO.getMemberPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String accessToken = jwtTokenProvider.createAccessToken(memberDTO.getLoginId());
            jwtTokenProvider.createRefreshToken(memberDTO.getLoginId());

            Cookie rememberLoginIdCookie = new Cookie("rememberLoginId", memberDTO.getLoginId());
            rememberLoginIdCookie.setPath("/");
            rememberLoginIdCookie.setMaxAge(60 * 60 * 24 * 30);
            response.addCookie(rememberLoginIdCookie);

            return ResponseEntity.ok(Map.of("accessToken", accessToken));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("info")
    @LogStatusWithReturn
    public MemberDTO getUserInfo(HttpServletRequest request) {
        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String userName = jwtTokenProvider.getUsername(token);
        MemberDTO memberDTO = memberService.getMember(userName);

        return memberDTO;
    }

    //  프로필 수정
    @PostMapping("profile/update")
    @LogStatus
    public ResponseEntity<?> updateProfile(
            MemberDTO memberDTO,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestParam(value = "bannerImage", required = false) MultipartFile bannerImage,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) throws IOException {
        // 수정 대상 회원 id는 프론트에서 받지 않고 로그인 사용자 기준으로 고정한다.
        // 이렇게 해야 다른 회원 id를 넣어 요청하는 조작을 막을 수 있다.
        memberDTO.setId(userDetails.getId());

        String todayPath = memberService.getTodayPath();
        String uploadedProfileKey = "";
        String uploadedBannerKey = "";

        // 새 파일 저장이 성공한 뒤에만 기존 파일을 지우기 위해 먼저 기존 파일 정보를 읽어둔다.
        MemberProfileFileDTO oldProfileFile = memberService.getProfileFile(userDetails.getId());
        MemberProfileFileDTO oldBannerFile = memberService.getBannerFile(userDetails.getId());

        try {
            // 1. 텍스트 정보는 이미지와 별개로 먼저 저장한다.
            memberService.update(memberDTO);

            // 2. 프로필 이미지를 새로 선택한 경우에만 업로드/저장을 진행한다.
            if (profileImage != null && !profileImage.isEmpty()) {
                uploadedProfileKey = s3Service.uploadFile(profileImage, todayPath);
                memberService.saveFile(userDetails.getId(), profileImage, uploadedProfileKey);

                // 새 프로필 저장이 끝난 뒤에만 이전 프로필 메타와 S3 파일을 정리한다.
                if (oldProfileFile != null) {
                    memberService.deleteProfileFile(oldProfileFile.getId());

                    if (oldProfileFile.getFileName() != null && !oldProfileFile.getFileName().isEmpty()) {
                        s3Service.deleteFile(oldProfileFile.getFileName());
                    }
                }
            }

            // 3. 배너 이미지를 새로 선택한 경우에만 업로드/저장을 진행한다.
            if (bannerImage != null && !bannerImage.isEmpty()) {
                uploadedBannerKey = s3Service.uploadFile(bannerImage, todayPath);
                memberService.saveBannerFile(userDetails.getId(), bannerImage, uploadedBannerKey);

                if (oldBannerFile != null) {
                    memberService.deleteProfileFile(oldBannerFile.getId());

                    if (oldBannerFile.getFileName() != null && !oldBannerFile.getFileName().isEmpty()) {
                        s3Service.deleteFile(oldBannerFile.getFileName());
                    }
                }
            }
        } catch (Exception e) {
            // 이번 요청에서 새로 올린 파일만 되돌린다.
            // 기존 파일은 새 저장이 끝나기 전까지 지우지 않았기 때문에 그대로 유지된다.
            if (uploadedProfileKey != null && !uploadedProfileKey.isEmpty()) {
                s3Service.deleteFile(uploadedProfileKey);
            }

            if (uploadedBannerKey != null && !uploadedBannerKey.isEmpty()) {
                s3Service.deleteFile(uploadedBannerKey);
            }

            throw new RuntimeException("프로필 수정 실패", e);
        }

        return ResponseEntity.ok(Map.of("message", "프로필 수정 성공"));
    }
}
