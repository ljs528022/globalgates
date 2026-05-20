package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum EstimationStatus {
    APPROVE("approve"),
    REQUESTING("requesting"),
    REJECT("reject");

    private final String value;

    private static final Map<String, EstimationStatus> STATUS_MAP =
            Arrays.stream(values()).collect(Collectors.toMap(EstimationStatus::getValue, Function.identity()));

    EstimationStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static EstimationStatus from(String value) {
        return STATUS_MAP.get(value);
    }
}
