package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.FileContentType;
import groovyjarjarantlr4.v4.runtime.misc.NotNull;
import org.springframework.core.convert.converter.Converter;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class StringToFileContentTypeConverter implements Converter<String, FileContentType> {
    @Override
    public FileContentType convert(@NotNull String source) {
        Map<String, FileContentType> fileContentTypeMap =
                Stream.of(FileContentType.values())
                        .collect(Collectors.toMap(FileContentType::getValue, Function.identity()));

        return fileContentTypeMap.get(source);
    }
}