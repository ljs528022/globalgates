package com.app.globalgates.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalFrontendConfigAdvice {

    @Value("${google.maps.api-key:}")
    private String googleMapsApiKey;

    @Value("${kakao.maps.js-key:}")
    private String kakaoMapsJsKey;

    @Value("${livekit.server.url:}")
    private String livekitServerUrl;

    @Value("${ad-regression.api.url:}")
    private String adRegressionApiUrl;

    @Value("${profanity.api.base-url:}")
    private String profanityApiBaseUrl;

    @ModelAttribute("googleMapsApiKey")
    public String googleMapsApiKey() {
        return googleMapsApiKey;
    }

    @ModelAttribute("kakaoMapsJsKey")
    public String kakaoMapsJsKey() {
        return kakaoMapsJsKey;
    }

    @ModelAttribute("livekitServerUrl")
    public String livekitServerUrl() {
        return livekitServerUrl;
    }

    @ModelAttribute("adRegressionApiUrl")
    public String adRegressionApiUrl() {
        return adRegressionApiUrl;
    }

    @ModelAttribute("profanityApiBaseUrl")
    public String profanityApiBaseUrl() {
        return profanityApiBaseUrl;
    }
}
