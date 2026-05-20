package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.domain.PaymentAdvertisementVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface PaymentAdvertisementMapper {
    // 결제 정보 등록
    void save(PaymentAdvertisementVO paymentAdvertisementVO);

    // id로 결제 정보 조회
    Optional<PaymentAdvertisementVO> selectById(Long id);
    
    // 발급 영수증 id로 조회
    Optional<PaymentAdvertisementVO> selectByReceiptId(String receiptId);

    // 결제 내역 상태 변화
    void updateStatus(@Param("receiptId") String receiptId,
                      @Param("paymentStatus") PaymentStatus paymentStatus,
                      @Param("paidAt") String paidAt);
}
