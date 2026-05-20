package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.exception.AdvertisementNotFoundException;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.AdSearch;
import com.app.globalgates.domain.AdvertisementVO;
import com.app.globalgates.dto.AdWithPagingDTO;
import com.app.globalgates.dto.AdvertisementDTO;
import com.app.globalgates.dto.FileAdvertisementDTO;
import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.repository.AdvertisementDAO;
import com.app.globalgates.repository.FileAdvertisementDAO;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.util.DateUtils;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@SpringBootTest
@Slf4j
public class AdvertisementServiceTest {
    @Autowired
    private AdvertisementDAO advertisementDAO;
    @Autowired
    private FileDAO fileDAO;
    @Autowired
    private FileAdvertisementDAO fileAdvertisementDAO;


    @Test
    public void testWrite() {
        String path = getTodayPath();

        AdvertisementDTO adDTO = new AdvertisementDTO();
        adDTO.setAdvertiserId(1L);
        adDTO.setTitle("TEST AD 02");
        adDTO.setHeadline("TEST HEADLINE 02");
        adDTO.setDescription("TEST DESCRIPTION 02");
        adDTO.setLandingUrl("https://globalgates.com/ad/ljs");
        adDTO.setBudget(400000);
        adDTO.setImpressionEstimate(2000);
        adDTO.setStartedAt("2026-03-19");
        advertisementDAO.save(adDTO);

        FileDTO fileDTO = new FileDTO();
        fileDTO.setOriginalName("TEST 02");
        fileDTO.setFileName("TEST_IMAGE 02");
        fileDTO.setFilePath("/2026/03/19");
        fileDTO.setFileSize(400L);
        fileDTO.setContentType(FileContentType.IMAGE);
        fileDAO.save(fileDTO);

        FileAdvertisementDTO fileAdDTO = new FileAdvertisementDTO();
        fileAdDTO.setId(fileDTO.getId());
        fileAdDTO.setAdId(adDTO.getId());
        fileAdvertisementDAO.save(fileAdDTO.toFileAdVO());
    }

    @Test
    public void testList() {
        AdSearch search = new AdSearch();
        Long memberId = 1L;
        Criteria criteria = new Criteria(1, advertisementDAO.getTotal(search, memberId));

        AdWithPagingDTO adWithPagingDTO = new AdWithPagingDTO();

        // 이미지 등록
        List<AdvertisementDTO> ads = advertisementDAO.findBySearch(criteria, null, memberId).stream()
                .map(adDTO -> {
                    List<FileAdvertisementDTO> images = new ArrayList<>(fileAdvertisementDAO.findByAdId(adDTO.getId()));
                    if(!images.isEmpty()) {
                        adDTO.setAdImageList(images);

                        List<String> imageUrls = images.stream()
                                .map(FileAdvertisementDTO::getFilePath)
                                .collect(Collectors.toList());
                        adDTO.setImgUrls(imageUrls);
                    };
                    return adDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(ads.size() > criteria.getRowCount());
        adWithPagingDTO.setCriteria(criteria);

        if(criteria.isHasMore()) {
            ads.remove(ads.size() - 1);
        }

        ads.forEach(adDTO -> {
            adDTO.setCreatedDatetime(DateUtils.toRelativeTime(adDTO.getCreatedDatetime()));
        });
        adWithPagingDTO.setAdvertisements(ads);

        log.info("받아온 광고들 : {}", adWithPagingDTO.getAdvertisements());
    }

    @Test
    public void testGetAdvertisementDetail() {
        Long id = 6L;
        AdvertisementDTO adDetail = null;
        AdvertisementVO advertisementVO = advertisementDAO.findById(id).orElseThrow(AdvertisementNotFoundException::new);

        adDetail = toDTO(advertisementVO);

        // 이미지 찾아오기
        List<FileAdvertisementDTO> images = fileAdvertisementDAO.findByAdId(adDetail.getId());
        if (!images.isEmpty()) {
            adDetail.setAdImageList(images);

            List<String> imageUrls = images.stream()
                    .map(FileAdvertisementDTO::getFilePath)
                    .collect(Collectors.toList());
            adDetail.setImgUrls(imageUrls);
        }

        log.info("받아온 광고 상세 정보: {}", adDetail);
    }

    // toDTO
    public AdvertisementDTO toDTO(AdvertisementVO adVO) {
        AdvertisementDTO adDTO = new AdvertisementDTO();
        adDTO.setId(adVO.getId());
        adDTO.setAdvertiserId(adVO.getAdvertiserId());
        adDTO.setTitle(adVO.getTitle());
        adDTO.setHeadline(adVO.getHeadline());
        adDTO.setDescription(adVO.getDescription());
        adDTO.setLandingUrl(adVO.getLandingUrl());
        adDTO.setBudget(adVO.getBudget());
        adDTO.setImpressionEstimate(adVO.getImpressionEstimate());
        adDTO.setReceiptId(adVO.getReceiptId());
        adDTO.setStatus(adVO.getStatus());
        adDTO.setCreatedDatetime(adVO.getCreatedDatetime());
        adDTO.setUpdatedDatetime(adVO.getUpdatedDatetime());

        return adDTO;
    }


    // 오늘자 경로 생성
    public String getTodayPath(){
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }
}
