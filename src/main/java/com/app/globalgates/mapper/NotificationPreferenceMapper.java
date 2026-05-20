package com.app.globalgates.mapper;

import com.app.globalgates.dto.NotificationPreferenceDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface NotificationPreferenceMapper {
    Optional<NotificationPreferenceDTO> selectByMemberId(Long memberId);

    void insert(NotificationPreferenceDTO notificationPreferenceDTO);

    void update(NotificationPreferenceDTO notificationPreferenceDTO);
}
