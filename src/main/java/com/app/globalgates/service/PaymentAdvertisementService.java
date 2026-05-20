package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.domain.PaymentAdvertisementVO;
import com.app.globalgates.dto.PaymentAdvertisementDTO;
import com.app.globalgates.repository.PaymentAdvertisementDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentAdvertisementService {
    private final PaymentAdvertisementDAO paymentAdvertisementDAO;

    // 결제 정보 저장
    @Transactional
    @LogStatus
    public void save(PaymentAdvertisementDTO paymentAdvertisementDTO) {
        paymentAdvertisementDAO.save(paymentAdvertisementDTO.toVO());
    }

    // id로 결제 정보 조회
    @LogStatusWithReturn
    public PaymentAdvertisementDTO findById(Long id) {
        PaymentAdvertisementVO vo = paymentAdvertisementDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("결제 정보를 찾을 수 없습니다."));
        return toDTO(vo);
    }

    // receiptId로 결제 정보 조회 (웹훅 처리용)
    @LogStatusWithReturn
    public PaymentAdvertisementDTO findByReceiptId(String receiptId) {
        PaymentAdvertisementVO vo = paymentAdvertisementDAO.findByReceiptId(receiptId)
                .orElseThrow(() -> new RuntimeException("결제 정보를 찾을 수 없습니다."));
        return toDTO(vo);
    }

    // 가상계좌 입금 완료 시 상태 업데이트 (웹훅 처리용)
    @Transactional
    @LogStatus
    public void updateStatus(String receiptId, PaymentStatus paymentStatus, String paidAt) {
        paymentAdvertisementDAO.updateStatus(receiptId, paymentStatus, paidAt);
    }

    // toDTO
    private PaymentAdvertisementDTO toDTO(PaymentAdvertisementVO vo) {
        PaymentAdvertisementDTO dto = new PaymentAdvertisementDTO();
        dto.setId(vo.getId());
        dto.setAdId(vo.getAdId());
        dto.setMemberId(vo.getMemberId());
        dto.setAmount(vo.getAmount());
        dto.setPaymentStatus(vo.getPaymentStatus());
        dto.setPaymentMethod(vo.getPaymentMethod());
        dto.setReceiptId(vo.getReceiptId());
        dto.setPaidAt(vo.getPaidAt());
        dto.setCreatedDatetime(vo.getCreatedDatetime());
        return dto;
    }
}
