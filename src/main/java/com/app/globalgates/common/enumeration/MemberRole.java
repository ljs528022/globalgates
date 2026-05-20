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

public enum MemberRole {
    BUSINESS("business"), EXPERT("expert"), ADMIN("admin");

    private final String value;

    private static final Map<String, MemberRole> MEMBER_ROLE_MAP =
            Arrays.stream(MemberRole.values()).collect(Collectors.toMap(MemberRole::getValue, Function.identity()));

    @JsonCreator
    MemberRole(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static MemberRole getMemberRole(String value) {
        return MEMBER_ROLE_MAP.get(value);
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.name()));
    }
}