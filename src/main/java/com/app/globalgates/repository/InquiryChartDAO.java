package com.app.globalgates.repository;

import com.app.globalgates.dto.ChartPointDTO;
import com.app.globalgates.mapper.InquiryChartMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class InquiryChartDAO {
    private final InquiryChartMapper inquiryChartMapper;

    public Long countFollowers(Long memberId) { return inquiryChartMapper.countFollowers(memberId); }
    public Long countApprovedEstimations(Long memberId) { return inquiryChartMapper.countApprovedEstimations(memberId); }
    public Long countReceivedEstimations(Long memberId) { return inquiryChartMapper.countReceivedEstimations(memberId); }
    public Double findAverageResponseHours(Long memberId) { return inquiryChartMapper.findAverageResponseHours(memberId); }
    public Long countPostLikes(Long memberId) { return inquiryChartMapper.countPostLikes(memberId); }
    public Long countPostBookmarks(Long memberId) { return inquiryChartMapper.countPostBookmarks(memberId); }
    public List<ChartPointDTO> findFollowerDailyCounts(Long memberId, LocalDateTime startAt, LocalDateTime endAt) { return inquiryChartMapper.selectFollowerDailyCounts(memberId, startAt, endAt); }
    public List<ChartPointDTO> findFollowerMonthlyCounts(Long memberId, LocalDateTime startAt, LocalDateTime endAt) { return inquiryChartMapper.selectFollowerMonthlyCounts(memberId, startAt, endAt); }
    public List<ChartPointDTO> findEstimationDailyCounts(Long memberId, LocalDateTime startAt, LocalDateTime endAt) { return inquiryChartMapper.selectEstimationDailyCounts(memberId, startAt, endAt); }
    public List<ChartPointDTO> findEstimationMonthlyCounts(Long memberId, LocalDateTime startAt, LocalDateTime endAt) { return inquiryChartMapper.selectEstimationMonthlyCounts(memberId, startAt, endAt); }
    public List<ChartPointDTO> findEstimationStatusMonthly(Long memberId, LocalDateTime startAt, LocalDateTime endAt) { return inquiryChartMapper.selectEstimationStatusMonthly(memberId, startAt, endAt); }
    public List<ChartPointDTO> findDealCategories(Long memberId) { return inquiryChartMapper.selectDealCategories(memberId); }
    public List<ChartPointDTO> findDealCountries(Long memberId) { return inquiryChartMapper.selectDealCountries(memberId); }
}
