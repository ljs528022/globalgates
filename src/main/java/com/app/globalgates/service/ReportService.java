package com.app.globalgates.service;

import com.app.globalgates.dto.ReportDTO;
import com.app.globalgates.repository.ReportDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class ReportService {
    private final ReportDAO reportDAO;

//    신고하기
    @CacheEvict(value = {"post:list", "page:search", "post", "community:post:list", "bookmark:list"}, allEntries = true)
    public void report(ReportDTO reportDTO) {
        log.info("신고 시도 reporterId: {}, targetId: {}, targetType: {}", reportDTO.getReporterId(), reportDTO.getTargetId(), reportDTO.getTargetType());
        if (reportDAO.findByReporterAndTarget(reportDTO.getReporterId(), reportDTO.getTargetId(), reportDTO.getTargetType()).isPresent()) {
            log.info("이미 신고한 대상 - 중복 안함");
            return;
        }
        reportDAO.save(reportDTO);
        log.info("신고 완");
    }
}
