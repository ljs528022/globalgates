package com.app.globalgates.service;

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
class NewsServiceTest {

    @Autowired
    private NewsService newsService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long newsId1;
    private Long newsId2;

    @BeforeEach
    void setUp() {
        // 테스트용 뉴스 2건 삽입
        jdbcTemplate.update(
                "insert into tbl_news (news_title, news_content, news_source_url, news_category, news_type, published_at) " +
                        "values (?, ?, ?, 'trade'::news_category_type, 'general'::news_type, now())",
                "무역 뉴스 제목", "무역 관련 뉴스 내용입니다.", "https://example.com/trade"
        );
        newsId1 = jdbcTemplate.queryForObject(
                "select id from tbl_news order by id desc limit 1", Long.class
        );

        jdbcTemplate.update(
                "insert into tbl_news (news_title, news_content, news_source_url, news_category, news_type, published_at) " +
                        "values (?, ?, ?, 'market'::news_category_type, 'emergency'::news_type, now())",
                "시장 긴급 뉴스", "시장 동향 긴급 속보입니다.", "https://example.com/market"
        );
        newsId2 = jdbcTemplate.queryForObject(
                "select id from tbl_news order by id desc limit 1", Long.class
        );

        log.info("setUp 완료 — newsId1: {}, newsId2: {}", newsId1, newsId2);
    }

    // 뉴스 전체 목록 조회
    @Test
    public void getNewsList() {
        List<NewsDTO> result = newsService.getNewsList();

        log.info("getNewsList 결과 — size: {}", result.size());
        result.forEach(n -> log.info("  news: id={}, title={}, category={}, type={}",
                n.getId(), n.getNewsTitle(), n.getNewsCategory(), n.getNewsType()));
        assertThat(result).hasSizeGreaterThanOrEqualTo(2);
    }

    // 뉴스 단건 조회
    @Test
    public void getNews() {
        Optional<NewsDTO> result = newsService.getNews(newsId1);

        log.info("getNews 결과 — {}", result.orElse(null));
        assertThat(result).isPresent();
        assertThat(result.get().getNewsTitle()).isEqualTo("무역 뉴스 제목");
        assertThat(result.get().getNewsCategory().getValue()).isEqualTo("trade");
        log.info("  title: {}, category: {}, type: {}, sourceUrl: {}",
                result.get().getNewsTitle(), result.get().getNewsCategory(),
                result.get().getNewsType(), result.get().getNewsSourceUrl());
    }

    // 긴급 뉴스 타입 조회 확인
    @Test
    public void getNewsEmergencyType() {
        Optional<NewsDTO> result = newsService.getNews(newsId2);

        log.info("긴급 뉴스 조회 — {}", result.orElse(null));
        assertThat(result).isPresent();
        assertThat(result.get().getNewsType().getValue()).isEqualTo("emergency");
        assertThat(result.get().getNewsCategory().getValue()).isEqualTo("market");
        log.info("  title: {}, type: {}, category: {}",
                result.get().getNewsTitle(), result.get().getNewsType(), result.get().getNewsCategory());
    }

    // 존재하지 않는 뉴스 조회
    @Test
    public void getNewsNotFound() {
        Optional<NewsDTO> result = newsService.getNews(999999L);

        log.info("getNews(999999) 결과 — present: {}", result.isPresent());
        assertThat(result).isEmpty();
    }
}
