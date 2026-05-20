package com.app.globalgates.repository;

import com.app.globalgates.domain.FileVO;
import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.mapper.FileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class FileDAO {
    private final FileMapper fileMapper;

    // 파일 등록
    public void save(FileDTO fileDTO) {
        fileMapper.insert(fileDTO);
    }

    // 파일 조회
    public Optional<FileVO> findById(Long id) {
        return fileMapper.selectById(id);
    }

    // 파일 삭제
    public void delete(Long id) {
        fileMapper.delete(id);
    }
}
