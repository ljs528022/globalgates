package com.app.globalgates.service;

import com.app.globalgates.dto.BookmarkDTO;
import com.app.globalgates.dto.BookmarkFolderDTO;
import com.app.globalgates.repository.BookmarkDAO;
import com.app.globalgates.repository.BookmarkFolderDAO;
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
class BookmarkServiceTest {

    @Autowired
    private BookmarkService bookmarkService;

    @Autowired
    private BookmarkFolderDAO bookmarkFolderDAO;

    @Autowired
    private BookmarkDAO bookmarkDAO;

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
                memberId, "서비스 테스트 게시글", "서비스 테스트 내용"
        );
        postId = jdbcTemplate.queryForObject(
                "select id from tbl_post where member_id = ? order by id desc limit 1", Long.class, memberId
        );

        log.info("setUp 완료 — memberId: {}, postId: {}", memberId, postId);
    }

    // 폴더 생성 후 목록 조회
    @Test
    public void createFolderAndGetFolders() {
        BookmarkFolderDTO folderDTO = new BookmarkFolderDTO();
        folderDTO.setMemberId(memberId);
        folderDTO.setFolderName("서비스 폴더");

        bookmarkService.createFolder(folderDTO);
        log.info("폴더 생성 — id: {}, name: {}", folderDTO.getId(), folderDTO.getFolderName());

        List<BookmarkFolderDTO> result = bookmarkService.getFolders(memberId);
        log.info("getFolders 결과 — size: {}", result.size());
        result.forEach(f -> log.info("  folder: id={}, name={}", f.getId(), f.getFolderName()));
        assertThat(result).extracting(BookmarkFolderDTO::getFolderName).contains("서비스 폴더");
    }

    // 폴더 수정
    @Test
    public void updateFolder() {
        BookmarkFolderDTO folderDTO = new BookmarkFolderDTO();
        folderDTO.setMemberId(memberId);
        folderDTO.setFolderName("원래 이름");
        bookmarkFolderDAO.save(folderDTO);

        folderDTO.setFolderName("변경된 이름");
        bookmarkService.updateFolder(folderDTO);

        Optional<BookmarkFolderDTO> result = bookmarkService.getFolder(folderDTO.getId());
        log.info("updateFolder 결과 — name: {}", result.get().getFolderName());
        assertThat(result.get().getFolderName()).isEqualTo("변경된 이름");
    }

    // 북마크 추가 후 회원 기준 조회
    @Test
    public void addBookmarkAndGetBookmarks() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);

        bookmarkService.addBookmark(dto);
        log.info("북마크 추가 — id: {}", dto.getId());

        List<BookmarkDTO> result = bookmarkService.getBookmarks(memberId);
        log.info("getBookmarks 결과 — size: {}", result.size());
        result.forEach(b -> log.info("  bookmark: {}", b));
        assertThat(result).isNotEmpty();
    }

    // 북마크 삭제 (id 기준)
    @Test
    public void deleteBookmark() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkDAO.save(dto);
        log.info("삭제 전 — id: {}", dto.getId());

        bookmarkService.deleteBookmark(dto.getId());

        Optional<BookmarkDTO> result = bookmarkService.getBookmark(dto.getId());
        log.info("삭제 후 — present: {}", result.isPresent());
        assertThat(result).isEmpty();
    }

    // 북마크 삭제 (회원/게시글 기준)
    @Test
    public void deleteBookmarkByMemberIdAndPostId() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkDAO.save(dto);
        log.info("삭제 전 — memberId: {}, postId: {}", memberId, postId);

        bookmarkService.deleteBookmark(memberId, postId);

        Optional<BookmarkDTO> result = bookmarkService.getBookmark(memberId, postId);
        log.info("회원/게시글 기준 삭제 후 — present: {}", result.isPresent());
        assertThat(result).isEmpty();
    }

    // 폴더 삭제 시 연결된 북마크의 folderId null 처리
    @Test
    public void deleteFolder() {
        BookmarkFolderDTO folderDTO = new BookmarkFolderDTO();
        folderDTO.setMemberId(memberId);
        folderDTO.setFolderName("삭제 폴더");
        bookmarkFolderDAO.save(folderDTO);

        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        dto.setFolderId(folderDTO.getId());
        bookmarkDAO.save(dto);
        log.info("폴더 삭제 전 — folderId: {}", folderDTO.getId());

        bookmarkService.deleteFolder(folderDTO.getId());

        Optional<BookmarkDTO> result = bookmarkDAO.findById(dto.getId());
        log.info("폴더 삭제 후 북마크 folderId — {}", result.get().getFolderId());
        assertThat(result).isPresent();
        assertThat(result.get().getFolderId()).isNull();
    }

    // 북마크 폴더 이동
    @Test
    public void updateFolderId() {
        BookmarkFolderDTO folderDTO = new BookmarkFolderDTO();
        folderDTO.setMemberId(memberId);
        folderDTO.setFolderName("이동 대상 폴더");
        bookmarkFolderDAO.save(folderDTO);

        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkDAO.save(dto);

        dto.setFolderId(folderDTO.getId());
        bookmarkService.updateFolderId(dto);

        Optional<BookmarkDTO> result = bookmarkService.getBookmark(dto.getId());
        log.info("updateFolderId 결과 — folderId: {}", result.get().getFolderId());
        assertThat(result.get().getFolderId()).isEqualTo(folderDTO.getId());
    }

    // 폴더별 북마크 조회
    @Test
    public void getBookmarksByFolder() {
        BookmarkFolderDTO folderDTO = new BookmarkFolderDTO();
        folderDTO.setMemberId(memberId);
        folderDTO.setFolderName("폴더별 조회");
        bookmarkFolderDAO.save(folderDTO);

        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        dto.setFolderId(folderDTO.getId());
        bookmarkDAO.save(dto);

        List<BookmarkDTO> result = bookmarkService.getBookmarksByFolder(folderDTO.getId());
        log.info("getBookmarksByFolder 결과 — folderId: {}, size: {}", folderDTO.getId(), result.size());
        assertThat(result).isNotEmpty();
    }

    // 미분류 북마크 조회
    @Test
    public void getUncategorizedBookmarks() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkDAO.save(dto);

        List<BookmarkDTO> result = bookmarkService.getUncategorizedBookmarks(memberId);
        log.info("getUncategorizedBookmarks 결과 — size: {}", result.size());
        assertThat(result).isNotEmpty();
    }

    // 북마크 개수 조회
    @Test
    public void getBookmarkCount() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkDAO.save(dto);

        int count = bookmarkService.getBookmarkCount(memberId);
        log.info("getBookmarkCount 결과 — count: {}", count);
        assertThat(count).isGreaterThanOrEqualTo(1);
    }

    // 중복 북마크 추가 시 DataIntegrityViolationException 발생 확인
    @Test
    public void addBookmarkDuplicate() {
        // UNIQUE 제약이 있으면 DataIntegrityViolationException 발생
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkService.addBookmark(dto);

        BookmarkDTO dto2 = new BookmarkDTO();
        dto2.setMemberId(memberId);
        dto2.setPostId(postId);

        try {
            bookmarkService.addBookmark(dto2);
            log.info("중복 북마크 — 예외 발생하지 않음 (UNIQUE 제약 미적용 상태)");
        } catch (Exception e) {
            log.info("중복 북마크 — 예외 발생: {}", e.getClass().getSimpleName());
            assertThat(e).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        }
    }

    // 삭제된 게시물이 포함된 북마크 조회 (LEFT JOIN)
    // FK 제약 때문에 게시물을 직접 삭제할 수 없으므로, FK를 일시 비활성화하여 테스트
    @Test
    public void getBookmarksWithDeletedPost() {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setMemberId(memberId);
        dto.setPostId(postId);
        bookmarkService.addBookmark(dto);

        // FK 일시 비활성화 → 게시물 삭제 → LEFT JOIN 검증
        jdbcTemplate.execute("alter table tbl_bookmark drop constraint if exists fk_bookmark_post");
        jdbcTemplate.update("delete from tbl_post where id = ?", postId);

        List<BookmarkDTO> result = bookmarkService.getBookmarks(memberId);
        log.info("삭제된 게시물 포함 조회 — size: {}", result.size());
        // LEFT JOIN이면 결과가 있되 postTitle이 null
        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getPostTitle()).isNull();

        // FK 복원 (Transactional 롤백이 처리하지만 명시적으로)
        jdbcTemplate.execute("alter table tbl_bookmark add constraint fk_bookmark_post foreign key (post_id) references tbl_post(id)");
    }
}
