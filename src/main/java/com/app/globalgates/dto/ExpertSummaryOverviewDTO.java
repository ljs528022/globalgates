package com.app.globalgates.dto;

import lombok.Data;

@Data
public class ExpertSummaryOverviewDTO {
    private Long profileViewCount;
    private Long dealCount;
    private Long inquiryRequestCount;
    private String averageResponseSpeed;
    private Long likeCount;
    private Long bookmarkCount;
}
