package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.dto.PaymentSubscribeDTO;
import com.app.globalgates.repository.PaymentSubscribeDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class PaymentSubscribeService {
    private final PaymentSubscribeDAO paymentSubscribeDAO;

    //    결제 정보 저장
    public void save(PaymentSubscribeDTO paymentSubscribeDTO) {
        paymentSubscribeDAO.save(paymentSubscribeDTO.toVO());
    }

    //    id로 결제 정보 조회
    public PaymentSubscribeDTO findById(Long id) {
        return paymentSubscribeDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("결제 오류"));
    }

    //    영수증 id로 결제 정보 조회
    public PaymentSubscribeDTO findByReceiptId(String receiptId) {
        return paymentSubscribeDAO.findByReceiptId(receiptId)
                .orElseThrow(() -> new RuntimeException("결제 정보조회 오류"));
    }

    //    결제 상태 변경
    public void updateStatus(String receiptId, PaymentStatus paymentStatus, String paidAt) {
        paymentSubscribeDAO.setStatus(receiptId, paymentStatus, paidAt);
    }
}
