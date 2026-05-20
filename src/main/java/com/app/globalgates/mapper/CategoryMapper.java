package com.app.globalgates.mapper;

import com.app.globalgates.dto.CategoryDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CategoryMapper {
//    카테고리추가
    public void insert(CategoryDTO categoryDTO);
//    memberId로 조회
    public Optional<CategoryDTO> selectById(Long id);
//  카테고리 이름으로 조회
    public Optional<CategoryDTO> selectByCategoryName(String categoryName);
//  전체 카테고리 조회
    public List<CategoryDTO> selectAll();
//  삭제
    public void delete(Long id);

}
