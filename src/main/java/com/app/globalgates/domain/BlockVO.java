package com.app.globalgates.domain;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access= AccessLevel.PROTECTED)
@SuperBuilder
public class BlockVO {
    private Long id;
    private Long blockerId;
    private Long blockedId;
    private String createdDatetime;
}
