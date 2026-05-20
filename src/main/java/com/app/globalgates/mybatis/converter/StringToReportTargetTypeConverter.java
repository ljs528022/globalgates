package com.app.globalgates.mybatis.converter;

import groovyjarjarantlr4.v4.runtime.misc.NotNull;
import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.common.enumeration.ReportTargetType;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class StringToReportTargetTypeConverter implements Converter<String, ReportTargetType> {
    @Override
    public ReportTargetType convert(@NotNull String source) {
        Map<String, ReportTargetType> reportTargetTypeMap =
                Stream.of(ReportTargetType.values())
                        .collect(Collectors.toMap(ReportTargetType::getValue, Function.identity()));

        return reportTargetTypeMap.get(source);
    }
}
