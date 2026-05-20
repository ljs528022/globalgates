package com.app.globalgates.mapper;

import com.app.globalgates.dto.RankedSearchHistoryDTO;
import com.app.globalgates.dto.SearchHistoryDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SearchHistoryMapper {
//    검색 기록 저장
    public void insert(SearchHistoryDTO searchHistoryDTO);

//    검색 횟수 증가
    public void updateSearchCount(@Param("memberId") Long memberId, @Param("searchKeyword") String searchKeyword);

//    개별 삭제
    public void delete(Long id);

//    회원 전체 삭제
    public void deleteAllByMemberId(Long memberId);

//    회원의 최근 검색 목록 조회
    public List<SearchHistoryDTO> selectAllByMemberId(Long memberId);

//    연관 검색어 목록 조회
    public List<SearchHistoryDTO> selectByKeyword(String keyword);

//    중복 검색어 조회
    public Optional<SearchHistoryDTO> selectByMemberIdAndKeyword(@Param("memberId") Long memberId, @Param("searchKeyword") String searchKeyword);

//    검색어 검색 횟수에 따른 순위 조회
    public List<RankedSearchHistoryDTO> selectSearchHistoryWithRank();
}
