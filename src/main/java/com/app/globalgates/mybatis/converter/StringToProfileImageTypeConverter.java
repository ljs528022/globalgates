package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.common.enumeration.Status;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class StringToProfileImageTypeConverter implements Converter<String, ProfileImageType> {
    @Override
    public ProfileImageType convert(@NonNull String source) {
        Map<String, ProfileImageType> ProfileImageTypeMap =
                Stream.of(ProfileImageType.values())
                        .collect(Collectors.toMap(ProfileImageType::getValue, Function.identity()));

        return ProfileImageTypeMap.get(source);
    }
}
