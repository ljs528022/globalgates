package com.app.globalgates.domain;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class PostHashtagVO {
    private Long id;
    private String tagName;
    private String createdDatetime;
}
