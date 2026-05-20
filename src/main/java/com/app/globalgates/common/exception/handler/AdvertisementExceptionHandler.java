package com.app.globalgates.common.exception.handler;

import com.app.globalgates.common.exception.AdvertisementNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.view.RedirectView;

@ControllerAdvice(basePackages = "com.app.globalgates.controller.advertisement")
public class AdvertisementExceptionHandler {
    @ExceptionHandler(AdvertisementNotFoundException.class)
    protected RedirectView foundFail(AdvertisementNotFoundException foundException, RedirectAttributes redirectAttributes) {
        redirectAttributes.addAttribute("found", "Fail");
        return new RedirectView("/ad/list");
    }
}
