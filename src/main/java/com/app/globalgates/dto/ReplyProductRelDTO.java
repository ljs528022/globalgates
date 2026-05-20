package com.app.globalgates.dto;

import com.app.globalgates.domain.ReplyProductRelVO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class ReplyProductRelDTO {
    private Long id;
    private Long replyPostId;
    private Long productPostId;

    public ReplyProductRelVO toReplyProductRelVO() {
        return ReplyProductRelVO.builder()
                .id(id)
                .replyPostId(replyPostId)
                .productPostId(productPostId)
                .build();
    }
}
