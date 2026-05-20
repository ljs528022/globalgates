package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.BadgeType;
import groovyjarjarantlr4.v4.runtime.misc.NotNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class StringToBadgeTypeConverter implements Converter<String, BadgeType> {
    @Override
    public BadgeType convert(@NotNull String source) {
        Map<String, BadgeType> badgeTypeMap =
                Stream.of(BadgeType.values())
                        .collect(Collectors.toMap(BadgeType::getValue, Function.identity()));

        return badgeTypeMap.get(source);
    }
}
