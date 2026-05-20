package com.app.globalgates.common.pagination;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
@NoArgsConstructor
public class Criteria {
    private int page;
    private int pageCount;
    private int startPage;
    private int endPage;
    private int rowCount;
    private int realEnd;
    private int offset;
    private int count;
    private boolean hasMore;

    public Criteria(int page, int total) {
        rowCount = 10;
        pageCount = 10;
        count = rowCount + 1;
        this.page = Math.max(1, page);
        offset = (page - 1) * rowCount;
        endPage = (int) (Math.ceil(page / (double) pageCount) * pageCount);
        startPage = endPage - pageCount + 1;
        realEnd = (int) (Math.ceil(total / (double) rowCount));
        endPage = Math.min(endPage, realEnd);
        endPage = Math.max(1, endPage);
        hasMore = this.page < realEnd;
    }
}
