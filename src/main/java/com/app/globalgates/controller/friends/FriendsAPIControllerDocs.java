package com.app.globalgates.controller.friends;

import com.app.globalgates.dto.CategoryDTO;
import com.app.globalgates.dto.FriendsWithPagingDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Friends", description = "Friends API")
public interface FriendsAPIControllerDocs {
    @Operation(
            summary = "친구 추천 목록 조회",
            description = "페이지별 친구 추천 목록을 조회한다.",
            parameters = {@Parameter(name = "page", description = "화면에 표시할 페이지 번호"),
                            @Parameter(name = "memberId", description = "로그인한 회원의 id"),
                            @Parameter(name = "categoryId", description = "카테고리 id (선택)")}
    )
    public FriendsWithPagingDTO getList(@PathVariable int page, @RequestParam Long memberId, @RequestParam(required = false) Long categoryId);

    @Operation(
            summary = "카테고리 목록 조회",
            description = "전체 카테고리 목록을 조회한다."
    )
    public List<CategoryDTO> getCategories();

    @Operation(
            summary = "커넥터 목록 조회 (profileId를 팔로우중인 회원들)",
            description = "페이지별 커넥터 목록을 조회한다. 본인 페이지면 profileId == viewerId.",
            parameters = {@Parameter(name = "page", description = "화면에 표시할 페이지 번호"),
                            @Parameter(name = "profileId", description = "친구 페이지 주인의 회원 id"),
                            @Parameter(name = "viewerId", description = "로그인한 회원의 id (버튼 상태/차단 필터 기준)")}
    )
    public FriendsWithPagingDTO getFollowers(@PathVariable int page, @RequestParam Long profileId, @RequestParam Long viewerId);

    @Operation(
            summary = "커넥팅 목록 조회 (profileId가 팔로우중인 회원들)",
            description = "페이지별 커넥팅 목록을 조회한다. 본인 페이지면 profileId == viewerId.",
            parameters = {@Parameter(name = "page", description = "화면에 표시할 페이지 번호"),
                            @Parameter(name = "profileId", description = "친구 페이지 주인의 회원 id"),
                            @Parameter(name = "viewerId", description = "로그인한 회원의 id (버튼 상태/차단 필터 기준)")}
    )
    public FriendsWithPagingDTO getFollowings(@PathVariable int page, @RequestParam Long profileId, @RequestParam Long viewerId);
}
