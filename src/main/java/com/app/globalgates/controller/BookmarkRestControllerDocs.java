package com.app.globalgates.controller;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.BookmarkDTO;
import com.app.globalgates.dto.BookmarkFolderDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@Tag(name = "Bookmark", description = "Bookmark API")
public interface BookmarkRestControllerDocs {

    @Operation(summary = "폴더 목록 조회", description = "로그인한 회원의 북마크 폴더 목록을 조회한다. (path memberId는 인증 ID와 일치해야 함)")
    ResponseEntity<List<BookmarkFolderDTO>> getFolders(@PathVariable Long memberId,
                                                       @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(summary = "폴더 생성", description = "새 북마크 폴더를 생성한다. memberId는 서버에서 인증 정보로 강제된다.")
    ResponseEntity<Map<String, Long>> createFolder(@RequestBody BookmarkFolderDTO bookmarkFolderDTO,
                                                   @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(summary = "폴더 수정", description = "북마크 폴더명을 수정한다. (소유자만 가능)")
    ResponseEntity<Void> updateFolder(@RequestBody BookmarkFolderDTO bookmarkFolderDTO,
                                      @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(summary = "폴더 삭제", description = "북마크 폴더를 삭제한다. 폴더 내 북마크는 미분류로 이동된다. (소유자만 가능)")
    ResponseEntity<Void> deleteFolder(@PathVariable Long id,
                                      @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(summary = "북마크 추가", description = "게시물을 북마크에 추가한다. memberId는 서버에서 인증 정보로 강제된다.")
    ResponseEntity<Void> addBookmark(@RequestBody BookmarkDTO bookmarkDTO,
                                     @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(summary = "북마크 삭제 (id)", description = "북마크 id로 북마크를 삭제한다. (소유자만 가능)")
    ResponseEntity<Void> deleteBookmark(@PathVariable Long id,
                                        @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(summary = "북마크 삭제 (회원+게시물)", description = "회원 id와 게시물 id로 북마크를 삭제한다.")
    ResponseEntity<Void> deleteBookmarkByMemberIdAndPostId(@PathVariable Long memberId,
                                                           @PathVariable Long postId,
                                                           @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(summary = "북마크 폴더 이동", description = "북마크를 다른 폴더로 이동한다. (소유자만 가능)")
    ResponseEntity<Void> updateFolderId(@PathVariable Long id,
                                        @RequestBody BookmarkDTO bookmarkDTO,
                                        @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(summary = "회원 전체 북마크 조회", description = "로그인한 회원의 전체 북마크 목록을 조회한다.")
    ResponseEntity<List<BookmarkDTO>> getBookmarks(@PathVariable Long memberId,
                                                   @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(summary = "폴더별 북마크 조회", description = "특정 폴더의 북마크 목록을 조회한다. (소유자만 가능)")
    ResponseEntity<List<BookmarkDTO>> getBookmarksByFolder(@PathVariable Long folderId,
                                                           @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(summary = "미분류 북마크 조회", description = "폴더에 속하지 않은 미분류 북마크 목록을 조회한다.")
    ResponseEntity<List<BookmarkDTO>> getUncategorizedBookmarks(@PathVariable Long memberId,
                                                                @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(summary = "북마크 단건 조회 (회원+게시물)", description = "회원 id와 게시물 id로 북마크를 단건 조회한다.")
    ResponseEntity<BookmarkDTO> getBookmarkByMemberAndPost(@PathVariable Long memberId,
                                                           @PathVariable Long postId,
                                                           @AuthenticationPrincipal CustomUserDetails userDetails);
}
