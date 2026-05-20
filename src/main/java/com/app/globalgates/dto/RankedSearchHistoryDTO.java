package com.app.globalgates.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter
@ToString
@NoArgsConstructor
public class RankedSearchHistoryDTO {
    private Long ranking;
    private String searchKeyword;
    private Long totalCount;
}
