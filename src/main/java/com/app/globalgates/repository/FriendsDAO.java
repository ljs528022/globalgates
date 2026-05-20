package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.FriendsDTO;
import com.app.globalgates.mapper.FriendsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FriendsDAO {
    private final FriendsMapper friendsMapper;

    public List<FriendsDTO> findAll(Criteria criteria, Long memberId, Long categoryId) {
        return friendsMapper.selectAll(criteria, memberId, categoryId);
    }

    public int findTotal(Long memberId, Long categoryId) {
        return friendsMapper.selectTotal(memberId, categoryId);
    }

    public List<FriendsDTO> findAllFollowers(Criteria criteria, Long profileId, Long viewerId) {
        return friendsMapper.selectAllFollowers(criteria, profileId, viewerId);
    }

    public int findTotalFollowers(Long profileId, Long viewerId) {
        return friendsMapper.selectTotalFollowers(profileId, viewerId);
    }

    public List<FriendsDTO> findAllFollowings(Criteria criteria, Long profileId, Long viewerId) {
        return friendsMapper.selectAllFollowings(criteria, profileId, viewerId);
    }

    public int findTotalFollowings(Long profileId, Long viewerId) {
        return friendsMapper.selectTotalFollowings(profileId, viewerId);
    }
}
