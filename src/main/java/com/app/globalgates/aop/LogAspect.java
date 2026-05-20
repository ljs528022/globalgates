package com.app.globalgates.aop;


import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

@Aspect
@Configuration
@Slf4j
public class LogAspect {
    @Around("logStatusAnnotated()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable{
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String args = Arrays.stream(joinPoint.getArgs()).map(String::valueOf).collect(Collectors.joining(", "));
        log.info("▶ [{}#{}] 호출 args=({})", className, methodName, args);
        Object result = joinPoint.proceed();
        log.info("◀ [{}#{}] 완료", className, methodName);
        return result;
    }

    @AfterReturning(value = "logStatusWithReturnAnnotated()", returning = "returnValue")
    public void afterReturning(JoinPoint joinPoint, Object returnValue) throws IOException {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String args = Arrays.stream(joinPoint.getArgs()).map(String::valueOf).collect(Collectors.joining(", "));
        log.info("▶ [{}#{}] 호출 args=({})", className, methodName, args);
        log.info("◀ [{}#{}] Return: {}", className, methodName, returnValue);
    }

    @Pointcut("@annotation(com.app.globalgates.aop.annotation.LogStatus)")
    public void logStatusAnnotated(){}

    @Pointcut("@annotation(com.app.globalgates.aop.annotation.LogStatusWithReturn)")
    public void logStatusWithReturnAnnotated(){}
}

















