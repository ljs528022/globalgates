package com.app.globalgates.controller.xport;

import com.app.globalgates.dto.FileRecodingDTO;
import com.app.globalgates.service.MeetingService;
import com.app.globalgates.service.S3Service;
import com.app.globalgates.service.video_chat.VideoChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/xport/**")
@Slf4j
public class XportController {
    private final MeetingService meetingService;
    private final VideoChatService videoChatService;
    private final S3Service s3Service;

    // 로그인한 유저의 id로 진행한 회의 목록 조회


    // 회의 id로 해당 오디오 파일 조회
    @GetMapping("audio")
    public ResponseEntity<?> getAudioFile(Long id) throws IOException {
        FileRecodingDTO fileRecodingDTO = videoChatService.getRecodingFile(id);
        if (fileRecodingDTO == null) return ResponseEntity.notFound().build();

        String presignedUrl = s3Service.getPresignedUrl(fileRecodingDTO.getFilePath(), Duration.ofHours(1));
        return ResponseEntity.ok(Map.of("url", presignedUrl));
    }
}
