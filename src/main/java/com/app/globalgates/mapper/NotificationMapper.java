package com.app.globalgates.mapper;

import com.app.globalgates.dto.NotificationDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface NotificationMapper {
    List<NotificationDTO> selectAll(@Param("recipientId") Long recipientId);

    List<NotificationDTO> selectByType(@Param("recipientId") Long recipientId, @Param("notificationType") String notificationType);

    Optional<NotificationDTO> selectById(@Param("id") Long id);

    void insert(NotificationDTO notificationDTO);

    void updateReadStatus(@Param("id") Long id);

    void updateAllReadStatus(@Param("recipientId") Long recipientId);

    void delete(@Param("id") Long id);

    void deleteAllByRecipientId(@Param("recipientId") Long recipientId);

    int selectUnreadCount(@Param("recipientId") Long recipientId);
}
