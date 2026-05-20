package com.app.globalgates.mapper;

import com.app.globalgates.domain.FileVO;
import com.app.globalgates.dto.FileDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface FileMapper {
    // 파일 저장
    public void insert(FileDTO fileDTO);

    // 파일 조회
    public Optional<FileVO> selectById(Long id);

    // 파일 삭제
    public void delete(Long id);
}
