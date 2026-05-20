package com.app.globalgates.mapper;

import com.app.globalgates.domain.FileAdvertisementVO;
import com.app.globalgates.dto.FileAdvertisementDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface FileAdvertisementMapper {
    // 광고 이미지 등록
    public void insert(FileAdvertisementVO fileAdvertisementVO);

    // 광고 id로 광고 이미지 조회
    public List<FileAdvertisementDTO> selectById(Long adId);

    // 광고 이미지 삭제
    public void delete(Long id);

    // 광고 id로 삭제
    public void deleteByAdId(Long adId);
}
