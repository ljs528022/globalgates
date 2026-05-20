package com.app.globalgates.domain;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access= AccessLevel.PROTECTED)
@SuperBuilder
public class FollowVO {
    private Long id;
    private Long followerId;
    private Long followingId;
    private String createdDatetime;
}
