package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.domain.CommunityVO;
import com.app.globalgates.dto.CommunityDTO;
import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.dto.PostFileDTO;
import com.app.globalgates.mapper.CommunityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CommunityDAO {
    private final CommunityMapper communityMapper;

    public void save(CommunityDTO dto) {
        communityMapper.insert(dto);
    }

    public void update(CommunityVO vo) {
        communityMapper.update(vo);
    }

    public void softDelete(Long id) {
        communityMapper.updateStatus(id, "inactive");
    }

    public Optional<CommunityDTO> findById(Long id, Long memberId) {
        return communityMapper.selectById(id, memberId);
    }

    public List<CommunityDTO> findAll(Criteria criteria) {
        return communityMapper.selectAll(criteria);
    }

    public List<CommunityDTO> findAllExcludeJoined(Long memberId, Criteria criteria) {
        return communityMapper.selectAllExcludeJoined(memberId, criteria);
    }

    public int getCountExcludeJoined(Long memberId) {
        return communityMapper.selectCountExcludeJoined(memberId);
    }

    public List<CommunityDTO> findByMemberId(Long memberId, Criteria criteria) {
        return communityMapper.selectByMemberId(memberId, criteria);
    }

    public List<CommunityDTO> findByCategory(Long categoryId, Criteria criteria) {
        return communityMapper.selectByCategory(categoryId, criteria);
    }

    public int getCount() {
        return communityMapper.selectCount();
    }

    public int getCountByMemberId(Long memberId) {
        return communityMapper.selectCountByMemberId(memberId);
    }

    public int getCountByCategory(Long categoryId) {
        return communityMapper.selectCountByCategory(categoryId);
    }

    public List<CommunityDTO> findByKeyword(String keyword, Criteria criteria) {
        return communityMapper.selectByKeyword(keyword, criteria);
    }

    public int getCountByKeyword(String keyword) {
        return communityMapper.selectCountByKeyword(keyword);
    }

    public List<PostDTO> findPostsByCommunityId(Long communityId, Long memberId, Criteria criteria, String type) {
        return communityMapper.selectPostsByCommunityId(communityId, memberId, criteria, type);
    }

    public int getPostsCountByCommunityId(Long communityId) {
        return communityMapper.selectPostsCountByCommunityId(communityId);
    }

    public List<PostDTO> findPostsBySearch(Long communityId, String keyword, String type, Long memberId, Criteria criteria) {
        return communityMapper.selectPostsBySearch(communityId, keyword, type, memberId, criteria);
    }

    public int getPostsCountBySearch(Long communityId, String keyword) {
        return communityMapper.selectPostsCountBySearch(communityId, keyword);
    }

    public List<PostDTO> findMyCommunitiesPosts(Long memberId, Criteria criteria) {
        return communityMapper.selectMyCommunitiesPosts(memberId, criteria);
    }

    public int getMyCommunitiesPostsCount(Long memberId) {
        return communityMapper.selectMyCommunitiesPostsCount(memberId);
    }

    public List<PostDTO> findExplorePosts(Long memberId, Long categoryId, Criteria criteria) {
        return communityMapper.selectExplorePosts(memberId, categoryId, criteria);
    }

    public int getExplorePostsCount(Long memberId, Long categoryId) {
        return communityMapper.selectExplorePostsCount(memberId, categoryId);
    }

    public List<PostFileDTO> findMediaByCommunityId(Long communityId, Criteria criteria) {
        return communityMapper.selectMediaByCommunityId(communityId, criteria);
    }

    public int getMediaCountByCommunityId(Long communityId) {
        return communityMapper.selectMediaCountByCommunityId(communityId);
    }
}
