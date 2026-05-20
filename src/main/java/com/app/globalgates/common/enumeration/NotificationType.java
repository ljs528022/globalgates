package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum NotificationType {
    CONNECT("connect"),
    APPROVE("approve"),
    LIKE("like"),
    POST("post"),
    REPLY("reply"),
    MESSAGE("message"),
    ESTIMATION("estimation"),
    SYSTEM("system"),
    HANDLE("handle");

    private final String value;

    private static final Map<String, NotificationType> NOTIFICATION_TYPE_MAP =
            Arrays.stream(NotificationType.values()).collect(Collectors.toMap(NotificationType::getValue, Function.identity()));

    @JsonCreator
    NotificationType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static NotificationType getNotificationType(String value) {
        return NOTIFICATION_TYPE_MAP.get(value);
    }
}
