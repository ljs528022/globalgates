package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import com.app.globalgates.domain.SubscriptionVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class SubscriptionDTO {
    private Long id;
    private Long memberId;
    private SubscriptionTier tier;
    private String billingCycle;
    private SubscriptionStatus status;
    private String startedAt;
    private String expiresAt;
    private String createdDatetime;
    private String updatedDatetime;
    private boolean quartz;
    private String billingKey;
    private int amount;

    public SubscriptionVO toVO() {
        return SubscriptionVO.builder()
                .id(id)
                .memberId(memberId)
                .tier(tier)
                .billingCycle(billingCycle)
                .status(status)
                .startedAt(startedAt)
                .expiresAt(expiresAt)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .quartz(quartz)
                .billingKey(billingKey)
                .amount(amount)
                .build();
    }
}
