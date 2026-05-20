package com.app.globalgates.dto;

import com.app.globalgates.domain.PostProductRelVO;
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
public class PostProductRelDTO {
    private Long id;
    private Long postId;
    private Long productPostId;

    public PostProductRelVO toPostProductRelVO() {
        return PostProductRelVO.builder()
                .id(id)
                .postId(postId)
                .productPostId(productPostId)
                .build();
    }
}
