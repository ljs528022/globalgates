package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.PostDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
@SpringBootTest
@Transactional
class PostMapperTest {

    @Autowired
    private PostMapper postMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long memberId;
    private Long postId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update(
                "insert into tbl_member (member_email, member_password, member_nickname, member_handle) values (?, ?, ?, ?) on conflict (member_email) do nothing",
                "posttest@test.com", "password123", "게시글테스트", "posttester"
        );
        memberId = jdbcTemplate.queryForObject(
                "select id from tbl_member where member_email = ?", Long.class, "posttest@test.com"
        );

        jdbcTemplate.update(
                "insert into tbl_post (member_id, title, content) values (?, ?, ?)",
                memberId, "테스트 게시글", "테스트 내용입니다"
        );
        postId = jdbcTemplate.queryForObject(
                "select id from tbl_post where member_id = ? order by id desc limit 1", Long.class, memberId
        );

        log.info("setUp 완료 — memberId: {}, postId: {}", memberId, postId);
    }

    @Test
    void insert() {
        PostDTO dto = new PostDTO();
        dto.setMemberId(memberId);
        dto.setPostTitle("새 게시글");
        dto.setPostContent("새 게시글 내용");

        postMapper.insert(dto);

        log.info("insert 결과 — id: {}", dto.getId());
        assertThat(dto.getId()).isNotNull();
    }

    @Test
    void selectById() {
        Optional<PostDTO> result = postMapper.selectById(postId, memberId);

        log.info("selectById 결과 — {}", result.orElse(null));
        assertThat(result).isPresent();
        assertThat(result.get().getPostTitle()).isEqualTo("테스트 게시글");
        assertThat(result.get().getMemberNickname()).isEqualTo("게시글테스트");
    }

    @Test
    void selectAll() {
        Criteria criteria = new Criteria(1, postMapper.selectTotal());
        List<PostDTO> result = postMapper.selectAll(criteria, memberId);

        log.info("selectAll 결과 — size: {}", result.size());
        result.forEach(p -> log.info("  post: id={}, title={}, likeCount={}, replyCount={}, isLiked={}",
                p.getId(), p.getPostTitle(), p.getLikeCount(), p.getReplyCount(), p.isLiked()));
        assertThat(result).isNotEmpty();
    }

    @Test
    void selectTotal() {
        int total = postMapper.selectTotal();

        log.info("selectTotal 결과 — total: {}", total);
        assertThat(total).isGreaterThanOrEqualTo(1);
    }

    @Test
    void update() {
        PostDTO dto = new PostDTO();
        dto.setId(postId);
        dto.setPostTitle("수정된 제목");
        dto.setPostContent("수정된 내용");

        postMapper.update(dto.toPostVO());

        Optional<PostDTO> result = postMapper.selectById(postId, memberId);
        log.info("update 결과 — title: {}", result.get().getPostTitle());
        assertThat(result.get().getPostTitle()).isEqualTo("수정된 제목");
    }

    @Test
    void delete() {
        postMapper.delete(postId);

        Optional<PostDTO> result = postMapper.selectById(postId, memberId);
        log.info("delete 후 조회 — present: {}", result.isPresent());
        assertThat(result).isEmpty();
    }
}
