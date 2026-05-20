package com.app.globalgates.repository;

import com.app.globalgates.dto.ChartPointDTO;
import com.app.globalgates.mapper.AdminStatsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class AdminStatsDAO {
    private final AdminStatsMapper adminStatsMapper;

    public Long findTotalMemberCount() { return adminStatsMapper.selectTotalMemberCount(); }
    public Long findTotalPostCount() { return adminStatsMapper.selectTotalPostCount(); }
    public Long findTotalReportCount() { return adminStatsMapper.selectTotalReportCount(); }
    public List<ChartPointDTO> findMemberJoinedDaily(LocalDateTime startAt, LocalDateTime endAt) { return adminStatsMapper.selectMemberJoinedDaily(startAt, endAt); }
    public List<ChartPointDTO> findMemberDroppedDaily(LocalDateTime startAt, LocalDateTime endAt) { return adminStatsMapper.selectMemberDroppedDaily(startAt, endAt); }
    public List<ChartPointDTO> findMemberJoinedMonthly(LocalDateTime startAt, LocalDateTime endAt) { return adminStatsMapper.selectMemberJoinedMonthly(startAt, endAt); }
    public List<ChartPointDTO> findMemberDroppedMonthly(LocalDateTime startAt, LocalDateTime endAt) { return adminStatsMapper.selectMemberDroppedMonthly(startAt, endAt); }
    public List<ChartPointDTO> findMemberTypes() { return adminStatsMapper.selectMemberTypes(); }
    public List<ChartPointDTO> findHourlyVisits(LocalDateTime startAt, LocalDateTime endAt) { return adminStatsMapper.selectHourlyVisits(startAt, endAt); }
    public List<ChartPointDTO> findPostDailyCounts(LocalDateTime startAt, LocalDateTime endAt) { return adminStatsMapper.selectPostDailyCounts(startAt, endAt); }
    public List<ChartPointDTO> findPostMonthlyCounts(LocalDateTime startAt, LocalDateTime endAt) { return adminStatsMapper.selectPostMonthlyCounts(startAt, endAt); }
    public List<ChartPointDTO> findPostCategoryCounts(LocalDateTime startAt, LocalDateTime endAt) { return adminStatsMapper.selectPostCategoryCounts(startAt, endAt); }
    public List<ChartPointDTO> findReportDailyCounts(LocalDateTime startAt, LocalDateTime endAt) { return adminStatsMapper.selectReportDailyCounts(startAt, endAt); }
    public List<ChartPointDTO> findReportMonthlyCounts(LocalDateTime startAt, LocalDateTime endAt) { return adminStatsMapper.selectReportMonthlyCounts(startAt, endAt); }
    public List<ChartPointDTO> findReportStatuses() { return adminStatsMapper.selectReportStatuses(); }
    public List<ChartPointDTO> findReportReasons(String targetType) { return adminStatsMapper.selectReportReasons(targetType); }
}
