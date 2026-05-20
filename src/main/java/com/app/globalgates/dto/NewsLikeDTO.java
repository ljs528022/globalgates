package com.app.globalgates.dto;

import com.app.globalgates.domain.NewsLikeVO;
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
public class NewsLikeDTO {
    private Long id;
    private Long memberId;
    private Long newsId;
    private String createdDatetime;

    public NewsLikeVO toNewsLikeVO() {
        return NewsLikeVO.builder()
                .id(id)
                .memberId(memberId)
                .newsId(newsId)
                .createdDatetime(createdDatetime)
                .build();
    }
}
