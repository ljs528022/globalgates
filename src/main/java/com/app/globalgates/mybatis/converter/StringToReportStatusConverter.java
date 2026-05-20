package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.common.enumeration.ReportStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class StringToReportStatusConverter implements Converter<String, ReportStatus> {
    @Override
    public ReportStatus convert(@NonNull String source) {
        Map<String, ReportStatus> reportStatusMap =
                Stream.of(ReportStatus.values())
                        .collect(Collectors.toMap(ReportStatus::getValue, Function.identity()));

        return reportStatusMap.get(source);
    }
}
