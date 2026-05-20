package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.Status;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

//    화면에서 받은 문자열을 Enum으로 변환
@Component
public class StringToStatusConverter implements Converter<String, Status> {
    @Override
    public Status convert(@NonNull String source) {
        Map<String, Status> statusMap =
                Stream.of(Status.values())
                        .collect(Collectors.toMap(Status::getValue, Function.identity()));

        return statusMap.get(source);
    }
}
