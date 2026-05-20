package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.NewsType;
import groovyjarjarantlr4.v4.runtime.misc.NotNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class StringToNewsTypeConverter implements Converter<String, NewsType> {
    @Override
    public NewsType convert(@NotNull String source) {
        Map<String, NewsType> newsTypeMap =
                Stream.of(NewsType.values())
                        .collect(Collectors.toMap(NewsType::getValue, Function.identity()));

        return newsTypeMap.get(source);
    }
}
