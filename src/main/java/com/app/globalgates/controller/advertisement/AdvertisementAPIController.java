package com.app.globalgates.controller.advertisement;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.common.search.AdSearch;
import com.app.globalgates.dto.AdWithPagingDTO;
import com.app.globalgates.dto.AdvertisementDTO;
import com.app.globalgates.dto.FileAdvertisementDTO;
import com.app.globalgates.service.AdvertisementService;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ad/**")
@Slf4j
public class AdvertisementAPIController implements AdvertisementAPIControllerDocs {
    private final AdvertisementService advertisementService;
    private final S3Service s3Service;

//    광고 등록
    @PostMapping("write")
    @LogStatusWithReturn
    public ResponseEntity<?> write(@ModelAttribute AdvertisementDTO advertisementDTO,
                                   @RequestParam(value = "images", required = false) ArrayList<MultipartFile> images,
                                   @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
        // 유저 id 받아와서 주입
        advertisementDTO.setAdvertiserId(userDetails.getId());
        advertisementService.save(advertisementDTO);

        if (images != null && !images.isEmpty()) {
            String todayPath = advertisementService.getTodayPath();
            List<String> uploadedKeys = new ArrayList<>();

            try {
                for (MultipartFile image : images) {
                    String s3Key = s3Service.uploadFile(image, todayPath);
                    uploadedKeys.add(s3Key);
                    advertisementService.saveFile(advertisementDTO.getId(), image, s3Key);
                }
            } catch (Exception e) {
                uploadedKeys.forEach(s3Service::deleteFile);
                advertisementService.delete(advertisementDTO.getId());
                throw new RuntimeException("파일 업로드 실패", e);
            }
        }

        log.info("저장된 광고 ID: {}", advertisementDTO.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("id", advertisementDTO.getId());
        result.put("message", "광고 등록 성공!");

        return ResponseEntity.ok(result);
    }

//    광고 검색
    @GetMapping("list/{page}")
    public ResponseEntity<?> list(@PathVariable int page, AdSearch search,
                                  @AuthenticationPrincipal CustomUserDetails userDetails) {

        AdWithPagingDTO result = advertisementService.list(page, search, userDetails.getId());

        result.getAdvertisements().forEach(ad ->
                ad.setImgUrls(convertToPresignedUrl(ad.getImgUrls()))
        );

        return ResponseEntity.ok(result);
    }

    @GetMapping("detail")
    @LogStatusWithReturn
    public ResponseEntity<?> detail(Long id) {
        AdvertisementDTO adDTO = advertisementService.getAdvertisementDetail(id);
        adDTO.setImgUrls(convertToPresignedUrl(adDTO.getImgUrls()));
        return ResponseEntity.ok(adDTO);
    }

    // 이미지 경로 변환 공통 로직
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
