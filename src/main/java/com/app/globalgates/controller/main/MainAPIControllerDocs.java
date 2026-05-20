package com.app.globalgates.controller.main;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Tag(name = "Main", description = "Main API")
public interface MainAPIControllerDocs {
    @Operation(
            summary = "피드 광고 조회",
            description = "메인 피드에 표시할 광고 목록을 페이지 단위로 조회한다.",
            parameters = {@Parameter(name = "page", description = "광고 페이지 번호"),
                            @Parameter(name = "count", description = "받아올 광고 개수")}
    )
    public List<AdvertisementDTO> getAds(@PathVariable int page, @RequestParam int count);

    @Operation(
            summary = "게시글 목록 조회",
            description = "페이지별 게시글 목록을 조회한다.",
            parameters = {@Parameter(name = "page", description = "화면에 표시할 페이지 번호"),
                            @Parameter(name = "memberId", description = "로그인한 회원의 id")}
    )
    public PostWithPagingDTO getPostList(@PathVariable int page, @RequestParam Long memberId);

    @Operation(
            summary = "게시글 단건 조회",
            description = "수정용 게시글 상세 정보를 조회한다.",
            parameters = {@Parameter(name = "id", description = "조회할 게시글의 id"),
                            @Parameter(name = "memberId", description = "로그인한 회원의 id")}
    )
    public PostDTO getPost(@PathVariable Long id, @RequestParam Long memberId);

    @Operation(
            summary = "게시글 작성",
            description = "게시글을 작성하고 파일을 업로드한다.",
            parameters = {@Parameter(name = "postDTO", description = "작성할 게시글 정보"),
                            @Parameter(name = "files", description = "첨부 파일들")}
    )
    public void writePost(PostDTO postDTO, @RequestParam(value = "files", required = false) List<MultipartFile> files) throws IOException;

    @Operation(
            summary = "게시글 수정",
            description = "기존 게시글을 수정한다.",
            parameters = {@Parameter(name = "id", description = "수정할 게시글의 id"),
                            @Parameter(name = "postDTO", description = "수정할 게시글 정보"),
                            @Parameter(name = "files", description = "첨부 파일들")}
    )
    public void updatePost(@PathVariable Long id, PostDTO postDTO, @RequestParam(value = "files", required = false) List<MultipartFile> files, @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException;

    @Operation(
            summary = "게시글 삭제",
            description = "게시글을 삭제한다.",
            parameters = {@Parameter(name = "id", description = "삭제할 게시글의 id")}
    )
    public void deletePost(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "댓글 작성",
            description = "게시글에 댓글을 작성한다.",
            parameters = {@Parameter(name = "postId", description = "댓글을 달 게시글의 id"),
                            @Parameter(name = "postDTO", description = "작성할 댓글 정보"),
                            @Parameter(name = "files", description = "첨부 파일들")}
    )
    public void writeReply(@PathVariable Long postId, PostDTO postDTO, @RequestParam(value = "files", required = false) List<MultipartFile> files) throws IOException;

    @Operation(
            summary = "댓글 목록 조회",
            description = "게시글의 댓글 목록을 조회한다.",
            parameters = {@Parameter(name = "postId", description = "조회할 게시글의 id"),
                            @Parameter(name = "memberId", description = "로그인한 회원의 id")}
    )
    public List<PostDTO> getReplies(@PathVariable Long postId, @RequestParam Long memberId);

    @Operation(
            summary = "전문가 목록 조회",
            description = "페이지별 전문가 목록을 조회한다.",
            parameters = {@Parameter(name = "page", description = "화면에 표시할 페이지 번호"),
                            @Parameter(name = "memberId", description = "로그인한 회원의 id")}
    )
    public ExpertWithPagingDTO getExpertList(@PathVariable int page, @RequestParam Long memberId);

    @Operation(
            summary = "좋아요 추가",
            description = "게시글에 좋아요를 추가한다.",
            parameters = {@Parameter(name = "postLikeDTO", description = "좋아요 정보")}
    )
    public void addLike(@RequestBody PostLikeDTO postLikeDTO, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "좋아요 취소",
            description = "게시글의 좋아요를 취소한다. (memberId는 인증 정보에서 추출)",
            parameters = {@Parameter(name = "postId", description = "게시글의 id")}
    )
    public void deleteLike(@PathVariable Long postId, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "회원 검색",
            description = "키워드로 회원을 검색한다.",
            parameters = {@Parameter(name = "keyword", description = "검색 키워드")}
    )
    public List<MemberDTO> searchMembers(@RequestParam String keyword);

    @Operation(
            summary = "검색 기록 저장",
            description = "검색 기록을 저장한다.",
            parameters = {@Parameter(name = "searchHistoryDTO", description = "검색 기록 정보")}
    )
    public void saveSearchHistory(@RequestBody SearchHistoryDTO searchHistoryDTO);

    @Operation(
            summary = "최근 검색 목록 조회",
            description = "회원의 최근 검색 기록을 조회한다.",
            parameters = {@Parameter(name = "memberId", description = "로그인한 회원의 id")}
    )
    public List<SearchHistoryDTO> getSearchHistories(@PathVariable Long memberId);

    @Operation(
            summary = "검색 기록 개별 삭제",
            description = "검색 기록을 개별 삭제한다.",
            parameters = {@Parameter(name = "id", description = "삭제할 검색 기록의 id")}
    )
    public void deleteSearchHistory(@PathVariable Long id);

    @Operation(
            summary = "검색 기록 전체 삭제",
            description = "회원의 검색 기록을 전체 삭제한다.",
            parameters = {@Parameter(name = "memberId", description = "로그인한 회원의 id")}
    )
    public void deleteAllSearchHistories(@PathVariable Long memberId);

    @Operation(
            summary = "최신 뉴스 조회",
            description = "사이드바에 표시할 최신 뉴스 2개를 조회한다."
    )
    public List<NewsDTO> getLatestNews();

    @Operation(
            summary = "내 판매품목 조회",
            description = "회원의 판매품목 목록을 조회한다.",
            parameters = {@Parameter(name = "memberId", description = "로그인한 회원의 id")}
    )
    public List<PostProductDTO> getMyProducts(@PathVariable Long memberId);

    @Operation(
            summary = "북마크 추가",
            description = "게시글을 북마크에 추가한다.",
            parameters = {@Parameter(name = "bookmarkDTO", description = "북마크 정보")}
    )
    public void addBookmark(@RequestBody BookmarkDTO bookmarkDTO);

    @Operation(
            summary = "북마크 삭제",
            description = "게시글의 북마크를 삭제한다.",
            parameters = {@Parameter(name = "memberId", description = "로그인한 회원의 id"),
                            @Parameter(name = "postId", description = "게시글의 id")}
    )
    public void deleteBookmark(@PathVariable Long memberId, @PathVariable Long postId);

    @Operation(
            summary = "팔로우 추가",
            description = "회원을 팔로우한다.",
            parameters = {@Parameter(name = "followDTO", description = "팔로우 정보")}
    )
    public void follow(@RequestBody FollowDTO followDTO);

    @Operation(
            summary = "팔로우 해제",
            description = "회원의 팔로우를 해제한다.",
            parameters = {@Parameter(name = "followerId", description = "팔로우 하는 회원의 id"),
                            @Parameter(name = "followingId", description = "팔로우 당하는 회원의 id")}
    )
    public void unfollow(@PathVariable Long followerId, @PathVariable Long followingId);

    @Operation(
            summary = "팔로잉 목록 조회",
            description = "공유 모달에서 팔로잉 목록을 조회한다.",
            parameters = {@Parameter(name = "memberId", description = "로그인한 회원의 id")}
    )
    public List<FollowDTO> getFollowings(@PathVariable Long memberId);

    @Operation(
            summary = "팔로우 추천 조회",
            description = "팔로우하지 않은 회원 추천 목록을 조회한다.",
            parameters = {@Parameter(name = "memberId", description = "로그인한 회원의 id")}
    )
    public List<MemberDTO> getSuggestions(@PathVariable Long memberId);

    @Operation(
            summary = "차단 추가",
            description = "회원을 차단한다.",
            parameters = {@Parameter(name = "blockDTO", description = "차단 정보")}
    )
    public void block(@RequestBody BlockDTO blockDTO);

    @Operation(
            summary = "신고",
            description = "게시글 또는 회원을 신고한다.",
            parameters = {@Parameter(name = "reportDTO", description = "신고 정보")}
    )
    public void report(@RequestBody ReportDTO reportDTO);

    @Operation(
            summary = "멘션 검색",
            description = "handle로 멘션 가능한 회원을 검색한다. 양방향 차단 제외, 최대 10개",
            parameters = {@Parameter(name = "keyword", description = "검색 키워드"),
                            @Parameter(name = "memberId", description = "로그인한 회원의 id")}
    )
    public List<com.app.globalgates.dto.MentionDTO> searchMentionMembers(@RequestParam String keyword, @RequestParam Long memberId);

    @Operation(
            summary = "임시저장",
            description = "게시글을 임시저장한다.",
            parameters = {@Parameter(name = "postTempDTO", description = "임시저장할 게시글 정보")}
    )
    public void savePostTemp(@RequestBody PostTempDTO postTempDTO);

    @Operation(
            summary = "임시저장 목록 조회",
            description = "회원의 임시저장 목록을 조회한다.",
            parameters = {@Parameter(name = "memberId", description = "로그인한 회원의 id")}
    )
    public List<PostTempDTO> getPostTemps(@PathVariable Long memberId);

    @Operation(
            summary = "임시저장 불러오기",
            description = "임시저장한 게시글을 불러오고 삭제한다.",
            parameters = {@Parameter(name = "id", description = "임시저장 id")}
    )
    public PostTempDTO loadPostTemp(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "임시저장 개별 삭제",
            description = "임시저장 게시글을 개별 삭제한다.",
            parameters = {@Parameter(name = "id", description = "임시저장 id")}
    )
    public void deletePostTemp(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "임시저장 선택 삭제",
            description = "선택한 임시저장 게시글들을 삭제한다.",
            parameters = {@Parameter(name = "ids", description = "삭제할 임시저장 id 목록")}
    )
    public void deletePostTemps(@RequestBody List<Long> ids);
}
