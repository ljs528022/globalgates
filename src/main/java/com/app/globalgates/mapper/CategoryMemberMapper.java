package com.app.globalgates.mapper;

import com.app.globalgates.dto.CategoryDTO;
import com.app.globalgates.dto.CategoryMemberDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface CategoryMemberMapper {
//  추가
    public void insert(CategoryMemberDTO categoryMemberDTO);
//  memberId로 조회
    public Optional<CategoryMemberDTO> selectByMemberId(Long memberId);
//  memberId로 삭제
    public void deleteByMemberId(Long memberId);
//  삭제
    public void delete(CategoryMemberDTO categoryMemberDTO);

}
