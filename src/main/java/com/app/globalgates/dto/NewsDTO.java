package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.NewsCategoryType;
import com.app.globalgates.common.enumeration.NewsType;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class NewsDTO {
    private Long id;
    private Long adminId;
    private Long postId;
    private String newsTitle;
    private String newsContent;
    private String newsSourceUrl;
    private NewsCategoryType newsCategory;
    private NewsType newsType;
    private String publishedAt;
    private String createdDatetime;
    private String updatedDatetime;
    private boolean liked;
    private boolean bookmarked;
    private int likeCount;
    private int bookmarkCount;
}
