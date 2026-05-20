package com.app.globalgates.service;

import com.app.globalgates.dto.AdminStatsDashboardDTO;
import com.app.globalgates.dto.ChartPointDTO;
import com.app.globalgates.repository.AdminStatsDAO;
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
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatsService {
    private static final DateTimeFormatter DAY_KEY = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("MM-dd");
    private static final DateTimeFormatter MONTH_KEY = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter MONTH_LABEL = DateTimeFormatter.ofPattern("yyyy.MM");

    private final AdminStatsDAO adminStatsDAO;

    public AdminStatsDashboardDTO getDashboard() {
        AdminStatsDashboardDTO dashboardDTO = new AdminStatsDashboardDTO();
        dashboardDTO.setTotalMemberCount(adminStatsDAO.findTotalMemberCount());
        dashboardDTO.setTotalPostCount(adminStatsDAO.findTotalPostCount());
        dashboardDTO.setTotalReportCount(adminStatsDAO.findTotalReportCount());
        dashboardDTO.setMemberTrend(buildDualPeriodMap(
                adminStatsDAO.findMemberJoinedDaily(daysAgoStart(6), tomorrowStart()),
                adminStatsDAO.findMemberDroppedDaily(daysAgoStart(6), tomorrowStart()),
                adminStatsDAO.findMemberJoinedDaily(daysAgoStart(29), tomorrowStart()),
                adminStatsDAO.findMemberDroppedDaily(daysAgoStart(29), tomorrowStart()),
                adminStatsDAO.findMemberJoinedMonthly(monthsAgoStart(5), tomorrowStart()),
                adminStatsDAO.findMemberDroppedMonthly(monthsAgoStart(5), tomorrowStart())
        ));
        dashboardDTO.setMemberTypes(defaultIfEmpty(adminStatsDAO.findMemberTypes(), "데이터 없음"));

        Map<String, List<ChartPointDTO>> hourlyVisits = new LinkedHashMap<>();
        hourlyVisits.put("7d", buildHourlySeries(adminStatsDAO.findHourlyVisits(daysAgoStart(6), tomorrowStart())));
        hourlyVisits.put("30d", buildHourlySeries(adminStatsDAO.findHourlyVisits(daysAgoStart(29), tomorrowStart())));
        hourlyVisits.put("6m", buildHourlySeries(adminStatsDAO.findHourlyVisits(monthsAgoStart(5), tomorrowStart())));
        dashboardDTO.setHourlyVisits(hourlyVisits);

        Map<String, List<ChartPointDTO>> postMonthly = new LinkedHashMap<>();
        postMonthly.put("7d", buildDailySeries(adminStatsDAO.findPostDailyCounts(daysAgoStart(6), tomorrowStart()), 7));
        postMonthly.put("30d", buildDailySeries(adminStatsDAO.findPostDailyCounts(daysAgoStart(29), tomorrowStart()), 30));
        postMonthly.put("6m", buildMonthlySeries(adminStatsDAO.findPostMonthlyCounts(monthsAgoStart(5), tomorrowStart())));
        dashboardDTO.setPostMonthly(postMonthly);

        Map<String, List<ChartPointDTO>> postCategories = new LinkedHashMap<>();
        postCategories.put("7d", defaultIfEmpty(adminStatsDAO.findPostCategoryCounts(daysAgoStart(6), tomorrowStart()), "데이터 없음"));
        postCategories.put("30d", defaultIfEmpty(adminStatsDAO.findPostCategoryCounts(daysAgoStart(29), tomorrowStart()), "데이터 없음"));
        postCategories.put("6m", defaultIfEmpty(adminStatsDAO.findPostCategoryCounts(monthsAgoStart(5), tomorrowStart()), "데이터 없음"));
        dashboardDTO.setPostCategories(postCategories);

        Map<String, List<ChartPointDTO>> reportMonthly = new LinkedHashMap<>();
        reportMonthly.put("7d", buildDailySeries(adminStatsDAO.findReportDailyCounts(daysAgoStart(6), tomorrowStart()), 7));
        reportMonthly.put("30d", buildDailySeries(adminStatsDAO.findReportDailyCounts(daysAgoStart(29), tomorrowStart()), 30));
        reportMonthly.put("6m", buildMonthlySeries(adminStatsDAO.findReportMonthlyCounts(monthsAgoStart(5), tomorrowStart())));
        dashboardDTO.setReportMonthly(reportMonthly);

        dashboardDTO.setReportStatuses(defaultIfEmpty(adminStatsDAO.findReportStatuses(), "데이터 없음"));
        dashboardDTO.setReportMemberTypes(defaultIfEmpty(adminStatsDAO.findReportReasons("member"), "데이터 없음"));
        dashboardDTO.setReportPostTypes(defaultIfEmpty(adminStatsDAO.findReportReasons("post"), "데이터 없음"));
        return dashboardDTO;
    }

    private Map<String, List<ChartPointDTO>> buildDualPeriodMap(List<ChartPointDTO> joined7d, List<ChartPointDTO> dropped7d,
                                                                List<ChartPointDTO> joined30d, List<ChartPointDTO> dropped30d,
                                                                List<ChartPointDTO> joined6m, List<ChartPointDTO> dropped6m) {
        Map<String, List<ChartPointDTO>> result = new LinkedHashMap<>();
        result.put("7d", mergeSeries(buildDailySeries(joined7d, 7), buildDailySeries(dropped7d, 7)));
        result.put("30d", mergeSeries(buildDailySeries(joined30d, 30), buildDailySeries(dropped30d, 30)));
        result.put("6m", mergeSeries(buildMonthlySeries(joined6m), buildMonthlySeries(dropped6m)));
        return result;
    }

    private List<ChartPointDTO> mergeSeries(List<ChartPointDTO> primarySeries, List<ChartPointDTO> secondarySeries) {
        List<ChartPointDTO> merged = new ArrayList<>();
        for (int i = 0; i < primarySeries.size(); i++) {
            ChartPointDTO point = new ChartPointDTO();
            point.setLabel(primarySeries.get(i).getLabel());
            point.setValue(primarySeries.get(i).getValue());
            point.setSecondaryValue(secondarySeries.get(i).getValue());
            merged.add(point);
        }
        return merged;
    }

    private List<ChartPointDTO> buildDailySeries(List<ChartPointDTO> rawData, int days) {
        Map<String, Long> countMap = rawData.stream().collect(Collectors.toMap(ChartPointDTO::getLabel, point -> zeroIfNull(point.getValue())));
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
        Map<String, Long> countMap = rawData.stream().collect(Collectors.toMap(ChartPointDTO::getLabel, point -> zeroIfNull(point.getValue())));
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

    private List<ChartPointDTO> buildHourlySeries(List<ChartPointDTO> rawData) {
        Map<String, ChartPointDTO> map = rawData.stream().collect(Collectors.toMap(ChartPointDTO::getLabel, Function.identity(), (left, right) -> left));
        List<ChartPointDTO> series = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            String label = String.valueOf(hour);
            ChartPointDTO source = map.get(label);
            ChartPointDTO point = new ChartPointDTO();
            point.setLabel(label);
            point.setValue(source == null ? 0L : zeroIfNull(source.getValue()));
            series.add(point);
        }
        return series;
    }

    private List<ChartPointDTO> defaultIfEmpty(List<ChartPointDTO> rawData, String label) {
        if (rawData == null || rawData.isEmpty()) {
            ChartPointDTO point = new ChartPointDTO();
            point.setLabel(label);
            point.setValue(0L);
            return List.of(point);
        }
        return rawData.stream().peek(point -> point.setValue(zeroIfNull(point.getValue()))).toList();
    }

    private Long zeroIfNull(Long value) { return value == null ? 0L : value; }
    private LocalDateTime daysAgoStart(int days) { return LocalDate.now().minusDays(days).atStartOfDay(); }
    private LocalDateTime monthsAgoStart(int months) { return YearMonth.now().minusMonths(months).atDay(1).atStartOfDay(); }
    private LocalDateTime tomorrowStart() { return LocalDate.now().plusDays(1).atStartOfDay(); }
}
