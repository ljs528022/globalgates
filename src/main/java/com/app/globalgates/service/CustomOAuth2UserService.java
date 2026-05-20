package com.app.globalgates.service;

import com.app.globalgates.auth.OAuth2Attribute;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.OAuthProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.repository.OAuthDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final OAuthDAO oAuthDAO;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = oAuth2UserService.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        log.info("registration id: {}", provider);
        log.info("user name attribute name: {}", userNameAttributeName);
        log.info("OAuth2.0: {}", oAuth2User.getAttributes());

        OAuth2Attribute oAuth2Attribute = OAuth2Attribute.of(provider, userNameAttributeName, oAuth2User.getAttributes());
        Map<String, Object> oAuth2AttributeMap = oAuth2Attribute.convertToMap();

        String loginId = "";
        if (oAuth2Attribute.getEmail() != null && !
                oAuth2Attribute.getEmail().isBlank()) {
            loginId = oAuth2Attribute.getEmail();
        } else if (oAuth2Attribute.getPhone() != null && !
                oAuth2Attribute.getPhone().isBlank()) {
            loginId = oAuth2Attribute.getPhone();
        }

        Optional<MemberDTO> foundMember = Optional.empty();

        if (!loginId.isBlank()) {
            foundMember = oAuthDAO.findMemberByMemberLoginId(
                    loginId,
                    OAuthProvider.getOAuthProvider(provider)
            );
        }

        oAuth2AttributeMap.put("exist", foundMember.isPresent());

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + (foundMember.isEmpty() ? MemberRole.BUSINESS.name() : foundMember.get().getMemberRole().name()))),
                oAuth2AttributeMap, "id");
    }
}