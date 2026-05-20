package com.app.globalgates.mapper;

import com.app.globalgates.domain.MeetingVO;
import com.app.globalgates.dto.MeetingDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MeetingMapper {

    // 회의 등록
    public void insert(MeetingDTO meetingDTO);

    // 회의 단건 조회
    public List<MeetingDTO> selectByMemberId(Long requesterId);

    // 회의 업데이트
    public void update(MeetingVO meetingVO);

    // 회의 삭제
    public void delete(Long id);

}
