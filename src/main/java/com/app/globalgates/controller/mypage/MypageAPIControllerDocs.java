package com.app.globalgates.controller.mypage;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.EstimationWithPagingDTO;
import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.dto.PostProductWithPagingDTO;
import com.app.globalgates.dto.PostWithPagingDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Tag(name = "Mypage", description = "Mypage API")
public interface MypageAPIControllerDocs {
    @Operation(
            summary = "내 상품 목록 조회",
            description = "로그인한 사용자 본인의 상품 목록을 페이징하여 조회한다.",
            parameters = {@Parameter(name = "page", description = "표시할 페이지 번호")}
    )
    public PostProductWithPagingDTO getMyProducts(@RequestParam(defaultValue = "1") int page, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "상대 프로필 상품 목록 조회",
            description = "특정 회원의 상품 목록을 페이징하여 조회한다.",
            parameters = {@Parameter(name = "page", description = "표시할 페이지 번호"),
                            @Parameter(name = "memberId", description = "조회할 회원의 id")}
    )
    public PostProductWithPagingDTO getProfileProducts(@RequestParam(defaultValue = "1") int page, @RequestParam Long memberId);

    @Operation(
            summary = "내 게시물 목록 조회",
            description = "로그인한 사용자 본인의 게시물 목록을 페이징하여 조회한다.",
            parameters = {@Parameter(name = "page", description = "표시할 페이지 번호")}
    )
    public PostWithPagingDTO getMyPosts(@RequestParam(defaultValue = "1") int page, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "상대 프로필 게시물 목록 조회",
            description = "특정 회원의 게시물 목록을 페이징하여 조회한다.",
            parameters = {@Parameter(name = "page", description = "표시할 페이지 번호"),
                            @Parameter(name = "memberId", description = "조회할 회원의 id")}
    )
    public PostWithPagingDTO getProfilePosts(@RequestParam(defaultValue = "1") int page, @RequestParam Long memberId);

    @Operation(
            summary = "내 답글 목록 조회",
            description = "로그인한 사용자 본인이 작성한 답글 목록을 페이징하여 조회한다.",
            parameters = {@Parameter(name = "page", description = "표시할 페이지 번호")}
    )
    public PostWithPagingDTO getMyReplies(@RequestParam(defaultValue = "1") int page, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "상대 프로필 답글 목록 조회",
            description = "특정 회원의 답글 목록을 페이징하여 조회한다.",
            parameters = {@Parameter(name = "page", description = "표시할 페이지 번호"),
                            @Parameter(name = "memberId", description = "조회할 회원의 id")}
    )
    public PostWithPagingDTO getProfileReplies(@RequestParam(defaultValue = "1") int page, @RequestParam Long memberId);

    @Operation(
            summary = "내 좋아요 게시물 조회",
            description = "로그인한 사용자가 좋아요한 게시물 목록을 페이징하여 조회한다.",
            parameters = {@Parameter(name = "page", description = "표시할 페이지 번호")}
    )
    public PostWithPagingDTO getMyLikedPosts(@RequestParam(defaultValue = "1") int page, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "견적 요약 조회",
            description = "전문가는 받은 견적, 일반 회원은 보낸 견적 요약을 조회한다."
    )
    public ResponseEntity<?> getMyEstimationsSummary(@AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "보낸 견적 목록 조회",
            description = "로그인한 사용자가 보낸 견적 요청 목록을 페이징하여 조회한다.",
            parameters = {@Parameter(name = "page", description = "표시할 페이지 번호")}
    )
    public EstimationWithPagingDTO getMyRequestedEstimations(@RequestParam(defaultValue = "1") int page, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "상품 등록",
            description = "새 상품을 등록한다. 이미지 파일을 함께 업로드할 수 있다.",
            parameters = {@Parameter(name = "postProductDTO", description = "등록할 상품 정보"),
                            @Parameter(name = "images", description = "상품 이미지 파일들"),
                            @Parameter(name = "userDetails", description = "로그인한 유저의 정보")}
    )
    public ResponseEntity<?> writeProduct(PostProductDTO postProductDTO, @RequestParam(value = "images", required = false) List<MultipartFile> images, @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException;

    @Operation(
            summary = "상품 삭제",
            description = "로그인한 사용자 본인의 상품을 삭제한다.",
            parameters = {@Parameter(name = "productId", description = "삭제할 상품의 id")}
    )
    public ResponseEntity<?> deleteProduct(@RequestParam Long productId, @AuthenticationPrincipal CustomUserDetails userDetails);
}
