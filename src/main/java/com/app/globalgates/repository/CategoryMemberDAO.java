package com.app.globalgates.repository;

import com.app.globalgates.dto.CategoryMemberDTO;
import com.app.globalgates.mapper.CategoryMemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CategoryMemberDAO {
    private final CategoryMemberMapper categoryMemberMapper;

    public void save(CategoryMemberDTO categoryMemberDTO) {
        categoryMemberMapper.insert(categoryMemberDTO);
    }

    public Optional<CategoryMemberDTO> findByMemberId(Long memberId) {
        return categoryMemberMapper.selectByMemberId(memberId);
    }

    public void deleteByMemberId(Long memberId) {
        categoryMemberMapper.deleteByMemberId(memberId);
    }

    public void delete(CategoryMemberDTO categoryMemberDTO) {
        categoryMemberMapper.delete(categoryMemberDTO);
    }
}
