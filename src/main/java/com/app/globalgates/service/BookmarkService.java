package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.dto.BookmarkDTO;
import com.app.globalgates.dto.BookmarkFolderDTO;
import com.app.globalgates.repository.BookmarkDAO;
import com.app.globalgates.repository.BookmarkFolderDAO;
import com.app.globalgates.repository.NewsBookmarkDAO;
import com.app.globalgates.repository.PostHashtagDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class BookmarkService {
    private final BookmarkDAO bookmarkDAO;
    private final BookmarkFolderDAO bookmarkFolderDAO;
    private final NewsBookmarkDAO newsBookmarkDAO;
    private final PostHashtagDAO postHashtagDAO;

    //    폴더 생성
    @CacheEvict(value = "bookmark:folder:list", allEntries = true)
    @LogStatus
    public void createFolder(BookmarkFolderDTO bookmarkFolderDTO) {
        bookmarkFolderDAO.save(bookmarkFolderDTO);
    }

    //    폴더 수정 (소유권 검증 포함)
    @CacheEvict(value = "bookmark:folder:list", allEntries = true)
    public void updateFolder(BookmarkFolderDTO bookmarkFolderDTO, Long memberId) {
        assertFolderOwnedBy(bookmarkFolderDTO.getId(), memberId);
        bookmarkFolderDTO.setMemberId(memberId);
        bookmarkFolderDAO.update(bookmarkFolderDTO);
    }

    //    폴더 수정 (레거시 시그니처)
    @CacheEvict(value = "bookmark:folder:list", allEntries = true)
    public void updateFolder(BookmarkFolderDTO bookmarkFolderDTO) {
        bookmarkFolderDAO.update(bookmarkFolderDTO);
    }

    //    폴더 삭제 (소유권 검증 포함)
    @CacheEvict(value = {"bookmark:folder:list", "bookmark:list"}, allEntries = true)
    @LogStatus
    public void deleteFolder(Long id, Long memberId) {
        assertFolderOwnedBy(id, memberId);
        bookmarkDAO.clearFolderId(id);
        newsBookmarkDAO.clearFolderId(id);
        bookmarkFolderDAO.delete(id);
    }

    //    폴더 삭제 (레거시 시그니처)
    @CacheEvict(value = {"bookmark:folder:list", "bookmark:list"}, allEntries = true)
    @LogStatus
    public void deleteFolder(Long id) {
        bookmarkDAO.clearFolderId(id);
        newsBookmarkDAO.clearFolderId(id);
        bookmarkFolderDAO.delete(id);
    }

    //    폴더 단건 조회
    public Optional<BookmarkFolderDTO> getFolder(Long id) {
        return bookmarkFolderDAO.findById(id);
    }

    //    폴더 목록 조회
    @Cacheable(value = "bookmark:folder:list", key = "#memberId")
    @LogStatusWithReturn
    public List<BookmarkFolderDTO> getFolders(Long memberId) {
        return bookmarkFolderDAO.findAllByMemberId(memberId);
    }

    //    북마크 추가
    @CacheEvict(value = {"bookmark:list", "post:list", "post", "community:post:list"}, allEntries = true)
    @LogStatus
    public void addBookmark(BookmarkDTO bookmarkDTO) {
        bookmarkDAO.save(bookmarkDTO);
    }

    //    북마크 삭제 (소유권 검증 포함)
    @CacheEvict(value = {"bookmark:list", "post:list", "post", "community:post:list"}, allEntries = true)
    @LogStatus
    public void deleteBookmarkChecked(Long id, Long memberId) {
        assertBookmarkOwnedBy(id, memberId);
        bookmarkDAO.delete(id);
    }

    //    북마크 삭제 (레거시 시그니처)
    @CacheEvict(value = {"bookmark:list", "post:list", "post", "community:post:list"}, allEntries = true)
    @LogStatus
    public void deleteBookmark(Long id) {
        bookmarkDAO.delete(id);
    }

    //    회원/게시글 기준 북마크 삭제
    @CacheEvict(value = {"bookmark:list", "post:list", "post", "community:post:list"}, allEntries = true)
    @LogStatus
    public void deleteBookmark(Long memberId, Long postId) {
        bookmarkDAO.deleteByMemberIdAndPostId(memberId, postId);
    }

    //    북마크 폴더 이동 (소유권 검증 포함)
    @CacheEvict(value = "bookmark:list", allEntries = true)
    public void updateFolderId(BookmarkDTO bookmarkDTO, Long memberId) {
        assertBookmarkOwnedBy(bookmarkDTO.getId(), memberId);
        if (bookmarkDTO.getFolderId() != null) {
            assertFolderOwnedBy(bookmarkDTO.getFolderId(), memberId);
        }
        bookmarkDAO.updateFolderId(bookmarkDTO);
    }

    //    북마크 폴더 이동 (레거시)
    @CacheEvict(value = "bookmark:list", allEntries = true)
    public void updateFolderId(BookmarkDTO bookmarkDTO) {
        bookmarkDAO.updateFolderId(bookmarkDTO);
    }

    //    북마크 단건 조회
    public Optional<BookmarkDTO> getBookmark(Long id) {
        return bookmarkDAO.findById(id);
    }

    //    회원/게시글 기준 북마크 단건 조회
    public Optional<BookmarkDTO> getBookmark(Long memberId, Long postId) {
        return bookmarkDAO.findByMemberIdAndPostId(memberId, postId);
    }

    //    회원 전체 북마크 조회
    @Cacheable(value = "bookmark:list", key = "'member:' + #memberId")
    @LogStatusWithReturn
    public List<BookmarkDTO> getBookmarks(Long memberId) {
        List<BookmarkDTO> list = bookmarkDAO.findAllByMemberId(memberId);
        attachHashtags(list);
        return list;
    }

    //    폴더별 북마크 조회 (소유권 검증 포함)
    @LogStatusWithReturn
    public List<BookmarkDTO> getBookmarksByFolder(Long folderId, Long memberId) {
        assertFolderOwnedBy(folderId, memberId);
        List<BookmarkDTO> list = bookmarkDAO.findAllByFolderId(folderId);
        attachHashtags(list);
        return list;
    }

    //    폴더별 북마크 조회 (레거시)
    @Cacheable(value = "bookmark:list", key = "'folder:' + #folderId")
    @LogStatusWithReturn
    public List<BookmarkDTO> getBookmarksByFolder(Long folderId) {
        List<BookmarkDTO> list = bookmarkDAO.findAllByFolderId(folderId);
        attachHashtags(list);
        return list;
    }

    //    미분류 북마크 조회
    @Cacheable(value = "bookmark:list", key = "'uncategorized:' + #memberId")
    @LogStatusWithReturn
    public List<BookmarkDTO> getUncategorizedBookmarks(Long memberId) {
        List<BookmarkDTO> list = bookmarkDAO.findAllUncategorizedByMemberId(memberId);
        attachHashtags(list);
        return list;
    }

    //    post 타입 북마크에 해시태그 채워넣기 (뉴스 북마크는 빈 리스트로 둠)
    private void attachHashtags(List<BookmarkDTO> list) {
        list.forEach(b -> {
            if ("post".equals(b.getBookmarkType()) && b.getPostId() != null) {
                b.setHashtags(postHashtagDAO.findAllByPostId(b.getPostId()));
            }
        });
    }

    //    북마크 개수 조회
    public int getBookmarkCount(Long memberId) {
        return bookmarkDAO.countByMemberId(memberId);
    }

    // ─── 소유권 검증 헬퍼 ───
    private void assertFolderOwnedBy(Long folderId, Long memberId) {
        BookmarkFolderDTO folder = bookmarkFolderDAO.findById(folderId)
                .orElseThrow(() -> new SecurityException("폴더를 찾을 수 없습니다."));
        if (folder.getMemberId() == null || !folder.getMemberId().equals(memberId)) {
            throw new SecurityException("해당 폴더에 대한 권한이 없습니다.");
        }
    }

    private void assertBookmarkOwnedBy(Long bookmarkId, Long memberId) {
        BookmarkDTO bookmark = bookmarkDAO.findById(bookmarkId)
                .orElseThrow(() -> new SecurityException("북마크를 찾을 수 없습니다."));
        if (bookmark.getMemberId() == null || !bookmark.getMemberId().equals(memberId)) {
            throw new SecurityException("해당 북마크에 대한 권한이 없습니다.");
        }
    }
}
