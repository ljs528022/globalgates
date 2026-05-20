package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.PaymentStatus;
import groovyjarjarantlr4.v4.runtime.misc.NotNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class StringToPaymentStatusConverter implements Converter<String, PaymentStatus> {
    @Override
    public PaymentStatus convert(@NotNull String source) {
        Map<String, PaymentStatus> paymentStatusMap =
                Stream.of(PaymentStatus.values())
                        .collect(Collectors.toMap(PaymentStatus::getValue, Function.identity()));

        return paymentStatusMap.get(source);
    }
}
