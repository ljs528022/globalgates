package com.app.globalgates.auth;

import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.OAuthDAO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuth2SuccessHandlerTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private MemberDAO memberDAO;

    @Mock
    private OAuthDAO oAuthDAO;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private Authentication authentication;

    @Mock
    private OAuth2User oAuth2User;

    @InjectMocks
    private OAuth2SuccessHandler successHandler;

    @Test
    void onAuthenticationSuccess_redirectsNewNaverUserToOAuthBirthModalWithoutClassCastException() throws Exception {
        when(authentication.getPrincipal()).thenReturn(oAuth2User);
        when(oAuth2User.getAttribute("provider")).thenReturn("naver");
        when(oAuth2User.getAttribute("email")).thenReturn("naver-user@example.com");
        when(oAuth2User.getAttribute("phone")).thenReturn(null);
        when(oAuth2User.getAttribute("exist")).thenReturn(false);
        when(oAuth2User.getAttribute("id")).thenReturn("naver-provider-id");
        when(oAuth2User.getAttribute("name")).thenReturn("Naver User");
        when(oAuth2User.getAttribute("profile")).thenReturn("https://example.com/profile.png");
        Collection<? extends GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_BUSINESS"));
        doReturn(authorities).when(oAuth2User).getAuthorities();
        when(memberDAO.findMemberByLoginId("naver-user@example.com")).thenReturn(Optional.empty());

        successHandler.onAuthenticationSuccess(request, response, authentication);

        verify(response).sendRedirect("/member/join?oauth=1&provider=naver&providerId=naver-provider-id&memberEmail=naver-user%40example.com&memberPhone=&memberName=Naver+User&profileUrl=https%3A%2F%2Fexample.com%2Fprofile.png#modal-oauth-birth");
        verify(jwtTokenProvider, never()).createAccessToken(anyString(), anyString());
        verify(jwtTokenProvider, never()).createRefreshToken(anyString(), anyString());
    }
}
