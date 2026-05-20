package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum ProfileImageType {
    PROFILE("profile"), BANNER("banner");

    private final String value;

    private static final Map<String, ProfileImageType> PROFILE_IMAGE_TYPE_MAP =
            Arrays.stream(ProfileImageType.values()).collect(Collectors.toMap(ProfileImageType::getValue, Function.identity()));

    @JsonCreator
    ProfileImageType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static ProfileImageType getStatus(String value) {
        return PROFILE_IMAGE_TYPE_MAP.get(value);
    }
}
