package com.app.globalgates.repository;

import com.app.globalgates.dto.NewsReplyLikeDTO;
import com.app.globalgates.mapper.NewsReplyLikeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NewsReplyLikeDAO {
    private final NewsReplyLikeMapper newsReplyLikeMapper;

    public void save(NewsReplyLikeDTO newsReplyLikeDTO) {
        newsReplyLikeMapper.insert(newsReplyLikeDTO);
    }

    public void deleteByMemberIdAndReplyId(Long memberId, Long replyId) {
        newsReplyLikeMapper.deleteByMemberIdAndReplyId(memberId, replyId);
    }

    public Optional<NewsReplyLikeDTO> findByMemberIdAndReplyId(Long memberId, Long replyId) {
        return newsReplyLikeMapper.selectByMemberIdAndReplyId(memberId, replyId);
    }
}
