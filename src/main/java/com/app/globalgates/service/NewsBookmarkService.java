package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.dto.BookmarkFolderDTO;
import com.app.globalgates.dto.NewsBookmarkDTO;
import com.app.globalgates.repository.BookmarkFolderDAO;
import com.app.globalgates.repository.NewsBookmarkDAO;
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
public class NewsBookmarkService {
    private final NewsBookmarkDAO newsBookmarkDAO;
    private final BookmarkFolderDAO bookmarkFolderDAO;

    @LogStatus
    @CacheEvict(value = {"news:list", "news", "bookmark:list"}, allEntries = true)
    public void addBookmark(NewsBookmarkDTO newsBookmarkDTO) {
        newsBookmarkDAO.save(newsBookmarkDTO);
    }

    @LogStatus
    @CacheEvict(value = {"news:list", "news", "bookmark:list"}, allEntries = true)
    public void deleteBookmark(Long memberId, Long newsId) {
        newsBookmarkDAO.deleteByMemberIdAndNewsId(memberId, newsId);
    }

    @LogStatusWithReturn
    public Optional<NewsBookmarkDTO> getBookmark(Long memberId, Long newsId) {
        return newsBookmarkDAO.findByMemberIdAndNewsId(memberId, newsId);
    }

    @LogStatusWithReturn
    public Optional<NewsBookmarkDTO> getBookmarkById(Long id) {
        return newsBookmarkDAO.findById(id);
    }

    @LogStatus
    @CacheEvict(value = {"news:list", "news", "bookmark:list", "bookmark:folder:list"}, allEntries = true)
    public void addBookmark(NewsBookmarkDTO newsBookmarkDTO, Long memberId) {
        newsBookmarkDTO.setMemberId(memberId);
        if (newsBookmarkDTO.getFolderId() != null) {
            assertFolderOwnedBy(newsBookmarkDTO.getFolderId(), memberId);
        }
        newsBookmarkDAO.save(newsBookmarkDTO);
    }

    @LogStatus
    @CacheEvict(value = {"news:list", "news", "bookmark:list", "bookmark:folder:list"}, allEntries = true)
    public void updateFolderId(NewsBookmarkDTO newsBookmarkDTO, Long memberId) {
        assertNewsBookmarkOwnedBy(newsBookmarkDTO.getId(), memberId);
        if (newsBookmarkDTO.getFolderId() != null) {
            assertFolderOwnedBy(newsBookmarkDTO.getFolderId(), memberId);
        }
        newsBookmarkDAO.updateFolderId(newsBookmarkDTO);
    }

    @LogStatus
    @CacheEvict(value = {"news:list", "news", "bookmark:list", "bookmark:folder:list"}, allEntries = true)
    public void clearFolderId(Long folderId) {
        newsBookmarkDAO.clearFolderId(folderId);
    }

    @LogStatusWithReturn
    public int getBookmarkCount(Long newsId) {
        return newsBookmarkDAO.countByNewsId(newsId);
    }

    private void assertFolderOwnedBy(Long folderId, Long memberId) {
        BookmarkFolderDTO folder = bookmarkFolderDAO.findById(folderId)
                .orElseThrow(() -> new SecurityException("폴더를 찾을 수 없습니다."));
        if (folder.getMemberId() == null || !folder.getMemberId().equals(memberId)) {
            throw new SecurityException("해당 폴더에 대한 권한이 없습니다.");
        }
    }

    private void assertNewsBookmarkOwnedBy(Long bookmarkId, Long memberId) {
        NewsBookmarkDTO bookmark = newsBookmarkDAO.findById(bookmarkId)
                .orElseThrow(() -> new SecurityException("뉴스 북마크를 찾을 수 없습니다."));
        if (bookmark.getMemberId() == null || !bookmark.getMemberId().equals(memberId)) {
            throw new SecurityException("해당 뉴스 북마크에 대한 권한이 없습니다.");
        }
    }
}
