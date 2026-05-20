package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.BadgeType;
import com.app.globalgates.domain.BadgeVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class BadgeDTO {
    private Long id;
    private Long memberId;
    private BadgeType badgeType;
    private String createdDatetime;
    private String updatedDatetime;

    public BadgeVO toVO() {
        return BadgeVO.builder()
                .id(id)
                .memberId(memberId)
                .badgeType(badgeType)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}
