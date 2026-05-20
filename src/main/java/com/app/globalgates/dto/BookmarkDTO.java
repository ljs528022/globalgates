package com.app.globalgates.dto;

import com.app.globalgates.domain.BookmarkVO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class BookmarkDTO {
    private Long id;
    private Long memberId;
    private Long postId;
    private Long folderId;
    private String postTitle;
    private String postContent;
    private String createdDatetime;
    private String updatedDatetime;
    // 게시물 작성자 정보
    private Long postMemberId;
    private String memberNickname;
    private String memberHandle;
    private String memberProfileFileName;
    // 게시물 통계
    private int likeCount;
    private int replyCount;
    private int bookmarkCount;
    // 좋아요 상태
    private boolean liked;
    // 첨부파일
    private List<PostFileDTO> postFiles;
    // 해시태그 (post 북마크에서만 채워짐, 뉴스 북마크는 빈 리스트)
    private List<PostHashtagDTO> hashtags = new ArrayList<>();
    // 뉴스 북마크 지원: 'post' | 'news', 그리고 뉴스 ID
    private String bookmarkType;
    private Long newsId;

    public BookmarkVO toBookmarkVO() {
        return BookmarkVO.builder()
                .id(id)
                .memberId(memberId)
                .postId(postId)
                .folderId(folderId)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}