package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.RankedSearchHistoryDTO;
import com.app.globalgates.dto.SearchHistoryDTO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.SearchHistoryDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class SearchService {
    private final SearchHistoryDAO searchHistoryDAO;
    private final MemberDAO memberDAO;

//    검색 기록 저장 (중복이면 횟수 증가, 없으면 새로 저장)
    @LogStatus
    @CacheEvict(value = "search:top10", allEntries = true)
    public void saveSearchHistory(SearchHistoryDTO searchHistoryDTO) {
        searchHistoryDAO.findByMemberIdAndKeyword(searchHistoryDTO.getMemberId(), searchHistoryDTO.getSearchKeyword())
                .ifPresentOrElse(
                        existing -> searchHistoryDAO.updateSearchCount(searchHistoryDTO.getMemberId(), searchHistoryDTO.getSearchKeyword()),
                        () -> searchHistoryDAO.save(searchHistoryDTO)
                );
    }

//    최근 검색 목록 조회
    @LogStatusWithReturn
    public List<SearchHistoryDTO> getSearchHistories(Long memberId) {
        return searchHistoryDAO.findAllByMemberId(memberId);
    }

//    관련 검색어들 조회
    @LogStatusWithReturn
    public List<SearchHistoryDTO> getSuggestions(String keyword) {
        return searchHistoryDAO.findByKeyword(keyword);
    }

//    검색 기록 개별 삭제
    @LogStatus
    public void deleteSearchHistory(Long id) {
        searchHistoryDAO.delete(id);
    }

//    검색 기록 전체 삭제
    @LogStatus
    public void deleteAllSearchHistories(Long memberId) {
        searchHistoryDAO.deleteAllByMemberId(memberId);
    }

//    회원 검색 (닉네임 또는 핸들)
    @LogStatusWithReturn
    public List<MemberDTO> searchMembers(String keyword) {
        return memberDAO.findMembersByKeyword(keyword);
    }

//    실시간 검색어 조회
    @Cacheable(value="search:top10", key="'all'")
    @LogStatusWithReturn
    public List<RankedSearchHistoryDTO> getTop10Histories() {
        return searchHistoryDAO.findTop10Histories();
    }
}
