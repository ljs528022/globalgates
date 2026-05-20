package com.app.globalgates.dto;

import com.app.globalgates.domain.CategoryMemberVO;
import com.app.globalgates.domain.CategoryVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class CategoryMemberDTO {
    private Long memberId;
    private Long categoryId;
    private String categoryName;
    private String createdDatetime;

}
