package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.PostProductDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
@Slf4j
public class PostProductMapperTests {
    @Autowired
    private PostMapper postMapper;
    @Autowired
    private PostProductMapper postProductMapper;

    @Test
    public void testSelectAllByMemberId() {
        List<PostProductDTO> foundProducts = postProductMapper.selectAllByMemberId(4L);
        log.info("찾은 상품 정보: {}", foundProducts);
    }

    @Test
    public void testSelectRecommendProducts() {
        Criteria criteria = new Criteria(1, postProductMapper.selectTotal());
        Long memberId = 40L;
        List<PostProductDTO> foundProducts = postProductMapper.selectRecommendProducts(criteria, memberId);
        log.info("조회한 상품 정보 : {}", foundProducts);
        log.info("조회한 상품 수 : {}", postProductMapper.selectTotal());
    }
}
