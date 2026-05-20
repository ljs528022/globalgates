package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.ReportStatus;
import com.app.globalgates.common.enumeration.Status;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.AdminMemberListDTO;
import com.app.globalgates.dto.AdminMemberWithPagingDTO;
import com.app.globalgates.dto.AdminPostListDTO;
import com.app.globalgates.dto.AdminPostWithPagingDTO;
import com.app.globalgates.dto.AdminReportListDTO;
import com.app.globalgates.dto.AdminReportWithPagingDTO;
import com.app.globalgates.dto.PostFileDTO;
import com.app.globalgates.repository.CategoryDAO;
import com.app.globalgates.repository.AdminDAO;
import com.app.globalgates.repository.PostHashtagDAO;
import com.app.globalgates.repository.PostFileDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    private final AdminDAO adminDAO;
    private final PostFileDAO postFileDAO;
    private final PostHashtagDAO postHashtagDAO;
    private final CategoryDAO categoryDAO;
    private final S3Service s3Service;

    public AdminMemberWithPagingDTO getAdminMembers(int page, String keyword, String subscriptionTier, String memberStatus) {
        Criteria criteria = new Criteria(page, adminDAO.findAdminMemberTotal(keyword, subscriptionTier, memberStatus));
        List<AdminMemberListDTO> members = adminDAO.findAdminMembers(criteria, keyword, subscriptionTier, memberStatus);

        criteria.setHasMore(members.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            members.remove(members.size() - 1);
        }

        AdminMemberWithPagingDTO result = new AdminMemberWithPagingDTO();
        result.setMembers(members);
        result.setCriteria(criteria);
        return result;
    }

    public AdminPostWithPagingDTO getAdminPosts(int page, String keyword, String postType, String categoryName, String postStatus) {
        Criteria criteria = new Criteria(page, adminDAO.findAdminPostTotal(keyword, postType, categoryName, postStatus));
        List<AdminPostListDTO> posts = adminDAO.findAdminPosts(criteria, keyword, postType, categoryName, postStatus);

        posts.forEach(post -> {
            List<PostFileDTO> files = new ArrayList<>(postFileDAO.findAllByPostId(post.getId()));
            files.forEach(file -> file.setFilePath(toPresignedUrlOrOriginal(file.getFilePath())));
            post.setPostFiles(files);
            post.setFileUrls(files.stream().map(PostFileDTO::getFilePath).collect(Collectors.toList()));
            post.setHashtags(postHashtagDAO.findAllByPostId(post.getId()));
        });

        criteria.setHasMore(posts.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            posts.remove(posts.size() - 1);
        }

        AdminPostWithPagingDTO result = new AdminPostWithPagingDTO();
        result.setPosts(posts);
        result.setCriteria(criteria);
        return result;
    }

    public AdminReportWithPagingDTO getAdminReports(int page, String keyword, String targetType, String reportStatus) {
        Criteria criteria = new Criteria(page, adminDAO.findAdminReportTotal(keyword, targetType, reportStatus));
        List<AdminReportListDTO> reports = adminDAO.findAdminReports(criteria, keyword, targetType, reportStatus);

        reports.forEach(report -> {
            if (report.getTargetType() == null || !"post".equalsIgnoreCase(report.getTargetType().getValue()) || report.getTargetId() == null) {
                return;
            }

            List<PostFileDTO> files = new ArrayList<>(postFileDAO.findAllByPostId(report.getTargetId()));
            files.forEach(file -> file.setFilePath(toPresignedUrlOrOriginal(file.getFilePath())));
            report.setPostFiles(files);
        });

        criteria.setHasMore(reports.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            reports.remove(reports.size() - 1);
        }

        AdminReportWithPagingDTO result = new AdminReportWithPagingDTO();
        result.setReports(reports);
        result.setCriteria(criteria);
        return result;
    }

    @Transactional
    public void updateMemberStatus(Long memberId, String memberStatus) {
        Status status = Status.getStatus(memberStatus);
        if (status == null) {
            throw new IllegalArgumentException("유효하지 않은 회원 상태입니다.");
        }
        adminDAO.updateMemberStatus(memberId, status.getValue());
    }

    @Transactional
    public void updatePostStatus(List<Long> postIds, String postStatus) {
        Status status = Status.getStatus(postStatus);
        if (status == null) {
            throw new IllegalArgumentException("유효하지 않은 게시물 상태입니다.");
        }

        List<Long> filteredIds = filterIds(postIds);
        if (filteredIds.isEmpty()) {
            return;
        }

        adminDAO.updatePostStatus(filteredIds, status.getValue());
    }

    @Transactional
    public void updatePost(Long postId, String postContent, String categoryName) {
        adminDAO.updatePostContent(postId, postContent == null ? "" : postContent.trim());

        if (categoryName != null && !categoryName.isBlank()) {
            categoryDAO.findByCategoryName(categoryName.trim())
                    .ifPresent(category -> adminDAO.updatePostCategory(postId, category.getId()));
        }
    }

    @Transactional
    public void deletePosts(List<Long> postIds) {
        List<Long> filteredIds = filterIds(postIds);
        if (filteredIds.isEmpty()) {
            return;
        }

        adminDAO.clearEstimationProducts(filteredIds);
        adminDAO.deletePostMentions(filteredIds);
        adminDAO.deletePostReports(filteredIds);
        adminDAO.deletePostBookmarks(filteredIds);
        adminDAO.deletePostFiles(filteredIds);
        adminDAO.deletePostLikes(filteredIds);
        adminDAO.deletePostHashtags(filteredIds);
        adminDAO.deletePostProducts(filteredIds);
        adminDAO.deleteReplyPosts(filteredIds);
        adminDAO.deletePosts(filteredIds);
    }

    @Transactional
    public void updateReportStatus(List<Long> reportIds, String reportStatus) {
        ReportStatus status = ReportStatus.getReportStatus(reportStatus);
        if (status == null) {
            throw new IllegalArgumentException("유효하지 않은 신고 상태입니다.");
        }

        List<Long> filteredIds = filterIds(reportIds);
        if (filteredIds.isEmpty()) {
            return;
        }

        adminDAO.updateReportStatus(filteredIds, status.getValue());

        if (status == ReportStatus.APPLIED) {
            adminDAO.updateReportedPostStatusByReportIds(filteredIds, Status.INACTIVE.getValue());
            adminDAO.updateReportedMemberStatusByReportIds(filteredIds, Status.INACTIVE.getValue());
            adminDAO.updateReportedMemberPostStatusByReportIds(filteredIds, Status.INACTIVE.getValue());
        } else if (status == ReportStatus.REJECTED) {
            adminDAO.updateReportedPostStatusByReportIds(filteredIds, Status.ACTIVE.getValue());
            adminDAO.updateReportedMemberStatusByReportIds(filteredIds, Status.ACTIVE.getValue());
            adminDAO.updateReportedMemberPostStatusByReportIds(filteredIds, Status.ACTIVE.getValue());
        }
    }

    @Transactional
    public void deleteReports(List<Long> reportIds) {
        List<Long> filteredIds = filterIds(reportIds);
        if (filteredIds.isEmpty()) {
            return;
        }

        adminDAO.deleteReports(filteredIds);
    }

    private List<Long> filterIds(List<Long> ids) {
        if (ids == null) {
            return List.of();
        }
        return ids.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private String toPresignedUrlOrOriginal(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return "";
        }

        if (filePath.startsWith("http://") || filePath.startsWith("https://") || filePath.startsWith("/")) {
            return filePath;
        }

        try {
            return s3Service.getPresignedUrl(filePath, Duration.ofMinutes(10));
        } catch (Exception e) {
            log.warn("admin presigned URL 생성 실패. 원본 경로를 그대로 사용합니다. filePath={}", filePath, e);
            return filePath;
        }
    }
}
