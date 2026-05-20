package com.app.globalgates.dto;

import com.app.globalgates.domain.CategoryVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class CategoryDTO {
    private long id;
    private Long productCategoryParentId;
    private String categoryName;
    private String createdDatetime;

    public CategoryVO toCategoriesVO(){
        return CategoryVO.builder()
                .id(id)
                .productCategoryParentId(productCategoryParentId)
                .categoryName(categoryName)
                .createdDatetime(createdDatetime)
                .build();
    }
}
