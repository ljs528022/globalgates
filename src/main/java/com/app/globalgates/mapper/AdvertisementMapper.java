package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.AdSearch;
import com.app.globalgates.domain.AdvertisementVO;
import com.app.globalgates.dto.AdvertisementDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface AdvertisementMapper {
    // 광고 등록
    public void insert(AdvertisementDTO advertisementDTO);

    // 광고 페이지 조회 (메인 피드)
    public List<AdvertisementDTO> selectAllForMain(@Param("count") int count, @Param("offset") int offset);

    // 광고 검색 조회
    public List<AdvertisementDTO> selectBySearch(@Param("criteria") Criteria criteria, @Param("search") AdSearch search, @Param("memberId") Long memberId);

    // 광고 전체 개수
    public int selectTotal(@Param("search") AdSearch search, @Param("memberId")Long memberId);

    // id로 광고 상세 조회
    public Optional<AdvertisementVO> selectById(Long id);

    // 광고 삭제
    public void delete(Long id);
}
