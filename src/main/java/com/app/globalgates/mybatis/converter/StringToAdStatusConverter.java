package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.AdStatus;
import groovyjarjarantlr4.v4.runtime.misc.NotNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class StringToAdStatusConverter implements Converter<String, AdStatus> {
    @Override
    public AdStatus convert(@NotNull String source) {
        Map<String, AdStatus> adStatusMap =
                Stream.of(AdStatus.values())
                        .collect(Collectors.toMap(AdStatus::getValue, Function.identity()));

        return adStatusMap.get(source);
    }
}
