package com.app.globalgates.aop.aspect.handler;


import com.app.globalgates.aop.aspect.util.MethodMatcher;
import lombok.RequiredArgsConstructor;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

//  Advice(매니저가 계약서 작성)
@RequiredArgsConstructor
public class SimpleHandler implements InvocationHandler {
    private final Object target;
    private final MethodMatcher methodMatcher;

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
//        invoke: 타겟 메소드를 실행해주는 메소드
        Object returnValue = method.invoke(target, args);

//        주변 로직을 알맞은 시점에 실행해 준다.
        if(returnValue instanceof String && methodMatcher.matches(method)){
            return ((String) returnValue) + "!!!";
        }
        return returnValue;
    }
}


















