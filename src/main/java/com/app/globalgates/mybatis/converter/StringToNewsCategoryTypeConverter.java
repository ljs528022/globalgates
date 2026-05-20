package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.NewsCategoryType;
import groovyjarjarantlr4.v4.runtime.misc.NotNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class StringToNewsCategoryTypeConverter implements Converter<String, NewsCategoryType> {
    @Override
    public NewsCategoryType convert(@NotNull String source) {
        Map<String, NewsCategoryType> categoryMap =
                Stream.of(NewsCategoryType.values())
                        .collect(Collectors.toMap(NewsCategoryType::getValue, Function.identity()));

        return categoryMap.get(source);
    }
}
