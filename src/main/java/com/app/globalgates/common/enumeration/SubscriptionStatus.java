package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum SubscriptionStatus {
    ACTIVE("active"), INACTIVE("inactive"), EXPIRED("expired");

    private final String value;

    private static final Map<String, SubscriptionStatus> SUBSCRIPTION_STATUS_MAP =
            Arrays.stream(SubscriptionStatus.values()).collect(Collectors.toMap(SubscriptionStatus::getValue, Function.identity()));

    @JsonCreator
    SubscriptionStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static SubscriptionStatus getSubscriptionStatus(String value) {
        return SUBSCRIPTION_STATUS_MAP.get(value);
    }
}
