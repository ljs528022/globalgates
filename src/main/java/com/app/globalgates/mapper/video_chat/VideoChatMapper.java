package com.app.globalgates.mapper.video_chat;

import com.app.globalgates.domain.video_chat.VideoChatVO;
import com.app.globalgates.domain.video_chat.VideoSessionListVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface VideoChatMapper {
//    채팅방이 있는지 조회
    public Optional<VideoChatVO> selectSession(@Param("conversationId") Long conversationId);
//    채팅방 생성
    public void insertVideoSession(VideoChatVO videoChatVO);
//    채팅방 통화 종료 반영 — owner(caller/receiver) 검증을 update 한 번에. 반환값은 affected rows
    public int updateSessionEnd(@Param("conversationId") Long conversationId,
                                @Param("memberId") Long memberId);
//    본인(caller_id) 의 화상회의 목록 + 요약 (LEFT JOIN)
    public List<VideoSessionListVO> selectSessionsByCallerId(@Param("callerId") Long callerId);

}
