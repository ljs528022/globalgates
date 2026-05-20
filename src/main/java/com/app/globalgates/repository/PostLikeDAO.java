package com.app.globalgates.repository;

import com.app.globalgates.dto.PostLikeDTO;
import com.app.globalgates.mapper.PostLikeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PostLikeDAO {
    private final PostLikeMapper postLikeMapper;

//    저장
    public void save(PostLikeDTO postLikeDTO) {
        postLikeMapper.insert(postLikeDTO);
    }

//    회원/게시글 기준 삭제
    public void deleteByMemberIdAndPostId(Long memberId, Long postId) {
        postLikeMapper.deleteByMemberIdAndPostId(memberId, postId);
    }

//    좋아요 여부 조회
    public Optional<PostLikeDTO> findByMemberIdAndPostId(Long memberId, Long postId) {
        return postLikeMapper.selectByMemberIdAndPostId(memberId, postId);
    }

//    게시글 좋아요 수 조회
    public int countByPostId(Long postId) {
        return postLikeMapper.selectCountByPostId(postId);
    }
}
