package com.app.globalgates.controller.main;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.*;
import com.app.globalgates.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/main")
@Slf4j
public class MainAPIController implements MainAPIControllerDocs {
    private final PostService postService;
    private final ExpertService expertService;
    private final PostLikeService postLikeService;
    private final SearchService searchService;
    private final NewsService newsService;
    private final PostProductService postProductService;
    private final BookmarkService bookmarkService;
    private final FollowService followService;
    private final BlockService blockService;
    private final ReportService reportService;
    private final S3Service s3Service;
    private final AdvertisementService advertisementService;
    private final PostTempService postTempService;
    private final com.app.globalgates.repository.MentionDAO mentionDAO;

//    피드에 광고
    @GetMapping("/ads/list/{page}")
    @LogStatusWithReturn
    public List<AdvertisementDTO> getAds(@PathVariable int page, @RequestParam int count) {
        log.info("광고 조회");
        List<AdvertisementDTO> ads = advertisementService.getAdsInMain(page, count);
        ads.forEach(ad -> {
            ad.setImgUrls(convertToPresignedUrl(ad.getImgUrls()));
            if (ad.getAdvertiserProfileFileName() != null) {
                try {
                    ad.setAdvertiserProfileFileName(s3Service.getPresignedUrl(ad.getAdvertiserProfileFileName(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    throw new RuntimeException("Presigned URL 생성 실패", e);
                }
            }
        });
        return ads;
    }

//    게시글 목록 조회
    @GetMapping("/posts/list/{page}")
    @LogStatusWithReturn
    public PostWithPagingDTO getPostList(@PathVariable int page, @RequestParam Long memberId) {
        log.info("게시글 목록 조회 — page: {}, memberId: {}", page, memberId);
        PostWithPagingDTO result = postService.getList(page, memberId);
        result.getPosts().forEach(post -> {
            convertPostFilesUrl(post);
            convertProfileUrl(post);
            convertProductImageUrl(post);
        });
        return result;
    }

//    게시글 단건 조회 (수정용)
    @GetMapping("/posts/{id}")
    @LogStatusWithReturn
    public PostDTO getPost(@PathVariable Long id, @RequestParam Long memberId) {
        log.info("게시글 단건 조회 — postId: {}, memberId: {}", id, memberId);
        PostDTO post = postService.getDetail(id, memberId);
        post.getPostFiles().forEach(pf -> {
            try {
                pf.setFilePath(s3Service.getPresignedUrl(pf.getFilePath(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                throw new RuntimeException("Presigned URL 생성 실패", e);
            }
        });
        return post;
    }

//    게시글 작성
    @PostMapping("/posts/write")
    @LogStatus
    public void writePost(PostDTO postDTO,
                          @RequestParam(value = "files", required = false) List<MultipartFile> files) throws IOException {
        log.info("게시글 작성됐나요?");
        postService.writePost(postDTO, files);
        log.info("ㅇㅇ됨. 작성자(내아디)(memberId)는: {}, 내용은(content): {}", postDTO.getMemberId(), postDTO.getPostContent());
        // 멘션 저장
        postService.saveMentions(postDTO.getId(), postDTO.getMemberId(), postDTO.getMentionedHandles());
        log.info("첨부파일은 있나요?");
        if (files != null && !files.isEmpty()) {
            log.info("파일인식함");
            String todayPath = postService.getTodayPath();
            List<String> uploadedKeys = new ArrayList<>();

            try {
                for (MultipartFile file : files) {
                    String s3Key = s3Service.uploadFile(file, todayPath);
                    uploadedKeys.add(s3Key);
                    postService.saveFile(postDTO.getId(), file, s3Key);
                    log.info("파일들어옴");
                }
            } catch (Exception e) {
                uploadedKeys.forEach(s3Service::deleteFile);
                throw new RuntimeException("파일 업로드 실패", e);
            }
        }
    }

//    게시글 수정
    @PostMapping("/posts/update/{id}")
    @LogStatus
    public void updatePost(@PathVariable Long id, PostDTO postDTO,
                           @RequestParam(value = "files", required = false) List<MultipartFile> files,
                           @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
        // path id를 정본으로 사용 + 인증 사용자로 작성자 검증/덮어쓰기 (IDOR 방어)
        postDTO.setId(id);
        postDTO.setMemberId(userDetails.getId());
        log.info("게시글 수정 — postId: {}, memberId: {}", id, userDetails.getId());
        postService.update(postDTO, userDetails.getId());

        if (files != null && !files.isEmpty()) {
            String todayPath = postService.getTodayPath();
            List<String> uploadedKeys = new ArrayList<>();

            try {
                for (MultipartFile file : files) {
                    String s3Key = s3Service.uploadFile(file, todayPath);
                    uploadedKeys.add(s3Key);
                    postService.saveFile(postDTO.getId(), file, s3Key);
                }
            } catch (Exception e) {
                uploadedKeys.forEach(s3Service::deleteFile);
                throw new RuntimeException("파일 업로드 실패", e);
            }
        }
    }

//    게시글 삭제
    @PostMapping("/posts/delete/{id}")
    @LogStatus
    public void deletePost(@PathVariable Long id,
                           @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("게시글 삭제 — postId: {}, memberId: {}", id, userDetails.getId());
        postService.delete(id, userDetails.getId());
    }

//    댓글 작성
    @PostMapping("/posts/{postId}/replies")
    @LogStatus
    public void writeReply(@PathVariable Long postId,
                           PostDTO postDTO,
                           @RequestParam(value = "files", required = false) List<MultipartFile> files) throws IOException {
        log.info("댓글 작성 — postId: {}, memberId: {}, content: {}", postId, postDTO.getMemberId(), postDTO.getPostContent());
        postDTO.setReplyPostId(postId);
        postService.writeReply(postDTO);
        // 멘션 저장
        postService.saveMentions(postDTO.getId(), postDTO.getMemberId(), postDTO.getMentionedHandles());

        if (files != null && !files.isEmpty()) {
            String todayPath = postService.getTodayPath();
            for (MultipartFile file : files) {
                String s3Key = s3Service.uploadFile(file, todayPath);
                postService.saveFile(postDTO.getId(), file, s3Key);
            }
        }
    }

//    댓글 목록
    @GetMapping("/posts/{postId}/replies")
    @LogStatusWithReturn
    public List<PostDTO> getReplies(@PathVariable Long postId, @RequestParam Long memberId) {
        log.info("댓글목록조회함 — postId: {}, memberId: {}", postId, memberId);
        List<PostDTO> replies = postService.getReplies(postId, memberId);
        replies.forEach(reply -> {
            convertPostFilesUrl(reply);
            convertProfileUrl(reply);
            convertProductImageUrl(reply);
            if (reply.getSubReplies() != null) {
                reply.getSubReplies().forEach(sub -> convertProductImageUrl(sub));
            }
        });
        return replies;
    }


//    전문가 목록 조회
    @GetMapping("/experts/list/{page}")
    @LogStatusWithReturn
    public ExpertWithPagingDTO getExpertList(@PathVariable int page, @RequestParam Long memberId) {
        log.info("전문가 목록 조회하기 page: {}, memberId: {}", page, memberId);
        ExpertWithPagingDTO result = expertService.getList(page, memberId);
        result.getExperts().forEach(expert -> {
            if (expert.getMemberProfileFileName() != null) {
                try {
                    expert.setMemberProfileFileName(s3Service.getPresignedUrl(expert.getMemberProfileFileName(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    throw new RuntimeException("Presigned URL 생성 실패", e);
                }
            }
        });
        return result;
    }


//    좋아요 추가
    @PostMapping("/likes")
    @LogStatus
    public void addLike(@RequestBody PostLikeDTO postLikeDTO,
                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 클라이언트 전달 memberId 무시 → 인증 사용자로 강제 (인증 우회 방어)
        postLikeDTO.setMemberId(userDetails.getId());
        log.info("좋아요 누름~ memberId: {}, postId: {}", userDetails.getId(), postLikeDTO.getPostId());
        postLikeService.addLike(postLikeDTO);
    }

//    좋아요 떼기 (memberId는 인증 정보에서 추출)
    @PostMapping("/likes/posts/{postId}/delete")
    @LogStatus
    public void deleteLike(@PathVariable Long postId,
                           @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long requesterId = userDetails.getId();
        log.info("좋아요 뗌~ memberId: {}, postId: {}", requesterId, postId);
        postLikeService.deleteLike(requesterId, postId);
    }


//    검색
    @GetMapping("/search/members")
    @LogStatusWithReturn
    public List<MemberDTO> searchMembers(@RequestParam String keyword) {
        log.info("회원 검색하기 keyword: {}", keyword);
        return searchService.searchMembers(keyword);
    }

//    검색 기록 저장
    @PostMapping("/search/histories")
    @LogStatus
    public void saveSearchHistory(@RequestBody SearchHistoryDTO searchHistoryDTO) {
        log.info("검색기록 저장 memberId: {}, keyword: {}", searchHistoryDTO.getMemberId(), searchHistoryDTO.getSearchKeyword());
        searchService.saveSearchHistory(searchHistoryDTO);
    }

//    최근 검색 목록 조회
    @GetMapping("/search/histories/{memberId}")
    @LogStatusWithReturn
    public List<SearchHistoryDTO> getSearchHistories(@PathVariable Long memberId) {
        log.info("최근검색 조회하기. memberId: {}", memberId);
        return searchService.getSearchHistories(memberId);
    }

//    검색 기록 개별 삭제
    @PostMapping("/search/histories/{id}/delete")
    @LogStatus
    public void deleteSearchHistory(@PathVariable Long id) {
        log.info("최근검색 개별삭제 — id: {}", id);
        searchService.deleteSearchHistory(id);
    }

//    검색 기록 전체 삭제
    @PostMapping("/search/histories/members/{memberId}/delete-all")
    @LogStatus
    public void deleteAllSearchHistories(@PathVariable Long memberId) {
        log.info("최근검색 전체삭제 — memberId: {}", memberId);
        searchService.deleteAllSearchHistories(memberId);
    }


//    사이드바 뉴스탭에 2개
    @GetMapping("/news/latest")
    @LogStatusWithReturn
    public List<NewsDTO> getLatestNews() {
        log.info("뉴스 조회하기");
        return newsService.getLatestNewsInMain();
    }


//    작성할때 내 판매품목 목록 조회
    @GetMapping("/products/members/{memberId}")
    @LogStatusWithReturn
    public List<PostProductDTO> getMyProducts(@PathVariable Long memberId) {
        log.info("내 판매품목 조회해요 내아이디(memberId): {}", memberId);
        List<PostProductDTO> products = postProductService.getMyProducts(memberId);
        products.forEach(product -> {
            List<String> presigned = new ArrayList<>();
            product.getPostFiles().forEach(key -> {
                try {
                    presigned.add(s3Service.getPresignedUrl(key, Duration.ofMinutes(10)));
                } catch (IOException e) {
                    // 변환 실패 키는 생략
                }
            });
            product.setPostFiles(presigned);
        });
        return products;
    }


//    북마크 추가
    @PostMapping("/bookmarks")
    @LogStatus
    public void addBookmark(@RequestBody BookmarkDTO bookmarkDTO) {
        log.info("북마크 추가댐 작성자아이디: {}, 게시물아이디: {}", bookmarkDTO.getMemberId(), bookmarkDTO.getPostId());
        bookmarkService.addBookmark(bookmarkDTO);
    }

//    북마크 떼기
    @PostMapping("/bookmarks/members/{memberId}/posts/{postId}/delete")
    @LogStatus
    public void deleteBookmark(@PathVariable Long memberId, @PathVariable Long postId) {
        log.info("북마크 뗌 — memberId: {}, postId: {}", memberId, postId);
        bookmarkService.deleteBookmark(memberId, postId);
    }

//    팔로우 추가
    @PostMapping("/follows")
    @LogStatus
    public void follow(@RequestBody FollowDTO followDTO) {
        log.info("팔로우 추가 — followerId: {}, followingId: {}", followDTO.getFollowerId(), followDTO.getFollowingId());
        followService.follow(followDTO);
    }

//    팔로우 해제
    @PostMapping("/follows/{followerId}/{followingId}/delete")
    @LogStatus
    public void unfollow(@PathVariable Long followerId, @PathVariable Long followingId) {
        log.info("팔로우 해제 — followerId: {}, followingId: {}", followerId, followingId);
        followService.unfollow(followerId, followingId);
    }

//    팔로잉 목록 조회(공유모달에서)
    @GetMapping("/follows/{memberId}/followings")
    @LogStatusWithReturn
    public List<FollowDTO> getFollowings(@PathVariable Long memberId) {
        log.info("팔로잉 목록 조회 들어옴1 — memberId: {}", memberId);
        List<FollowDTO> result = followService.getFollowings(memberId);
        log.info("팔로잉 목록 조회 들어옴2 — 결과 size: {}", result.size());
        result.forEach(f -> log.info("  following: {}", f));
        return result;
    }


//    팔로우 추천탭 - 우선은 2개 조회 (나중에 AI)
    @GetMapping("/follows/{memberId}/suggestions")
    @LogStatusWithReturn
    public List<MemberDTO> getSuggestions(@PathVariable Long memberId) {
        log.info("팔로우 추천 조회하기");
        List<MemberDTO> members = followService.getUnfollowedMembers(memberId);
        members.forEach(m -> {
            if (m.getFileName() != null) {
                try {
                    m.setFileName(s3Service.getPresignedUrl(m.getFileName(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    m.setFileName(null);
                }
            }
        });
        return members;
    }

//    차단 추가
    @PostMapping("/blocks")
    @LogStatus
    public void block(@RequestBody BlockDTO blockDTO) {
        log.info("차단합니다~ 내아이디: {}, 차단당한사람: {}", blockDTO.getBlockerId(), blockDTO.getBlockedId());
        blockService.block(blockDTO);
        log.info("회원차단해서 게시물다가려짐 — blockedId: {}", blockDTO.getBlockedId());
    }


//    신고
    @PostMapping("/reports")
    @LogStatus
    public void report(@RequestBody ReportDTO reportDTO) {
        log.info("신고합니다~ 내아이디: {}, 신고당한거아이디: {}, 신고한게 글인지 회원인지: {}, 사유는? {}", reportDTO.getReporterId(), reportDTO.getTargetId(), reportDTO.getTargetType(), reportDTO.getReason());
        reportService.report(reportDTO);
    }

//    멘션 검색 (handle로 검색, 양방향 차단 제외, 최대 10개)
    @GetMapping("/mentions/search")
    @LogStatusWithReturn
    public List<com.app.globalgates.dto.MentionDTO> searchMentionMembers(@RequestParam String keyword, @RequestParam Long memberId) {
        log.info("멘션검색 들어옴1 keyword: {}, memberId: {}", keyword, memberId);
        List<com.app.globalgates.dto.MentionDTO> result = mentionDAO.searchForMention(keyword, memberId);
        log.info("멘션검색 들어옴2 결과수: {}", result.size());
        // 프로필 이미지 presigned URL 변환
        result.forEach(m -> {
            if (m.getProfileFileName() != null) {
                try {
                    m.setProfileFileName(s3Service.getPresignedUrl(m.getProfileFileName(), java.time.Duration.ofMinutes(10)));
                } catch (java.io.IOException e) {
                    m.setProfileFileName(null);
                }
            }
        });
        return result;
    }

//    임시저장하기
    @PostMapping("/post-temps")
    @LogStatus
    public void savePostTemp(@RequestBody PostTempDTO postTempDTO) {
        log.info("임시저장 memberId: {}, content: {}", postTempDTO.getMemberId(), postTempDTO.getPostTempContent());
        postTempService.savePostTemp(postTempDTO);
    }

//    임시저장 조회=모달에서목록
    @GetMapping("/post-temps/{memberId}")
    @LogStatusWithReturn
    public List<PostTempDTO> getPostTemps(@PathVariable Long memberId) {
        log.info("임시저장 목록 조회 memberId: {}", memberId);
        return postTempService.getPostTemps(memberId);
    }

//    임시저장한것 로드 = 삭제
    @PostMapping("/post-temps/{id}/load")
    @LogStatusWithReturn
    public PostTempDTO loadPostTemp(@PathVariable Long id,
                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("임시저장 불러오기 id: {}, memberId: {}", id, userDetails.getId());
        return postTempService.loadPostTemp(id, userDetails.getId());
    }

//    임시저장 개별 삭제
    @PostMapping("/post-temps/{id}/delete")
    @LogStatus
    public void deletePostTemp(@PathVariable Long id,
                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("임시저장 개별 삭제 id: {}, memberId: {}", id, userDetails.getId());
        postTempService.deletePostTemp(id, userDetails.getId());
    }

//    임시저장 선택 삭제
    @PostMapping("/post-temps/delete")
    @LogStatus
    public void deletePostTemps(@RequestBody List<Long> ids) {
        log.info("임시저장 선택 삭제 ids: {}", ids);
        postTempService.deletePostTemps(ids);
    }

    // ── 댓글/대댓글 파일 URL 변환 (null 안전) ──
    private void convertPostFilesUrl(PostDTO post) {
        if (post.getPostFiles() != null) {
            post.getPostFiles().forEach(pf -> {
                try {
                    pf.setFilePath(s3Service.getPresignedUrl(pf.getFilePath(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    throw new RuntimeException("Presigned URL 생성 실패", e);
                }
            });
        }
        if (post.getSubReplies() != null) {
            post.getSubReplies().forEach(sub -> convertPostFilesUrl(sub));
        }
    }

    // 첨부 상품 이미지 URL 변환 ──
    private void convertProductImageUrl(PostDTO post) {
        if (post.getProductImage() != null) {
            try {
                post.setProductImage(s3Service.getPresignedUrl(post.getProductImage(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                throw new RuntimeException("Presigned URL 생성 실패", e);
            }
        }
    }

    // ── 프로필 이미지 URL 변환 (null 안전) ──
    private void convertProfileUrl(PostDTO post) {
        if (post.getMemberProfileFileName() != null) {
            try {
                post.setMemberProfileFileName(s3Service.getPresignedUrl(post.getMemberProfileFileName(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                throw new RuntimeException("Presigned URL 생성 실패", e);
            }
        }
        if (post.getSubReplies() != null) {
            post.getSubReplies().forEach(sub -> convertProfileUrl(sub));
        }
    }

    // ── S3 Presigned URL 변환 ──
    private List<String> convertToPresignedUrl(List<String> s3Keys) {
        if (s3Keys == null || s3Keys.isEmpty()) return List.of();
        return s3Keys.stream()
                .map(key -> {
                    try {
                        return s3Service.getPresignedUrl(key, Duration.ofMinutes(10));
                    } catch (IOException e) {
                        throw new RuntimeException("Presigned URL 생성 실패", e);
                    }
                })
                .collect(Collectors.toList());
    }
}
