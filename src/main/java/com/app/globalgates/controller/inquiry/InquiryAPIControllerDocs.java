package com.app.globalgates.controller.inquiry;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.AdvertisementDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;

@Tag(name = "Inquiry", description = "Inquiry Member API")
public interface InquiryAPIControllerDocs {
    @Operation(
            summary = "전문가 페이지 거래처 회원 조회",
            description = "카테고리를 통해 거래처 회원을 검색한다.",
            parameters = {@Parameter(name="page", description = "페이지네이션을 위한 페이지 값"),
                    @Parameter(name="categoryName", description = "선택한 카테고리 이름"),
                    @Parameter(name="userDetails", description = "로그인한 유저의 정보")}
    )
    public ResponseEntity<?> getInquiryMembers(@PathVariable int page, @RequestBody Map<String, String> body, @AuthenticationPrincipal CustomUserDetails userDetails);
}
