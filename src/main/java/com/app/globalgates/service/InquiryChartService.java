package com.app.globalgates.service;

import com.app.globalgates.dto.ChartPointDTO;
import com.app.globalgates.dto.ExpertChartDashboardDTO;
import com.app.globalgates.dto.ExpertSummaryOverviewDTO;
import com.app.globalgates.repository.InquiryChartDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryChartService {
    private static final DateTimeFormatter DAY_KEY = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("M/d");
    private static final DateTimeFormatter MONTH_KEY = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter MONTH_LABEL = DateTimeFormatter.ofPattern("yyyy.MM");

    private final InquiryChartDAO inquiryChartDAO;

    public ExpertChartDashboardDTO getDashboard(Long memberId) {
        ExpertChartDashboardDTO dashboardDTO = new ExpertChartDashboardDTO();
        dashboardDTO.setOverview(getOverview(memberId));

        Map<String, List<ChartPointDTO>> profileViewCount = new LinkedHashMap<>();
        profileViewCount.put("7d", buildDailySeries(inquiryChartDAO.findFollowerDailyCounts(memberId, daysAgoStart(6), tomorrowStart()), 7));
        profileViewCount.put("30d", buildDailySeries(inquiryChartDAO.findFollowerDailyCounts(memberId, daysAgoStart(29), tomorrowStart()), 30));
        profileViewCount.put("6m", buildMonthlySeries(inquiryChartDAO.findFollowerMonthlyCounts(memberId, monthsAgoStart(5), tomorrowStart())));
        dashboardDTO.setProfileViewCount(profileViewCount);

        Map<String, List<ChartPointDTO>> inquiryRequestCount = new LinkedHashMap<>();
        inquiryRequestCount.put("7d", buildDailySeries(inquiryChartDAO.findEstimationDailyCounts(memberId, daysAgoStart(6), tomorrowStart()), 7));
        inquiryRequestCount.put("30d", buildDailySeries(inquiryChartDAO.findEstimationDailyCounts(memberId, daysAgoStart(29), tomorrowStart()), 30));
        inquiryRequestCount.put("6m", buildMonthlySeries(inquiryChartDAO.findEstimationMonthlyCounts(memberId, monthsAgoStart(5), tomorrowStart())));
        dashboardDTO.setInquiryRequestCount(inquiryRequestCount);

        dashboardDTO.setConnectChanges(buildMonthlyDualSeries(inquiryChartDAO.findEstimationStatusMonthly(memberId, monthsAgoStart(5), tomorrowStart())));
        dashboardDTO.setDealCategories(defaultIfEmpty(inquiryChartDAO.findDealCategories(memberId), "데이터 없음"));
        dashboardDTO.setDealCountries(defaultIfEmpty(inquiryChartDAO.findDealCountries(memberId), "데이터 없음"));
        return dashboardDTO;
    }

    private ExpertSummaryOverviewDTO getOverview(Long memberId) {
        ExpertSummaryOverviewDTO overviewDTO = new ExpertSummaryOverviewDTO();
        overviewDTO.setProfileViewCount(zeroIfNull(inquiryChartDAO.countFollowers(memberId)));
        overviewDTO.setDealCount(zeroIfNull(inquiryChartDAO.countApprovedEstimations(memberId)));
        overviewDTO.setInquiryRequestCount(zeroIfNull(inquiryChartDAO.countReceivedEstimations(memberId)));
        overviewDTO.setAverageResponseSpeed(formatAverageHours(inquiryChartDAO.findAverageResponseHours(memberId)));
        overviewDTO.setLikeCount(zeroIfNull(inquiryChartDAO.countPostLikes(memberId)));
        overviewDTO.setBookmarkCount(zeroIfNull(inquiryChartDAO.countPostBookmarks(memberId)));
        return overviewDTO;
    }

    private List<ChartPointDTO> buildDailySeries(List<ChartPointDTO> rawData, int days) {
        Map<String, Long> countMap = rawData.stream()
                .collect(Collectors.toMap(ChartPointDTO::getLabel, point -> zeroIfNull(point.getValue())));
        List<ChartPointDTO> series = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            ChartPointDTO point = new ChartPointDTO();
            point.setLabel(date.format(DAY_LABEL));
            point.setValue(countMap.getOrDefault(date.format(DAY_KEY), 0L));
            series.add(point);
        }
        return series;
    }

    private List<ChartPointDTO> buildMonthlySeries(List<ChartPointDTO> rawData) {
        Map<String, Long> countMap = rawData.stream()
                .collect(Collectors.toMap(ChartPointDTO::getLabel, point -> zeroIfNull(point.getValue())));
        List<ChartPointDTO> series = new ArrayList<>();
        YearMonth current = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth yearMonth = current.minusMonths(i);
            ChartPointDTO point = new ChartPointDTO();
            point.setLabel(yearMonth.format(MONTH_LABEL));
            point.setValue(countMap.getOrDefault(yearMonth.format(MONTH_KEY), 0L));
            series.add(point);
        }
        return series;
    }

    private List<ChartPointDTO> buildMonthlyDualSeries(List<ChartPointDTO> rawData) {
        Map<String, ChartPointDTO> pointMap = rawData.stream()
                .collect(Collectors.toMap(ChartPointDTO::getLabel, Function.identity(), (left, right) -> left));
        List<ChartPointDTO> series = new ArrayList<>();
        YearMonth current = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth yearMonth = current.minusMonths(i);
            ChartPointDTO source = pointMap.get(yearMonth.format(MONTH_KEY));
            ChartPointDTO point = new ChartPointDTO();
            point.setLabel(String.format(Locale.KOREA, "%d월", yearMonth.getMonthValue()));
            point.setValue(source == null ? 0L : zeroIfNull(source.getValue()));
            point.setSecondaryValue(source == null ? 0L : zeroIfNull(source.getSecondaryValue()));
            series.add(point);
        }
        return series;
    }

    private List<ChartPointDTO> defaultIfEmpty(List<ChartPointDTO> rawData, String emptyLabel) {
        if (rawData == null || rawData.isEmpty()) {
            ChartPointDTO point = new ChartPointDTO();
            point.setLabel(emptyLabel);
            point.setValue(0L);
            return List.of(point);
        }
        return rawData.stream().peek(point -> point.setValue(zeroIfNull(point.getValue()))).toList();
    }

    private Long zeroIfNull(Long value) {
        return value == null ? 0L : value;
    }

    private String formatAverageHours(Double averageHours) {
        if (averageHours == null || averageHours <= 0) return "-";
        if (averageHours < 1) return Math.max(1, (int) Math.round(averageHours * 60)) + "m";
        return String.format(Locale.KOREA, "%.1fh", averageHours);
    }

    private LocalDateTime daysAgoStart(int days) {
        return LocalDate.now().minusDays(days).atStartOfDay();
    }

    private LocalDateTime monthsAgoStart(int months) {
        return YearMonth.now().minusMonths(months).atDay(1).atStartOfDay();
    }

    private LocalDateTime tomorrowStart() {
        return LocalDate.now().plusDays(1).atStartOfDay();
    }
}
