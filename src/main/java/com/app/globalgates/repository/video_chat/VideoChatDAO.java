package com.app.globalgates.repository.video_chat;

import com.app.globalgates.domain.video_chat.VideoChatVO;
import com.app.globalgates.domain.video_chat.VideoSessionListVO;
import com.app.globalgates.mapper.video_chat.VideoChatMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class VideoChatDAO {
    private final VideoChatMapper videoChatMapper;

    //    채팅방이 있는지 조회
    public Optional<VideoChatVO> findSession(Long conversationId) {
        return videoChatMapper.selectSession(conversationId);
    };
    //    채팅방 생성
    public void saveVideoSession(VideoChatVO videoChatVO) {
        videoChatMapper.insertVideoSession(videoChatVO);
    };
    //    채팅방 통화 종료 반영 — affected rows 반환 (0 이면 권한 없음 / 세션 없음)
    public int updateSessionEnd(Long conversationId, Long memberId) {
        return videoChatMapper.updateSessionEnd(conversationId, memberId);
    };
    //    내(caller_id) 화상회의 목록 + 요약 LEFT JOIN
    public List<VideoSessionListVO> findSessionsByCallerId(Long callerId) {
        return videoChatMapper.selectSessionsByCallerId(callerId);
    };
}
