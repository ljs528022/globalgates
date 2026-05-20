package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.domain.PaymentAdvertisementVO;
import lombok.*;

import java.io.Serial;
import java.math.BigDecimal;

@Getter @Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class PaymentAdvertisementDTO {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long adId;
    private Long memberId;
    private BigDecimal amount;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private String receiptId;
    private String paidAt;
    private String createdDatetime;

    public PaymentAdvertisementVO toVO() {
        return PaymentAdvertisementVO.builder()
                .id(id)
                .adId(adId)
                .memberId(memberId)
                .amount(amount)
                .paymentStatus(paymentStatus)
                .paymentMethod(paymentMethod)
                .receiptId(receiptId)
                .paidAt(paidAt)
                .build();
    }
}
