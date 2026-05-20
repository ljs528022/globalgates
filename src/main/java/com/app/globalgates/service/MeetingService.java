package com.app.globalgates.service;

import com.app.globalgates.domain.MeetingVO;
import com.app.globalgates.dto.FileRecodingDTO;
import com.app.globalgates.dto.MeetingDTO;
import com.app.globalgates.repository.FileRecodingDAO;
import com.app.globalgates.repository.MeetingDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MeetingService {
    private final MeetingDAO meetingDAO;
    private final FileRecodingDAO fileRecodingDAO;

    // 회의 등록
    @Transactional
    public void save(MeetingDTO meetingDTO) {
        meetingDAO.save(meetingDTO);
    }

    // 회의 목록 조회
    public List<MeetingDTO> getMeetingInfo(Long requesterId) {
        return meetingDAO.getMeeting(requesterId);
    }

    // 회의 수정
    @Transactional
    public void update(Long id, String title, String content) {
        MeetingDTO meetingDTO = new MeetingDTO();
        meetingDTO.setId(id);
        meetingDTO.setTitle(title);
        meetingDTO.setContent(content);

        meetingDAO.update(meetingDTO.toVO());
    }

    // 회의 삭제
    public void delete(Long id) {
        meetingDAO.delete(id);
    }

    public MeetingDTO toDTO(MeetingVO meetingVO) {
        MeetingDTO meetingDTO = new MeetingDTO();
        meetingDTO.setId(meetingVO.getId());
        meetingDTO.setRequesterId(meetingVO.getRequesterId());
        meetingDTO.setAcceptorId(meetingVO.getAcceptorId());
        meetingDTO.setTitle(meetingVO.getTitle());
        meetingDTO.setContent(meetingVO.getContent());
        meetingDTO.setCreatedDatetime(meetingVO.getCreatedDatetime());
        meetingDTO.setUpdatedDatetime(meetingVO.getUpdatedDatetime());

        return meetingDTO;
    }
}
