package com.app.globalgates.repository;

import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.domain.PaymentAdvertisementVO;
import com.app.globalgates.mapper.PaymentAdvertisementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PaymentAdvertisementDAO {
    private final PaymentAdvertisementMapper paymentAdvertisementMapper;

    // 광고 결제 내역 저장
    public void save(PaymentAdvertisementVO paymentAdvertisementVO) {
        paymentAdvertisementMapper.save(paymentAdvertisementVO);
    }

    // id 로 결제 내역 조회
    public Optional<PaymentAdvertisementVO> findById(Long id) {
        return paymentAdvertisementMapper.selectById(id);
    }

    // 결제 영수증 id로 내역 조회
    public Optional<PaymentAdvertisementVO> findByReceiptId(String receiptId) {
        return paymentAdvertisementMapper.selectByReceiptId(receiptId);
    }

    // 결재 내역 변경
    public void updateStatus(String receiptId, PaymentStatus paymentStatus, String paidAt) {
        paymentAdvertisementMapper.updateStatus(receiptId, paymentStatus, paidAt);
    }
}
