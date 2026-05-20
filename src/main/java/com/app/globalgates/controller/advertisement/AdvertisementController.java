package com.app.globalgates.controller.advertisement;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
@Slf4j
public class AdvertisementController {

    @GetMapping("/ad")
    public String goToAdPage() {
        return "advertisement/advertisement";
    }
}
