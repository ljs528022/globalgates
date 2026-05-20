package com.app.globalgates.repository;

import com.app.globalgates.dto.PostProductRelDTO;
import com.app.globalgates.mapper.PostProductRelMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PostProductRelDAO {
    private final PostProductRelMapper postProductRelMapper;

//    저장
    public void save(PostProductRelDTO postProductRelDTO) {
        postProductRelMapper.insert(postProductRelDTO);
    }

//    게시글 삭제
    public void deleteByPostId(Long postId) {
        postProductRelMapper.deleteByPostId(postId);
    }

//    첨부된 상품 조회
    public Optional<PostProductRelDTO> findByPostId(Long postId) {
        return postProductRelMapper.selectByPostId(postId);
    }
}
