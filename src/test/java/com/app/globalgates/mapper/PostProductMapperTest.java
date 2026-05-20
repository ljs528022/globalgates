package com.app.globalgates.mapper;

import com.app.globalgates.dto.PostProductDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
@SpringBootTest
@Transactional
class PostProductMapperTest {

    @Autowired
    private PostProductMapper postProductMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long memberId;
    private Long postId;
    private Long categoryId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update(
                "insert into tbl_member (member_email, member_password, member_nickname, member_handle) values (?, ?, ?, ?) on conflict (member_email) do nothing",
                "producttest@test.com", "password123", "상품테스트", "producttester"
        );
        memberId = jdbcTemplate.queryForObject(
                "select id from tbl_member where member_email = ?", Long.class, "producttest@test.com"
        );

        jdbcTemplate.update(
                "insert into tbl_category (category_name) values (?) on conflict (category_name) do nothing",
                "테스트카테고리"
        );
        categoryId = jdbcTemplate.queryForObject(
                "select id from tbl_category where category_name = ?", Long.class, "테스트카테고리"
        );

        jdbcTemplate.update(
                "insert into tbl_post (member_id, title, content) values (?, ?, ?)",
                memberId, "테스트 상품", "테스트 상품 설명"
        );
        postId = jdbcTemplate.queryForObject(
                "select id from tbl_post where member_id = ? order by id desc limit 1", Long.class, memberId
        );

        jdbcTemplate.update(
                "insert into tbl_post_product (id, product_price, product_stock, product_category_id) values (?, ?, ?, ?)",
                postId, 25000, 100, categoryId
        );

        log.info("setUp 완료 — memberId: {}, postId: {}, categoryId: {}", memberId, postId, categoryId);
    }

    @Test
    void selectAllByMemberId() {
        List<PostProductDTO> result = postProductMapper.selectAllByMemberId(memberId);

        log.info("selectAllByMemberId 결과 — size: {}", result.size());
        result.forEach(p -> log.info("  product: id={}, title={}, price={}, stock={}",
                p.getId(), p.getPostTitle(), p.getProductPrice(), p.getProductStock()));
        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getProductPrice()).isEqualTo(25000);
    }
}
