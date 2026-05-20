package com.app.globalgates.mapper;

import com.app.globalgates.dto.CategoryDTO;
import com.app.globalgates.dto.CategoryMemberDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;

@SpringBootTest
@Slf4j
public class CategoryMapperTests {

    @Autowired
    private CategoryMapper categoryMapper;
    @Autowired
    private CategoryMemberMapper categoryMemberMapper;

    @Test
    public void testInsert(){
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setId(15L);
        categoryDTO.setCategoryName("음료");
        log.info("categoryDTO : {}", categoryDTO);
        categoryMapper.insert(categoryDTO);

        CategoryMemberDTO categoryMemberDTO = new CategoryMemberDTO();
        categoryMemberDTO.setCategoryId(categoryDTO.getId());
        log.info("categoryMemberDTO : {}", categoryMemberDTO);
        categoryMemberMapper.insert(categoryMemberDTO);
    }

    @Test
    public void testSelectById(){
        Optional<CategoryDTO> category = categoryMapper.selectById(1L);
        log.info("category : {}", category);
    }

    @Test
    public void testSelectByCategoryName(){
        Optional<CategoryDTO> category = categoryMapper.selectByCategoryName("섬유/의류");
        log.info("category : {}", category);
    }

}
