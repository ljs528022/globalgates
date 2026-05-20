package com.app.globalgates.service;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class BootpayBillingService {

    @Value("${bootpay.application-id}")
    private String applicationId;

    @Value("${bootpay.private-key}")
    private String privateKey;

    @Value("${bootpay.api-base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // 토큰 캐싱 (만료 30분 전까지 재사용)
    private String cachedToken = null;
    private long tokenExpiresAtMillis = 0L;

    /**
     * Bootpay 액세스 토큰 발급 (POST /v2/request/token)
     * 30분간 유효. 만료 60초 전까지는 캐시 사용.
     */
    public String getAccessToken() {
        if (cachedToken != null && System.currentTimeMillis() < tokenExpiresAtMillis - 60_000L) {
            return cachedToken;
        }

        String url = baseUrl + "/v2/request/token";
        Map<String, String> body = Map.of(
                "application_id", applicationId,
                "private_key", privateKey
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            Map<?, ?> response = restTemplate.postForObject(
                    url, new HttpEntity<>(body, headers), Map.class);
            log.info("Bootpay 토큰 응답: {}", response);

            if (response == null) throw new RuntimeException("Bootpay 토큰 응답 없음");

            //    Bootpay v2 응답: { access_token, expire_in }
            //    구버전은 { token, expired_at } — 둘 다 대응
            Object dataObj = response.get("data");
            Map<?, ?> dataMap = (dataObj instanceof Map<?, ?>) ? (Map<?, ?>) dataObj : response;

            Object tokenObj = dataMap.get("access_token");
            if (tokenObj == null) tokenObj = dataMap.get("token");
            if (tokenObj == null) tokenObj = response.get("access_token");
            if (tokenObj == null) tokenObj = response.get("token");
            if (tokenObj == null) {
                throw new RuntimeException("Bootpay 토큰 응답에서 access_token 못 찾음: " + response);
            }
            String token = String.valueOf(tokenObj);

            //    expire_in (남은 초) 또는 expired_at (unix timestamp 초)
            Object expireIn = dataMap.get("expire_in");
            if (expireIn == null) expireIn = response.get("expire_in");
            Object expiredAt = dataMap.get("expired_at");
            if (expiredAt == null) expiredAt = response.get("expired_at");

            long expiresAtMillis;
            if (expireIn instanceof Number n) {
                expiresAtMillis = System.currentTimeMillis() + n.longValue() * 1000L;
            } else if (expiredAt instanceof Number n) {
                expiresAtMillis = n.longValue() * 1000L;
            } else {
                expiresAtMillis = System.currentTimeMillis() + 1800_000L;
            }

            cachedToken = token;
            tokenExpiresAtMillis = expiresAtMillis;
            return token;
        } catch (HttpStatusCodeException e) {
            log.error("Bootpay 토큰 발급 HTTP 에러 status={} body={}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("Bootpay 토큰 발급 실패 [" + e.getStatusCode() + "]: "
                    + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Bootpay 토큰 발급 실패", e);
            throw new RuntimeException("Bootpay 토큰 발급 실패: " + e.getMessage(), e);
        }
    }

    /**
     * receipt_id 로 실제 billing_key 조회 (GET /v2/subscribe/billing_key/{receipt_id})
     * Bootpay v2 정기결제 흐름:
     *   - 프론트 requestSubscription() → receipt_id 받음 (실제 billing_key 아님)
     *   - 백엔드에서 receipt_id 로 조회 → 실제 billing_key 추출
     */
    public String resolveBillingKey(String receiptId) {
        String token = getAccessToken();
        String url = baseUrl + "/v2/subscribe/billing_key/" + receiptId;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        try {
            org.springframework.http.ResponseEntity<Map> resp = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class);
            Map<?, ?> body = resp.getBody();
            log.info("Bootpay billing_key 조회 응답: {}", body);
            if (body == null) throw new RuntimeException("billing_key 조회 응답 없음");
            Object billingKey = body.get("billing_key");
            if (billingKey == null) {
                throw new RuntimeException("응답에 billing_key 없음: " + body);
            }
            return String.valueOf(billingKey);
        } catch (HttpStatusCodeException e) {
            log.error("billing_key 조회 HTTP 에러 status={} body={}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("billing_key 조회 실패 [" + e.getStatusCode() + "]: "
                    + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("billing_key 조회 실패", e);
            throw new RuntimeException("billing_key 조회 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 빌링키로 정기결제 1회 청구 (POST /v2/subscribe/payment)
     * billing_key 는 body에 포함.
     */
    public BillingResult charge(String billingKey, int amount, String orderName,
                                String orderId, String itemName, Long userId) {
        log.info("정기결제 청구 시작 — billingKey={}, amount={}, orderId={}", billingKey, amount, orderId);

        String token;
        try {
            token = getAccessToken();
        } catch (Exception e) {
            return BillingResult.fail("토큰 발급 실패: " + e.getMessage());
        }

        String url = baseUrl + "/v2/subscribe/payment";

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", String.valueOf(userId));

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> item = new HashMap<>();
        item.put("name", itemName);
        item.put("qty", 1);
        item.put("id", "SUBSCRIBE_" + userId);
        item.put("price", amount);
        items.add(item);

        Map<String, Object> body = new HashMap<>();
        body.put("billing_key", billingKey);
        body.put("price", amount);
        body.put("order_name", orderName);
        body.put("order_id", orderId);
        body.put("tax_free", 0);
        body.put("user", userInfo);
        body.put("items", items);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        try {
            Map<?, ?> response = restTemplate.postForObject(
                    url, new HttpEntity<>(body, headers), Map.class);
            log.info("Bootpay 빌링결제 응답: {}", response);

            if (response == null) return BillingResult.fail("응답 없음");

            Object errorCode = response.get("error_code");
            if (errorCode != null) {
                String message = String.valueOf(response.get("message"));
                return BillingResult.fail("결제 실패: " + message);
            }

            Object data = response.get("data");
            String receiptId = null;
            if (data instanceof Map<?, ?> dataMap) {
                Object rid = dataMap.get("receipt_id");
                if (rid != null) receiptId = String.valueOf(rid);
            }
            //    data 없거나 receipt_id 없으면 응답 자체에서 시도
            if (receiptId == null && response.get("receipt_id") != null) {
                receiptId = String.valueOf(response.get("receipt_id"));
            }

            log.info("정기결제 성공 receiptId={}", receiptId);
            return BillingResult.success(receiptId);
        } catch (HttpStatusCodeException e) {
            log.error("정기결제 HTTP 에러 status={} body={}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            return BillingResult.fail("HTTP " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("정기결제 호출 예외", e);
            return BillingResult.fail(e.getMessage());
        }
    }

    @Getter
    public static class BillingResult {
        private final boolean success;
        private final String receiptId;
        private final String message;

        private BillingResult(boolean success, String receiptId, String message) {
            this.success = success;
            this.receiptId = receiptId;
            this.message = message;
        }

        public static BillingResult success(String receiptId) {
            return new BillingResult(true, receiptId, null);
        }

        public static BillingResult fail(String message) {
            return new BillingResult(false, null, message);
        }
    }
}
