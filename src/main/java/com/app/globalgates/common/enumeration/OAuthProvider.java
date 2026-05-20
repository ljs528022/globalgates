package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum OAuthProvider {
    KAKAO("kakao"), NAVER("naver"), GOOGLE("google"), FACEBOOK("facebook");

    private final String value;

    private static final Map<String, OAuthProvider> OAUTH_PROVIDER_MAP =
            Arrays.stream(OAuthProvider.values()).collect(Collectors.toMap(OAuthProvider::getValue, Function.identity()));

    @JsonCreator
    OAuthProvider(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static OAuthProvider getOAuthProvider(String value) {
        return OAUTH_PROVIDER_MAP.get(value);
    }
}
