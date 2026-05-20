package com.app.globalgates.controller.advertisement;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.common.search.AdSearch;
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

@Tag(name = "Advertisement", description = "Advertisement API")
public interface AdvertisementAPIControllerDocs {
    @Operation(
            summary = "광고 등록",
            description = "화면에서 받아온 정보로 광고를 등록한다.",
            parameters = {@Parameter(name="advertisementDTO", description = "등록 화면에서 입력한 광고 정보"),
                            @Parameter(name="images", description = "화면에서 입력한 광고 이미지들"),
                            @Parameter(name="userDetails", description = "로그인한 유저의 정보")}
    )
    public ResponseEntity<?> write(@RequestBody AdvertisementDTO advertisementDTO, @RequestParam("images") ArrayList<MultipartFile> images, @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException;

    @Operation(
            summary = "광고 검색",
            description = "화면에서 받아온 정보로 광고를 등록한다.",
            parameters = {@Parameter(name="page", description = "화면에 표시할 페이지 번호"),
                            @Parameter(name="search", description = "화면에서 입력한 검색 값"),
                            @Parameter(name="userDetails", description = "로그인한 유저의 정보")}
    )
    public ResponseEntity<?> list(@PathVariable int page, AdSearch search, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "광고 상세 조회",
            description = "목록에서 선택한 광고의 상세 정보를 조회한다.",
            parameters = {@Parameter(name="id", description = "조회할 광고의 id")}
    )
    public ResponseEntity<?> detail(Long id);

}
