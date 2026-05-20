package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.domain.CommunityVO;
import com.app.globalgates.dto.CommunityDTO;
import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.dto.PostFileDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CommunityMapper {
    // CRUD
    public void insert(CommunityDTO communityDTO);
    public void update(CommunityVO communityVO);
    public void updateStatus(@Param("id") Long id, @Param("status") String status);

    // 커뮤니티 조회
    public Optional<CommunityDTO> selectById(@Param("id") Long id, @Param("memberId") Long memberId);
    public List<CommunityDTO> selectAll(@Param("criteria") Criteria criteria);
    public List<CommunityDTO> selectAllExcludeJoined(@Param("memberId") Long memberId, @Param("criteria") Criteria criteria);
    public int selectCountExcludeJoined(@Param("memberId") Long memberId);
    public List<CommunityDTO> selectByMemberId(@Param("memberId") Long memberId, @Param("criteria") Criteria criteria);
    public List<CommunityDTO> selectByCategory(@Param("categoryId") Long categoryId, @Param("criteria") Criteria criteria);
    public int selectCount();
    public int selectCountByMemberId(Long memberId);
    public int selectCountByCategory(Long categoryId);

    // 커뮤니티 검색
    public List<CommunityDTO> selectByKeyword(@Param("keyword") String keyword, @Param("criteria") Criteria criteria);
    public int selectCountByKeyword(@Param("keyword") String keyword);

    // 커뮤니티 내 게시글 조회
    public List<PostDTO> selectPostsByCommunityId(@Param("communityId") Long communityId, @Param("memberId") Long memberId, @Param("criteria") Criteria criteria, @Param("type") String type);
    public int selectPostsCountByCommunityId(Long communityId);

    // 커뮤니티 내 게시글 검색
    public List<PostDTO> selectPostsBySearch(
            @Param("communityId") Long communityId,
            @Param("keyword") String keyword,
            @Param("type") String type,
            @Param("memberId") Long memberId,
            @Param("criteria") Criteria criteria
    );
    public int selectPostsCountBySearch(@Param("communityId") Long communityId, @Param("keyword") String keyword);

    // 홈 피드: 내가 가입한 커뮤니티의 모든 게시글
    public List<PostDTO> selectMyCommunitiesPosts(@Param("memberId") Long memberId, @Param("criteria") Criteria criteria);
    public int selectMyCommunitiesPostsCount(Long memberId);

    // 탐색 피드: 내가 미가입한 커뮤니티의 생성자 게시글 (카테고리 필터 지원)
    public List<PostDTO> selectExplorePosts(@Param("memberId") Long memberId, @Param("categoryId") Long categoryId, @Param("criteria") Criteria criteria);
    public int selectExplorePostsCount(@Param("memberId") Long memberId, @Param("categoryId") Long categoryId);

    // 커뮤니티 내 미디어 조회
    public List<PostFileDTO> selectMediaByCommunityId(@Param("communityId") Long communityId, @Param("criteria") Criteria criteria);
    public int selectMediaCountByCommunityId(Long communityId);
}
