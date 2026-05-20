package com.app.globalgates.controller;

import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.SearchHistoryDTO;
import com.app.globalgates.repository.SearchHistoryDAO;
import com.app.globalgates.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search-history/**")
@Slf4j
public class SearchHistoryController {
    private final SearchService searchService;

    // 연관 검색어 조회
    @GetMapping("suggestions")
    public ResponseEntity<?> getSuggestions(@AuthenticationPrincipal CustomUserDetails userDetails, String keyword) {
        SearchHistoryDTO suggestion = new SearchHistoryDTO();
        suggestion.setMemberId(userDetails.getId());
        suggestion.setSearchKeyword(keyword);

        // 검색어가 있으면 검색횟수 +1 아니면 새로 저장
        searchService.saveSearchHistory(suggestion);

        // 검색값과 비슷한 모든 검색어 조회
        List<SearchHistoryDTO> suggestions = searchService.getSuggestions(keyword);

        return ResponseEntity.ok(suggestions);
    }

    // 최근 검색어 조회
    @GetMapping("recent-keywords")
    public ResponseEntity<?> getRecentKeywords(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<SearchHistoryDTO> recentKeywords = searchService.getSearchHistories(userDetails.getId());

        return ResponseEntity.ok(recentKeywords);
    }

    // 검색어 하나 삭제
    @DeleteMapping("recent-keywords")
    public ResponseEntity<?> deleteKeyword(Long id) {
        searchService.deleteSearchHistory(id);

        return ResponseEntity.ok("해당 검색어를 삭제했습니다.");
    }

    @DeleteMapping("recent-keywords/all")
    public ResponseEntity<?> deleteAllKeyword(@AuthenticationPrincipal CustomUserDetails userDetails) {
        searchService.deleteAllSearchHistories(userDetails.getId());

        return ResponseEntity.ok("모든 검색어를 삭제했습니다.");
    }


}
