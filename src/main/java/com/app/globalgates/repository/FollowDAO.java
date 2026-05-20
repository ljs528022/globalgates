package com.app.globalgates.repository;

import com.app.globalgates.dto.FollowDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.mapper.FollowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class FollowDAO {
    private final FollowMapper followMapper;

    //    팔로우 추가
    public void save(FollowDTO followDTO) {
        followMapper.insert(followDTO);
    }

    //    팔로우 삭제
    public void delete(Long followerId, Long followingId) {
        followMapper.delete(followerId, followingId);
    }

    //    팔로우 여부 조회
    public Optional<FollowDTO> findByFollowerIdAndFollowingId(Long followerId, Long followingId) {
        return followMapper.selectByFollowerIdAndFollowingId(followerId, followingId);
    }

    //    팔로워 목록
    public List<FollowDTO> findAllFollowers(Long followingId) {
        return followMapper.selectAllFollowers(followingId);
    }

    //    팔로잉 목록
    public List<FollowDTO> findAllFollowings(Long followerId) {
        return followMapper.selectAllFollowings(followerId);
    }

    //    미팔로우 회원 3명
    public List<MemberDTO> findUnfollowedMembers(Long memberId) {
        return followMapper.selectUnfollowedMembers(memberId);
    }
}
