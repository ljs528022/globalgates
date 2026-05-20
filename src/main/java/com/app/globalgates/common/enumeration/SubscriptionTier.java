package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum SubscriptionTier {
    FREE("free"), PRO("pro"), PRO_PLUS("pro_plus"), EXPERT("expert");

    private final String value;

    private static final Map<String, SubscriptionTier> SUBSCRIPTION_TIER_MAP =
            Arrays.stream(SubscriptionTier.values()).collect(Collectors.toMap(SubscriptionTier::getValue, Function.identity()));

    @JsonCreator
    SubscriptionTier(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static SubscriptionTier getSubscriptionTier(String value) {
        return SUBSCRIPTION_TIER_MAP.get(value);
    }
}
