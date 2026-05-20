package com.app.globalgates.aop.aspect.util;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;

import java.lang.reflect.Method;

//    JoinPoint(광고, 영화, 예능 등)
@Primary
@RequiredArgsConstructor
public class NameMatchMethodMatcher implements MethodMatcher {
    private final String methodName;
    @Override
    public boolean matches(Method method) {
        return methodName.equals(method.getName());
    }
}
