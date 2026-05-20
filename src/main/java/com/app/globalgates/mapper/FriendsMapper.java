package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.FriendsDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FriendsMapper {
    public List<FriendsDTO> selectAll(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId, @Param("categoryId") Long categoryId);

    public int selectTotal(@Param("memberId") Long memberId, @Param("categoryId") Long categoryId);

    public List<FriendsDTO> selectAllFollowers(@Param("criteria") Criteria criteria, @Param("profileId") Long profileId, @Param("viewerId") Long viewerId);

    public int selectTotalFollowers(@Param("profileId") Long profileId, @Param("viewerId") Long viewerId);

    public List<FriendsDTO> selectAllFollowings(@Param("criteria") Criteria criteria, @Param("profileId") Long profileId, @Param("viewerId") Long viewerId);

    public int selectTotalFollowings(@Param("profileId") Long profileId, @Param("viewerId") Long viewerId);
}
