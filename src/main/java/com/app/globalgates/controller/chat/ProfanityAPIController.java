package com.app.globalgates.controller.chat;

import com.app.globalgates.dto.chat.ProfanityCheckResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Controller
@Slf4j
@RequestMapping("/api/v1/chat")
public class ProfanityAPIController {
    // URL이 비거나 깨져 있으면 부팅을 멈추지 말고 fail-open(allow). Cloudflare Tunnel URL이
    // 매일 바뀌고 시크릿이 누락된 채 배포될 수 있어 컨테이너 자체가 죽는 것은 피한다.
    private final WebClient webClient;

    public ProfanityAPIController(@Value("${profanity.api.base-url:}") String profanityApiBaseUrl) {
        WebClient client = null;
        String url = profanityApiBaseUrl == null ? "" : profanityApiBaseUrl.trim();
        if (url.isEmpty()) {
            log.warn("profanity.api.base-url 미설정 — 모든 검사 결과는 allow로 처리한다.");
        } else {
            try {
                client = WebClient.create(url);
                log.info("ProfanityAPI WebClient 초기화 완료: {}", url);
            } catch (RuntimeException e) {
                log.warn("profanity.api.base-url 형식 오류({}) — fail-open. value=[{}]", e.getMessage(), url);
            }
        }
        this.webClient = client;
    }

    @PostMapping("/profanity-check")
    @ResponseBody
    public Mono<ProfanityCheckResponseDTO> profanityCheck(@RequestBody Map<String, String> body){
        String message = body.get("message");
        log.info("message : {}", message);

        if (webClient == null) {
            return Mono.just(allowFallback());
        }

        return webClient.post()
                .uri("/api/profanity/check")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(ProfanityCheckResponseDTO.class)
                .onErrorResume(e -> {
                    log.warn("profanity API 호출 실패 — fail-open: {}", e.toString());
                    return Mono.just(allowFallback());
                });
    }

    private ProfanityCheckResponseDTO allowFallback() {
        ProfanityCheckResponseDTO dto = new ProfanityCheckResponseDTO();
        dto.setAction("allow");
        dto.setLabel("clean");
        dto.setIsAbusive(false);
        dto.setPAbusive(0.0);
        dto.setPClean(1.0);
        return dto;
    }
}
