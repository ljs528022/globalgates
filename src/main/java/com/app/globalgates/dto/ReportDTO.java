package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.ReportStatus;
import com.app.globalgates.common.enumeration.ReportTargetType;
import com.app.globalgates.domain.ReportVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class ReportDTO {
    private Long id;
    private Long reporterId;
    private Long targetId;
    private ReportTargetType targetType;
    private String reason;
    private ReportStatus status;
    private String createdDatetime;
    private String updatedDatetime;

    public ReportVO toReportVO() {
        return ReportVO.builder()
                .id(id)
                .reporterId(reporterId)
                .targetId(targetId)
                .targetType(targetType)
                .reason(reason)
                .status(status)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}
