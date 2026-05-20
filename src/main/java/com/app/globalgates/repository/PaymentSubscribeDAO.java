package com.app.globalgates.repository;

import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.domain.PaymentSubscribeVO;
import com.app.globalgates.dto.PaymentSubscribeDTO;
import com.app.globalgates.mapper.PaymentSubscribeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PaymentSubscribeDAO {
    private final PaymentSubscribeMapper paymentSubscribeMapper;

    //    구독 결제 내역 저장
    public void save(PaymentSubscribeVO paymentSubscribeVO) {
        paymentSubscribeMapper.insert(paymentSubscribeVO);
    }

    //    id로 결제 내역 조회
    public Optional<PaymentSubscribeDTO> findById(Long id) {
        return paymentSubscribeMapper.selectById(id);
    }

    //    영수증 id로 결제 내역 조회
    public Optional<PaymentSubscribeDTO> findByReceiptId(String receiptId) {
        return paymentSubscribeMapper.selectByReceiptId(receiptId);
    }

    //    결제 상태 변경
    public void setStatus(String receiptId, PaymentStatus paymentStatus, String paidAt) {
        paymentSubscribeMapper.updateStatus(receiptId, paymentStatus, paidAt);
    }
}
