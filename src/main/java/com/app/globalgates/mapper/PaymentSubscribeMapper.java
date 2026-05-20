package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.domain.PaymentSubscribeVO;
import com.app.globalgates.dto.PaymentSubscribeDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface PaymentSubscribeMapper {
    //    결제 정보 등록
    void insert(PaymentSubscribeVO paymentSubscribeVO);

    //    id로 결제 정보 조회
    Optional<PaymentSubscribeDTO> selectById(Long id);

    //    영수증 id로 조회
    Optional<PaymentSubscribeDTO> selectByReceiptId(String receiptId);

    //    결제 상태 변경
    void updateStatus(@Param("receiptId") String receiptId,
                      @Param("paymentStatus") PaymentStatus paymentStatus,
                      @Param("paidAt") String paidAt);
}
