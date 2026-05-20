package com.app.globalgates.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ExpertChartDashboardDTO {
    private ExpertSummaryOverviewDTO overview;
    private Map<String, List<ChartPointDTO>> profileViewCount;
    private Map<String, List<ChartPointDTO>> inquiryRequestCount;
    private List<ChartPointDTO> connectChanges;
    private List<ChartPointDTO> dealCategories;
    private List<ChartPointDTO> dealCountries;
}
