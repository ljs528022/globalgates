package com.app.globalgates.common.exception.handler;

import com.app.globalgates.common.exception.PostNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

/**
 * 전역 페이지(Thymeleaf) 예외 핸들러.
 * @RestController 는 GlobalRestExceptionHandler 가 가져가고, 그 외 일반 @Controller(Thymeleaf)에서
 * 발생하는 예외를 Error/error 뷰로 라우팅한다.
 *
 * 주의: @RestControllerAdvice 가 RestController 만 매칭하므로, 본 advice 는 그 외 컨트롤러에 적용된다.
 * 우선순위는 LOWEST 로 두어 컨트롤러별 로컬 @ExceptionHandler 와 다른 advice 를 침범하지 않는다.
 */
@ControllerAdvice(annotations = org.springframework.stereotype.Controller.class)
@Order(Ordered.LOWEST_PRECEDENCE)
@Slf4j
public class GlobalPageExceptionHandler {

    @ExceptionHandler({IllegalStateException.class, PostNotFoundException.class, AccessDeniedException.class})
    public String handleAccessOrNotFound(RuntimeException e, Model model) {
        log.warn("페이지 처리 중 예외: {}", e.getMessage());
        model.addAttribute("errorMessage", e.getMessage());
        return "Error/error";
    }
}
