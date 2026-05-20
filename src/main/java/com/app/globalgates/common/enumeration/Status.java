package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum Status {
    ACTIVE("active"), INACTIVE("inactive"), BANNED("banned");

    private final String value;

    private static final Map<String, Status> STATUS_MAP =
            Arrays.stream(Status.values()).collect(Collectors.toMap(Status::getValue, Function.identity()));

    @JsonCreator
    Status(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static Status getStatus(String value) {
        return STATUS_MAP.get(value);
    }
}