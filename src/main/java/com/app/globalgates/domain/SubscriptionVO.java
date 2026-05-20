package com.app.globalgates.domain;

import com.app.globalgates.audit.Period;
import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class SubscriptionVO extends Period {
    private Long id;
    private Long memberId;
    private SubscriptionTier tier;
    private String billingCycle;
    private SubscriptionStatus status;
    private String startedAt;
    private String expiresAt;
    private boolean quartz;
    private String billingKey;
    private int amount;
}
