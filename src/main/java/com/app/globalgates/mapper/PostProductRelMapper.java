package com.app.globalgates.mapper;

import com.app.globalgates.dto.PostProductRelDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface PostProductRelMapper {
//    게시글-상품 첨부 관계 저장
    public void insert(PostProductRelDTO postProductRelDTO);

//    게시글 기준 첨부 관계 삭제 (수정 시 사용)
    public void deleteByPostId(Long postId);

//    게시글에 첨부된 상품 조회
    public Optional<PostProductRelDTO> selectByPostId(Long postId);
}
