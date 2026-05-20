package com.app.globalgates.mapper;

import com.app.globalgates.dto.ChartPointDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface InquiryChartMapper {
    Long countFollowers(@Param("memberId") Long memberId);

    Long countApprovedEstimations(@Param("memberId") Long memberId);

    Long countReceivedEstimations(@Param("memberId") Long memberId);

    Double findAverageResponseHours(@Param("memberId") Long memberId);

    Long countPostLikes(@Param("memberId") Long memberId);

    Long countPostBookmarks(@Param("memberId") Long memberId);

    List<ChartPointDTO> selectFollowerDailyCounts(@Param("memberId") Long memberId,
                                                  @Param("startAt") LocalDateTime startAt,
                                                  @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectFollowerMonthlyCounts(@Param("memberId") Long memberId,
                                                    @Param("startAt") LocalDateTime startAt,
                                                    @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectEstimationDailyCounts(@Param("memberId") Long memberId,
                                                    @Param("startAt") LocalDateTime startAt,
                                                    @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectEstimationMonthlyCounts(@Param("memberId") Long memberId,
                                                      @Param("startAt") LocalDateTime startAt,
                                                      @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectEstimationStatusMonthly(@Param("memberId") Long memberId,
                                                      @Param("startAt") LocalDateTime startAt,
                                                      @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectDealCategories(@Param("memberId") Long memberId);

    List<ChartPointDTO> selectDealCountries(@Param("memberId") Long memberId);
}
