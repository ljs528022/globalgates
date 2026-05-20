package com.app.globalgates.domain;

import com.app.globalgates.audit.Period;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@SuperBuilder
public class BookmarkVO extends Period {
    private Long id;
    private Long memberId;
    private Long postId;
    private Long folderId;
}
