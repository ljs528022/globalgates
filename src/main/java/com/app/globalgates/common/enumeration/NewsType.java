package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum NewsType {
    GENERAL("general", "일반"),
    EMERGENCY("emergency", "속보");

    private final String value;
    private final String label;

    private static final Map<String, NewsType> NEWS_TYPE_MAP =
            Arrays.stream(NewsType.values()).collect(Collectors.toMap(NewsType::getValue, Function.identity()));

    NewsType(String value, String label) {
        this.value = value;
        this.label = label;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public String getLabel() {
        return label;
    }

    public static NewsType getNewsType(String value) {
        return NEWS_TYPE_MAP.get(value);
    }

    @JsonCreator
    public static NewsType fromValue(String value) {
        return NEWS_TYPE_MAP.get(value);
    }
}
