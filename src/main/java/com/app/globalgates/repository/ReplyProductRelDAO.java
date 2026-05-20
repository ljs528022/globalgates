package com.app.globalgates.repository;

import com.app.globalgates.dto.ReplyProductRelDTO;
import com.app.globalgates.mapper.ReplyProductRelMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ReplyProductRelDAO {
    private final ReplyProductRelMapper replyProductRelMapper;

//    저장
    public void save(ReplyProductRelDTO replyProductRelDTO) {
        replyProductRelMapper.insert(replyProductRelDTO);
    }

//    댓글 기준 삭제
    public void deleteByReplyPostId(Long replyPostId) {
        replyProductRelMapper.deleteByReplyPostId(replyPostId);
    }

//    댓글의 상품 조회
    public Optional<ReplyProductRelDTO> findByReplyPostId(Long replyPostId) {
        return replyProductRelMapper.selectByReplyPostId(replyPostId);
    }
}
