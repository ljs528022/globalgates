package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.domain.PaymentSubscribeVO;
import lombok.*;

@Getter @Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class PaymentSubscribeDTO {
    private Long id;
    private Long subscriptionId;
    private Long memberId;
    private int amount;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private String receiptId;
    private String paidAt;
    private String createdDatetime;

    public PaymentSubscribeVO toVO() {
        return PaymentSubscribeVO.builder()
                .id(id)
                .subscriptionId(subscriptionId)
                .memberId(memberId)
                .amount(amount)
                .paymentStatus(paymentStatus)
                .paymentMethod(paymentMethod)
                .receiptId(receiptId)
                .paidAt(paidAt)
                .build();
    }
}
