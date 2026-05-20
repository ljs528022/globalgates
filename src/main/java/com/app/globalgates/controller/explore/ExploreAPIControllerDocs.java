package com.app.globalgates.controller.explore;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.NewsDTO;
import com.app.globalgates.dto.PostProductWithPagingDTO;
import com.app.globalgates.dto.RankedSearchHistoryDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Tag(name = "Explore", description = "Explore API")
public interface ExploreAPIControllerDocs {
    @Operation(
            summary = "추천 상품 조회",
            description = "로그인한 유저의 관심사를 토대로 관련된 상품을 조회",
            parameters = {@Parameter(name="page", description = "조회한 상품의 페이지 번호"),
                        @Parameter(name="userDetails", description = "로그인한 유저의 인증 정보")})
    public ResponseEntity<?> getRecommends(@PathVariable int page, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "뉴스 조회",
            description = "최근의 뉴스를 목록으로 조회",
            parameters = {@Parameter(name="userDetails", description = "로그인한 유저의 인증 정보")})
    public ResponseEntity<?> getNews(@AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "실시간 트랜드 조회",
            description = "가장 많이 검색된 검색어를 10위 까지 조회")
    public ResponseEntity<?> getTrends();
}
