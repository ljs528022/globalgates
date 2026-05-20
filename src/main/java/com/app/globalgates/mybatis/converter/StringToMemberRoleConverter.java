package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.MemberRole;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

//    화면에서 받은 문자열을 Enum으로 변환
@Component
public class StringToMemberRoleConverter implements Converter<String, MemberRole> {
    @Override
    public MemberRole convert(@NonNull String source) {
        Map<String, MemberRole> memberRoleMap =
                Stream.of(MemberRole.values())
                        .collect(Collectors.toMap(MemberRole::getValue, Function.identity()));

        return memberRoleMap.get(source);
    }
}

