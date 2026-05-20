package com.app.globalgates.auth;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@Builder(access = AccessLevel.PRIVATE)
@Getter
@ToString
@Slf4j
public class OAuth2Attribute {
    private Map<String, Object> attributes;
    private String userNameAttributeName;
    private String provider;
    private String id;
    private String email;
    private String name;
    private String phone;
    private String profile;

    public static OAuth2Attribute of(String provider, String userNameAttribute, Map<String, Object> attributes) {
        switch (provider) {
            case "kakao":
                return ofKakao(provider, userNameAttribute, attributes);
            case "naver":
                return ofNaver(provider, userNameAttribute, attributes);
            case "facebook":
                return ofFacebook(provider, userNameAttribute, attributes);
            case "google":
                return ofGoogle(provider, userNameAttribute, attributes);
            default:
                throw new RuntimeException();
        }
    }

    //    카카오
    private static OAuth2Attribute ofKakao(String provider, String userNameAttribute, Map<String, Object> attributes) {
        String providerId = String.valueOf(((Long)attributes.get("id")).longValue());
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> kakaoProfile = (Map<String, Object>) kakaoAccount.get("profile");

        return OAuth2Attribute.builder()
                .id(providerId)
                .provider(provider)
                .email((String)kakaoAccount.get("email"))
                .name((String) kakaoProfile.get("nickname"))
                .profile((String)kakaoProfile.get("profile_image_url"))
                .attributes(kakaoAccount)
                .userNameAttributeName(userNameAttribute)
                .build();
    }

    //    네이버
    private static OAuth2Attribute ofNaver(String provider, String userNameAttribute, Map<String, Object> attributes) {
        Map<String, Object> naverResponse = (Map<String, Object>) attributes.get("response");

        return OAuth2Attribute.builder()
                .id((String)naverResponse.get("id"))
                .provider(provider)
                .email((String)naverResponse.get("email"))
                .name((String) naverResponse.get("name"))
                .profile((String)naverResponse.get("profile_image"))
                .attributes(naverResponse)
                .userNameAttributeName(userNameAttribute)
                .build();
    }

    //  facebook
    private static OAuth2Attribute ofFacebook(String provider, String userNameAttribute, Map<String, Object> attributes) {
        return OAuth2Attribute.builder()
                .id((String) attributes.get("id"))
                .provider(provider)
                .email((String) attributes.get("email"))
                .name((String) attributes.get("name"))
                .profile((String) attributes.get("public_profile"))
                .attributes(attributes)
                .userNameAttributeName(userNameAttribute)
                .build();
    }

    //  google

    private static OAuth2Attribute ofGoogle(String provider, String userNameAttribute, Map<String, Object> attributes) {
        return OAuth2Attribute.builder()
                .id((String) attributes.get("sub"))
                .provider(provider)
                .email((String) attributes.get("email"))
                .name((String) attributes.get("name"))
                .profile((String) attributes.get("picture"))
                .attributes(attributes)
                .userNameAttributeName(userNameAttribute)
                .build();
    }

    public Map<String, Object> convertToMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("provider", provider);
        map.put("email", email);
        map.put("name", name);
        map.put("profile", profile);
        return map;
    }
}
