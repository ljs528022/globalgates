package com.app.globalgates.repository;

import com.app.globalgates.dto.RankedSearchHistoryDTO;
import com.app.globalgates.dto.SearchHistoryDTO;
import com.app.globalgates.mapper.SearchHistoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class SearchHistoryDAO {
    private final SearchHistoryMapper searchHistoryMapper;

//    저장
    public void save(SearchHistoryDTO searchHistoryDTO) {
        searchHistoryMapper.insert(searchHistoryDTO);
    }

//    검색 횟수 증가
    public void updateSearchCount(Long memberId, String searchKeyword) {
        searchHistoryMapper.updateSearchCount(memberId, searchKeyword);
    }

//    개별 삭제
    public void delete(Long id) {
        searchHistoryMapper.delete(id);
    }

//    회원 전체 삭제
    public void deleteAllByMemberId(Long memberId) {
        searchHistoryMapper.deleteAllByMemberId(memberId);
    }

//    회원의 최근 검색 목록 조회
    public List<SearchHistoryDTO> findAllByMemberId(Long memberId) {
        return searchHistoryMapper.selectAllByMemberId(memberId);
    }

//    연관 검색어 목록 조회
    public List<SearchHistoryDTO> findByKeyword(String keyword) {
        return searchHistoryMapper.selectByKeyword(keyword);
    }

//    중복 검색어 조회
    public Optional<SearchHistoryDTO> findByMemberIdAndKeyword(Long memberId, String searchKeyword) {
        return searchHistoryMapper.selectByMemberIdAndKeyword(memberId, searchKeyword);
    }

//    실시간 검색어 조회
    public List<RankedSearchHistoryDTO> findTop10Histories() {
        return searchHistoryMapper.selectSearchHistoryWithRank();
    }
}
