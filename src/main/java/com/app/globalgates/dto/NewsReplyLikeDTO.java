package com.app.globalgates.dto;

import com.app.globalgates.domain.NewsReplyLikeVO;
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
public class NewsReplyLikeDTO {
    private Long id;
    private Long memberId;
    private Long replyId;
    private String createdDatetime;

    public NewsReplyLikeVO toNewsReplyLikeVO() {
        return NewsReplyLikeVO.builder()
                .id(id)
                .memberId(memberId)
                .replyId(replyId)
                .createdDatetime(createdDatetime)
                .build();
    }
}
