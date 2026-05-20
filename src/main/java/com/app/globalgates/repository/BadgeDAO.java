package com.app.globalgates.repository;

import com.app.globalgates.common.enumeration.BadgeType;
import com.app.globalgates.domain.BadgeVO;
import com.app.globalgates.mapper.BadgeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class BadgeDAO {
    private final BadgeMapper badgeMapper;

    public void save(BadgeVO badgeVO) {
        badgeMapper.insert(badgeVO);
    }

    public Optional<BadgeVO> findByMemberId(Long memberId) {
        return badgeMapper.selectByMemberId(memberId);
    }

    public void setBadgeType(Long id, BadgeType badgeType) {
        badgeMapper.updateBadgeType(id, badgeType);
    }

    public void deleteByMemberId(Long memberId) {
        badgeMapper.deleteByMemberId(memberId);
    }
}
