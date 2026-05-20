package com.app.globalgates.domain;

import com.app.globalgates.audit.Period;
import com.app.globalgates.common.enumeration.PaymentStatus;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class PaymentSubscribeVO extends Period {
    private Long id;
    private Long subscriptionId;
    private Long memberId;
    private int amount;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private String receiptId;
    private String paidAt;
}
