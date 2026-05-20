package com.app.globalgates.controller.video_chat;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.domain.video_chat.VideoSessionListVO;
import com.app.globalgates.service.video_chat.VideoChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// 본인이 발신자(caller_id) 였던 화상회의 목록 — video_ai 위젯의 회의 목록 데이터 소스
@RestController
@RequestMapping("/api/v1/video-chat/sessions")
@RequiredArgsConstructor
public class VideoChatSessionAPIController {

    private final VideoChatService videoChatService;

    @GetMapping
    public ResponseEntity<List<VideoSessionListVO>> myList(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(videoChatService.getMySessions(userDetails.getId()));
    }
}
