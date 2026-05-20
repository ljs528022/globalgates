package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.domain.PaymentAdvertisementVO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.Optional;

@SpringBootTest
@Slf4j
public class PaymentAdvertisementMapperTests {
    @Autowired
    private PaymentAdvertisementMapper paymentAdvertisementMapper;

    @Test
    public void testSave() {
        PaymentAdvertisementVO payAdVO = PaymentAdvertisementVO.builder()
                .adId(28L)
                .memberId(1L)
                .amount(new BigDecimal("300000.00"))
                .paymentMethod("카드")
                .receiptId("GG-TEST-" + System.currentTimeMillis())
                .paidAt("2026-03-19 14:33:44.786801")
                .build();

        paymentAdvertisementMapper.save(payAdVO);
    }

    @Test
    public void testSelectById() {
        Optional<PaymentAdvertisementVO> foundPayAdVo = paymentAdvertisementMapper.selectById(2L);
        log.info("찾은 결제 내역 : {}", foundPayAdVo);
    }

    @Test
    public void testSelectByReceiptId() {
        Optional<PaymentAdvertisementVO> foundPayAdVo = paymentAdvertisementMapper.selectByReceiptId("GG-TEST-1774184380398");
        log.info("찾은 결제 내역 : {}", foundPayAdVo);
    }

    @Test
    public void testUpdateStatus() {
        paymentAdvertisementMapper.updateStatus("GG-TEST-1774184380398", PaymentStatus.COMPLETED, "2026-03-20 14:33:44.786801");
    }
}
