package com.app.globalgates.controller.explore;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.common.search.PostSearch;
import com.app.globalgates.dto.MemberWithPagingDTO;
import com.app.globalgates.dto.PostWithPagingDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "Explore Search", description = "탐색 검색 API")
public interface ExploreSearchControllerDocs {

    @Operation(
            summary = "게시물 검색 조회",
            description = "키워드로 게시물을 검색합니다. `search.type`이 `'popular'`이면 조회수 높은 순(인기순), 그 외에는 최신순으로 조회됩니다.",
            parameters = {
                    @Parameter(name = "page", description = "표시할 게시물 목록 페이지 (1부터 시작)", required = true),
                    @Parameter(name = "keyword", description = "검색 키워드"),
                    @Parameter(name = "type", description = "정렬 기준 - `popular`: 인기순 / 그 외: 최신순"),
                    @Parameter(name = "userDetails", description = "로그인한 유저 정보")
            }
    )
    ResponseEntity<?> getSearchPosts(@PathVariable int page, PostSearch search, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "회원 검색 조회",
            description = "키워드로 회원을 검색합니다.",
            parameters = {
                    @Parameter(name = "page", description = "표시할 유저 목록 페이지 (1부터 시작)", required = true),
                    @Parameter(name = "keyword", description = "검색할 회원 키워드 (닉네임 등)"),
                    @Parameter(name = "userDetails", description = "로그인한 유저 정보")
            }
    )
    ResponseEntity<?> getSearchMembers(@PathVariable int page, String keyword, @AuthenticationPrincipal CustomUserDetails userDetails);
}