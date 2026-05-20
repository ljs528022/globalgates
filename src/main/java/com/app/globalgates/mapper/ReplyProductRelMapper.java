package com.app.globalgates.mapper;

import com.app.globalgates.dto.ReplyProductRelDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface ReplyProductRelMapper {
//    댓글-상품 관계 저장
    public void insert(ReplyProductRelDTO replyProductRelDTO);

//    댓글-상품 관계 삭제
    public void deleteByReplyPostId(Long replyPostId);

//    댓글의 상품 조회
    public Optional<ReplyProductRelDTO> selectByReplyPostId(Long replyPostId);
}
