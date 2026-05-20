package com.app.globalgates.controller.video_chat;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.MeetingDTO;
import com.app.globalgates.dto.video_chat.VideoChatDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Tag(name = "VideoChat", description = "화상채팅 API")
public interface VideoChatAPIControllerDocs {

    @Operation(
            summary = "화상통화 세션 요청",
            description = "발신자가 수신자에게 화상통화를 요청한다. 채팅방이 없으면 생성하고, 화상 세션을 반환한다.",
            parameters = {
                    @Parameter(name = "userDetails", description = "로그인한 발신자 정보"),
                    @Parameter(name = "videoChatDTO", description = "수신자 ID 등 통화 요청 정보")
            }
    )
    ResponseEntity<?> requestVideoCall(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody VideoChatDTO videoChatDTO
    );

    @Operation(
            summary = "녹화 파일 업로드",
            description = "화상통화 종료 후 녹화 파일과 회의 정보를 함께 등록한다.",
            parameters = {
                    @Parameter(name = "file", description = "녹화된 .webm 파일"),
                    @Parameter(name = "meetingDTO", description = "회의 제목, 참여자 등 회의 정보"),
                    @Parameter(name = "userDetails", description = "로그인한 사용자 정보")
            }
    )
    ResponseEntity<?> uploadRecording(
            @RequestParam("file") MultipartFile file,
            MeetingDTO meetingDTO,
            @AuthenticationPrincipal CustomUserDetails userDetails
    );

    @Operation(
            summary = "내 정보 조회",
            description = "현재 로그인한 사용자의 memberId, memberName, memberHandle을 반환한다."
    )
    ResponseEntity<?> getMyId(@AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "화상통화 거절",
            description = "수신자가 통화 요청을 거절하면 발신자에게 STOMP로 거절 알림을 전송한다.",
            parameters = {
                    @Parameter(name = "userDetails", description = "거절하는 수신자 정보"),
                    @Parameter(name = "body", description = "callerId — 거절 대상 발신자 ID")
            }
    )
    ResponseEntity<?> rejectVideoCall(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> body
    );

    @Operation(
            summary = "화상통화 세션 종료",
            description = "통화가 끝나면 세션 상태를 종료 처리한다. caller/receiver 본인만 종료 가능 (403 otherwise).",
            parameters = {
                    @Parameter(name = "userDetails", description = "로그인한 사용자 정보"),
                    @Parameter(name = "conversationId", description = "종료할 채팅방 ID")
            }
    )
    ResponseEntity<Void> endSession(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam Long conversationId
    );
}
