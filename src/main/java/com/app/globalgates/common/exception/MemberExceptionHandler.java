package com.app.globalgates.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.view.RedirectView;

@ControllerAdvice(basePackages = "com.app.oauth.controller.member")
@Slf4j
public class MemberExceptionHandler {
    @ExceptionHandler({MemberLoginFailException.class})
    public RedirectView handleMemberLoginFailException(MemberLoginFailException e) {
        return new RedirectView("/member/join");
    }

    @ExceptionHandler({MemberNotFoundException.class})
    public RedirectView handleMemberNotFoundException(MemberNotFoundException e) {
        return new RedirectView("/member/join");
    }
}
