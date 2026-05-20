package com.app.globalgates.controller;

import com.app.globalgates.dto.NotificationDTO;
import com.app.globalgates.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationAPIController {
    private final NotificationService notificationService;

    // 전체 알림 조회
    @GetMapping("/{recipientId}")
    public List<NotificationDTO> getNotifications(@PathVariable Long recipientId) {
        return notificationService.getNotifications(recipientId);
    }

    // 멘션 알림만 조회
    @GetMapping("/{recipientId}/mentions")
    public List<NotificationDTO> getMentionNotifications(@PathVariable Long recipientId) {
        return notificationService.getMentionNotifications(recipientId);
    }

    // 읽지 않은 알림 수
    @GetMapping("/{recipientId}/unread-count")
    public Map<String, Integer> getUnreadCount(@PathVariable Long recipientId) {
        return Map.of("count", notificationService.getUnreadCount(recipientId));
    }

    // 알림 생성
    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody NotificationDTO notificationDTO) {
        notificationService.createNotification(notificationDTO);
        return ResponseEntity.ok(Map.of("message", "알림이 생성되었습니다."));
    }

    // 단건 읽음 처리
    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    // 전체 읽음 처리
    @PutMapping("/{recipientId}/read-all")
    public void markAllAsRead(@PathVariable Long recipientId) {
        notificationService.markAllAsRead(recipientId);
    }

    // 단건 삭제
    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }

    // 전체 삭제
    @DeleteMapping("/{recipientId}/all")
    public void deleteAllNotifications(@PathVariable Long recipientId) {
        notificationService.deleteAllNotifications(recipientId);
    }
}
