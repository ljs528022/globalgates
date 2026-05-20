package com.app.globalgates.controller.video_chat;

import com.app.globalgates.auth.CustomUserDetails;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.apache.hc.core5.ssl.TrustStrategy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.SSLContext;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/video-chat/**")
@Slf4j
public class VideoChatTokenProxyController {

    @Value("${livekit.server.url}")
    private String livekitServerUrl;

    @PostMapping("token")
    public ResponseEntity<Map<String, String>> proxyToken(
            @RequestBody Map<String, String> params,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            // participantName을 서버에서 직접 설정 (currentMemberId 문제 완전 해결)
            Map<String, String> body = new HashMap<>(params);
            body.put("participantName", "member-" + userDetails.getId());

            // 자체 서명 인증서 무시 설정
            TrustStrategy acceptingTrustStrategy = (cert, authType) -> true;
            SSLContext sslContext = SSLContextBuilder.create()
                    .loadTrustMaterial(null, acceptingTrustStrategy)
                    .build();

            var connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
                    .setSSLSocketFactory(
                            SSLConnectionSocketFactoryBuilder.create()
                                    .setSslContext(sslContext)
                                    .setHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                                    .build()
                    ).build();

            var httpClient = HttpClients.custom()
                    .setConnectionManager(connectionManager)
                    .build();

            var requestFactory = new HttpComponentsClientHttpRequestFactory(httpClient);
            var restTemplate = new RestTemplate(requestFactory);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    livekitServerUrl,
                    body,
                    Map.class
            );

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("errorMessage", "토큰 발급 실패: " + e.getMessage()));
        }
    }
}
