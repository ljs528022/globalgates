package com.app.globalgates.mapper;

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
class BookmarkFolderMapperTest {

    @Autowired
    private BookmarkFolderMapper bookmarkFolderMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long memberId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update(
                "insert into tbl_member (member_email, member_password, member_nickname, member_handle) values (?, ?, ?, ?) on conflict (member_email) do nothing",
                "test@test.com", "password123", "테스트유저", "testuser"
        );
        memberId = jdbcTemplate.queryForObject(
                "select id from tbl_member where member_email = ?", Long.class, "test@test.com"
        );
        log.info("setUp 완료 — memberId: {}", memberId);
    }

    // 폴더 생성 후 id 자동 생성 확인
    @Test
    public void insert() {
        BookmarkFolderDTO dto = new BookmarkFolderDTO();
        dto.setMemberId(memberId);
        dto.setFolderName("관심 상품");

        bookmarkFolderMapper.insert(dto);

        log.info("insert 결과 — id: {}, folderName: {}", dto.getId(), dto.getFolderName());
        assertThat(dto.getId()).isNotNull();
    }

    // 폴더명 수정
    @Test
    public void update() {
        BookmarkFolderDTO dto = new BookmarkFolderDTO();
        dto.setMemberId(memberId);
        dto.setFolderName("원래 폴더명");
        bookmarkFolderMapper.insert(dto);

        dto.setFolderName("수정된 폴더명");
        bookmarkFolderMapper.update(dto);

        Optional<BookmarkFolderDTO> result = bookmarkFolderMapper.selectById(dto.getId());
        log.info("update 결과 — folderName: {}", result.get().getFolderName());
        assertThat(result.get().getFolderName()).isEqualTo("수정된 폴더명");
    }

    // 폴더 삭제
    @Test
    public void delete() {
        BookmarkFolderDTO dto = new BookmarkFolderDTO();
        dto.setMemberId(memberId);
        dto.setFolderName("삭제할 폴더");
        bookmarkFolderMapper.insert(dto);
        log.info("삭제 전 — id: {}", dto.getId());

        bookmarkFolderMapper.delete(dto.getId());

        Optional<BookmarkFolderDTO> result = bookmarkFolderMapper.selectById(dto.getId());
        log.info("삭제 후 조회 — present: {}", result.isPresent());
        assertThat(result).isEmpty();
    }

    // id로 폴더 단건 조회
    @Test
    public void selectById() {
        BookmarkFolderDTO dto = new BookmarkFolderDTO();
        dto.setMemberId(memberId);
        dto.setFolderName("조회 테스트");
        bookmarkFolderMapper.insert(dto);

        Optional<BookmarkFolderDTO> result = bookmarkFolderMapper.selectById(dto.getId());

        log.info("selectById 결과 — {}", result.orElse(null));
        assertThat(result).isPresent();
        assertThat(result.get().getFolderName()).isEqualTo("조회 테스트");
    }

    // 회원의 폴더 목록 조회
    @Test
    public void selectAllByMemberId() {
        BookmarkFolderDTO folder1 = new BookmarkFolderDTO();
        folder1.setMemberId(memberId);
        folder1.setFolderName("폴더1");
        bookmarkFolderMapper.insert(folder1);

        BookmarkFolderDTO folder2 = new BookmarkFolderDTO();
        folder2.setMemberId(memberId);
        folder2.setFolderName("폴더2");
        bookmarkFolderMapper.insert(folder2);

        List<BookmarkFolderDTO> result = bookmarkFolderMapper.selectAllByMemberId(memberId);

        log.info("selectAllByMemberId 결과 — size: {}", result.size());
        result.forEach(f -> log.info("  folder: id={}, name={}", f.getId(), f.getFolderName()));
        assertThat(result).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    public void selectAllByMemberIdCountsNewsBookmarks() {
        BookmarkFolderDTO folder = new BookmarkFolderDTO();
        folder.setMemberId(memberId);
        folder.setFolderName("뉴스 포함 폴더");
        bookmarkFolderMapper.insert(folder);

        jdbcTemplate.update(
                "insert into tbl_news (admin_id, news_title, news_content, news_source_url, news_category, news_type, published_at) " +
                        "values (?, ?, ?, ?, 'trade'::news_category_type, 'general'::news_type, now())",
                memberId, "폴더 카운트 뉴스", "뉴스 내용", "https://example.com/news-folder-count"
        );
        Long newsId = jdbcTemplate.queryForObject(
                "select id from tbl_news where news_title = ? order by id desc limit 1",
                Long.class,
                "폴더 카운트 뉴스"
        );
        jdbcTemplate.update(
                "insert into tbl_news_bookmark (member_id, news_id, folder_id) values (?, ?, ?)",
                memberId, newsId, folder.getId()
        );

        List<BookmarkFolderDTO> result = bookmarkFolderMapper.selectAllByMemberId(memberId);

        BookmarkFolderDTO savedFolder = result.stream()
                .filter(f -> f.getId().equals(folder.getId()))
                .findFirst()
                .orElseThrow();
        assertThat(savedFolder.getBookmarkCount()).isEqualTo(1);
    }
}
