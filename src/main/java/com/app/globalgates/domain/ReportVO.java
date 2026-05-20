package com.app.globalgates.domain;

import com.app.globalgates.common.enumeration.ReportStatus;
import com.app.globalgates.common.enumeration.ReportTargetType;
import com.app.globalgates.audit.Period;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@NoArgsConstructor(access= AccessLevel.PROTECTED)
@SuperBuilder
public class ReportVO extends Period {
    private Long id;
    private Long reporterId;
    private Long targetId;
    private ReportTargetType targetType;
    private String reason;
    private ReportStatus status;
}
