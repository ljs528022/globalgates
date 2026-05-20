package com.app.globalgates.mapper;

import com.app.globalgates.dto.ReplyProductRelDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
@SpringBootTest
@Transactional
class ReplyProductRelMapperTest {

    @Autowired
    private ReplyProductRelMapper replyProductRelMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long memberId;
    private Long replyPostId;
    private Long productPostId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update(
                "insert into tbl_member (member_email, member_password, member_nickname, member_handle) values (?, ?, ?, ?) on conflict (member_email) do nothing",
                "reltest@test.com", "password123", "관계테스트", "reltester"
        );
        memberId = jdbcTemplate.queryForObject(
                "select id from tbl_member where member_email = ?", Long.class, "reltest@test.com"
        );

        // 원글 (상품 게시글)
        jdbcTemplate.update(
                "insert into tbl_post (member_id, title, content) values (?, ?, ?)",
                memberId, "판매 상품", "상품 설명"
        );
        productPostId = jdbcTemplate.queryForObject(
                "select id from tbl_post where member_id = ? order by id desc limit 1", Long.class, memberId
        );

        // 댓글
        jdbcTemplate.update(
                "insert into tbl_post (member_id, title, content, reply_post_id) values (?, ?, ?, ?)",
                memberId, "", "이 상품 추천드려요", productPostId
        );
        replyPostId = jdbcTemplate.queryForObject(
                "select id from tbl_post where member_id = ? order by id desc limit 1", Long.class, memberId
        );

        log.info("setUp 완료 — memberId: {}, replyPostId: {}, productPostId: {}", memberId, replyPostId, productPostId);
    }

    @Test
    void insert() {
        ReplyProductRelDTO dto = new ReplyProductRelDTO();
        dto.setReplyPostId(replyPostId);
        dto.setProductPostId(productPostId);

        replyProductRelMapper.insert(dto);

        log.info("insert 결과 — id: {}", dto.getId());
        assertThat(dto.getId()).isNotNull();
    }

    @Test
    void selectByReplyPostId() {
        ReplyProductRelDTO dto = new ReplyProductRelDTO();
        dto.setReplyPostId(replyPostId);
        dto.setProductPostId(productPostId);
        replyProductRelMapper.insert(dto);

        Optional<ReplyProductRelDTO> result = replyProductRelMapper.selectByReplyPostId(replyPostId);

        log.info("selectByReplyPostId 결과 — {}", result.orElse(null));
        assertThat(result).isPresent();
        assertThat(result.get().getProductPostId()).isEqualTo(productPostId);
    }

    @Test
    void deleteByReplyPostId() {
        ReplyProductRelDTO dto = new ReplyProductRelDTO();
        dto.setReplyPostId(replyPostId);
        dto.setProductPostId(productPostId);
        replyProductRelMapper.insert(dto);
        log.info("삭제 전 — id: {}", dto.getId());

        replyProductRelMapper.deleteByReplyPostId(replyPostId);

        Optional<ReplyProductRelDTO> result = replyProductRelMapper.selectByReplyPostId(replyPostId);
        log.info("삭제 후 조회 — present: {}", result.isPresent());
        assertThat(result).isEmpty();
    }
}
