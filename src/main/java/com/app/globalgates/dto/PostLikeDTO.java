package com.app.globalgates.dto;

import com.app.globalgates.domain.PostLikeVO;
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
public class PostLikeDTO {
    private Long id;
    private Long memberId;
    private Long postId;
    private String createdDatetime;

    public PostLikeVO toPostLikeVO() {
        return PostLikeVO.builder()
                .id(id)
                .memberId(memberId)
                .postId(postId)
                .createdDatetime(createdDatetime)
                .build();
    }
}
