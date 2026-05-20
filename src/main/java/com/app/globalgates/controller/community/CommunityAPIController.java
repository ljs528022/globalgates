package com.app.globalgates.controller.community;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.CommunityDTO;
import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.service.CommunityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/communities")
@Slf4j
public class CommunityAPIController {
    private final CommunityService communityService;

    // ──────────────────────────────────────
    // 커뮤니티 CRUD
    // ──────────────────────────────────────

    @PostMapping
    public ResponseEntity<?> createCommunity(@Valid CommunityDTO dto,
                                             @RequestParam(required = false) MultipartFile coverImage,
                                             @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
        dto.setCreatorId(userDetails.getId());
        communityService.createCommunity(dto, coverImage);
        return ResponseEntity.ok(Map.of("message", "커뮤니티 생성 완료"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCommunity(@PathVariable Long id,
                                             @Valid CommunityDTO dto,
                                             @RequestParam(required = false) MultipartFile coverImage,
                                             @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
        communityService.updateCommunity(id, dto.toCommunityVO(), coverImage, userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "커뮤니티 수정 완료"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCommunity(@PathVariable Long id,
                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        communityService.deleteCommunity(id, userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "커뮤니티 삭제 완료"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCommunityDetail(@PathVariable Long id,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(communityService.getCommunityDetail(id, memberId));
    }

    @GetMapping("/list/{page}")
    public ResponseEntity<?> getExploreCommunities(@PathVariable int page,
                                                   @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        log.info("=== [API] GET /api/communities/list/{} === memberId={}", page, memberId);
        var result = communityService.getExploreCommunities(page, memberId);
        log.info("=== [API] 탐색 커뮤니티 목록 반환 === count={}", result.getCommunities() != null ? result.getCommunities().size() : 0);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my/{page}")
    public ResponseEntity<?> getMyCommunities(@PathVariable int page,
                                              @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
        return ResponseEntity.ok(communityService.getMyCommunities(page, userDetails.getId()));
    }

    @GetMapping("/feed/home/{page}")
    public ResponseEntity<?> getHomeFeed(@PathVariable int page,
                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요합니다."));
        return ResponseEntity.ok(communityService.getMyCommunitiesFeed(page, userDetails.getId()));
    }

    @GetMapping("/feed/explore/{page}")
    public ResponseEntity<?> getExploreFeed(@PathVariable int page,
                                            @RequestParam(required = false) Long categoryId,
                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인이 필요합니다."));
        log.info("=== [API] GET /api/communities/feed/explore/{} === memberId={}, categoryId={}", page, userDetails.getId(), categoryId);
        var result = communityService.getExploreFeed(page, userDetails.getId(), categoryId);
        log.info("=== [API] 탐색 피드 반환 === postCount={}", result.getPosts() != null ? result.getPosts().size() : 0);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search/{page}")
    public ResponseEntity<?> searchCommunities(@PathVariable int page,
                                               @RequestParam String keyword) throws IOException {
        return ResponseEntity.ok(communityService.searchCommunities(keyword, page));
    }

    @GetMapping("/category/{categoryId}/{page}")
    public ResponseEntity<?> getCommunitiesByCategory(@PathVariable Long categoryId,
                                                      @PathVariable int page) throws IOException {
        return ResponseEntity.ok(communityService.getCommunitiesByCategory(categoryId, page));
    }

    // ──────────────────────────────────────
    // 멤버십
    // ──────────────────────────────────────

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinCommunity(@PathVariable Long id,
                                           @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("=== [API] POST /api/communities/{}/join === memberId={}", id, userDetails.getId());
        communityService.joinCommunity(id, userDetails.getId());
        log.info("=== [API] 커뮤니티 가입 응답 완료 === communityId={}, memberId={}", id, userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "커뮤니티 가입 완료"));
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<?> leaveCommunity(@PathVariable Long id,
                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("=== [API] DELETE /api/communities/{}/leave === memberId={}", id, userDetails.getId());
        communityService.leaveCommunity(id, userDetails.getId());
        log.info("=== [API] 커뮤니티 탈퇴 응답 완료 === communityId={}, memberId={}", id, userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "커뮤니티 탈퇴 완료"));
    }

    @GetMapping("/{id}/members/{page}")
    public ResponseEntity<?> getCommunityMembers(@PathVariable Long id,
                                                 @PathVariable int page) throws IOException {
        return ResponseEntity.ok(communityService.getCommunityMembers(id, page));
    }

    @PutMapping("/{id}/members/{memberId}/role")
    public ResponseEntity<?> updateMemberRole(@PathVariable Long id,
                                              @PathVariable Long memberId,
                                              @RequestBody Map<String, String> body,
                                              @AuthenticationPrincipal CustomUserDetails userDetails) {
        communityService.updateMemberRole(id, memberId, body.get("role"), userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "역할 변경 완료"));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<?> kickMember(@PathVariable Long id,
                                        @PathVariable Long memberId,
                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        communityService.kickMember(id, memberId, userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "멤버 추방 완료"));
    }

    // ──────────────────────────────────────
    // 커뮤니티 게시글
    // ──────────────────────────────────────

    @PostMapping("/{id}/posts")
    public ResponseEntity<?> writeCommunityPost(@PathVariable Long id,
                                                PostDTO postDTO,
                                                @RequestParam(required = false) List<MultipartFile> files,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
        postDTO.setMemberId(userDetails.getId());
        communityService.writeCommunityPost(postDTO, files, id);
        return ResponseEntity.ok(Map.of("message", "게시글 작성 완료"));
    }

    @GetMapping("/{id}/posts/{page}")
    public ResponseEntity<?> getCommunityPosts(@PathVariable Long id,
                                               @PathVariable int page,
                                               @RequestParam(defaultValue = "latest") String type,
                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(communityService.getCommunityPosts(id, page, memberId, type));
    }

    // ──────────────────────────────────────
    // 검색
    // ──────────────────────────────────────

    @GetMapping("/{id}/search/{page}")
    public ResponseEntity<?> searchCommunityPosts(@PathVariable Long id,
                                                  @PathVariable int page,
                                                  @RequestParam String keyword,
                                                  @RequestParam(defaultValue = "latest") String type,
                                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(communityService.searchCommunityPosts(id, keyword, type, page, memberId));
    }

    // ──────────────────────────────────────
    // 미디어
    // ──────────────────────────────────────

    @GetMapping("/{id}/media/{page}")
    public ResponseEntity<?> getCommunityMedia(@PathVariable Long id,
                                               @PathVariable int page) throws IOException {
        return ResponseEntity.ok(communityService.getCommunityMedia(id, page));
    }

    // ──────────────────────────────────────
    // 예외 처리
    // ──────────────────────────────────────

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException e) {
        log.error("데이터 무결성 위반: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "이미 존재하거나 잘못된 데이터입니다."));
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<?> handleIO(IOException e) {
        log.error("파일 처리 오류: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "파일 처리 중 오류가 발생했습니다."));
    }
}
