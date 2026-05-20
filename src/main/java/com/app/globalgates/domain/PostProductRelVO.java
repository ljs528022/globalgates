package com.app.globalgates.domain;

import lombok.*;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class PostProductRelVO {
    private Long id;
    private Long postId;
    private Long productPostId;
}
