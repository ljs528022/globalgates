package com.app.globalgates.domain;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class MentionVO {
    private Long id;
    private Long mentionTaggerId;
    private Long mentionTaggedId;
    private Long postId;
}
