package com.app.globalgates.mapper;

import com.app.globalgates.dto.PostLikeDTO;
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
class PostLikeMapperTest {

    @Autowired
    private PostLikeMapper postLikeMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long memberId;
    private Long postId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update(
                "insert into tbl_member (member_email, member_password, member_nickname, member_handle) values (?, ?, ?, ?) on conflict (member_email) do nothing",
                "liketest@test.com", "password123", "좋아요테스트", "liketester"
        );
        memberId = jdbcTemplate.queryForObject(
                "select id from tbl_member where member_email = ?", Long.class, "liketest@test.com"
        );

        jdbcTemplate.update(
                "insert into tbl_post (member_id, title, content) values (?, ?, ?)",
                memberId, "좋아요 테스트 게시글", "테스트 내용"
        );
        postId = jdbcTemplate.queryForObject(
                "select id from tbl_post where member_id = ? order by id desc limit 1", Long.class, memberId
        );

        log.info("setUp 완료 — memberId: {}, postId: {}", memberId, postId);
    }

    @Test
    void insert() {
        PostLikeDTO dto = new PostLikeDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);

        postLikeMapper.insert(dto);

        log.info("insert 결과 — id: {}", dto.getId());
        assertThat(dto.getId()).isNotNull();
    }

    @Test
    void selectByMemberIdAndPostId() {
        PostLikeDTO dto = new PostLikeDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        postLikeMapper.insert(dto);

        Optional<PostLikeDTO> result = postLikeMapper.selectByMemberIdAndPostId(memberId, postId);

        log.info("selectByMemberIdAndPostId 결과 — {}", result.orElse(null));
        assertThat(result).isPresent();
        assertThat(result.get().getMemberId()).isEqualTo(memberId);
    }

    @Test
    void deleteByMemberIdAndPostId() {
        PostLikeDTO dto = new PostLikeDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        postLikeMapper.insert(dto);
        log.info("삭제 전 — id: {}", dto.getId());

        postLikeMapper.deleteByMemberIdAndPostId(memberId, postId);

        Optional<PostLikeDTO> result = postLikeMapper.selectByMemberIdAndPostId(memberId, postId);
        log.info("삭제 후 조회 — present: {}", result.isPresent());
        assertThat(result).isEmpty();
    }

    @Test
    void selectCountByPostId() {
        PostLikeDTO dto = new PostLikeDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        postLikeMapper.insert(dto);

        int count = postLikeMapper.selectCountByPostId(postId);

        log.info("selectCountByPostId 결과 — count: {}", count);
        assertThat(count).isGreaterThanOrEqualTo(1);
    }
}
