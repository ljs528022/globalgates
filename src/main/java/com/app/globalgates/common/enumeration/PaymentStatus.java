package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum PaymentStatus {
    PENDING("pending"), COMPLETED("completed"), CANCELLED("cancelled"), FAILED("failed");

    private final String value;

    private static final Map<String, PaymentStatus> PAYMENT_STATUS_MAP =
            Arrays.stream(PaymentStatus.values()).collect(Collectors.toMap(PaymentStatus::getValue, Function.identity()));

    @JsonCreator
    PaymentStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static PaymentStatus getPaymentStatus(String value) {
        return PAYMENT_STATUS_MAP.get(value);
    }
}
