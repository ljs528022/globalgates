package com.app.globalgates.task;

import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.repository.CommunityFileDAO;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class S3OrphanCleanupTask {
    private final CommunityFileDAO communityFileDAO;
    private final FileDAO fileDAO;
    private final S3Service s3Service;

    // 매일 새벽 3시 실행 — 삭제된 커뮤니티의 S3 파일 정리
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupDeletedCommunityFiles() {
        List<FileDTO> orphanFiles = communityFileDAO.findByDeletedCommunities();
        if (orphanFiles.isEmpty()) return;

        log.info("S3 고아 파일 정리 시작: {}건", orphanFiles.size());
        int success = 0, fail = 0;

        for (FileDTO file : orphanFiles) {
            try {
                s3Service.deleteFile(file.getFilePath());
                communityFileDAO.delete(file.getId());
                fileDAO.delete(file.getId());
                success++;
            } catch (Exception e) {
                fail++;
                log.error("S3 파일 삭제 실패: {}", file.getFilePath(), e);
            }
        }

        log.info("S3 고아 파일 정리 완료: 성공 {}건, 실패 {}건", success, fail);
    }
}
