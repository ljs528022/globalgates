package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.ReportTargetType;
import com.app.globalgates.dto.ReportDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface ReportMapper {
    //    신고하기
    public void insert(ReportDTO reportDTO);

    //    중복 신고 조회
    public Optional<ReportDTO> selectByReporterAndTarget(@Param("reporterId") Long reporterId, @Param("targetId") Long targetId, @Param("targetType") ReportTargetType targetType);
}
