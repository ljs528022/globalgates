package com.app.globalgates.domain;

import com.app.globalgates.common.enumeration.BadgeType;
import lombok.*;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class BadgeVO {
    private Long id;
    private Long memberId;
    private BadgeType badgeType;
    private String createdDatetime;
    private String updatedDatetime;
}
