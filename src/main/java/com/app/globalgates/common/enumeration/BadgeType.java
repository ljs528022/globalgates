package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum BadgeType {
    PRO("pro"), PRO_PLUS("pro_plus"), EXPERT("expert");

    private final String value;

    private static final Map<String, BadgeType> BADGE_TYPE_MAP =
            Arrays.stream(BadgeType.values()).collect(Collectors.toMap(BadgeType::getValue, Function.identity()));

    @JsonCreator
    BadgeType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static BadgeType getBadgeType(String value) {
        return BADGE_TYPE_MAP.get(value);
    }
}
