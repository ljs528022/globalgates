package com.app.globalgates.repository;

import com.app.globalgates.dto.NewsBookmarkDTO;
import com.app.globalgates.mapper.NewsBookmarkMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NewsBookmarkDAO {
    private final NewsBookmarkMapper newsBookmarkMapper;

    public void save(NewsBookmarkDTO newsBookmarkDTO) {
        newsBookmarkMapper.insert(newsBookmarkDTO);
    }

    public void deleteByMemberIdAndNewsId(Long memberId, Long newsId) {
        newsBookmarkMapper.deleteByMemberIdAndNewsId(memberId, newsId);
    }

    public Optional<NewsBookmarkDTO> findByMemberIdAndNewsId(Long memberId, Long newsId) {
        return newsBookmarkMapper.selectByMemberIdAndNewsId(memberId, newsId);
    }

    public int countByNewsId(Long newsId) {
        return newsBookmarkMapper.selectCountByNewsId(newsId);
    }

    public Optional<NewsBookmarkDTO> findById(Long id) {
        return newsBookmarkMapper.selectById(id);
    }

    public void updateFolderId(NewsBookmarkDTO newsBookmarkDTO) {
        newsBookmarkMapper.updateFolderId(newsBookmarkDTO);
    }

    public void clearFolderId(Long folderId) {
        newsBookmarkMapper.clearFolderId(folderId);
    }
}
