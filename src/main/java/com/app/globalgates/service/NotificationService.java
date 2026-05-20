package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.NotificationType;
import com.app.globalgates.dto.NotificationDTO;
import com.app.globalgates.dto.NotificationPreferenceDTO;
import com.app.globalgates.repository.NotificationDAO;
import com.app.globalgates.repository.NotificationPreferenceDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class NotificationService {
    private final NotificationDAO notificationDAO;
    private final NotificationPreferenceDAO notificationPreferenceDAO;
    private final S3Service s3Service;

    // 전체 알림 조회
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotifications(Long recipientId) {
        List<NotificationDTO> list = notificationDAO.findAll(recipientId);
        convertProfileImages(list);
        return list;
    }

    // 멘션(handle) 알림만 조회
    @Transactional(readOnly = true)
    public List<NotificationDTO> getMentionNotifications(Long recipientId) {
        List<NotificationDTO> list = notificationDAO.findByType(recipientId, NotificationType.HANDLE.getValue());
        convertProfileImages(list);
        return list;
    }

    // 읽지 않은 알림 수
    @Transactional(readOnly = true)
    public int getUnreadCount(Long recipientId) {
        return notificationDAO.getUnreadCount(recipientId);
    }

    // 알림 생성 (사용자 알림 설정 확인 후 생성)
    public void createNotification(NotificationDTO notificationDTO) {
        if (!isNotificationAllowed(notificationDTO.getRecipientId(), notificationDTO.getNotificationType())) {
            log.debug("알림 설정에 의해 차단됨: recipientId={}, type={}", notificationDTO.getRecipientId(), notificationDTO.getNotificationType());
            return;
        }
        notificationDAO.save(notificationDTO);
    }

    // 단건 읽음 처리
    public void markAsRead(Long id) {
        notificationDAO.markAsRead(id);
    }

    // 전체 읽음 처리
    public void markAllAsRead(Long recipientId) {
        notificationDAO.markAllAsRead(recipientId);
    }

    // 단건 삭제
    public void deleteNotification(Long id) {
        notificationDAO.delete(id);
    }

    // 전체 삭제
    public void deleteAllNotifications(Long recipientId) {
        notificationDAO.deleteAll(recipientId);
    }

    // S3 프로필 이미지 presigned URL 변환
    private void convertProfileImages(List<NotificationDTO> list) {
        for (NotificationDTO n : list) {
            if (n.getSenderProfileImage() != null) {
                try {
                    n.setSenderProfileImage(
                            s3Service.getPresignedUrl(n.getSenderProfileImage(), Duration.ofMinutes(10))
                    );
                } catch (IOException e) {
                    log.warn("프로필 이미지 presigned URL 생성 실패: {}", n.getSenderProfileImage(), e);
                    n.setSenderProfileImage(null);
                }
            }
        }
    }

    // 사용자 알림 설정에 따라 해당 타입의 알림이 허용되는지 확인
    private boolean isNotificationAllowed(Long recipientId, NotificationType type) {
        NotificationPreferenceDTO pref = notificationPreferenceDAO.findByMemberId(recipientId).orElse(null);
        if (pref == null) {
            return true;
        }

        return switch (type) {
            case CONNECT -> pref.isPushConnect();
            case APPROVE -> pref.isPushExpert();
            case LIKE -> pref.isPushLikes();
            case POST -> pref.isPushPosts();
            case REPLY -> pref.isPushComments();
            case MESSAGE -> pref.isPushChatMessages();
            case ESTIMATION -> pref.isPushQuotes();
            case SYSTEM -> pref.isPushSystem();
            case HANDLE -> pref.isPushMentions();
        };
    }
}
