package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum AdStatus {
    ACTIVE("active"), REPORTED("reported"), EXPIRED("expired");

    private final String value;

    private static final Map<String, AdStatus> AD_STATUS_MAP =
            Arrays.stream(AdStatus.values()).collect(Collectors.toMap(AdStatus::getValue, Function.identity()));

    @JsonCreator
    AdStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static AdStatus getAdStatus(String value) {
        return AD_STATUS_MAP.get(value);
    }
}