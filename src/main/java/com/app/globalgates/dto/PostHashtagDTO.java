package com.app.globalgates.dto;

import com.app.globalgates.domain.PostHashtagVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class PostHashtagDTO {
    private Long id;
    private String tagName;
    private String createdDatetime;

    public PostHashtagVO toPostHashtagVO() {
        return PostHashtagVO.builder()
                .id(id)
                .tagName(tagName)
                .createdDatetime(createdDatetime)
                .build();
    }
}
