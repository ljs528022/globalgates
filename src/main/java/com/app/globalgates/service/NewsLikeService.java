package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.dto.NewsLikeDTO;
import com.app.globalgates.repository.NewsLikeDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class NewsLikeService {
    private final NewsLikeDAO newsLikeDAO;

    @LogStatus
    @CacheEvict(value = {"news:list", "news"}, allEntries = true)
    public void addLike(NewsLikeDTO newsLikeDTO) {
        newsLikeDAO.save(newsLikeDTO);
    }

    @LogStatus
    @CacheEvict(value = {"news:list", "news"}, allEntries = true)
    public void deleteLike(Long memberId, Long newsId) {
        newsLikeDAO.deleteByMemberIdAndNewsId(memberId, newsId);
    }

    @LogStatusWithReturn
    public Optional<NewsLikeDTO> getLike(Long memberId, Long newsId) {
        return newsLikeDAO.findByMemberIdAndNewsId(memberId, newsId);
    }

    @LogStatusWithReturn
    public int getLikeCount(Long newsId) {
        return newsLikeDAO.countByNewsId(newsId);
    }
}
