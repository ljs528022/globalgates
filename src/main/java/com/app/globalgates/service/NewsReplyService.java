package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.dto.NewsReplyDTO;
import com.app.globalgates.dto.NewsReplyLikeDTO;
import com.app.globalgates.repository.NewsReplyDAO;
import com.app.globalgates.repository.NewsReplyLikeDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class NewsReplyService {
    private final NewsReplyDAO newsReplyDAO;
    private final NewsReplyLikeDAO newsReplyLikeDAO;

    @LogStatus
    public void writeReply(NewsReplyDTO newsReplyDTO) {
        newsReplyDAO.save(newsReplyDTO);
    }

    @LogStatusWithReturn
    public List<NewsReplyDTO> getReplies(Long newsId, Long currentMemberId, String sort) {
        String normalizedSort = "popular".equals(sort) ? "popular" : "latest";
        return newsReplyDAO.findByNewsId(newsId, currentMemberId, normalizedSort);
    }

    @LogStatusWithReturn
    public int getReplyCount(Long newsId) {
        return newsReplyDAO.countByNewsId(newsId);
    }

    @LogStatus
    public void deleteReply(Long replyId, Long memberId) {
        newsReplyDAO.softDeleteById(replyId, memberId);
    }

    @LogStatus
    public boolean updateReply(Long replyId, Long memberId, String content) {
        return newsReplyDAO.updateContentById(replyId, memberId, content) > 0;
    }

    @LogStatus
    public void addReplyLike(NewsReplyLikeDTO newsReplyLikeDTO) {
        newsReplyLikeDAO.save(newsReplyLikeDTO);
    }

    @LogStatus
    public void deleteReplyLike(Long memberId, Long replyId) {
        newsReplyLikeDAO.deleteByMemberIdAndReplyId(memberId, replyId);
    }

    @LogStatusWithReturn
    public Optional<NewsReplyLikeDTO> getReplyLike(Long memberId, Long replyId) {
        return newsReplyLikeDAO.findByMemberIdAndReplyId(memberId, replyId);
    }
}
