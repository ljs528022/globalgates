package com.app.globalgates.dto;

import com.app.globalgates.domain.NewsBookmarkVO;
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
public class NewsBookmarkDTO {
    private Long id;
    private Long memberId;
    private Long newsId;
    private Long folderId;
    private String createdDatetime;

    public NewsBookmarkVO toNewsBookmarkVO() {
        return NewsBookmarkVO.builder()
                .id(id)
                .memberId(memberId)
                .newsId(newsId)
                .folderId(folderId)
                .createdDatetime(createdDatetime)
                .build();
    }
}
