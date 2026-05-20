package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.BadgeType;
import com.app.globalgates.domain.BadgeVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface BadgeMapper {
    void insert(BadgeVO badgeVO);

    Optional<BadgeVO> selectByMemberId(Long memberId);

    void updateBadgeType(@Param("id") Long id, @Param("badgeType") BadgeType badgeType);

    void deleteByMemberId(Long memberId);
}
