package com.app.globalgates.controller.explore;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.*;
import com.app.globalgates.service.*;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/explore/**")
@Slf4j
public class ExploreAPIController implements ExploreAPIControllerDocs {
    private final PostProductService postProductService;
    private final PostLikeService postLikeService;
    private final BookmarkService bookmarkService;
    private final NewsService newsService;
    private final NewsLikeService newsLikeService;
    private final NewsBookmarkService newsBookmarkService;
    private final SearchService searchService;
    private final S3Service s3Service;

//    추천 상품 목록 조회
    @GetMapping("products/{page}")
    public ResponseEntity<?> getRecommends(@PathVariable int page,
                                           @AuthenticationPrincipal CustomUserDetails userDetails) {
        PostProductWithPagingDTO posts = postProductService.getRecommendProducts(page, userDetails.getId());

        posts.getPosts().forEach(post -> {
            if (post.getMemberProfile() != null && !post.getMemberProfile().isBlank()) {
                post.setMemberProfile(
                        toPresignedUrlOrOriginal(post.getMemberProfile())
                );
            }

            if(post.getPostFiles() == null || post.getPostFiles().isEmpty()) {
                return;
            }
            post.setPostFiles(
                    post.getPostFiles().stream()
                            .map(this::toPresignedUrlOrOriginal)
                            .collect(Collectors.toList())
            );

        });

        return ResponseEntity.ok(posts);
    }

    private String toPresigned(String s3Key) {
        if (s3Key == null || s3Key.isBlank()) return null;
        try {
            return s3Service.getPresignedUrl(s3Key, Duration.ofMinutes(10));
        } catch (IOException e) {
            return null;
        }
    }

//    뉴스 목록 조회
    @GetMapping("news")
    public ResponseEntity<?> getNews(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        List<NewsDTO> newsList = newsService.getNewsList();
        List<NewsDTO> response = newsList.stream().map(source -> {
            NewsDTO copy = new NewsDTO();
            copy.setId(source.getId());
            copy.setAdminId(source.getAdminId());
            copy.setNewsTitle(source.getNewsTitle());
            copy.setNewsContent(source.getNewsContent());
            copy.setNewsSourceUrl(source.getNewsSourceUrl());
            copy.setNewsCategory(source.getNewsCategory());
            copy.setNewsType(source.getNewsType());
            copy.setPublishedAt(source.getPublishedAt());
            copy.setUpdatedDatetime(source.getUpdatedDatetime());
            copy.setCreatedDatetime(DateUtils.toRelativeTime(source.getCreatedDatetime()));
            copy.setLikeCount(newsLikeService.getLikeCount(source.getId()));
            copy.setBookmarkCount(newsBookmarkService.getBookmarkCount(source.getId()));
            copy.setLiked(memberId != null && newsLikeService.getLike(memberId, source.getId()).isPresent());
            copy.setBookmarked(memberId != null && newsBookmarkService.getBookmark(memberId, source.getId()).isPresent());
            return copy;
        }).toList();
        return ResponseEntity.ok(response);
    }

//    실시간 검색어 순위 조회 (10위 까지만)
    @GetMapping("trends")
    public ResponseEntity<?> getTrends() {
        List<RankedSearchHistoryDTO> trends = searchService.getTop10Histories();
        return ResponseEntity.ok(trends);
    }

    //    좋아요 조회 후, 생성 or 삭제
    @PostMapping("likes/{postId}")
    public ResponseEntity<?> checkLikes(@PathVariable Long postId,
                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        Optional<PostLikeDTO> exising = postLikeService.getLike(userDetails.getId(), postId);
        if(!exising.isPresent()) {
            PostLikeDTO postLikeDTO = new PostLikeDTO();
            postLikeDTO.setMemberId(userDetails.getId());
            postLikeDTO.setPostId(postId);
            postLikeService.addLike(postLikeDTO);

            return ResponseEntity.ok("좋아요를 생성했습니다.");
        } else {
            postLikeService.deleteLike(userDetails.getId(), postId);
            return ResponseEntity.ok("좋아요를 삭제했습니다.");
        }
    }

    // 북마크 조회 후, 생성 or 삭제
    @PostMapping("/api/explore/bookmarks/{postId}")
    public ResponseEntity<?> checkBookmarks(@PathVariable Long postId,
                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Optional<BookmarkDTO> exising = bookmarkService.getBookmark(userDetails.getId(), postId);
        log.info("정보가 바인딩이 되었나?? : {}", exising);

        if(!exising.isPresent()) {
            BookmarkDTO bookmarkDTO = new BookmarkDTO();
            bookmarkDTO.setPostId(postId);
            bookmarkDTO.setMemberId(userDetails.getId());
            bookmarkDTO.setFolderId(null);
            bookmarkService.addBookmark(bookmarkDTO);

            return ResponseEntity.ok("북마크를 등록했습니다.");
        } else {
            bookmarkService.deleteBookmark(exising.get().getId());
            return ResponseEntity.ok("북마크를 제거했습니다.");
        }
    }

    private String toPresignedUrlOrOriginal(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return filePath;
        }

        try {
            return s3Service.getPresignedUrl(filePath, Duration.ofMinutes(10));
        } catch (IOException e) {
            log.warn("mypage presigned URL 생성 실패. 원본 경로를 그대로 반환합니다. filePath={}", filePath, e);
            return filePath;
        }
    }

}
