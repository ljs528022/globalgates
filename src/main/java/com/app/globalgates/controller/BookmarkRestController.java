package com.app.globalgates.controller;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.BookmarkDTO;
import com.app.globalgates.dto.BookmarkFolderDTO;
import com.app.globalgates.dto.NewsBookmarkDTO;
import com.app.globalgates.dto.PostFileDTO;
import com.app.globalgates.repository.PostFileDAO;
import com.app.globalgates.service.BookmarkService;
import com.app.globalgates.service.NewsBookmarkService;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookmarks")
public class BookmarkRestController implements BookmarkRestControllerDocs {
    private final BookmarkService bookmarkService;
    private final NewsBookmarkService newsBookmarkService;
    private final PostFileDAO postFileDAO;
    private final S3Service s3Service;

    @LogStatusWithReturn
    @GetMapping("/folders/{memberId}")
    public ResponseEntity<List<BookmarkFolderDTO>> getFolders(@PathVariable Long memberId,
                                                              @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Long authMemberId = userDetails.getId();
        if (memberId != null && !memberId.equals(authMemberId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(bookmarkService.getFolders(authMemberId));
    }

    @LogStatusWithReturn
    @PostMapping("/folders")
    public ResponseEntity<Map<String, Long>> createFolder(@RequestBody BookmarkFolderDTO bookmarkFolderDTO,
                                                          @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        bookmarkFolderDTO.setMemberId(userDetails.getId());
        bookmarkService.createFolder(bookmarkFolderDTO);
        return ResponseEntity.ok(Map.of("id", bookmarkFolderDTO.getId()));
    }

    @LogStatus
    @PutMapping("/folders")
    public ResponseEntity<Void> updateFolder(@RequestBody BookmarkFolderDTO bookmarkFolderDTO,
                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        bookmarkFolderDTO.setMemberId(userDetails.getId());
        bookmarkService.updateFolder(bookmarkFolderDTO, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @LogStatus
    @PostMapping("/folders/{id}/delete")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id,
                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        bookmarkService.deleteFolder(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @LogStatus
    @PostMapping
    public ResponseEntity<Void> addBookmark(@RequestBody BookmarkDTO bookmarkDTO,
                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        bookmarkDTO.setMemberId(userDetails.getId());
        bookmarkService.addBookmark(bookmarkDTO);
        return ResponseEntity.ok().build();
    }

    @LogStatus
    @PostMapping("/news")
    public ResponseEntity<Void> addNewsBookmark(@RequestBody NewsBookmarkDTO newsBookmarkDTO,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        newsBookmarkService.addBookmark(newsBookmarkDTO, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @LogStatus
    @PostMapping("/{id}/delete")
    public ResponseEntity<Void> deleteBookmark(@PathVariable Long id,
                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        bookmarkService.deleteBookmarkChecked(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @LogStatus
    @PostMapping("/members/{memberId}/posts/{postId}/delete")
    public ResponseEntity<Void> deleteBookmarkByMemberIdAndPostId(@PathVariable Long memberId,
                                                                  @PathVariable Long postId,
                                                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Long authMemberId = userDetails.getId();
        if (memberId != null && !memberId.equals(authMemberId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        bookmarkService.deleteBookmark(authMemberId, postId);
        return ResponseEntity.ok().build();
    }

    @LogStatus
    @PutMapping("/{id}/folder")
    public ResponseEntity<Void> updateFolderId(@PathVariable Long id,
                                               @RequestBody BookmarkDTO bookmarkDTO,
                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        bookmarkDTO.setId(id);
        bookmarkDTO.setMemberId(userDetails.getId());
        bookmarkService.updateFolderId(bookmarkDTO, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @LogStatus
    @PutMapping("/news/{id}/folder")
    public ResponseEntity<Void> updateNewsFolderId(@PathVariable Long id,
                                                   @RequestBody NewsBookmarkDTO newsBookmarkDTO,
                                                   @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        newsBookmarkDTO.setId(id);
        newsBookmarkService.updateFolderId(newsBookmarkDTO, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @LogStatusWithReturn
    @GetMapping("/members/{memberId}")
    public ResponseEntity<List<BookmarkDTO>> getBookmarks(@PathVariable Long memberId,
                                                          @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Long authMemberId = userDetails.getId();
        if (memberId != null && !memberId.equals(authMemberId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<BookmarkDTO> bookmarks = bookmarkService.getBookmarks(authMemberId);
        applyPostFiles(bookmarks);
        return ResponseEntity.ok(bookmarks);
    }

    @LogStatusWithReturn
    @GetMapping("/folders/{folderId}/items")
    public ResponseEntity<List<BookmarkDTO>> getBookmarksByFolder(@PathVariable Long folderId,
                                                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        List<BookmarkDTO> bookmarks = bookmarkService.getBookmarksByFolder(folderId, userDetails.getId());
        applyPostFiles(bookmarks);
        return ResponseEntity.ok(bookmarks);
    }

    @LogStatusWithReturn
    @GetMapping("/members/{memberId}/uncategorized")
    public ResponseEntity<List<BookmarkDTO>> getUncategorizedBookmarks(@PathVariable Long memberId,
                                                                       @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Long authMemberId = userDetails.getId();
        if (memberId != null && !memberId.equals(authMemberId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<BookmarkDTO> bookmarks = bookmarkService.getUncategorizedBookmarks(authMemberId);
        applyPostFiles(bookmarks);
        return ResponseEntity.ok(bookmarks);
    }

    @LogStatusWithReturn
    @GetMapping("/members/{memberId}/posts/{postId}")
    public ResponseEntity<BookmarkDTO> getBookmarkByMemberAndPost(@PathVariable Long memberId,
                                                                  @PathVariable Long postId,
                                                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Long authMemberId = userDetails.getId();
        if (memberId != null && !memberId.equals(authMemberId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return bookmarkService.getBookmark(authMemberId, postId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @LogStatusWithReturn
    @GetMapping("/members/{memberId}/news/{newsId}")
    public ResponseEntity<NewsBookmarkDTO> getNewsBookmarkByMemberAndNews(@PathVariable Long memberId,
                                                                          @PathVariable Long newsId,
                                                                          @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Long authMemberId = userDetails.getId();
        if (memberId != null && !memberId.equals(authMemberId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return newsBookmarkService.getBookmark(authMemberId, newsId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException e) {
        log.error("데이터 무결성 위반: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "이 폴더에 이미 북마크된 게시물입니다."));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<?> handleForbidden(SecurityException e) {
        log.warn("권한 없음: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", e.getMessage()));
    }

    private void applyPostFiles(List<BookmarkDTO> bookmarks) {
        bookmarks.forEach(b -> {
            if (b.getPostId() != null) {
                List<PostFileDTO> files = postFileDAO.findAllByPostId(b.getPostId());
                b.setPostFiles(files);
                files.forEach(pf -> {
                    try {
                        pf.setFilePath(s3Service.getPresignedUrl(pf.getFilePath(), Duration.ofMinutes(10)));
                    } catch (IOException e) {
                        log.warn("Presigned URL 생성 실패: {}", pf.getFilePath());
                    }
                });
            }
            if (b.getMemberProfileFileName() != null) {
                try {
                    b.setMemberProfileFileName(s3Service.getPresignedUrl(b.getMemberProfileFileName(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    log.warn("프로필 Presigned URL 생성 실패: {}", b.getMemberProfileFileName());
                }
            }
        });
    }
}
