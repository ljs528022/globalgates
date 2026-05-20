
package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.PostSearch;
import com.app.globalgates.domain.PostVO;
import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.mapper.PostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PostDAO {
    private final PostMapper postMapper;

    //    게시글 등록
    public void save(PostDTO postDTO) {
        postMapper.insert(postDTO);
    }

    //    게시글 수정
    public void setPost(PostVO postVO) {
        postMapper.update(postVO);
    }

    //    게시글 삭제
    public void delete(Long id) {
        postMapper.delete(id);
    }

    //    조회수 증가
    public void updateReadCount(Long id) {
        postMapper.updateReadCount(id);
    }

    //    게시글 단건 조회
    public Optional<PostDTO> findById(Long id, Long memberId) {
        return postMapper.selectById(id, memberId);
    }

    //    게시글 목록 조회 (메인 피드)
    public List<PostDTO> findAll(Criteria criteria, Long memberId) {
        return postMapper.selectAll(criteria, memberId);
    }

    //    게시글 목록 조회 (mypage의 memberId)
    public List<PostDTO> findAllByMemberId(Criteria criteria, Long memberId) {
        return postMapper.selectAllByMemberId(criteria, memberId);
    }

    //    좋아요한 게시글 목록 조회 (mypage Likes 탭)
    public List<PostDTO> findLikedPostsByMemberId(Criteria criteria, Long memberId) {
        return postMapper.selectLikedPostsByMemberId(criteria, memberId);
    }

    //    내가 작성한 댓글 목록 조회 (mypage Replies 탭)
    public List<PostDTO> findRepliesWrittenByMemberId(Criteria criteria, Long memberId) {
        return postMapper.selectRepliesWrittenByMemberId(criteria, memberId);
    }

    //    게시글 전체 개수
    public int findTotal() {
        return postMapper.selectTotal();
    }

    //    member가 가진 게시글 전체 개수
    public int findTotalByMemberId(Long memberId) {
        return postMapper.selectTotalByMemberId(memberId);
    }

    //    member가 좋아요한 게시글 전체 개수
    public int findLikedPostTotalByMemberId(Long memberId) {
        return postMapper.selectLikedPostTotalByMemberId(memberId);
    }

    //    member가 작성한 댓글 전체 개수
    public int findReplyTotalByMemberId(Long memberId) {
        return postMapper.selectReplyTotalByMemberId(memberId);
    }

    //    게시글 검색 조회
    public List<PostDTO> findBySearch(Criteria criteria, PostSearch search) {
        return postMapper.selectBySearch(criteria, search);
    }

//    댓글 목록 조회
    public List<PostDTO> findRepliesByPostId(Long postId, Long memberId) {
        return postMapper.selectRepliesByPostId(postId, memberId);
    }

//    대댓글 목록 조회
    public List<PostDTO> findSubRepliesByParentIds(List<Long> parentIds, Long memberId) {
        return postMapper.selectSubRepliesByParentIds(parentIds, memberId);
    }


    //     검색한 게시글 총 개수
    public int findSearchTotal(PostSearch search) {
        return postMapper.selectTotalBySearch(search);
    }
}
