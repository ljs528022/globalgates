package com.app.globalgates.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AdminStatsDashboardDTO {
    private Long totalMemberCount;
    private Long totalPostCount;
    private Long totalReportCount;
    private Map<String, List<ChartPointDTO>> memberTrend;
    private List<ChartPointDTO> memberTypes;
    private Map<String, List<ChartPointDTO>> hourlyVisits;
    private Map<String, List<ChartPointDTO>> postMonthly;
    private Map<String, List<ChartPointDTO>> postCategories;
    private Map<String, List<ChartPointDTO>> reportMonthly;
    private List<ChartPointDTO> reportStatuses;
    private List<ChartPointDTO> reportMemberTypes;
    private List<ChartPointDTO> reportPostTypes;
}
