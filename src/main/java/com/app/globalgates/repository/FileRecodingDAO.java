package com.app.globalgates.repository;

import com.app.globalgates.domain.FileRecodingVO;
import com.app.globalgates.dto.FileRecodingDTO;
import com.app.globalgates.mapper.FileRecodingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class FileRecodingDAO {
    private final FileRecodingMapper fileRecodingMapper;

    // 녹음 파일 등록
    public void save(FileRecodingVO fileRecodingVO) {
        fileRecodingMapper.insert(fileRecodingVO);
    };

    // 회의 id로 녹음파일 조회
    public FileRecodingDTO findByMeetingId(Long meetingId) {
        return fileRecodingMapper.selectByMeetingId(meetingId);
    }
}
