package com.app.globalgates.mapper;

import com.app.globalgates.dto.BookmarkDTO;
import com.app.globalgates.dto.BookmarkFolderDTO;
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
class BookmarkMapperTest {

    @Autowired
    private BookmarkMapper bookmarkMapper;

    @Autowired
    private BookmarkFolderMapper bookmarkFolderMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long memberId;
    private Long postId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update(
                "insert into tbl_member (member_email, member_password, member_nickname, member_handle) values (?, ?, ?, ?) on conflict (member_email) do nothing",
                "test@test.com", "password123", "테스트유저", "testuser"
        );
        memberId = jdbcTemplate.queryForObject(
                "select id from tbl_member where member_email = ?", Long.class, "test@test.com"
        );

        jdbcTemplate.update(
                "insert into tbl_post (member_id, title, content) values (?, ?, ?)",
                memberId, "테스트 게시글", "테스트 내용"
        );
        postId = jdbcTemplate.queryForObject(
                "select id from tbl_post where member_id = ? order by id desc limit 1", Long.class, memberId
        );

        log.info("setUp 완료 — memberId: {}, postId: {}", memberId, postId);
    }

    // 북마크 생성 후 id 자동 생성 확인
    @Test
    public void insert() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);

        bookmarkMapper.insert(dto);

        log.info("insert 결과 — id: {}, memberId: {}, postId: {}", dto.getId(), dto.getMemberId(), dto.getPostId());
        assertThat(dto.getId()).isNotNull();
    }

    // id로 북마크 단건 조회
    @Test
    public void selectById() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkMapper.insert(dto);

        Optional<BookmarkDTO> result = bookmarkMapper.selectById(dto.getId());

        log.info("selectById 결과 — {}", result.orElse(null));
        assertThat(result).isPresent();
        assertThat(result.get().getMemberId()).isEqualTo(memberId);
    }

    // 회원/게시글 기준 단건 조회
    @Test
    public void selectByMemberIdAndPostId() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkMapper.insert(dto);

        Optional<BookmarkDTO> result = bookmarkMapper.selectByMemberIdAndPostId(memberId, postId);

        log.info("selectByMemberIdAndPostId 결과 — {}", result.orElse(null));
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(dto.getId());
    }

    // 북마크 삭제
    @Test
    public void delete() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkMapper.insert(dto);
        log.info("삭제 전 — id: {}", dto.getId());

        bookmarkMapper.delete(dto.getId());

        Optional<BookmarkDTO> result = bookmarkMapper.selectById(dto.getId());
        log.info("삭제 후 조회 — present: {}", result.isPresent());
        assertThat(result).isEmpty();
    }

    // 회원/게시글 기준 북마크 삭제
    @Test
    public void deleteByMemberIdAndPostId() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkMapper.insert(dto);
        log.info("삭제 전 — id: {}", dto.getId());

        bookmarkMapper.deleteByMemberIdAndPostId(memberId, postId);

        Optional<BookmarkDTO> result = bookmarkMapper.selectByMemberIdAndPostId(memberId, postId);
        log.info("회원/게시글 기준 삭제 후 — present: {}", result.isPresent());
        assertThat(result).isEmpty();
    }

    // 북마크 폴더 이동
    @Test
    public void updateFolderId() {
        BookmarkFolderDTO folderDTO = new BookmarkFolderDTO();
        folderDTO.setMemberId(memberId);
        folderDTO.setFolderName("테스트 폴더");
        bookmarkFolderMapper.insert(folderDTO);

        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkMapper.insert(dto);

        dto.setFolderId(folderDTO.getId());
        bookmarkMapper.updateFolderId(dto);

        Optional<BookmarkDTO> result = bookmarkMapper.selectById(dto.getId());
        log.info("updateFolderId 결과 — folderId: {}", result.get().getFolderId());
        assertThat(result.get().getFolderId()).isEqualTo(folderDTO.getId());
    }

    // 폴더 삭제 전 folderId null 처리
    @Test
    public void clearFolderId() {
        BookmarkFolderDTO folderDTO = new BookmarkFolderDTO();
        folderDTO.setMemberId(memberId);
        folderDTO.setFolderName("삭제될 폴더");
        bookmarkFolderMapper.insert(folderDTO);

        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        dto.setFolderId(folderDTO.getId());
        bookmarkMapper.insert(dto);
        log.info("clearFolderId 전 — folderId: {}", dto.getFolderId());

        bookmarkMapper.clearFolderId(folderDTO.getId());

        Optional<BookmarkDTO> result = bookmarkMapper.selectById(dto.getId());
        log.info("clearFolderId 후 — folderId: {}", result.get().getFolderId());
        assertThat(result.get().getFolderId()).isNull();
    }

    // 회원 기준 전체 북마크 조회
    @Test
    public void selectAllByMemberId() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkMapper.insert(dto);

        List<BookmarkDTO> result = bookmarkMapper.selectAllByMemberId(memberId);

        log.info("selectAllByMemberId 결과 — size: {}", result.size());
        result.forEach(b -> log.info("  bookmark: {}", b));
        assertThat(result).isNotEmpty();
    }

    // 폴더 기준 전체 북마크 조회
    @Test
    public void selectAllByFolderId() {
        BookmarkFolderDTO folderDTO = new BookmarkFolderDTO();
        folderDTO.setMemberId(memberId);
        folderDTO.setFolderName("폴더별 조회 테스트");
        bookmarkFolderMapper.insert(folderDTO);

        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        dto.setFolderId(folderDTO.getId());
        bookmarkMapper.insert(dto);

        List<BookmarkDTO> result = bookmarkMapper.selectAllByFolderId(folderDTO.getId());

        log.info("selectAllByFolderId 결과 — folderId: {}, size: {}", folderDTO.getId(), result.size());
        result.forEach(b -> log.info("  bookmark: {}", b));
        assertThat(result).isNotEmpty();
    }

    // 미분류 북마크 조회 (folderId가 null인 것만)
    @Test
    public void selectAllUncategorizedByMemberId() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkMapper.insert(dto);

        List<BookmarkDTO> result = bookmarkMapper.selectAllUncategorizedByMemberId(memberId);

        log.info("selectAllUncategorizedByMemberId 결과 — size: {}", result.size());
        result.forEach(b -> log.info("  bookmark: {}", b));
        assertThat(result).isNotEmpty();
    }

    // 회원 북마크 수 조회
    @Test
    public void selectCountByMemberId() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkMapper.insert(dto);

        int count = bookmarkMapper.selectCountByMemberId(memberId);

        log.info("selectCountByMemberId 결과 — count: {}", count);
        assertThat(count).isGreaterThanOrEqualTo(1);
    }
}
