package com.app.globalgates.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

// 루트(/) 요청을 메인으로 보낸다. 인증되지 않은 사용자는 Security 필터에 의해
// 자연스럽게 /member/login 으로 다시 리다이렉트된다.
@Controller
public class RootController {

    @GetMapping("/")
    public String index() {
        return "redirect:/main/main";
    }
}
