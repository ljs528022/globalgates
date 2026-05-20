package com.app.globalgates.common.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum FileContentType {
    IMAGE("image"), VIDEO("video"), DOCUMENT("document"), AUDIO("audio"), ETC("etc");

    private final String value;

    private static final Map<String, FileContentType> FILE_CONTENT_TYPE_MAP =
            Arrays.stream(FileContentType.values()).collect(Collectors.toMap(FileContentType::getValue, Function.identity()));

    @JsonCreator
    FileContentType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static FileContentType getFileContentType(String value) {
        return FILE_CONTENT_TYPE_MAP.get(value);
    }
}