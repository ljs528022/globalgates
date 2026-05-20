package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.AdSearch;
import com.app.globalgates.domain.AdvertisementVO;
import com.app.globalgates.dto.AdvertisementDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;

@SpringBootTest
@Slf4j
public class    AdvertisementMapperTests {
    @Autowired
    private AdvertisementMapper advertisementMapper;

    @Test
    public void insertTest() {
        AdvertisementDTO adDTO = new AdvertisementDTO();

        adDTO.setAdvertiserId(1L);
        adDTO.setTitle("친환경 담요 OEM 상담");
        adDTO.setHeadline("해외 바이어 맞춤 생산 가능");
        adDTO.setDescription("소량 MOQ부터 대량 생산까지 대응하며 샘플 발송과 맞춤 라벨링이 가능합니다. 해외 바이어 문의에 빠르게 응답합니다.");
        adDTO.setLandingUrl("https://globalgates.com/store/yunchan");
        adDTO.setBudget(300000);
        adDTO.setImpressionEstimate(1500);
        adDTO.setStartedAt("2026-03-15");

        advertisementMapper.insert(adDTO);
    }

    @Test
    public void testSelectWithSearchAndFilter() {
        AdSearch search = new AdSearch();
        Long memberId = 1L;
        Criteria criteria = new Criteria(1, advertisementMapper.selectTotal(search, memberId));

        List<AdvertisementDTO> foundAds = advertisementMapper.selectBySearch(criteria, search, memberId);
        log.info("검색된 광고 : {}", foundAds);
        log.info("검색된 모든 광고 수: {}", advertisementMapper.selectTotal(search, memberId));
    }

    @Test
    public void testSelectById() {
        Optional<AdvertisementVO> foundAd = advertisementMapper.selectById(12L);
        log.info("조회한 광고 상세: {}", foundAd);
    }
}
