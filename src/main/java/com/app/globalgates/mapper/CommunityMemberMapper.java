package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.CommunityMemberDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CommunityMemberMapper {
    public void insert(CommunityMemberDTO dto);
    public void delete(@Param("communityId") Long communityId, @Param("memberId") Long memberId);
    public void updateRole(@Param("communityId") Long communityId, @Param("memberId") Long memberId, @Param("role") String role);

    public Optional<CommunityMemberDTO> selectByIds(@Param("communityId") Long communityId, @Param("memberId") Long memberId);
    public List<CommunityMemberDTO> selectByCommunityId(@Param("communityId") Long communityId, @Param("criteria") Criteria criteria);
    public int selectCountByCommunityId(Long communityId);
}
