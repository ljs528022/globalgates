package com.app.globalgates.dto;

import com.app.globalgates.domain.NewsReplyVO;
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
public class NewsReplyDTO {
    private Long id;
    private Long memberId;
    private Long newsId;
    private String content;
    private String replyStatus;
    private String createdDatetime;
    private String updatedDatetime;

    // 파생 필드 — join/서브쿼리로 채움
    private String memberName;
    private String memberHandle;
    private String memberProfileFileName;
    private int likeCount;
    private boolean liked;

    public NewsReplyVO toNewsReplyVO() {
        return NewsReplyVO.builder()
                .id(id)
                .memberId(memberId)
                .newsId(newsId)
                .content(content)
                .replyStatus(replyStatus)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}
