
package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.PostSearch;
import com.app.globalgates.domain.PostVO;
import com.app.globalgates.dto.PostDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PostMapper {
    //    게시글등록
    public void insert(PostDTO postDTO);

    //    게시글수정
    public void update(PostVO postVO);

    //    게시글삭제
    public void delete(Long id);

    //    조회수 증가
    public void updateReadCount(Long id);

    //    게시글 단건 조회
    public Optional<PostDTO> selectById(@Param("id") Long id, @Param("memberId") Long memberId);

    //    게시글 목록 조회 (메인 피드)
    public List<PostDTO> selectAll(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId);

    //    게시글 목록 조회 (mypage의 memberId)
    public List<PostDTO> selectAllByMemberId(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId);

    //    좋아요한 게시글 목록 조회 (mypage Likes 탭)
    public List<PostDTO> selectLikedPostsByMemberId(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId);

    //    내가 작성한 댓글 목록 조회 (mypage Replies 탭)
    public List<PostDTO> selectRepliesWrittenByMemberId(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId);

    //    게시글 전체 개수
    public int selectTotal();

    //    member가 가진 게시글 전체 개수
    public int selectTotalByMemberId(@Param("memberId") Long memberId);

    //    member가 좋아요한 게시글 전체 개수
    public int selectLikedPostTotalByMemberId(@Param("memberId") Long memberId);

    //    member가 작성한 댓글 전체 개수
    public int selectReplyTotalByMemberId(@Param("memberId") Long memberId);

    //    게시글 검색 조회
    public List<PostDTO> selectBySearch(@Param("criteria") Criteria criteria, @Param("postSearch") PostSearch postSearch);

    //     검색한 게시글 총 개수
    public int selectTotalBySearch(@Param("search") PostSearch search);

//    댓글 목록 조회 (특정 게시글의)
    public List<PostDTO> selectRepliesByPostId(@Param("postId") Long postId, @Param("memberId") Long memberId);

//    대댓글 목록 조회 (여러 댓글의 대댓글을 한번에)
    public List<PostDTO> selectSubRepliesByParentIds(@Param("parentIds") List<Long> parentIds, @Param("memberId") Long memberId);

}
