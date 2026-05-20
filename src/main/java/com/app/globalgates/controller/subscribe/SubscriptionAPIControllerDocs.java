package com.app.globalgates.controller.subscribe;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.SubscriptionDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Subscription", description = "Subscription API")
public interface SubscriptionAPIControllerDocs {
    @Operation(
            summary = "구독하기",
            description = "구독 + 뱃지 + 멤버롤(expert일 경우) 처리",
            parameters = {@Parameter(name = "subscriptionDTO", description = "구독 정보"),
                            @Parameter(name = "userDetails", description = "로그인한 유저의 정보")}
    )
    public Long subscribe(@RequestBody SubscriptionDTO subscriptionDTO, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "현재 구독 조회",
            description = "로그인한 회원의 현재 구독 정보를 조회한다.",
            parameters = {@Parameter(name = "userDetails", description = "로그인한 유저의 정보")}
    )
    public SubscriptionDTO my(@AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "구독 해지",
            description = "월간 구독을 해지한다.",
            parameters = {@Parameter(name = "subscriptionDTO", description = "해지할 구독 정보"),
                            @Parameter(name = "userDetails", description = "로그인한 유저의 정보")}
    )
    public void cancel(@RequestBody SubscriptionDTO subscriptionDTO, @AuthenticationPrincipal CustomUserDetails userDetails);
}
