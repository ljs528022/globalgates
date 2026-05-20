package com.app.globalgates.controller;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.NewsBookmarkDTO;
import com.app.globalgates.dto.NewsLikeDTO;
import com.app.globalgates.dto.NewsReplyDTO;
import com.app.globalgates.dto.NewsReplyLikeDTO;
import com.app.globalgates.service.NewsBookmarkService;
import com.app.globalgates.service.NewsLikeService;
import com.app.globalgates.service.NewsReplyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
@Slf4j
public class NewsAPIController {

    private final NewsLikeService newsLikeService;
    private final NewsBookmarkService newsBookmarkService;
    private final NewsReplyService newsReplyService;

    //    좋아요 토글
    @LogStatus
    @PostMapping("/{newsId}/likes")
    public ResponseEntity<?> toggleLike(@PathVariable Long newsId,
                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long memberId = userDetails.getId();
        Optional<NewsLikeDTO> existing = newsLikeService.getLike(memberId, newsId);

        boolean liked;
        if (existing.isPresent()) {
            newsLikeService.deleteLike(memberId, newsId);
            liked = false;
        } else {
            NewsLikeDTO dto = new NewsLikeDTO();
            dto.setMemberId(memberId);
            dto.setNewsId(newsId);
            newsLikeService.addLike(dto);
            liked = true;
        }
        int likeCount = newsLikeService.getLikeCount(newsId);
        return ResponseEntity.ok(Map.of("liked", liked, "likeCount", likeCount));
    }

    //    북마크 토글
    @LogStatus
    @PostMapping("/{newsId}/bookmarks")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long newsId,
                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long memberId = userDetails.getId();
        Optional<NewsBookmarkDTO> existing = newsBookmarkService.getBookmark(memberId, newsId);

        boolean bookmarked;
        if (existing.isPresent()) {
            newsBookmarkService.deleteBookmark(memberId, newsId);
            bookmarked = false;
        } else {
            NewsBookmarkDTO dto = new NewsBookmarkDTO();
            dto.setMemberId(memberId);
            dto.setNewsId(newsId);
            newsBookmarkService.addBookmark(dto);
            bookmarked = true;
        }
        int bookmarkCount = newsBookmarkService.getBookmarkCount(newsId);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked, "bookmarkCount", bookmarkCount));
    }

    //    댓글 등록
    @LogStatusWithReturn
    @PostMapping("/{newsId}/replies")
    public ResponseEntity<?> writeReply(@PathVariable Long newsId,
                                        @RequestBody NewsReplyDTO newsReplyDTO,
                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        String content = newsReplyDTO.getContent();
        if (content == null || content.codePoints().allMatch(c -> Character.isWhitespace(c) || Character.isSpaceChar(c))) {
            return ResponseEntity.badRequest().body(Map.of("message", "내용을 입력해주세요."));
        }
        newsReplyDTO.setNewsId(newsId);
        newsReplyDTO.setMemberId(userDetails.getId());
        newsReplyService.writeReply(newsReplyDTO);
        int replyCount = newsReplyService.getReplyCount(newsId);
        return ResponseEntity.ok(Map.of("id", newsReplyDTO.getId(), "replyCount", replyCount));
    }

    //    댓글 목록
    @LogStatusWithReturn
    @GetMapping("/{newsId}/replies")
    public ResponseEntity<?> getReplies(@PathVariable Long newsId,
                                        @RequestParam(value = "sort", required = false) String sort,
                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long currentMemberId = userDetails != null ? userDetails.getId() : null;
        List<NewsReplyDTO> replies = newsReplyService.getReplies(newsId, currentMemberId, sort);
        return ResponseEntity.ok(replies);
    }

    //    댓글 삭제 (작성자만)
    @LogStatus
    @DeleteMapping("/replies/{replyId}")
    public ResponseEntity<?> deleteReply(@PathVariable Long replyId,
                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        newsReplyService.deleteReply(replyId, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    //    댓글 수정 (작성자만)
    @LogStatus
    @PutMapping("/replies/{replyId}")
    public ResponseEntity<?> updateReply(@PathVariable Long replyId,
                                         @RequestBody NewsReplyDTO newsReplyDTO,
                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        String content = newsReplyDTO.getContent();
        if (content == null || content.codePoints().allMatch(c -> Character.isWhitespace(c) || Character.isSpaceChar(c))) {
            return ResponseEntity.badRequest().body(Map.of("message", "내용을 입력해주세요."));
        }
        boolean updated = newsReplyService.updateReply(replyId, userDetails.getId(), content);
        if (!updated) {
            return ResponseEntity.status(403).body(Map.of("message", "수정 권한이 없거나 댓글을 찾을 수 없습니다."));
        }
        return ResponseEntity.ok(Map.of("id", replyId, "content", content));
    }

    //    댓글 좋아요 토글
    @LogStatus
    @PostMapping("/replies/{replyId}/likes")
    public ResponseEntity<?> toggleReplyLike(@PathVariable Long replyId,
                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long memberId = userDetails.getId();
        Optional<NewsReplyLikeDTO> existing = newsReplyService.getReplyLike(memberId, replyId);

        boolean liked;
        if (existing.isPresent()) {
            newsReplyService.deleteReplyLike(memberId, replyId);
            liked = false;
        } else {
            NewsReplyLikeDTO dto = new NewsReplyLikeDTO();
            dto.setMemberId(memberId);
            dto.setReplyId(replyId);
            newsReplyService.addReplyLike(dto);
            liked = true;
        }
        return ResponseEntity.ok(Map.of("liked", liked));
    }
}
