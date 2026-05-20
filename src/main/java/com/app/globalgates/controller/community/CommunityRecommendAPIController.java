package com.app.globalgates.controller.community;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.CommunityRecommendItemDTO;
import com.app.globalgates.dto.CommunityRecommendResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

// FastAPI 추천 서버 호출 릴레이 — 가입 직후 프론트가 호출해 유사 커뮤니티 Top-N 을 받아간다.
//
// 책임:
//   - 인증된 회원만 호출 가능 (BOLA 방지)
//   - FastAPI 응답을 그대로 프론트에 패스스루
//   - FastAPI 가 죽어 있거나 404 를 내도 가입 자체는 이미 끝난 상태이므로
//     응답을 빈 items 로 fallback — 추천 실패가 사용자 흐름을 차단하지 않도록 한다.
@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
@Slf4j
public class CommunityRecommendAPIController {

    private final WebClient ragWebClient;

    // GET /api/communities/{id}/recommendations?topN=5&method=tfidf
    // → FastAPI POST /api/community/recommend 로 변환해 호출
    @GetMapping("/{id}/recommendations")
    public ResponseEntity<CommunityRecommendResponseDTO> getRecommendations(
            @PathVariable("id") Long communityId,
            @RequestParam(value = "topN", defaultValue = "5") Integer topN,
            @RequestParam(value = "method", defaultValue = "tfidf") String method,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // 비로그인 차단 — 가입 직후에만 의미 있는 호출이므로 미인증은 거절
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        Map<String, Object> body = new HashMap<>();
        body.put("communityId", communityId);
        body.put("topN", topN);
        body.put("method", method);

        log.info("[추천 호출] memberId={}, communityId={}, topN={}, method={}",
                userDetails.getId(), communityId, topN, method);

        try {
            CommunityRecommendResponseDTO result = ragWebClient.post()
                    .uri("/api/community/recommend")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response ->
                            response.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .flatMap(errBody -> Mono.error(
                                            new ResponseStatusException(response.statusCode(), errBody)
                                    ))
                    )
                    .bodyToMono(CommunityRecommendResponseDTO.class)
                    .timeout(Duration.ofSeconds(3))
                    .block();

            log.info("[추천 응답 수신] baseId={}, items={}",
                    result != null ? result.getBaseId() : null,
                    result != null && result.getItems() != null ? result.getItems().size() : 0);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // ResponseStatusException 의 status 를 cause chain 따라 추출 — onStatus 콜백이
            // 던진 status 가 wrapper 안에 들어 있을 수 있다.
            HttpStatusCode statusCode = null;
            Throwable cur = e;
            while (cur != null && statusCode == null) {
                if (cur instanceof ResponseStatusException rse) {
                    statusCode = rse.getStatusCode();
                }
                cur = cur.getCause();
            }

            // 401/403 은 인증/권한 문제 — 200+empty 로 가리면 사용자/운영자가 "추천 없음" 으로
            // 오인해 진짜 원인(토큰 만료, 권한 누락 등) 을 놓친다. 상태를 그대로 전달.
            if (statusCode != null && (statusCode.value() == 401 || statusCode.value() == 403)) {
                log.warn("[추천 인증 실패] communityId={}, status={}", communityId, statusCode.value());
                return ResponseEntity.status(statusCode).build();
            }

            // 그 외 (FastAPI 다운/타임아웃/404/503) — 가입 흐름은 이미 완료된 상태이므로
            // 빈 추천으로 graceful degrade. 화면은 "추천 없음" 으로 정상 동작한다.
            log.warn("[추천 fallback] FastAPI 호출 실패: communityId={}, cause={}",
                    communityId, e.getMessage());
            CommunityRecommendResponseDTO fallback = new CommunityRecommendResponseDTO();
            fallback.setBaseId(communityId);
            fallback.setMethod(method);
            fallback.setItems(new ArrayList<CommunityRecommendItemDTO>());
            return ResponseEntity.ok(fallback);
        }
    }
}
