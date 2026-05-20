package com.app.globalgates.repository;

import com.app.globalgates.dto.NewsReplyDTO;
import com.app.globalgates.mapper.NewsReplyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NewsReplyDAO {
    private final NewsReplyMapper newsReplyMapper;

    public void save(NewsReplyDTO newsReplyDTO) {
        newsReplyMapper.insert(newsReplyDTO);
    }

    public Optional<NewsReplyDTO> findById(Long id) {
        return newsReplyMapper.selectById(id);
    }

    public List<NewsReplyDTO> findByNewsId(Long newsId, Long currentMemberId, String sort) {
        return newsReplyMapper.selectByNewsId(newsId, currentMemberId, sort);
    }

    public int countByNewsId(Long newsId) {
        return newsReplyMapper.selectCountByNewsId(newsId);
    }

    public void softDeleteById(Long id, Long memberId) {
        newsReplyMapper.softDeleteById(id, memberId);
    }

    public int updateContentById(Long id, Long memberId, String content) {
        return newsReplyMapper.updateContentById(id, memberId, content);
    }
}
