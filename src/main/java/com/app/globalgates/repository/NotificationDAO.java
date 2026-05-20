package com.app.globalgates.repository;

import com.app.globalgates.dto.NotificationDTO;
import com.app.globalgates.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NotificationDAO {
    private final NotificationMapper notificationMapper;

    public List<NotificationDTO> findAll(Long recipientId) {
        return notificationMapper.selectAll(recipientId);
    }

    public List<NotificationDTO> findByType(Long recipientId, String notificationType) {
        return notificationMapper.selectByType(recipientId, notificationType);
    }

    public Optional<NotificationDTO> findById(Long id) {
        return notificationMapper.selectById(id);
    }

    public void save(NotificationDTO notificationDTO) {
        notificationMapper.insert(notificationDTO);
    }

    public void markAsRead(Long id) {
        notificationMapper.updateReadStatus(id);
    }

    public void markAllAsRead(Long recipientId) {
        notificationMapper.updateAllReadStatus(recipientId);
    }

    public void delete(Long id) {
        notificationMapper.delete(id);
    }

    public void deleteAll(Long recipientId) {
        notificationMapper.deleteAllByRecipientId(recipientId);
    }

    public int getUnreadCount(Long recipientId) {
        return notificationMapper.selectUnreadCount(recipientId);
    }
}
