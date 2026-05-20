// ChatService IIFE 모듈
const ChatService = (() => {

    async function handleResponse(response, fallbackMsg) {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || fallbackMsg);
        }
        if (response.status === 204) return null;
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    // 1.채팅방 목록 조회
    const getRooms = async () => {
        const response = await fetch(`/api/v1/chat/rooms`);
        return handleResponse(response, "채팅방 목록 조회 실패");
    };

    // 2.채팅방 생성
    const createRoom = async (title, invitedId) => {
        const response = await fetch("/api/v1/chat/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, invitedId }),
        });
        return handleResponse(response, "채팅방 생성 실패");
    };

    // 3.대화 내역 조회 (커서 기반 페이징)
    const getMessages = async (conversationId, cursor = null) => {
        const params = new URLSearchParams();
        if (cursor) params.set("cursor", cursor);
        const query = params.toString();
        const response = await fetch(
            `/api/v1/chat/conversations/${conversationId}/messages${query ? "?" + query : ""}`
        );
        return handleResponse(response, "대화 내역 조회 실패");
    };

    // 4.메시지 전송
    const sendMessage = async (conversationId, content) => {
        const body = { conversationId, content };
        const response = await fetch("/api/v1/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return handleResponse(response, "메시지 전송 실패");
    };

    // 5.읽음 처리 - 방 입장시 호출, read receipt 브로드캐스트 O
    const markAsRead = async (conversationId) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}/read`,
            { method: "POST" }
        );
        return handleResponse(response, "읽음 처리 실패");
    };

    // 6.조용한 읽음 처리 - 실시간 수신중 호출, DB만 갱신, 브로드캐스트 X
    const markAsReadQuiet = async (conversationId) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}/read-quiet`,
            { method: "POST" }
        );
        return handleResponse(response, "조용한 읽음 처리 실패");
    };

    // 7.메시지 삭제 - 내 계정에서만 삭제
    const deleteMessage = async (messageId) => {
        const response = await fetch(`/api/v1/chat/messages/${messageId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "메시지 삭제 실패");
        }
    };

    // 8.유저 검색 (차단 사용자 제외)
    const searchMembers = async (keyword) => {
        const response = await fetch(
            `/api/v1/chat/members/search?keyword=${encodeURIComponent(keyword)}`
        );
        return handleResponse(response, "유저 검색 실패");
    };

    // 9.연결된 전문가 목록 조회
    const getConnectedExperts = async (keyword) => {
        const params = new URLSearchParams();
        if (keyword && keyword.trim()) {
            params.set("keyword", keyword.trim());
        }
        const query = params.toString();
        const response = await fetch(`/api/v1/chat/experts${query ? "?" + query : ""}`);
        return handleResponse(response, "연결된 전문가 조회 실패");
    };

    // 10.상대방 정보 조회
    const getPartner = async (conversationId) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}/partner`
        );
        return handleResponse(response, "상대방 정보 조회 실패");
    };

    // 11.채팅방 활성화
    const activateRoom = async (conversationId) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}/activate`,
            { method: "POST" }
        );
        return handleResponse(response, "채팅방 활성화 실패");
    };

    // 12.반응 추가
    const addReaction = async (messageId, emoji, conversationId) => {
        const response = await fetch(`/api/v1/chat/messages/${messageId}/reactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emoji, conversationId }),
        });
        return handleResponse(response, "반응 추가 실패");
    };

    // 13.반응 삭제 (DELETE에 body 의존하면 일부 프록시가 제거하므로 query param 사용)
    const removeReaction = async (messageId, emoji, conversationId) => {
        const params = new URLSearchParams({ emoji, conversationId });
        const response = await fetch(
            `/api/v1/chat/messages/${messageId}/reactions?${params.toString()}`,
            { method: "DELETE" }
        );
        return handleResponse(response, "반응 삭제 실패");
    };

    // 14.반응 조회
    const getReactions = async (messageId) => {
        const response = await fetch(`/api/v1/chat/messages/${messageId}/reactions`);
        return handleResponse(response, "반응 조회 실패");
    };

    // 15.별칭 수정
    const updateAlias = async (conversationId, alias) => {
        const response = await fetch(`/api/v1/chat/rooms/${conversationId}/alias`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alias }),
        });
        return handleResponse(response, "별칭 수정 실패");
    };

    // 17.대화방 삭제
    const deleteConversation = async (conversationId) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}`,
            { method: "DELETE" }
        );
        return handleResponse(response, "대화방 삭제 실패");
    };

    // 18.파일 첨부 메시지 전송
    const sendMessageWithFile = async (conversationId, content, file) => {
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append("content", content);
        formData.append("file", file);
        const response = await fetch("/api/v1/chat/send-with-file", {
            method: "POST",
            body: formData,
        });
        return handleResponse(response, "파일 첨부 메시지 전송 실패");
    };

    // 19.파일 다운로드 URL 조회
    const getFileDownloadUrl = async (fileId) => {
        const response = await fetch(`/api/v1/chat/files/${fileId}/download`);
        if (!response.ok) throw new Error("파일 다운로드 URL 조회 실패");
        const data = await response.json();
        return data.url;
    };

    // 20.파일 미리보기 URL 조회
    const getFilePreviewUrl = async (fileId) => {
        const response = await fetch(`/api/v1/chat/files/${fileId}/preview`);
        if (!response.ok) throw new Error("파일 미리보기 URL 조회 실패");
        const data = await response.json();
        return data.url;
    };

    // 21.차단 여부 확인 (blockerId는 서버가 인증 컨텍스트에서 추출 — 본인만 조회)
    const isBlocked = async (_blockerId, blockedId) => {
        const response = await fetch(
            `/api/v1/blocks/check?blockedId=${blockedId}`
        );
        if (!response.ok) return false;
        const data = await response.json();
        return data.blocked;
    };

    // 22.사용자 차단 (blockerId는 서버가 자동 추출)
    const blockUser = async (_blockerId, blockedId, conversationId) => {
        const response = await fetch("/api/v1/blocks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blockedId, conversationId }),
        });
        return handleResponse(response, "차단 실패");
    };

    // 23.사용자 차단 해제 (blockerId는 서버가 자동 추출)
    const unblockUser = async (_blockerId, blockedId, conversationId) => {
        let url = `/api/v1/blocks?blockedId=${blockedId}`;
        if (conversationId) url += `&conversationId=${conversationId}`;
        const response = await fetch(url, { method: "DELETE" });
        return handleResponse(response, "차단 해제 실패");
    };

    // 24.스크린샷 차단 토글
    const toggleScreenBlock = async (conversationId) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}/screen-block`,
            { method: "POST" }
        );
        if (!response.ok) throw new Error("스크린샷 차단 토글 실패");
        return await response.json();
    };

    // 25.스크린샷 차단 상태 조회
    const getScreenBlock = async (conversationId) => {
        const response = await fetch(`/api/v1/chat/rooms/${conversationId}/screen-block`);
        if (!response.ok) throw new Error("스크린샷 차단 상태 조회 실패");
        return await response.json();
    };

    // 26.사라진 메시지 설정 변경
    const updateDisappearMessage = async (conversationId, setting) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}/disappear`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ setting }) }
        );
        if (!response.ok) throw new Error("사라진 메시지 설정 실패");
        return await response.json();
    };

    // 27.사라진 메시지 설정 조회
    const getDisappearMessage = async (conversationId) => {
        const response = await fetch(`/api/v1/chat/rooms/${conversationId}/disappear`);
        if (!response.ok) throw new Error("사라진 메시지 설정 조회 실패");
        return await response.json();
    };

    // 28.스크린샷 시도 알림 (서버가 양쪽 참여자에게 브로드캐스트)
    const reportScreenshotAttempt = async (conversationId) => {
        try {
            await fetch(
                `/api/v1/chat/rooms/${conversationId}/screenshot-attempt`,
                { method: "POST" }
            );
        } catch (e) { /* 캡처 차단 자체 흐름이 망가지면 안 되므로 silent */ }
    };

    // 29.비속어 검사 (Spring 프록시 → FastAPI). 네트워크/서버 오류 시 fail-open(allow).
    const checkProfanity = async (message) => {
        try {
            const response = await fetch("/api/v1/chat/profanity-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            if (!response.ok) {
                return { action: "allow", label: "clean", isAbusive: false, pAbusive: 0, pClean: 1 };
            }
            return await response.json();
        } catch (e) {
            return { action: "allow", label: "clean", isAbusive: false, pAbusive: 0, pClean: 1 };
        }
    };

    return {
        getRooms,
        createRoom,
        getMessages,
        sendMessage,
        markAsRead,
        markAsReadQuiet,
        deleteMessage,
        searchMembers,
        getConnectedExperts,
        getPartner,
        activateRoom,
        addReaction,
        removeReaction,
        getReactions,
        updateAlias,
        deleteConversation,
        sendMessageWithFile,
        getFileDownloadUrl,
        getFilePreviewUrl,
        isBlocked,
        blockUser,
        unblockUser,
        toggleScreenBlock,
        getScreenBlock,
        updateDisappearMessage,
        getDisappearMessage,
        reportScreenshotAttempt,
        checkProfanity,
    };
})();
