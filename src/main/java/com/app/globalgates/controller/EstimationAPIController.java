package com.app.globalgates.controller;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.dto.EstimationDTO;
import com.app.globalgates.dto.EstimationExpertDTO;
import com.app.globalgates.dto.EstimationWithPagingDTO;
import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.service.EstimationService;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/estimations/**")
public class EstimationAPIController {
    private final EstimationService estimationService;
    private final S3Service s3Service;

    @PostMapping("write")
    public void write(@RequestBody EstimationDTO estimationDTO,
                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails != null) {
            estimationDTO.setRequesterId(userDetails.getId());
        }
        estimationService.write(estimationDTO);
    }

    @GetMapping("list/{page}")
    public EstimationWithPagingDTO getList(@PathVariable int page,
                                           @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateExpert(userDetails);
        return estimationService.getList(page, userDetails != null ? userDetails.getId() : null);
    }

    @GetMapping("{id}")
    public EstimationDTO getDetail(@PathVariable Long id) {
        return estimationService.getDetail(id).orElse(null);
    }

    @PatchMapping("{id}/status")
    public boolean updateStatus(@PathVariable Long id,
                                @RequestBody EstimationDTO estimationDTO,
                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateExpert(userDetails);
        return estimationService.updateStatus(
                id,
                userDetails != null ? userDetails.getId() : null,
                estimationDTO.getStatus()
        );
    }

    @GetMapping("experts")
    public List<EstimationExpertDTO> getExperts(@RequestParam(defaultValue = "1") int page,
                                                @RequestParam(required = false) String keyword,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        return getRequestMembers(page, keyword, userDetails);
    }

    @GetMapping("product-owners")
    public List<EstimationExpertDTO> getProductOwners(@RequestParam(defaultValue = "1") int page,
                                                      @RequestParam(required = false) String keyword,
                                                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        return getRequestMembers(page, keyword, userDetails);
    }

    private List<EstimationExpertDTO> getRequestMembers(int page,
                                                        String keyword,
                                                        CustomUserDetails userDetails) {
        List<EstimationExpertDTO> members = estimationService.getExpertsForRequest(
                page,
                userDetails != null ? userDetails.getId() : null,
                keyword);

        // DB의 raw S3 key를 브라우저가 직접 쓸 수 있는 presigned URL로 변환.
        // mypage가 게시글 프로필 이미지를 변환하는 흐름과 동일한 패턴이다.
        members.forEach(member -> {
            if (member.getMemberProfileFileName() != null && !member.getMemberProfileFileName().isBlank()) {
                member.setMemberProfileFileName(
                        toPresignedUrlOrOriginal(member.getMemberProfileFileName())
                );
            }
        });
        return members;
    }

    @GetMapping("products")
    public List<PostProductDTO> getProducts(@RequestParam(required = false) Long memberId) {
        List<PostProductDTO> products = estimationService.getProductsForRequest(memberId);

        // 상품 썸네일도 동일하게 presigned URL로 내려준다.
        products.forEach(product -> {
            if (product.getPostFiles() == null || product.getPostFiles().isEmpty()) return;
            product.setPostFiles(
                    product.getPostFiles().stream()
                            .map(this::toPresignedUrlOrOriginal)
                            .collect(Collectors.toList())
            );
        });
        return products;
    }

    private String toPresignedUrlOrOriginal(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return filePath;
        }

        try {
            return s3Service.getPresignedUrl(filePath, Duration.ofMinutes(10));
        } catch (IOException e) {
            log.warn("estimation presigned URL 생성 실패. 원본 경로를 그대로 반환합니다. filePath={}", filePath, e);
            return filePath;
        }
    }

    private void validateExpert(CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getMemberRole() != MemberRole.EXPERT) {
            throw new AccessDeniedException("expert role required");
        }
    }
}
