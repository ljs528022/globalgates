package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum ReportStatus {
    PENDING("pending"), APPLIED("applied"), REJECTED("rejected");

    private final String value;

    private static final Map<String, ReportStatus> REPORT_STATUS_MAP =
            Arrays.stream(ReportStatus.values()).collect(Collectors.toMap(ReportStatus::getValue, Function.identity()));

    @JsonCreator
    ReportStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static ReportStatus getReportStatus(String value) {
        return REPORT_STATUS_MAP.get(value);
    }
}
