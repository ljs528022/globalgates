package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.AdSearch;
import com.app.globalgates.domain.AdvertisementVO;
import com.app.globalgates.dto.AdvertisementDTO;
import com.app.globalgates.mapper.AdvertisementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AdvertisementDAO {
    private final AdvertisementMapper advertisementMapper;

    // 광고 등록
    public void save(AdvertisementDTO advertisementDTO) {
        advertisementMapper.insert(advertisementDTO);
    }

    // 광고 페이지 조회 (메인 피드)
    public List<AdvertisementDTO> findAllForMain(int count, int offset) {
        return advertisementMapper.selectAllForMain(count, offset);
    }

    // 광고 검색 조회
    public List<AdvertisementDTO> findBySearch(Criteria criteria, AdSearch search, Long memberId) {
        return advertisementMapper.selectBySearch(criteria, search, memberId);
    }

    // 검색된 광고 개수
    public int getTotal(AdSearch search, Long memberId) {
        return advertisementMapper.selectTotal(search, memberId);
    }

    // id로 광고 상세 조회
    public Optional<AdvertisementVO> findById(Long id) {
        return advertisementMapper.selectById(id);
    }

    // 광고 삭제
    public void delete(Long id) {
        advertisementMapper.delete(id);
    }
}
