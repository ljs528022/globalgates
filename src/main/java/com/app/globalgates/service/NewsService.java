package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.dto.NewsDTO;
import com.app.globalgates.repository.NewsDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NewsService {
    private final NewsDAO newsDAO;

    //    뉴스 전체 조회
    @LogStatusWithReturn
    @Cacheable(value = "news:list", key = "'all'")
    public List<NewsDTO> getNewsList() {
        return newsDAO.findAll();
    }

    //    뉴스 단건 조회
    @LogStatusWithReturn
    @Cacheable(value = "news", key = "#id")
    public Optional<NewsDTO> getNews(Long id) {
        return newsDAO.findById(id);
    }

    //    메인 사이드바용 최신 뉴스 2개 조회
    @Cacheable(value = "news:list", key = "'latest:main'")
    @LogStatusWithReturn
    public List<NewsDTO> getLatestNewsInMain() {
        return newsDAO.findLatestInMain();
    }

}
