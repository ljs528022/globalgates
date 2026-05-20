package com.app.globalgates.service.video_chat;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.domain.FileRecodingVO;
import com.app.globalgates.domain.video_chat.VideoChatVO;
import com.app.globalgates.domain.video_chat.VideoSessionListVO;
import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.dto.FileRecodingDTO;
import com.app.globalgates.dto.MeetingDTO;
import com.app.globalgates.dto.chat.ChatRoomDTO;
import com.app.globalgates.dto.video_chat.VideoChatDTO;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.repository.FileRecodingDAO;
import com.app.globalgates.repository.chat.ChatRoomDAO;
import com.app.globalgates.repository.video_chat.VideoChatDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoChatService {
    private final VideoChatDAO videoChatDAO;
    private final FileDAO fileDAO;
    private final FileRecodingDAO fileRecodingDAO;

    @Transactional
    @LogStatusWithReturn
    public VideoChatDTO getOrCreateSession(Long conversationId, Long callerId, Long receiverId) {
        Optional<VideoChatVO> optSession  =  videoChatDAO.findSession(conversationId);
        VideoChatVO session;

        if (optSession.isPresent()) {
            // 기존 세션 꺼내기
            session = optSession.get();
        } else {
            // 새 세션 생성
            VideoChatVO newSession = VideoChatVO.builder()
                    .conversationId(conversationId)
                    .callerId(callerId)
                    .receiverId(receiverId)
                    .build();

            videoChatDAO.saveVideoSession(newSession);
            session = newSession;
        }

        return toDTO(session);
    }

    // 녹음 파일 서버에 등록
    @Transactional
    @LogStatus
    public void saveRecodingFile(MeetingDTO meetingDTO, MultipartFile file, String s3Key) {
        FileDTO fileDTO = new FileDTO();
        fileDTO.setOriginalName(file.getOriginalFilename());
        fileDTO.setFileName(s3Key.substring(s3Key.lastIndexOf("/") + 1));
        fileDTO.setFilePath(s3Key);
        fileDTO.setFileSize(file.getSize());
        fileDTO.setContentType(file.getContentType().contains("audio")
                ? FileContentType.AUDIO : FileContentType.ETC);
        fileDAO.save(fileDTO);

        FileRecodingDTO fileRecodingDTO = new FileRecodingDTO();
        fileRecodingDTO.setId(fileDTO.getId());
        fileRecodingDTO.setMeetingId(meetingDTO.getId());
        fileRecodingDTO.setRecodingTime(meetingDTO.getMeetingDurationTime());
        fileRecodingDAO.save(fileRecodingDTO.toFileRecodingVO());
    }

    // 회의 id로 해당 회의의 녹음 파일 조회
    @LogStatusWithReturn
    public FileRecodingDTO getRecodingFile(Long meetingId) {
        return fileRecodingDAO.findByMeetingId(meetingId);
    }

    @Transactional
    @LogStatusWithReturn
    public int endSession(Long conversationId, Long memberId) {
        return videoChatDAO.updateSessionEnd(conversationId, memberId);
    }

    // 본인(caller_id) 의 화상회의 목록 + 요약 조회 — video_ai 위젯에서 사용
    @LogStatusWithReturn
    public List<VideoSessionListVO> getMySessions(Long callerId) {
        return videoChatDAO.findSessionsByCallerId(callerId);
    }

    // toDTO
    public VideoChatDTO toDTO (VideoChatVO videoChatVO) {
        return VideoChatDTO.builder()
                .id(videoChatVO.getId())
                .conversationId(videoChatVO.getConversationId())
                .callerId(videoChatVO.getCallerId())
                .receiverId(videoChatVO.getReceiverId())
                .startedAt(videoChatVO.getStartedAt())
                .endedAt(videoChatVO.getEndedAt())
                .durationSec(videoChatVO.getDurationSec())
                .createdDatetime(videoChatVO.getCreatedDatetime())
                .build();
    }
}
