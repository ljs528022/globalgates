package com.app.globalgates.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstimationDTO {
    private Long id;
    private Long requesterId;
    private Long receiverId;
    private Long productId;
    private String title;
    private String content;
    private String location;
    private String deadLine;
    private String status;
    private String requesterEmail;
    private String receiverEmail;
    private String createdDateTime;
    private String updatedDateTime;
    @Builder.Default
    private List<EstimationTagDTO> tags = new ArrayList<>();

    // 요청자 식별 정보 (selectAll/selectRequestedAll/selectById JOIN으로 채워진다)
    private String requesterName;
    private String requesterNickname;
    private String requesterHandle;

    // 수신자 식별 정보 (LEFT JOIN — receiver_id가 null이면 null)
    private String receiverName;
    private String receiverNickname;
    private String receiverHandle;

    // 견적이 가리키는 상품 정보 (LEFT JOIN — productId가 null이거나 상품이 inactive면 null).
    // productPrice/Stock은 Integer wrapper — LEFT JOIN의 null을 그대로 보존한다.
    private String productTitle;
    private Integer productPrice;
    private Integer productStock;
}
