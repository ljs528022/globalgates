package com.app.globalgates.auth;

import com.app.globalgates.common.enumeration.OAuthProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.OAuthDTO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.OAuthDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberDAO memberDAO;
    private final OAuthDAO oAuthDAO;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String provider = oAuth2User.getAttribute("provider");
        String email = oAuth2User.getAttribute("email");
        String phone = oAuth2User.getAttribute("phone");
        boolean isExist = oAuth2User.getAttribute("exist");
        String role = oAuth2User.getAuthorities().stream()
                .map(auth -> auth.getAuthority()).collect(Collectors.joining());
        String path = "/main/main";
        boolean errorCreateTokens = false;
        String loginId = "";
        log.info("들어옴1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,");
        // OAuth 로그인 식별값은 email 우선, 없으면 phone 사용
        if(email != null && !email.isBlank()) {
            loginId = email;
        } else if(phone != null && !phone.isBlank()) {
            loginId = phone;
        } else {
            // Provider가 최소 식별 정보도 안 주면 가입 진행 불가
            path = "/member/join";
            errorCreateTokens = true;
        }
        log.info("loginId : {}",loginId);
        if(isExist){
//            기존 SNS 회원
            //이미 tbl_oauth 연동이 끝난 회원이므로 그대로 토큰 발급
        } else{
            Optional<MemberDTO> foundMember = memberDAO.findMemberByLoginId(loginId);
            log.info("foundMember : {}", foundMember);
            log.info("들어옴2..........................................");
            if(foundMember.isEmpty()){
                // 신규 OAuth 회원:
                // 여기서 DB insert 하지 않고, 추가정보 입력용 임시 토큰만 쿠키에 저장한 뒤
                // 별도 HTML 화면으로 보낸다.
                // 신규 회원:
                // 여기서 member/oauth를 바로 insert 하지 않고,
                // OAuth 제공자가 준 최소 정보만 query string으로 넘겨서
                // 추가정보 입력 페이지로 redirect 한다.

                String providerId = getAttributeAsString(oAuth2User, "id");
                String name = getAttributeAsString(oAuth2User, "name");
                String profileUrl = getAttributeAsString(oAuth2User, "profile");
                log.info("provideId : {}", providerId);
                log.info("name : {}", name);
                log.info("profileUrl : {}",profileUrl);
                log.info("들어옴3.................................");
                path = "/member/join"
                        + "?oauth=1"
                        + "&provider=" + enc(provider)
                        + "&providerId=" + enc(providerId)
                        + "&memberEmail=" + enc(email)
                        + "&memberPhone=" + enc(phone)
                        + "&memberName=" + enc(name)
                        + "&profileUrl=" + enc(profileUrl)
                        + "#modal-oauth-birth";
                log.info("들어옴4.................................");
                log.info("path : {}",path);
                // 아직 회원가입이 끝난 게 아니므로 JWT는 발급하지 않는다.
                errorCreateTokens = true;
//                return RedirectView ;

            }else {
//            기존 회원(자동 연동)
                if(foundMember.get().isMemberLoginVerified()){
                    OAuthDTO oAuthDTO = new OAuthDTO();
                    oAuthDTO.setProvider(OAuthProvider.getOAuthProvider(provider));
                    oAuthDTO.setMemberId(foundMember.get().getId());
                    oAuthDTO.setProviderId(oAuth2User.getAttribute("id"));
                    oAuthDTO.setProfileURL(oAuth2User.getAttribute("profile"));
                    oAuthDAO.save(oAuthDTO.toOAuthVO());

                }else{
                    path = "/member/join";
                    errorCreateTokens = true;
                }
            }
        }

        if(!errorCreateTokens) {
            jwtTokenProvider.createAccessToken(loginId, provider);
            jwtTokenProvider.createRefreshToken(loginId, provider);
        }
        log.info("들어옴5.................................");
        response.sendRedirect(path);
    }

    private String enc(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private String getAttributeAsString(OAuth2User oAuth2User, String attributeName) {
        Object value = oAuth2User.getAttribute(attributeName);
        return value == null ? "" : value.toString();
    }
}

