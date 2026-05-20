package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum ReportTargetType {
    POST("post"), MEMBER("member");

    private final String value;

    private static final Map<String, ReportTargetType> REPORT_TARGET_TYPE_MAP =
            Arrays.stream(ReportTargetType.values()).collect(Collectors.toMap(ReportTargetType::getValue, Function.identity()));

    @JsonCreator
    ReportTargetType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static ReportTargetType getReportTargetType(String value) {
        return REPORT_TARGET_TYPE_MAP.get(value);
    }
}
