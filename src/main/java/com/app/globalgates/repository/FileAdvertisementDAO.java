package com.app.globalgates.repository;

import com.app.globalgates.domain.FileAdvertisementVO;
import com.app.globalgates.dto.FileAdvertisementDTO;
import com.app.globalgates.mapper.FileAdvertisementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FileAdvertisementDAO {
    private final FileAdvertisementMapper fileAdvertisementMapper;

    // 광고 이미지 등록
    public void save(FileAdvertisementVO fileAdvertisementVO) {
        fileAdvertisementMapper.insert(fileAdvertisementVO);
    }

    // 광고 id로 이미지 조회
    public List<FileAdvertisementDTO> findByAdId(Long adId) {
        return fileAdvertisementMapper.selectById(adId);
    }

    // 광고 이미지 삭제
    public void delete(Long id) {
        fileAdvertisementMapper.delete(id);
    }

    // 광고 id로 삭제
    public void deleteByAdId(Long adId) {
        fileAdvertisementMapper.deleteByAdId(adId);
    }
}
