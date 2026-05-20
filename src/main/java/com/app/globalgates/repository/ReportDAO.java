package com.app.globalgates.repository;

import com.app.globalgates.common.enumeration.ReportTargetType;
import com.app.globalgates.dto.ReportDTO;
import com.app.globalgates.mapper.ReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ReportDAO {
    private final ReportMapper reportMapper;

    //    신고하기
    public void save(ReportDTO reportDTO) {
        reportMapper.insert(reportDTO);
    }

    //    중복 신고 조회
    public Optional<ReportDTO> findByReporterAndTarget(Long reporterId, Long targetId, ReportTargetType targetType) {
        return reportMapper.selectByReporterAndTarget(reporterId, targetId, targetType);
    }
}
