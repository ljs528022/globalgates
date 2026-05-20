package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum NewsCategoryType {
    TRADE("trade", "무역동향"),
    MARKET("market", "수출입"),
    POLICY("policy", "정책"),
    TECHNOLOGY("technology", "전자재료"),
    ETC("etc", "기타");

    private final String value;
    private final String label;

    private static final Map<String, NewsCategoryType> NEWS_CATEGORY_TYPE_MAP =
            Arrays.stream(NewsCategoryType.values()).collect(Collectors.toMap(NewsCategoryType::getValue, Function.identity()));

    NewsCategoryType(String value, String label) {
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

    public static NewsCategoryType getNewsCategoryType(String value) {
        return NEWS_CATEGORY_TYPE_MAP.get(value);
    }

    @JsonCreator
    public static NewsCategoryType fromValue(String value) {
        return NEWS_CATEGORY_TYPE_MAP.get(value);
    }
}
