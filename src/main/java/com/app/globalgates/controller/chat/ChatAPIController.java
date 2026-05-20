package com.app.globalgates.controller.chat;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.domain.FileVO;
import com.app.globalgates.dto.chat.ChatMessageDTO;
import com.app.globalgates.dto.chat.ChatReadReceiptDTO;
import com.app.globalgates.dto.chat.ChatRoomDTO;
import com.app.globalgates.dto.chat.ChatExpertDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MessageReactionDTO;
import com.app.globalgates.service.chat.ChatFileService;
import com.app.globalgates.service.chat.ChatMessageService;
import com.app.globalgates.service.chat.ChatRoomService;
import com.app.globalgates.service.ExpertService;
import com.app.globalgates.service.chat.MessageReactionService;
import com.app.globalgates.service.ProducerService;
import com.app.globalgates.service.S3Service;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.chat.ChatFileDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatAPIController {
    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;
    private final ProducerService producerService;
    private final ExpertService expertService;
    private final MessageReactionService messageReactionService;
    private final MemberDAO memberDAO;
    private final FileDAO fileDAO;
    private final S3Service s3Service;
    private final ChatFileService chatFileService;
    private final ChatFileDAO chatFileDAO;
    private final SimpMessagingTemplate messagingTemplate;

    // 채팅방 목록 조회
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDTO>> getRooms(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long memberId = userDetails.getId();
        log.info("채팅방 목록 조회 - memberId: {}", memberId);
        List<ChatRoomDTO> rooms = chatRoomService.getRooms(memberId);
        rooms.forEach(room -> resolveProfileImage(room));
        return ResponseEntity.ok(rooms);
    }

    // 채팅방 생성 또는 기존 방 반환 (차단 상태면 409)
    @PostMapping("/rooms")
    public ResponseEntity<?> createRoom(@AuthenticationPrincipal CustomUserDetails userDetails,
                                        @RequestBody Map<String, Object> body) {
        Long senderId = userDetails.getId();
        if (body.get("invitedId") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "invitedId는 필수입니다."));
        }
        Long invitedId = Long.valueOf(body.get("invitedId").toString());
        String title = (String) body.getOrDefault("title", "");

        log.info("채팅방 생성 요청 - senderId: {}, invitedId: {}", senderId, invitedId);
        try {
            ChatRoomDTO room = chatRoomService.createOrGetRoom(title, senderId, invitedId);
            return ResponseEntity.ok(room);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    // 대화 내역 조회 (커서 기반 페이징)
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> getMessages(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(required = false) Integer pageSize) {
        Long memberId = userDetails.getId();
        log.info("대화 내역 조회 - conversationId: {}, memberId: {}, cursor: {}", conversationId, memberId, cursor);
        Map<String, Object> result = chatMessageService.getMessagesWithCursor(conversationId, memberId, cursor, pageSize);
        return ResponseEntity.ok(result);
    }

    // 메시지 전송 (차단 상태면 403)
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@AuthenticationPrincipal CustomUserDetails userDetails,
                                         @RequestBody ChatMessageDTO chatMessageDTO) {
        if (chatMessageDTO.getContent() != null && chatMessageDTO.getContent().length() > 4000) {
            return ResponseEntity.badRequest().body(Map.of("error", "메시지 내용은 4000자를 초과할 수 없습니다."));
        }
        chatMessageDTO.setSenderId(userDetails.getId());
        chatMessageDTO.setSenderName(userDetails.getMemberName());
        log.info("메시지 전송 - conversationId: {}, senderId: {}", chatMessageDTO.getConversationId(), chatMessageDTO.getSenderId());
        try {
            ChatMessageDTO saved = producerService.sendMessage(chatMessageDTO);
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    // 내 계정에서만 메시지 삭제 (per-member soft delete)
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@AuthenticationPrincipal CustomUserDetails userDetails,
                                              @PathVariable Long messageId) {
        Long memberId = userDetails.getId();
        log.info("메시지 삭제 - messageId: {}, memberId: {}", messageId, memberId);
        chatMessageService.deleteMessageForMember(messageId, memberId);
        return ResponseEntity.ok().build();
    }

    // 유저 검색 (차단 사용자 제외)
    @GetMapping("/members/search")
    public ResponseEntity<List<MemberDTO>> searchMembers(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String keyword) {
        Long memberId = userDetails.getId();
        log.info("유저 검색 - keyword: {}, memberId: {}", keyword, memberId);
        List<MemberDTO> members = memberDAO.searchByKeyword(keyword, memberId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/experts")
    public ResponseEntity<List<ChatExpertDTO>> getConnectedExperts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String keyword) {
        Long memberId = userDetails.getId();
        log.info("연결된 전문가 조회 - memberId: {}, keyword: {}", memberId, keyword);
        List<ChatExpertDTO> experts = expertService.getConnectedExpertsForChat(memberId, keyword);
        experts.forEach(expert -> {
            String path = expert.getMemberProfileFileName();
            if (path == null || path.isBlank()) {
                expert.setMemberProfileFileName("/images/profile/default_image.png");
                return;
            }
            if (path.startsWith("http")) return;
            if (path.startsWith("/images/")) return;
            String s3Key = path.startsWith("/") ? path.substring(1) : path;
            try {
                expert.setMemberProfileFileName(s3Service.getPresignedUrl(s3Key, Duration.ofMinutes(10)));
            } catch (IOException e) {
                expert.setMemberProfileFileName("/images/profile/default_image.png");
            }
        });
        return ResponseEntity.ok(experts);
    }

    // 상대방 정보 조회
    @GetMapping("/rooms/{conversationId}/partner")
    public ResponseEntity<ChatRoomDTO> getPartner(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId) {
        Long memberId = userDetails.getId();
        log.info("상대방 정보 조회 - conversationId: {}, memberId: {}", conversationId, memberId);
        return chatRoomService.getPartner(conversationId, memberId)
                .map(room -> { resolveProfileImage(room); return ResponseEntity.ok(room); })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/rooms/{conversationId}/activate")
    public ResponseEntity<Void> activateRoom(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId) {
        Long memberId = userDetails.getId();
        log.info("채팅방 활성화 - conversationId: {}, memberId: {}", conversationId, memberId);
        chatRoomService.activateRoom(conversationId, memberId);
        return ResponseEntity.noContent().build();
    }

    // 방 입장 시 읽음 처리 (read receipt 브로드캐스트 O)
    @PostMapping("/rooms/{conversationId}/read")
    public ResponseEntity<ChatReadReceiptDTO> markAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId) {
        Long memberId = userDetails.getId();
        log.info("대화 읽음 처리 - conversationId: {}, memberId: {}", conversationId, memberId);
        return chatRoomService.markConversationAsRead(conversationId, memberId)
                .map(readReceipt -> {
                    messagingTemplate.convertAndSend(
                            "/topic/room." + conversationId + ".read",
                            readReceipt
                    );
                    return ResponseEntity.ok(readReceipt);
                })
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    // 실시간 수신 중 읽음 처리 (read receipt 브로드캐스트 X, DB만 갱신)
    @PostMapping("/rooms/{conversationId}/read-quiet")
    public ResponseEntity<Void> markAsReadQuiet(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId) {
        Long memberId = userDetails.getId();
        chatRoomService.markConversationAsReadQuiet(conversationId, memberId);
        return ResponseEntity.noContent().build();
    }

    // 별칭 수정
    @PatchMapping("/rooms/{conversationId}/alias")
    public ResponseEntity<Void> updateAlias(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId,
            @RequestBody Map<String, Object> body) {
        Long memberId = userDetails.getId();
        String alias = (String) body.get("alias");
        log.info("별칭 수정 - conversationId: {}, memberId: {}, alias: {}", conversationId, memberId, alias);
        chatRoomService.updateAlias(conversationId, memberId, alias);
        return ResponseEntity.noContent().build();
    }

    // 대화방 soft delete
    @DeleteMapping("/rooms/{conversationId}")
    public ResponseEntity<Void> softDeleteConversation(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId) {
        Long memberId = userDetails.getId();
        log.info("대화방 삭제 - conversationId: {}, memberId: {}", conversationId, memberId);
        chatRoomService.softDeleteConversation(conversationId, memberId);
        return ResponseEntity.ok().build();
    }

    // 반응 추가
    @PostMapping("/messages/{messageId}/reactions")
    public ResponseEntity<MessageReactionDTO> addReaction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long messageId,
            @RequestBody Map<String, Object> body) {
        Long memberId = userDetails.getId();
        String emoji = (String) body.get("emoji");
        Long conversationId = Long.valueOf(body.get("conversationId").toString());
        log.info("반응 추가 - messageId: {}, memberId: {}, emoji: {}", messageId, memberId, emoji);
        MessageReactionDTO saved = messageReactionService.addReaction(messageId, memberId, emoji, conversationId);
        return ResponseEntity.ok(saved);
    }

    // 반응 삭제 (DELETE에 body 의존하면 일부 프록시가 제거하므로 query param으로 받음)
    @DeleteMapping("/messages/{messageId}/reactions")
    public ResponseEntity<Void> removeReaction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long messageId,
            @RequestParam String emoji,
            @RequestParam Long conversationId) {
        Long memberId = userDetails.getId();
        log.info("반응 삭제 - messageId: {}, memberId: {}, emoji: {}", messageId, memberId, emoji);
        messageReactionService.removeReaction(messageId, memberId, emoji, conversationId);
        return ResponseEntity.ok().build();
    }

    // 반응 조회
    @GetMapping("/messages/{messageId}/reactions")
    public ResponseEntity<List<MessageReactionDTO>> getReactions(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                 @PathVariable Long messageId) {
        log.info("반응 조회 - messageId: {}", messageId);
        List<MessageReactionDTO> reactions = messageReactionService.getReactions(messageId, userDetails.getId());
        return ResponseEntity.ok(reactions);
    }

    // 파일 첨부 메시지 전송 (차단 상태면 403)
    @PostMapping("/send-with-file")
    public ResponseEntity<?> sendMessageWithFile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam Long conversationId,
            @RequestParam(required = false, defaultValue = "") String content,
            @RequestParam("file") MultipartFile file) throws IOException {
        if (content != null && content.length() > 4000) {
            return ResponseEntity.badRequest().body(Map.of("error", "메시지 내용은 4000자를 초과할 수 없습니다."));
        }
        Long senderId = userDetails.getId();
        String senderName = userDetails.getMemberName();
        log.info("파일 첨부 메시지 전송 - conversationId: {}, senderId: {}", conversationId, senderId);
        try {
            ChatMessageDTO dto = new ChatMessageDTO();
            dto.setConversationId(conversationId);
            dto.setSenderId(senderId);
            dto.setSenderName(senderName);
            dto.setContent(content);
            ChatMessageDTO saved = producerService.sendMessageWithFile(dto, file);
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    // 파일 다운로드 URL 조회
    @GetMapping("/files/{fileId}/download")
    public ResponseEntity<Map<String, String>> getFileDownloadUrl(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long fileId) throws IOException {
        Long memberId = userDetails.getId();
        log.info("파일 다운로드 URL 조회 - fileId: {}, memberId: {}", fileId, memberId);
        if (!chatFileDAO.isAccessibleByMember(fileId, memberId)) {
            return ResponseEntity.status(403).body(Map.of("error", "접근 권한 없음"));
        }
        Optional<FileVO> fileOpt = fileDAO.findById(fileId);
        if (fileOpt.isEmpty()) return ResponseEntity.notFound().build();
        FileVO file = fileOpt.get();
        String url = s3Service.getPresignedDownloadUrl(
                file.getFilePath(), file.getOriginalName(), Duration.ofMinutes(10));
        return ResponseEntity.ok(Map.of("url", url));
    }

    // 파일 미리보기 URL 조회
    @GetMapping("/files/{fileId}/preview")
    public ResponseEntity<Map<String, String>> getFilePreviewUrl(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long fileId) throws IOException {
        Long memberId = userDetails.getId();
        log.info("파일 미리보기 URL 조회 - fileId: {}, memberId: {}", fileId, memberId);
        if (!chatFileDAO.isAccessibleByMember(fileId, memberId)) {
            return ResponseEntity.status(403).body(Map.of("error", "접근 권한 없음"));
        }
        Optional<FileVO> fileOpt = fileDAO.findById(fileId);
        if (fileOpt.isEmpty()) return ResponseEntity.notFound().build();
        FileVO file = fileOpt.get();
        String url = s3Service.getPresignedUrl(file.getFilePath(), Duration.ofMinutes(30));
        return ResponseEntity.ok(Map.of("url", url));
    }

    // 스크린샷 차단 토글
    @PostMapping("/rooms/{conversationId}/screen-block")
    public ResponseEntity<Map<String, Boolean>> toggleScreenBlock(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId) {
        Long memberId = userDetails.getId();
        log.info("스크린샷 차단 토글 - conversationId: {}, memberId: {}", conversationId, memberId);
        boolean blocked = chatRoomService.toggleScreenBlock(conversationId, memberId);
        return ResponseEntity.ok(Map.of("blocked", blocked));
    }

    // 스크린샷 차단 상태 조회
    @GetMapping("/rooms/{conversationId}/screen-block")
    public ResponseEntity<Map<String, Boolean>> getScreenBlock(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId) {
        Long memberId = userDetails.getId();
        boolean blocked = chatRoomService.isScreenBlocked(conversationId, memberId);
        return ResponseEntity.ok(Map.of("blocked", blocked));
    }

    // 스크린샷 시도 알림 — 서버는 영속화 없이 실시간으로 양쪽 참여자에게 브로드캐스트
    @PostMapping("/rooms/{conversationId}/screenshot-attempt")
    public ResponseEntity<Void> notifyScreenshotAttempt(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId) {
        Long memberId = userDetails.getId();
        if (!chatRoomService.isMember(conversationId, memberId)) {
            return ResponseEntity.status(403).build();
        }
        MemberDTO member = memberDAO.findByMemberId(memberId).orElse(null);
        String actorName = member != null
                ? Optional.ofNullable(member.getMemberNickname()).filter(s -> !s.isBlank()).orElse(member.getMemberName())
                : "알 수 없음";
        Map<String, Object> payload = Map.of(
                "type", "SCREENSHOT_ATTEMPT",
                "actorId", memberId,
                "actorName", actorName,
                "timestamp", System.currentTimeMillis()
        );
        messagingTemplate.convertAndSend("/topic/room." + conversationId + ".screenshot-attempt", payload);
        return ResponseEntity.ok().build();
    }

    // 사라진 메시지 설정 변경
    @PostMapping("/rooms/{conversationId}/disappear")
    public ResponseEntity<Map<String, String>> updateDisappearMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId,
            @RequestBody Map<String, String> body) {
        Long memberId = userDetails.getId();
        String setting = body.getOrDefault("setting", "none");
        log.info("사라진 메시지 설정 - conversationId: {}, memberId: {}, setting: {}", conversationId, memberId, setting);
        chatRoomService.updateDisappearMessage(conversationId, memberId, setting);
        return ResponseEntity.ok(Map.of("setting", setting));
    }

    // 사라진 메시지 설정 조회
    @GetMapping("/rooms/{conversationId}/disappear")
    public ResponseEntity<Map<String, Object>> getDisappearMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long conversationId) {
        Long memberId = userDetails.getId();
        Map<String, Object> result = chatRoomService.getDisappearMessage(conversationId, memberId);
        if (result == null) {
            return ResponseEntity.ok(Map.of("setting", "none", "activatedAt", ""));
        }
        String setting = String.valueOf(result.getOrDefault("setting", "none"));
        Object activatedAt = result.get("activated_at");
        return ResponseEntity.ok(Map.of(
                "setting", setting,
                "activatedAt", activatedAt != null ? activatedAt.toString() : ""
        ));
    }

    // S3 프로필 이미지 presigned URL 변환 헬퍼 (null이면 기본 이미지)
    private void resolveProfileImage(ChatRoomDTO room) {
        String path = room.getPartnerProfileFileName();
        if (path == null || path.isBlank()) {
            room.setPartnerProfileFileName("/images/profile/default_image.png");
            return;
        }
        if (path.startsWith("http")) return;
        if (path.startsWith("/images/")) return;
        String s3Key = path.startsWith("/") ? path.substring(1) : path;
        try {
            room.setPartnerProfileFileName(s3Service.getPresignedUrl(s3Key, Duration.ofMinutes(10)));
        } catch (IOException e) {
            room.setPartnerProfileFileName("/images/profile/default_image.png");
        }
    }
}
