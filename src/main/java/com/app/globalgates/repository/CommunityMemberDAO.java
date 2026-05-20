package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.CommunityMemberDTO;
import com.app.globalgates.mapper.CommunityMemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CommunityMemberDAO {
    private final CommunityMemberMapper communityMemberMapper;

    public void save(CommunityMemberDTO dto) {
        communityMemberMapper.insert(dto);
    }

    public void delete(Long communityId, Long memberId) {
        communityMemberMapper.delete(communityId, memberId);
    }

    public void updateRole(Long communityId, Long memberId, String role) {
        communityMemberMapper.updateRole(communityId, memberId, role);
    }

    public Optional<CommunityMemberDTO> findByIds(Long communityId, Long memberId) {
        return communityMemberMapper.selectByIds(communityId, memberId);
    }

    public List<CommunityMemberDTO> findByCommunityId(Long communityId, Criteria criteria) {
        return communityMemberMapper.selectByCommunityId(communityId, criteria);
    }

    public int getCountByCommunityId(Long communityId) {
        return communityMemberMapper.selectCountByCommunityId(communityId);
    }
}
