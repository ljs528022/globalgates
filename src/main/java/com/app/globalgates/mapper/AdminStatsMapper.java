package com.app.globalgates.mapper;

import com.app.globalgates.dto.ChartPointDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface AdminStatsMapper {
    Long selectTotalMemberCount();

    Long selectTotalPostCount();

    Long selectTotalReportCount();

    List<ChartPointDTO> selectMemberJoinedDaily(@Param("startAt") LocalDateTime startAt,
                                                @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectMemberDroppedDaily(@Param("startAt") LocalDateTime startAt,
                                                 @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectMemberJoinedMonthly(@Param("startAt") LocalDateTime startAt,
                                                  @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectMemberDroppedMonthly(@Param("startAt") LocalDateTime startAt,
                                                   @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectMemberTypes();

    List<ChartPointDTO> selectHourlyVisits(@Param("startAt") LocalDateTime startAt,
                                           @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectPostDailyCounts(@Param("startAt") LocalDateTime startAt,
                                              @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectPostMonthlyCounts(@Param("startAt") LocalDateTime startAt,
                                                @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectPostCategoryCounts(@Param("startAt") LocalDateTime startAt,
                                                 @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectReportDailyCounts(@Param("startAt") LocalDateTime startAt,
                                                @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectReportMonthlyCounts(@Param("startAt") LocalDateTime startAt,
                                                  @Param("endAt") LocalDateTime endAt);

    List<ChartPointDTO> selectReportStatuses();

    List<ChartPointDTO> selectReportReasons(@Param("targetType") String targetType);
}
