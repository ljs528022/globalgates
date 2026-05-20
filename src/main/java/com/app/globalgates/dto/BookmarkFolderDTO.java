package com.app.globalgates.dto;

import com.app.globalgates.domain.BookmarkFolderVO;
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
public class BookmarkFolderDTO {
    private Long id;
    private Long memberId;
    private String folderName;
    private String createdDatetime;
    private String updatedDatetime;
    private int bookmarkCount;

    public BookmarkFolderVO toBookmarkFolderVO() {
        return BookmarkFolderVO.builder()
                .id(id)
                .memberId(memberId)
                .folderName(folderName)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}