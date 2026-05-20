package com.app.globalgates.controller.mypage;

import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.dto.EstimationWithPagingDTO;
import com.app.globalgates.dto.PostProductWithPagingDTO;
import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.dto.PostWithPagingDTO;
import com.app.globalgates.service.EstimationService;
import com.app.globalgates.service.PostProductService;
import com.app.globalgates.service.PostService;
import com.app.globalgates.service.S3Service;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
@Slf4j
public class MypageAPIController implements MypageAPIControllerDocs {
    private final PostProductService postProductService;
    private final S3Service s3Service;
    private final PostService postService;
    private final EstimationService estimationService;

    // 마이페이지의 "내 상품" 탭은 로그인한 사용자 본인의 상품만 보여줘야 한다.
    // 그래서 memberId를 프론트에서 받지 않고, 인증 객체에서만 꺼내서 조회한다.
    @GetMapping("/products")
    @LogStatusWithReturn
    public PostProductWithPagingDTO getMyProducts(
            @RequestParam(defaultValue = "1") int page,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        PostProductWithPagingDTO result = postProductService.getMyProducts(page, userDetails.getId());

        result.getPosts().forEach(product -> {
            if (product.getPostFiles() == null || product.getPostFiles().isEmpty()) {
                return;
            }

            product.setPostFiles(
                    product.getPostFiles().stream()
                            .map(this::toPresignedUrlOrOriginal)
                            .collect(Collectors.toList())
            );
        });

        return result;
    }

    // 상대 프로필의 상품 탭도 같은 카드 UI를 재사용하므로,
    // owner 전용 응답 구조는 유지하고 조회 기준만 페이지 주인 memberId로 바꾼다.
    @GetMapping("/profile/products")
    @LogStatusWithReturn
    public PostProductWithPagingDTO getProfileProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam Long memberId
    ) {
        PostProductWithPagingDTO result = postProductService.getMyProducts(page, memberId);

        result.getPosts().forEach(product -> {
            if (product.getPostFiles() == null || product.getPostFiles().isEmpty()) {
                return;
            }

            product.setPostFiles(
                    product.getPostFiles().stream()
                            .map(this::toPresignedUrlOrOriginal)
                            .collect(Collectors.toList())
            );
        });

        return result;
    }

    // 마이페이지 게시물 탭은 현재 로그인한 사용자가 작성한 "일반 게시글"만 내려준다.
    // memberId를 프론트에서 받지 않고 인증 객체에서만 꺼내서 조회해야
    // 다른 사용자의 게시물을 임의로 조회하는 요청을 막을 수 있다.
    @GetMapping("/posts")
    @LogStatusWithReturn
    public PostWithPagingDTO getMyPosts(
            @RequestParam(defaultValue = "1") int page,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        PostWithPagingDTO result = postService.getMyPosts(page, userDetails.getId());

        // 게시물 탭도 main 피드와 동일하게 "브라우저가 직접 열 수 있는 URL"로 가공해서 내려준다.
        // layout.js는 post.postFiles[*].filePath를 그대로 img/background-image에 사용하므로,
        // raw S3 key를 그대로 반환하면 mypage에서만 이미지가 깨진다.
        //
        // 이 변환은 저장 모델을 바꾸는 작업이 아니라, 화면 응답 전용 표현을 만드는 단계다.
        // 따라서 controller에서 처리하는 편이 현재 프로젝트 구조와 가장 잘 맞는다.
        result.getPosts().forEach(post -> {
            if (post.getMemberProfileFileName() != null && !post.getMemberProfileFileName().isBlank()) {
                post.setMemberProfileFileName(
                        toPresignedUrlOrOriginal(post.getMemberProfileFileName())
                );
            }

            if (post.getPostFiles() == null || post.getPostFiles().isEmpty()) {
                return;
            }

            post.getPostFiles().forEach(file ->
                    file.setFilePath(toPresignedUrlOrOriginal(file.getFilePath()))
            );
        });

        return result;
    }

    // 상대 프로필의 게시물 탭은 페이지 주인이 작성한 일반 게시글만 공개 조회한다.
    @GetMapping("/profile/posts")
    @LogStatusWithReturn
    public PostWithPagingDTO getProfilePosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam Long memberId
    ) {
        PostWithPagingDTO result = postService.getMyPosts(page, memberId);

        result.getPosts().forEach(post -> {
            if (post.getMemberProfileFileName() != null && !post.getMemberProfileFileName().isBlank()) {
                post.setMemberProfileFileName(
                        toPresignedUrlOrOriginal(post.getMemberProfileFileName())
                );
            }

            if (post.getPostFiles() == null || post.getPostFiles().isEmpty()) {
                return;
            }

            post.getPostFiles().forEach(file ->
                    file.setFilePath(toPresignedUrlOrOriginal(file.getFilePath()))
            );
        });

        return result;
    }

    // Replies 탭도 Posts / Likes와 같은 PostDTO 구조를 사용한다.
    // 마이페이지에서는 "내가 작성한 댓글"만 별도 조건으로 조회하고,
    // 화면 렌더는 동일한 카드 컴포넌트를 재사용한다.
    @GetMapping("/replies")
    @LogStatusWithReturn
    public PostWithPagingDTO getMyReplies(
            @RequestParam(defaultValue = "1") int page,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        PostWithPagingDTO result = postService.getMyReplies(page, userDetails.getId());

        // 댓글 목록도 게시글 카드와 같은 첨부파일 구조를 가지므로,
        // 브라우저가 직접 쓸 수 있도록 presigned URL로 가공해서 내려준다.
        result.getPosts().forEach(post -> {
            if (post.getMemberProfileFileName() != null && !post.getMemberProfileFileName().isBlank()) {
                post.setMemberProfileFileName(
                        toPresignedUrlOrOriginal(post.getMemberProfileFileName())
                );
            }

            if (post.getPostFiles() == null || post.getPostFiles().isEmpty()) {
                return;
            }

            post.getPostFiles().forEach(file ->
                    file.setFilePath(toPresignedUrlOrOriginal(file.getFilePath()))
            );
        });

        return result;
    }

    // 상대 프로필의 답글 탭도 동일한 카드 구조를 재사용하므로
    // 조회 기준만 현재 로그인 사용자가 아니라 페이지 주인으로 바꾼다.
    @GetMapping("/profile/replies")
    @LogStatusWithReturn
    public PostWithPagingDTO getProfileReplies(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam Long memberId
    ) {
        PostWithPagingDTO result = postService.getMyReplies(page, memberId);

        result.getPosts().forEach(post -> {
            if (post.getMemberProfileFileName() != null && !post.getMemberProfileFileName().isBlank()) {
                post.setMemberProfileFileName(
                        toPresignedUrlOrOriginal(post.getMemberProfileFileName())
                );
            }

            if (post.getPostFiles() == null || post.getPostFiles().isEmpty()) {
                return;
            }

            post.getPostFiles().forEach(file ->
                    file.setFilePath(toPresignedUrlOrOriginal(file.getFilePath()))
            );
        });

        return result;
    }

    // Likes 탭도 Posts 탭과 같은 PostDTO 구조를 사용한다.
    // 화면은 동일한 카드 컴포넌트를 재사용하고,
    // 데이터만 "내가 좋아요한 게시글"로 바꿔 내려주는 방식이 유지보수에 가장 유리하다.
    @GetMapping("/likes")
    @LogStatusWithReturn
    public PostWithPagingDTO getMyLikedPosts(
            @RequestParam(defaultValue = "1") int page,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        PostWithPagingDTO result = postService.getMyLikedPosts(page, userDetails.getId());

        // main / mypage Posts 탭과 동일하게, Likes 탭도 이미지 URL을 presigned URL로 가공한다.
        // 이 단계가 없으면 raw S3 key가 그대로 브라우저에 전달되어 이미지가 깨질 수 있다.
        result.getPosts().forEach(post -> {
            // 작성자 프로필 이미지도 다른 메서드와 동일하게 presigned URL로 가공한다.
            if (post.getMemberProfileFileName() != null && !post.getMemberProfileFileName().isBlank()) {
                post.setMemberProfileFileName(
                        toPresignedUrlOrOriginal(post.getMemberProfileFileName())
                );
            }

            if (post.getPostFiles() == null || post.getPostFiles().isEmpty()) {
                return;
            }

            post.getPostFiles().forEach(file ->
                    file.setFilePath(toPresignedUrlOrOriginal(file.getFilePath()))
            );
        });

        return result;
    }

    @GetMapping("/estimations/summary")
    @LogStatusWithReturn
    public ResponseEntity<?> getMyEstimationsSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        boolean isExpert = userDetails.getMemberRole() == MemberRole.EXPERT;

        // expert는 받은 견적 요약을, non-expert는 보낸 견적 요약을 같은 카드에 렌더링한다.
        EstimationWithPagingDTO result = isExpert
                ? estimationService.getList(1, userDetails.getId())
                : estimationService.getRequestedList(1, userDetails.getId());

        // 사이드바 카드는 "5분 전 / 2시간 전" 같은 상대 시간 표시가 더 어울려서
        // raw timestamp 를 컨트롤러에서만 변환해 내려준다.
        // /estimation/list 페이지는 raw 가 필요해서 service 에서 일괄 변환은 하지 않는다.
        result.getEstimations().forEach(estimation ->
                estimation.setCreatedDateTime(DateUtils.toRelativeTime(estimation.getCreatedDateTime()))
        );

        return ResponseEntity.ok(Map.of(
                "expert", isExpert,
                "hasMore", result.getCriteria().isHasMore() || result.getEstimations().size() > 5,
                "estimations", result.getEstimations().stream().limit(5).toList()
        ));
    }

    @GetMapping("/estimations/requested")
    @LogStatusWithReturn
    public EstimationWithPagingDTO getMyRequestedEstimations(
            @RequestParam(defaultValue = "1") int page,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // non-expert 더보기는 마이페이지 안에서 requester 기준 목록을 이어 붙인다.
        EstimationWithPagingDTO result = estimationService.getRequestedList(page, userDetails.getId());

        // summary 와 동일한 톤(상대 시간)으로 카드를 이어 붙이도록 변환.
        result.getEstimations().forEach(estimation ->
                estimation.setCreatedDateTime(DateUtils.toRelativeTime(estimation.getCreatedDateTime()))
        );

        return result;
    }

    // 회원가입 join 흐름처럼:
    // 1. 본체 저장
    // 2. 파일이 있으면 S3 업로드
    // 3. 업로드 성공분만 DB 연결
    @PostMapping("/products")
    @LogStatusWithReturn
    public ResponseEntity<?> writeProduct(
            PostProductDTO postProductDTO,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) throws IOException {

        // memberId는 프론트가 아닌 로그인 사용자에서만 받는다.
        postProductDTO.setMemberId(userDetails.getId());
        log.info("postProductDTO: {}", postProductDTO);
        if (images != null && !images.isEmpty()) {
            String todayPath = postProductService.getTodayPath();
            List<String> uploadedKeys = new ArrayList<>();

            try {
                postProductService.save(postProductDTO);

                for (MultipartFile image : images) {
                    if (image == null || image.isEmpty()) {
                        continue;
                    }

                    String s3Key = s3Service.uploadFile(image, todayPath);
                    uploadedKeys.add(s3Key);
                    postProductService.saveFile(postProductDTO.getId(), image, s3Key);
                }
            } catch (Exception e) {
                uploadedKeys.forEach(s3Service::deleteFile);

                if (postProductDTO.getId() != null) {
                    postProductService.delete(postProductDTO.getId());
                }

                throw new RuntimeException("상품 등록 실패", e);
            }
        } else {
            postProductService.save(postProductDTO);
        }

        return ResponseEntity.ok(Map.of(
                "id", postProductDTO.getId(),
                "message", "상품 등록 성공"
        ));
    }

    @PostMapping("/products/delete")
    @LogStatusWithReturn
    public ResponseEntity<?> deleteProduct(
            @RequestParam Long productId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // 삭제 권한 판단에 필요한 memberId는 프론트에서 받지 않는다.
        // 항상 현재 로그인한 사용자 id를 기준으로 서비스 계층에 넘겨서
        // 다른 사람 상품 삭제 시도를 서버에서 차단한다.
        postProductService.delete(productId, userDetails.getId());

        return ResponseEntity.ok(Map.of("message", "상품 삭제 성공"));
    }

    // S3 raw key를 화면 출력용 presigned URL로 바꾼다.
    // 실패 시에는 목록 API 전체를 500으로 만들지 않고, 해당 파일만 원본 경로를 유지한다.
    // 이렇게 하면 일시적인 URL 생성 실패가 전체 마이페이지 렌더링 실패로 번지는 것을 막을 수 있다.
    // 동시에 로그를 남겨 운영 중 원인 추적도 가능하게 한다.
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
