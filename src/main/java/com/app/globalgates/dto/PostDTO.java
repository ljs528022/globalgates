
package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.Status;
import com.app.globalgates.domain.PostVO;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class PostDTO {
    private Long id;
    private Long memberId;
    private Status postStatus;
    private String postTitle;
    private String postContent;
    private String location;
    private Long replyPostId;
    private String createdDatetime;
    private String updatedDatetime;

    // 멤버
    private String memberNickname;
    private String memberHandle;
    private String memberProfileFileName;
    private String badgeType;

    // 좋아요,댓글,조회수
    private int likeCount;
    private int replyCount;
    private int postReadCount;

    // 좋아요, 북마크, 신고, 팔로우 여부
    private boolean isLiked;
    private boolean isBookmarked;
    private boolean isReported;
    private boolean isFollowed;

    // 해시태그
    private List<PostHashtagDTO> hashtags = new ArrayList<>();

    // 첨부파일
    private List<PostFileDTO> postFiles;
    private List<String> fileUrls;
    private String[] fileIdsToDelete;

    // 커뮤니티
    private Long communityId;
    private String communityName;
    private String categoryName;

    // 첨부된 판매글 (게시 시 클라이언트가 전달)
    private Long productPostId;
    // 첨부 상품
    private Long productId;
    private int productPrice;
    private int productStock;
    private String productTitle;
    private String productContent;
    private String productImage;
    private String productHashtags;

    // 속보타입 뉴스
    private String newsTitle;
    private String newsContent;
    private String newsType;

    // 대댓글 (댓글의 댓글)
    private List<PostDTO> subReplies;

    // 멘션
    private List<String> mentionedHandles;

    public PostVO toPostVO() {
        return PostVO.builder()
                .id(id)
                .memberId(memberId)
                .postStatus(postStatus)
                .postTitle(postTitle)
                .postContent(postContent)
                .location(location)
                .replyPostId(replyPostId)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}
