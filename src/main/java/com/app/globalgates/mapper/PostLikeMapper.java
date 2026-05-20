package com.app.globalgates.mapper;

import com.app.globalgates.dto.PostLikeDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface PostLikeMapper {
//    좋아요 추가
    public void insert(PostLikeDTO postLikeDTO);

//    좋아요 삭제 (회원/게시글 기준)
    public void deleteByMemberIdAndPostId(@Param("memberId") Long memberId, @Param("postId") Long postId);

//    좋아요 여부 조회
    public Optional<PostLikeDTO> selectByMemberIdAndPostId(@Param("memberId") Long memberId, @Param("postId") Long postId);

//    게시글 좋아요 수 조회
    public int selectCountByPostId(Long postId);
}
