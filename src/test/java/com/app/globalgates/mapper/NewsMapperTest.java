package com.app.globalgates.mapper;

import com.app.globalgates.dto.NewsDTO;
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
class NewsMapperTest {

    @Autowired
    private NewsMapper newsMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long newsId;

    @BeforeEach
    void setUp() {
        // 테스트용 뉴스 데이터 직접 삽입
        jdbcTemplate.update(
                "insert into tbl_news (news_title, news_content, news_source_url, news_category, news_type, published_at) " +
                        "values (?, ?, ?, 'trade'::news_category_type, 'general'::news_type, now())",
                "테스트 뉴스 제목", "테스트 뉴스 본문 내용입니다.", "https://example.com/news/1"
        );
        newsId = jdbcTemplate.queryForObject(
                "select id from tbl_news order by id desc limit 1", Long.class
        );

        log.info("setUp 완료 — newsId: {}", newsId);
    }

    // 뉴스 전체 조회 (최신순)
    @Test
    public void selectAll() {
        List<NewsDTO> result = newsMapper.selectAll();

        log.info("selectAll 결과 — size: {}", result.size());
        result.forEach(n -> log.info("  news: id={}, title={}, category={}, type={}",
                n.getId(), n.getNewsTitle(), n.getNewsCategory(), n.getNewsType()));
        assertThat(result).isNotEmpty();
    }

    // 뉴스 단건 조회
    @Test
    public void selectById() {
        Optional<NewsDTO> result = newsMapper.selectById(newsId);

        log.info("selectById 결과 — {}", result.orElse(null));
        assertThat(result).isPresent();
        assertThat(result.get().getNewsTitle()).isEqualTo("테스트 뉴스 제목");
        assertThat(result.get().getNewsContent()).isEqualTo("테스트 뉴스 본문 내용입니다.");
        log.info("  title: {}, content: {}, sourceUrl: {}, category: {}, type: {}",
                result.get().getNewsTitle(), result.get().getNewsContent(),
                result.get().getNewsSourceUrl(), result.get().getNewsCategory(), result.get().getNewsType());
    }

    // 존재하지 않는 id 조회 시 빈 Optional 반환
    @Test
    public void selectByIdNotFound() {
        Optional<NewsDTO> result = newsMapper.selectById(999999L);

        log.info("selectById(999999) 결과 — present: {}", result.isPresent());
        assertThat(result).isEmpty();
    }
}
