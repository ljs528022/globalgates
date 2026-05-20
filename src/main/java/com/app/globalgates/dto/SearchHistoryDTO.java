package com.app.globalgates.dto;

import com.app.globalgates.domain.SearchHistoryVO;
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
public class SearchHistoryDTO {
    private Long id;
    private Long memberId;
    private String searchKeyword;
    private int searchCount;
    private String createdDatetime;

    public SearchHistoryVO toSearchHistoryVO() {
        return SearchHistoryVO.builder()
                .id(id)
                .memberId(memberId)
                .searchKeyword(searchKeyword)
                .searchCount(searchCount)
                .createdDatetime(createdDatetime)
                .build();
    }
}
