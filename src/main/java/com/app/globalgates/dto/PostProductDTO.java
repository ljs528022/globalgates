package com.app.globalgates.dto;

import com.app.globalgates.domain.PostProductVO;
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
public class PostProductDTO {
    private Long id;

    // tbl_post 저장 시 작성자 id로만 사용된다.
    private Long memberId;

    private int productPrice;
    private int productStock;
    private Long productCategoryId;

    // 상품 등록 폼에서 직접 받는 값이다.
    private String categoryName;
    private String postTag;

    private String createdDatetime;
    private String updatedDatetime;

    // tbl_member JOIN 정보
    private String memberNickname;
    private String memberHandle;
    private String memberProfile;
    // tbl_post JOIN 정보
    private String postTitle;
    private String postContent;

    // 상품 이미지 (tbl_post_file JOIN)
    private List<String> postFiles = new ArrayList<>();

    // 좋아요, 북마크 여부
    private boolean isLiked;
    private boolean isBookmarked;

    // 좋아요 개수
    private int likeCount;

    // 상품 태그
    private List<PostHashtagDTO> hashtags = new ArrayList<>();

    public PostProductVO toPostProductVO() {
        return PostProductVO.builder()
                .id(id)
                .productPrice(productPrice)
                .productStock(productStock)
                .productCategoryId(productCategoryId)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }

    // 상품은 tbl_post를 먼저 저장한 뒤 같은 id로 tbl_post_product를 저장한다.
    public PostDTO toPostDTO() {
        PostDTO postDTO = new PostDTO();
        postDTO.setId(id);
        postDTO.setMemberId(memberId);
        postDTO.setPostTitle(postTitle);
        postDTO.setPostContent(postContent);
        return postDTO;
    }
}
