package com.app.globalgates.repository;

import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.dto.SubscriptionDTO;
import com.app.globalgates.mapper.SubscriptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class SubscriptionDAO {
    private final SubscriptionMapper subscriptionMapper;

    //    구독
    public void save(SubscriptionDTO subscriptionDTO) {
        subscriptionMapper.insert(subscriptionDTO);
    }

    //    어떤 구독 조회
    public Optional<SubscriptionDTO> findByMemberId(Long memberId) {
        return subscriptionMapper.selectByMemberId(memberId);
    }

    //    구독 상태 변경
    public void setStatus(Long id, SubscriptionStatus status) {
        subscriptionMapper.updateStatus(id, status);
    }

    //    [쿼츠관련]

    //    구독 끝난 사람들 조회
    public List<SubscriptionDTO> findExpiredMembers() {
        return subscriptionMapper.selectExpiredMembers();
    }

    public void setQuartz(Long id, boolean quartz) {
        subscriptionMapper.updateQuartz(id, quartz);
    }

    public void setExpiresAt(Long id) {
        subscriptionMapper.updateSubscribe(id);
    }

}
