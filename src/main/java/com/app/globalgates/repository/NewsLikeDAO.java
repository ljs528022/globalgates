package com.app.globalgates.repository;

import com.app.globalgates.dto.NewsLikeDTO;
import com.app.globalgates.mapper.NewsLikeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NewsLikeDAO {
    private final NewsLikeMapper newsLikeMapper;

    public void save(NewsLikeDTO newsLikeDTO) {
        newsLikeMapper.insert(newsLikeDTO);
    }

    public void deleteByMemberIdAndNewsId(Long memberId, Long newsId) {
        newsLikeMapper.deleteByMemberIdAndNewsId(memberId, newsId);
    }

    public Optional<NewsLikeDTO> findByMemberIdAndNewsId(Long memberId, Long newsId) {
        return newsLikeMapper.selectByMemberIdAndNewsId(memberId, newsId);
    }

    public int countByNewsId(Long newsId) {
        return newsLikeMapper.selectCountByNewsId(newsId);
    }
}
