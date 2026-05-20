package com.app.globalgates.domain;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class PostHashtagRelVO {
    private Long id;
    private Long postId;
    private Long hashtagId;
}
