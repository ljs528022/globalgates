package com.app.globalgates.repository;

import com.app.globalgates.dto.NotificationPreferenceDTO;
import com.app.globalgates.mapper.NotificationPreferenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NotificationPreferenceDAO {
    private final NotificationPreferenceMapper notificationPreferenceMapper;

    public Optional<NotificationPreferenceDTO> findByMemberId(Long memberId) {
        return notificationPreferenceMapper.selectByMemberId(memberId);
    }

    // 회원당 알림 설정은 한 행만 유지하므로,
    // 서비스가 넘겨준 현재 상태의 id 유무만 보고 insert/update를 분기한다.
    public void save(NotificationPreferenceDTO notificationPreferenceDTO) {
        if (notificationPreferenceDTO.getId() == null) {
            notificationPreferenceMapper.insert(notificationPreferenceDTO);
            return;
        }

        notificationPreferenceMapper.update(notificationPreferenceDTO);
    }
}
