package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.OAuthProvider;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

//    화면에서 받은 문자열을 Enum으로 변환
@Component
public class StringToOAuthProviderConverter implements Converter<String, OAuthProvider> {
    @Override
    public OAuthProvider convert(@NonNull String source) {
        Map<String, OAuthProvider> OAuthProviderMap =
                Stream.of(OAuthProvider.values())
                        .collect(Collectors.toMap(OAuthProvider::getValue, Function.identity()));

        return OAuthProviderMap.get(source);
    }
}