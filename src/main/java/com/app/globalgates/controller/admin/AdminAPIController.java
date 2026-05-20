package com.app.globalgates.controller.admin;

import com.app.globalgates.dto.AdminMemberWithPagingDTO;
import com.app.globalgates.dto.AdminPostWithPagingDTO;
import com.app.globalgates.dto.AdminReportWithPagingDTO;
import com.app.globalgates.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAPIController {
    private final AdminService adminService;

    @GetMapping("/members/{page}")
    public ResponseEntity<AdminMemberWithPagingDTO> getAdminMembers(
            @PathVariable int page,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String subscriptionTier,
            @RequestParam(required = false) String memberStatus
    ) {
        return ResponseEntity.ok(adminService.getAdminMembers(page, keyword, subscriptionTier, memberStatus));
    }

    @GetMapping("/posts/{page}")
    public ResponseEntity<AdminPostWithPagingDTO> getAdminPosts(
            @PathVariable int page,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String postType,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String postStatus
    ) {
        return ResponseEntity.ok(adminService.getAdminPosts(page, keyword, postType, categoryName, postStatus));
    }

    @GetMapping("/reports/{page}")
    public ResponseEntity<AdminReportWithPagingDTO> getAdminReports(
            @PathVariable int page,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) String reportStatus
    ) {
        return ResponseEntity.ok(adminService.getAdminReports(page, keyword, targetType, reportStatus));
    }

    @PatchMapping("/members/{memberId}/status")
    public ResponseEntity<Void> updateAdminMemberStatus(
            @PathVariable Long memberId,
            @RequestParam String memberStatus
    ) {
        adminService.updateMemberStatus(memberId, memberStatus);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/posts/status")
    public ResponseEntity<Void> updateAdminPostStatus(
            @RequestBody List<Long> postIds,
            @RequestParam String postStatus
    ) {
        adminService.updatePostStatus(postIds, postStatus);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/posts")
    public ResponseEntity<Void> deleteAdminPosts(@RequestBody List<Long> postIds) {
        adminService.deletePosts(postIds);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/posts/{postId}")
    public ResponseEntity<Void> updateAdminPost(
            @PathVariable Long postId,
            @RequestBody Map<String, String> request
    ) {
        adminService.updatePost(postId, request.get("postContent"), request.get("categoryName"));
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/reports/status")
    public ResponseEntity<Void> updateAdminReportStatus(
            @RequestBody List<Long> reportIds,
            @RequestParam String reportStatus
    ) {
        adminService.updateReportStatus(reportIds, reportStatus);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reports")
    public ResponseEntity<Void> deleteAdminReports(@RequestBody List<Long> reportIds) {
        adminService.deleteReports(reportIds);
        return ResponseEntity.ok().build();
    }
}
