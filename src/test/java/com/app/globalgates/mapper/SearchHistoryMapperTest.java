package com.app.globalgates.mapper;

import com.app.globalgates.dto.SearchHistoryDTO;
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
class SearchHistoryMapperTest {

    @Autowired
    private SearchHistoryMapper searchHistoryMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long memberId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update(
                "insert into tbl_member (member_email, member_password, member_nickname, member_handle) values (?, ?, ?, ?) on conflict (member_email) do nothing",
                "searchtest@test.com", "password123", "검색테스트", "searchtester"
        );
        memberId = jdbcTemplate.queryForObject(
                "select id from tbl_member where member_email = ?", Long.class, "searchtest@test.com"
        );

        log.info("setUp 완료 — memberId: {}", memberId);
    }

    @Test
    void insert() {
        SearchHistoryDTO dto = new SearchHistoryDTO();
        dto.setMemberId(memberId);
        dto.setSearchKeyword("반도체");

        searchHistoryMapper.insert(dto);

        log.info("insert 결과 — id: {}", dto.getId());
        assertThat(dto.getId()).isNotNull();
    }

    @Test
    void selectAllByMemberId() {
        SearchHistoryDTO dto1 = new SearchHistoryDTO();
        dto1.setMemberId(memberId);
        dto1.setSearchKeyword("반도체");
        searchHistoryMapper.insert(dto1);

        SearchHistoryDTO dto2 = new SearchHistoryDTO();
        dto2.setMemberId(memberId);
        dto2.setSearchKeyword("수출");
        searchHistoryMapper.insert(dto2);

        List<SearchHistoryDTO> result = searchHistoryMapper.selectAllByMemberId(memberId);

        log.info("selectAllByMemberId 결과 — size: {}", result.size());
        result.forEach(s -> log.info("  search: {}", s));
        assertThat(result).hasSize(2);
    }

    @Test
    void selectByMemberIdAndKeyword() {
        SearchHistoryDTO dto = new SearchHistoryDTO();
        dto.setMemberId(memberId);
        dto.setSearchKeyword("FTA");
        searchHistoryMapper.insert(dto);

        Optional<SearchHistoryDTO> result = searchHistoryMapper.selectByMemberIdAndKeyword(memberId, "FTA");

        log.info("selectByMemberIdAndKeyword 결과 — {}", result.orElse(null));
        assertThat(result).isPresent();
        assertThat(result.get().getSearchKeyword()).isEqualTo("FTA");
    }

    @Test
    void updateSearchCount() {
        SearchHistoryDTO dto = new SearchHistoryDTO();
        dto.setMemberId(memberId);
        dto.setSearchKeyword("환율");
        searchHistoryMapper.insert(dto);

        searchHistoryMapper.updateSearchCount(memberId, "환율");

        Optional<SearchHistoryDTO> result = searchHistoryMapper.selectByMemberIdAndKeyword(memberId, "환율");
        log.info("updateSearchCount 결과 — searchCount: {}", result.get().getSearchCount());
        assertThat(result.get().getSearchCount()).isEqualTo(2);
    }

    @Test
    void delete() {
        SearchHistoryDTO dto = new SearchHistoryDTO();
        dto.setMemberId(memberId);
        dto.setSearchKeyword("삭제테스트");
        searchHistoryMapper.insert(dto);
        log.info("삭제 전 — id: {}", dto.getId());

        searchHistoryMapper.delete(dto.getId());

        Optional<SearchHistoryDTO> result = searchHistoryMapper.selectByMemberIdAndKeyword(memberId, "삭제테스트");
        log.info("삭제 후 조회 — present: {}", result.isPresent());
        assertThat(result).isEmpty();
    }

    @Test
    void deleteAllByMemberId() {
        SearchHistoryDTO dto1 = new SearchHistoryDTO();
        dto1.setMemberId(memberId);
        dto1.setSearchKeyword("전체삭제1");
        searchHistoryMapper.insert(dto1);

        SearchHistoryDTO dto2 = new SearchHistoryDTO();
        dto2.setMemberId(memberId);
        dto2.setSearchKeyword("전체삭제2");
        searchHistoryMapper.insert(dto2);

        searchHistoryMapper.deleteAllByMemberId(memberId);

        List<SearchHistoryDTO> result = searchHistoryMapper.selectAllByMemberId(memberId);
        log.info("전체 삭제 후 — size: {}", result.size());
        assertThat(result).isEmpty();
    }
}
