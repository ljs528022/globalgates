window.onload = () => {
    // 사이드바 게시하기 모달 활성화. memberId는 chat.html 의 Chat-Layout dataset.
    postModalApi.bootstrap({
        services: service,
        layout: layout,
        getMemberId: () => Number(document.querySelector(".Chat-Layout")?.dataset.memberId) || null,
    });

    // 1.DOM 요소 선언

    // 1-1.채팅방 관련 DOM
    const newChatBtn = document.querySelector(".ChatContent-Button");
    const newChatDiv = document.querySelector(".Chat-ChatContent");
    const chatDiv = document.querySelector(".ChatPage-Layout");
    const chatUser = chatDiv.querySelector(".ChatPage-UserInfo");
    const userListContainer = document.querySelector(".UserList-Container");
    const scrollContainer = document.querySelector(".ChatPage-Main-Container");

    // 1-2.모달 관련 DOM
    const modalBackDrop = document.querySelector(".Modal-BackDrop");
    const searchExpertModal = document.querySelector(".Search-Modal");
    const searchExpertCloseBtn = searchExpertModal?.querySelector(".Modal-Header-Button");
    const searchExpertInput = searchExpertModal?.querySelector(".Search-Modal-SearchBar input");
    const searchExpertList = searchExpertModal?.querySelector(".Modal-ExpertList");
    const userInfoModal = document.querySelector(".Big-Modal.Info");
    const changeAliasModal = document.querySelector(".Big-Modal.ChangeAlias");
    const removedMsgModal = document.querySelector(".Big-Modal.RemovedMsg");

    const banScreanShotModal = document.querySelector(".Big-Modal.BanScreanShot");
    const deleteChatModal = document.querySelector(".Small-Modal.DeleteChat");
    const leaveModal = document.querySelector(".Small-Modal.Leave");
    const banUserModal = document.querySelector(".Small-Modal.Ban-User");
    const profanityModal = document.querySelector(".Small-Modal.Profanity");
    const profanityModalTitle = document.getElementById("profanityModalTitle");
    const profanityModalMessage = document.getElementById("profanityModalMessage");
    const profanitySendAnywayBtn = document.getElementById("profanitySendAnyway");
    const profanityEditBtn = document.getElementById("profanityEdit");
    const profanityCloseBtn = document.getElementById("profanityClose");

    // 1-3.반응형 관련 DOM (모바일 nav 더보기/로그아웃은 /js/common/mobile-nav.js가 처리)
    const userListWrapper = document.querySelector(".Chat-UserList-Wrapper");
    const backBtn = document.getElementById("chat-back-btn");
    const bottomNav = document.querySelector(".mobile-nav");
    const mobileMessageBadge = document.querySelector(".Chat-MobMessageBadge");

    // 1-4.좌측 검색바 관련 DOM
    const searchBarPlaceholder = document.querySelector(".Header-SearchBar:not(.Input)");
    const searchBarInput = document.querySelector(".Header-SearchBar.Input");
    const searchInput = document.querySelector(".Search-Conversation-Input");
    const searchClearBtn = document.querySelector(".Search-Clear-Btn");
    const searchConvPanel = document.querySelector(".Search-Conversation");
    const searchConvEmpty = document.querySelector(".Search-Conv-Empty");
    const searchConvResults = document.querySelector(".Search-Conv-Results");
    const searchConvGrid = document.querySelector(".Search-Conv-Grid");
    const searchConvList = document.querySelector(".Search-Conv-List");
    const userListEl = document.querySelector(".UserList-Wrapper");

    // 1-5.채팅 메뉴 관련 DOM
    const chatMenu = document.querySelector(".Chat-Extend-Menu");
    const emojiPicker = document.querySelector(".Chat-Emoji-Picker");
    const toast = document.querySelector(".Clipboard-Toast");

    // 1-6.하단 입력란 관련 DOM
    const chatForm = document.getElementById("chatSubmit");
    const chatInput = document.getElementById("chat-input");
    const chatAttach = document.getElementById("chat-image");
    const inputImageContainer = document.querySelector(".Input-Image-Container");
    const inputImageCard = inputImageContainer?.querySelector(".Input-Image-Card");
    const inputImageEl = inputImageCard?.querySelector("img");
    const removeImageBtn = inputImageCard?.querySelector(".Remove-Image-Button");
    const chatSubmit = document.querySelector(".Submit-Button-Wrapper");

    // 1-7.상태 변수
    const CONFIG = {
        MOBILE_BREAKPOINT: 600,
        TOAST_DURATION: 4000,
        SOCKET_RETRY_DELAY: 3000,
        MAX_MESSAGE_LENGTH: 4000,
    };

    // 비속어 체크 결과로 대기 중인 전송 페이로드. 모달에서 "그래도 보내기" 선택시 사용.
    let pendingSendPayload = null;

    let expertSearchTimer = null;
    let roomRefreshTimer = null;
    let socketReconnectTimer = null;
    let stageOneRooms = [];
    let activeBtn = null;
    let activeEmoteBtn = null;
    let picker = null;
    let isCurrentPartnerBlocked = false;
    let isSending = false;

    // 1-8. 화상통화용 변수
    // [임시 - 로컬 테스트용 프록시]
    // 배포 시 아래 LIVEKIT_SERVER_URL을 실제 LiveKit 서버 URL로 변경
    let LIVEKIT_SERVER_URL = "";
    let sessionId = null;
    let pendingVideoRoomName = null;
    let loginedMemberId = null;

    // 1-9. LiveKit 서버 URL — body data-livekit-server-url 에서 주입 (서버에서 ${LIVEKIT_HOST}:${LIVEKIT_PORT} 조립)
    function configureLiveKitUrl() {
        if (!LIVEKIT_SERVER_URL) {
            LIVEKIT_SERVER_URL = document.body?.dataset?.livekitServerUrl || "";
        }
    }
    configureLiveKitUrl();

    // 2.채팅방 목록 관련 함수

    // 2-1.채팅방 목록 DOM 배열 반환
    function getStageOneRoomItems() {
        return Array.from(document.querySelectorAll(".UserList-EachUser"));
    }

    // 2-2.현재 방 표시
    function markCurrentStageOneRoom(roomId) {
        let activeRoom = null;
        getStageOneRoomItems().forEach((roomItem) => {
            const isCurrent = Number(roomItem.dataset.conversationId || 0) === Number(roomId);
            roomItem.classList.toggle("current", isCurrent);
            if (isCurrent) activeRoom = roomItem;
        });
        return activeRoom;
    }

    // 2-3.서버 응답 데이터 정규화
    function normalizeStageOneRoom(room) {
        const conversationId = Number(room?.conversationId || room?.id || 0);
        const partnerId = Number(room?.partnerId || room?.invitedId || 0);
        const partnerName = String(room?.partnerName || room?.invitedName || room?.displayName || room?.title || "").trim();
        const displayName = String(room?.displayName || room?.title || partnerName).trim();
        const partnerHandle = String(room?.partnerHandle || room?.invitedHandle || "").trim();

        if (!conversationId || !displayName) return null;

        return {
            conversationId,
            partnerId,
            partnerName,
            displayName,
            partnerHandle,
            partnerProfileFileName: room?.partnerProfileFileName || "/images/profile/default_image.png",
            lastMessage: String(room?.lastMessage || "").trim(),
            lastMessageTime: room?.lastMessageTime ? ChatLayout.formatRoomTime(room.lastMessageTime) : "",
            unreadCount: Math.max(Number(room?.unreadCount || 0), 0),
        };
    }

    // 2-4.방 목록 복사본 반환
    function buildStageOneConversationRooms() {
        return [...stageOneRooms];
    }

    // 2-5.방 목록 클릭 이벤트 바인딩
    function bindStageOneRoomClicks() {
        getStageOneRoomItems().forEach((chat) => {
            chat.addEventListener("click", () => selectStageOneRoom(chat));
        });
    }

    // 2-6.방 목록 HTML 렌더링
    function renderStageOneRoomList(rooms) {
        if (!userListContainer) return;
        userListContainer.innerHTML = ChatLayout.renderRoomListMarkup(rooms);
        bindStageOneRoomClicks();
    }

    // 2-7.모바일 하단 네비게이션 unread 뱃지 갱신
    function updateStageOneTotalUnreadBadge() {
        if (!mobileMessageBadge) return;
        const totalUnreadCount = stageOneRooms.reduce(
            (sum, room) => sum + Math.max(Number(room?.unreadCount || 0), 0), 0,
        );
        const unreadLabel = ChatLayout.formatUnreadCount(totalUnreadCount);
        mobileMessageBadge.textContent = unreadLabel;
        mobileMessageBadge.classList.toggle("off", !unreadLabel);
    }

    // 2-8.개별 방 unread 뱃지 UI 갱신
    function updateStageOneRoomUnreadUi(roomId) {
        const targetRoom = stageOneRooms.find((room) => room.conversationId === Number(roomId));
        const roomItem = getStageOneRoomItems().find(
            (item) => Number(item.dataset.conversationId || 0) === Number(roomId),
        );
        const infoBottom = roomItem?.querySelector(".Info-Bottom");

        if (!targetRoom || !infoBottom) {
            updateStageOneTotalUnreadBadge();
            return;
        }

        const unreadLabel = ChatLayout.formatUnreadCount(targetRoom.unreadCount);
        const existingBadge = infoBottom.querySelector(".Room-UnreadCount");

        if (!unreadLabel) {
            existingBadge?.remove();
            updateStageOneTotalUnreadBadge();
            return;
        }

        if (existingBadge) {
            const badgeText = existingBadge.querySelector(".UnreadCount-Badge");
            if (badgeText) badgeText.textContent = unreadLabel;
            updateStageOneTotalUnreadBadge();
            return;
        }

        infoBottom.insertAdjacentHTML("beforeend", `
            <div class="Room-UnreadCount">
                <span class="UnreadCount-Badge">${ChatLayout.escapeHtml(unreadLabel)}</span>
            </div>
        `);
        updateStageOneTotalUnreadBadge();
    }

    // 2-9.특정 방 unread 카운트 설정
    function setStageOneRoomUnreadCount(roomId, unreadCount) {
        let didUpdate = false;
        stageOneRooms = stageOneRooms.map((room) => {
            if (room.conversationId !== Number(roomId)) return room;
            didUpdate = true;
            return { ...room, unreadCount: Math.max(Number(unreadCount || 0), 0) };
        });

        if (!didUpdate) {
            updateStageOneTotalUnreadBadge();
            return;
        }
        updateStageOneRoomUnreadUi(roomId);
        refreshSearchConversationPanel(searchInput?.value || "");
    }

    // 2-10.특정 방 unread 카운트 1 증가
    function incrementStageOneRoomUnreadCount(roomId) {
        const targetRoom = stageOneRooms.find((room) => room.conversationId === Number(roomId));
        if (!targetRoom) {
            updateStageOneTotalUnreadBadge();
            return;
        }
        setStageOneRoomUnreadCount(roomId, Number(targetRoom.unreadCount || 0) + 1);
    }

    // 2-11.서버에서 방 목록 조회 후 렌더링
    async function loadStageOneRoomList() {
        try {
            const rooms = await ChatService.getRooms();
            stageOneRooms = (Array.isArray(rooms) ? rooms : [])
                .map(normalizeStageOneRoom)
                .filter(Boolean);
        } catch (error) {
            console.error("채팅방 목록 조회 실패", error);
            stageOneRooms = [];
        }
        renderStageOneRoomList(stageOneRooms);
        syncStageOneRoomSubscriptions();
        updateStageOneTotalUnreadBadge();
        refreshSearchConversationPanel(searchInput?.value || "");
        return stageOneRooms;
    }

    // 2-12.방 목록 미리보기 동기화
    function syncStageOneRoomPreview(messages) {
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        const currentRoomItem = getStageOneRoomItems().find(
            (roomItem) => Number(roomItem.dataset.conversationId || 0) === Number(currentRoomId),
        );

        stageOneRooms = stageOneRooms.map((room) =>
            room.conversationId === Number(currentRoomId)
                ? {
                    ...room,
                    lastMessage: lastMessage ? lastMessage.content || "" : "",
                    lastMessageTime: lastMessage ? ChatLayout.formatRoomTime(lastMessage.createdDatetime) : "",
                }
                : room,
        );

        refreshSearchConversationPanel(searchInput?.value || "");
        if (!currentRoomItem) return;

        const preview = currentRoomItem.querySelector(".Talk-Content");
        const time = currentRoomItem.querySelector(".Lastest-ChatTime-Text");
        if (preview) preview.textContent = lastMessage ? lastMessage.content || "" : "";
        if (time) time.textContent = lastMessage ? ChatLayout.formatRoomTime(lastMessage.createdDatetime) : "";
    }

    // 2-13.다른 방에서 수신한 메시지의 미리보기 로컬 갱신
    function updateStageOneRoomPreviewLocally(roomId, message) {
        const roomItem = getStageOneRoomItems().find(
            (item) => Number(item.dataset.conversationId || 0) === Number(roomId),
        );
        if (!roomItem) return;

        const preview = roomItem.querySelector(".Talk-Content");
        const time = roomItem.querySelector(".Lastest-ChatTime-Text");
        if (preview) preview.textContent = message.content || "";
        if (time) time.textContent = ChatLayout.formatRoomTime(message.createdDatetime);

        stageOneRooms = stageOneRooms.map((room) =>
            room.conversationId === Number(roomId)
                ? { ...room, lastMessage: message.content || "", lastMessageTime: ChatLayout.formatRoomTime(message.createdDatetime) }
                : room,
        );
    }

    // 2-14.방 목록 갱신 디바운스
    function scheduleStageOneRoomRefresh() {
        clearTimeout(roomRefreshTimer);
        roomRefreshTimer = setTimeout(async () => {
            const activeRoomId = currentRoomId;
            await loadStageOneRoomList();
            markCurrentStageOneRoom(activeRoomId);
        }, 100);
    }

    // 3.좌측 대화 검색 관련 함수

    // 3-1.검색 결과 클릭 이벤트 바인딩
    function bindSearchConversationClicks(container, selector) {
        container.querySelectorAll(selector).forEach((item) => {
            item.addEventListener("click", () => openConversationFromSearch(item.dataset.conversationId));
        });
    }

    // 3-2.검색 결과 그리드 렌더링
    function renderSearchConversationGrid(rooms) {
        if (!searchConvGrid) return;
        searchConvGrid.innerHTML = ChatLayout.renderSearchConversationGridMarkup(rooms);
        bindSearchConversationClicks(searchConvGrid, ".Search-Conv-Item");
    }

    // 3-3.검색 결과 리스트 렌더링
    function renderSearchConversationList(rooms) {
        if (!searchConvList) return;
        searchConvList.innerHTML = ChatLayout.renderSearchConversationListMarkup(rooms);
        bindSearchConversationClicks(searchConvList, ".Search-Conv-Row");
    }

    // 3-4.검색 패널 갱신
    function refreshSearchConversationPanel(keyword = "") {
        const rooms = buildStageOneConversationRooms();
        const trimmedKeyword = keyword.trim();
        if (!trimmedKeyword) {
            renderSearchConversationGrid(rooms);
            return;
        }
        renderSearchConversationList(ChatLayout.filterSearchConversationRooms(rooms, trimmedKeyword));
    }

    // 3-5.검색 패널 열기
    function openSearchPanel() {
        searchBarPlaceholder.style.display = "none";
        searchBarInput.style.display = "flex";
        userListEl.style.display = "none";
        searchConvPanel.classList.remove("off");
        searchConvEmpty.style.display = "flex";
        searchConvResults.classList.add("off");
        refreshSearchConversationPanel();
        setTimeout(() => searchInput.focus(), 50);
    }

    // 3-6.검색 패널 닫기
    function closeSearchPanel() {
        searchBarPlaceholder.style.display = "";
        searchBarInput.style.display = "none";
        userListEl.style.display = "";
        searchConvPanel.classList.add("off");
        searchInput.value = "";
        searchClearBtn.classList.add("off");
    }

    // 3-7.검색 이벤트 바인딩
    searchBarPlaceholder.addEventListener("click", (e) => {
        e.stopPropagation();
        openSearchPanel();
    });

    searchInput.addEventListener("input", () => {
        const hasValue = searchInput.value.trim().length > 0;
        searchClearBtn.classList.toggle("off", !hasValue);
        searchConvEmpty.style.display = hasValue ? "none" : "flex";
        searchConvResults.classList.toggle("off", !hasValue);
        refreshSearchConversationPanel(searchInput.value);
    });

    searchClearBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchClearBtn.classList.add("off");
        searchConvEmpty.style.display = "flex";
        searchConvResults.classList.add("off");
        refreshSearchConversationPanel();
        searchInput.focus();
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeSearchPanel();
    });

    document.addEventListener("click", (e) => {
        if (
            !searchConvPanel.classList.contains("off") &&
            !searchBarInput.contains(e.target) &&
            !searchBarPlaceholder.contains(e.target) &&
            !searchConvPanel.contains(e.target)
        ) {
            closeSearchPanel();
        }
    });

    // 4.채팅방 열기 닫기

    // 4-1.모바일 여부 판단
    function isMobile() {
        return window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    }

    // 4-2.채팅방 열기
    function openChatRoom() {
        chatDiv.style.visibility = "hidden";
        newChatDiv.classList.add("off");
        chatDiv.classList.remove("off");
        bottomNav.style.display = "none";
        if (isMobile()) userListWrapper.classList.add("off");
    }

    // 4-3.채팅방 닫기
    function closeChatRoom() {
        currentRoomId = 0;
        pendingSubscriptionRoomId = null;
        if (currentReadSubscription) {
            currentReadSubscription.unsubscribe();
            currentReadSubscription = null;
        }
        markCurrentStageOneRoom(0);
        delete chatLayoutEl.dataset.conversationId;
        const url = new URL(window.location.href);
        url.searchParams.delete("conversationId");
        url.searchParams.delete("partnerId");
        window.history.replaceState({}, "", url.toString());
        chatDiv.classList.add("off");
        newChatDiv.classList.remove("off");
        bottomNav.style.display = "";
        if (isMobile()) userListWrapper.classList.remove("off");
        applyScreenBlockProtection(false);
    }

    // 4-4.채팅방 선택
    function selectStageOneRoom(chat) {
        const roomId = Number(chat?.dataset.conversationId || 0);
        if (!roomId) return;
        openChatRoom();
        activateStageOneRoom(roomId);
    }

    // 4-5.검색에서 대화방 열기
    function openConversationFromSearch(conversationId) {
        const targetRoom = getStageOneRoomItems().find(
            (roomItem) => Number(roomItem.dataset.conversationId || 0) === Number(conversationId),
        );
        if (!targetRoom) return;
        closeSearchPanel();
        selectStageOneRoom(targetRoom);
    }

    // 4-6.뒤로가기 버튼: 직전 페이지로 이동
    backBtn.addEventListener("click", () => {
        // 모바일에서 채팅방이 열려 있으면 URL 정리만 하고 그대로 history.back
        if (typeof currentRoomId !== "undefined" && currentRoomId) {
            const url = new URL(window.location.href);
            url.searchParams.delete("conversationId");
            url.searchParams.delete("partnerId");
            window.history.replaceState({}, "", url.toString());
        }
        window.history.back();
    });

    // 4-7.반응형 리사이즈 처리
    window.addEventListener("resize", () => {
        if (!isMobile()) {
            userListWrapper.classList.remove("off");
        } else {
            if (!chatDiv.classList.contains("off")) userListWrapper.classList.add("off");
        }
    });

    // 5.이모지 관련

    // 5-1.하단 입력란 이모지 버튼
    const emoteButton = document.getElementById("emoji-btn");

    if (typeof EmojiButton !== "undefined") {
        // position 'top-start'이 일부 레이아웃에서 좌측으로 튀어 'auto' 사용 — 라이브러리 자동 배치
        picker = new EmojiButton({ position: "auto", zIndex: 9999, autoHide: true });
        picker.on("emoji", (emoji) => {
            const textBox = document.getElementById("chat-input");
            textBox.value += emoji;
            chatSubmit.classList.remove("off");
        });
        emoteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            picker.togglePicker(emoteButton);
        });
    } else {
        if (emoteButton) emoteButton.style.display = "none";
    }

    // 5-2.메시지별 이모지 피커 열기
    function openEmojiPicker(btn) {
        emojiPicker.classList.remove("off");
        const rect = btn.getBoundingClientRect();
        const pickerWidth = emojiPicker.offsetWidth || 200;
        const pickerHeight = emojiPicker.offsetHeight || 50;

        let top = rect.top - pickerHeight - 8;
        let left = rect.left;
        if (top < 8) top = rect.bottom + 8;
        if (left + pickerWidth > window.innerWidth) left = window.innerWidth - pickerWidth - 8;
        if (left < 8) left = 8;

        emojiPicker.style.position = "fixed";
        emojiPicker.style.top = `${top}px`;
        emojiPicker.style.left = `${left}px`;
        emojiPicker.style.zIndex = "9999";
        activeEmoteBtn = btn;
    }

    // 5-3.메시지별 이모지 피커 닫기
    function closeEmojiPicker() {
        emojiPicker.classList.add("off");
        activeEmoteBtn = null;
    }

    // 5-4.이모지 피커 선택 이벤트
    emojiPicker.querySelectorAll(".Emoji-Button").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const emoji = btn.dataset.emoji;
            const targetChat = activeEmoteBtn?.closest(".Each-Main-Content");
            addReaction(emoji, targetChat);
            closeEmojiPicker();
        });
    });

    // 5-5.이모지 피커 외부 클릭시 닫기
    document.addEventListener("click", (e) => {
        if (
            !emojiPicker.classList.contains("off") &&
            !emojiPicker.contains(e.target) &&
            e.target !== activeEmoteBtn
        ) {
            closeEmojiPicker();
        }
    });

    // 6.전문가 검색 모달

    // 6-1.전문가 클릭 이벤트 바인딩 (비동기 방식)
    function bindConnectedExpertClicks() {
        searchExpertList?.querySelectorAll(".Each-Expert[data-expert-id]").forEach((expert) => {
            expert.addEventListener("click", async () => {
                const expertId = Number(expert.dataset.expertId || 0);
                if (!expertId) return;
                try {
                    const room = await ChatService.createRoom("", expertId);
                    closeModal(searchExpertModal);
                    await loadStageOneRoomList();
                    const roomId = Number(room.id);
                    const targetRoom = getStageOneRoomItems().find(
                        (item) => Number(item.dataset.conversationId || 0) === roomId,
                    );
                    if (targetRoom) {
                        selectStageOneRoom(targetRoom);
                    }
                } catch (error) {
                    console.error("전문가 채팅방 생성 실패", error);
                    showErrorToast("채팅방 생성에 실패했습니다");
                }
            });
        });
    }

    // 6-2.전문가 목록 렌더링
    function renderConnectedExperts(experts) {
        if (!searchExpertList) return;
        searchExpertList.innerHTML = ChatLayout.renderInviteExpertListMarkup(experts);
        bindConnectedExpertClicks();
    }

    // 6-3.전문가 목록 서버 조회
    async function loadConnectedExpertsForModal(keyword = "") {
        try {
            const experts = await ChatService.getConnectedExperts(keyword);
            renderConnectedExperts(experts);
        } catch (error) {
            console.error("연결된 전문가 조회 실패", error);
            renderConnectedExperts([]);
        }
    }

    // 6-4.전문가 검색 모달 열기
    function openSearchExpertModal() {
        openModal(searchExpertModal);
        if (searchExpertInput) searchExpertInput.value = "";
        loadConnectedExpertsForModal();
        setTimeout(() => searchExpertInput?.focus(), 50);
    }

    // 6-5.전문가 검색 입력 이벤트
    if (searchExpertInput) {
        searchExpertInput.addEventListener("input", () => {
            clearTimeout(expertSearchTimer);
            expertSearchTimer = setTimeout(() => {
                loadConnectedExpertsForModal(searchExpertInput.value);
            }, 200);
        });
    }

    searchExpertCloseBtn?.addEventListener("click", () => closeModal(searchExpertModal));

    newChatBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        openSearchExpertModal();
    });

    const inviteBtn = document.querySelector(".Header-Each-Button.Invite");
    if (inviteBtn) {
        inviteBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openSearchExpertModal();
        });
    }

    // 7.채팅방 상단 버튼 이벤트
    const buttons = chatDiv.querySelectorAll(".ChatPage-Button");
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const divName = button.classList[1];
            switch (divName) {
                case "VideoCall": startVideoCall(); break;
                case "UserInfo": openModal(userInfoModal); break;
            }
        });
    });

    // 8.채팅 메뉴 관련

    // 8-1.HTML에 하드코딩된 샘플 메시지에 대한 hover 이벤트
    const conversations = chatDiv.querySelectorAll(".Left, .Right");

    // 8-2.메뉴 닫기
    function closeMenu() {
        if (activeBtn) {
            const menu = activeBtn.closest(".Message-Buttons");
            if (menu) menu.classList.add("off");
        }
        chatMenu.classList.remove("on");
        chatMenu.classList.add("off");
        activeBtn = null;
    }

    // 8-3.더보기 메뉴 항목 가시성 갱신
    function updateMenuVisibility() {
        if (!activeBtn) return;
        const targetMsg = activeBtn.closest(".Each-Main-Content");
        const hasContent = targetMsg?.querySelector(".Message-Content");
        const hasFile = targetMsg?.querySelector(".Message-File");
        const copyBtn = chatMenu.querySelector('[name="copy"]');
        const downloadBtn = chatMenu.querySelector('[name="download"]');
        if (copyBtn) copyBtn.style.display = hasContent ? "" : "none";
        if (downloadBtn) downloadBtn.style.display = hasFile ? "" : "none";
    }

    // 8-4.메뉴 위치 갱신
    function updateMenuPosition() {
        if (!activeBtn) return;
        const rect = activeBtn.getBoundingClientRect();

        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            closeMenu();
            return;
        }

        const menuHeight = chatMenu.offsetHeight;
        const menuWidth = chatMenu.offsetWidth;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceRight = window.innerWidth - rect.left;

        let top = spaceBelow >= menuHeight ? rect.bottom + 8 : rect.top - menuHeight - 8;
        let left = spaceRight >= menuWidth ? rect.left : rect.right - menuWidth;
        left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

        chatMenu.style.top = `${top}px`;
        chatMenu.style.left = `${left}px`;
    }

    // 8-4.하드코딩 메시지에 hover, 이모지, 더보기 메뉴 이벤트 바인딩
    conversations.forEach((c) => {
        const menu = c.querySelector(".Message-Buttons");
        if (!menu) return;

        const emojiBtn = menu.querySelector(".Message-Button.Emote");
        const moreBtn = menu.querySelector(".Message-Button.Menu");

        c.addEventListener("mouseover", () => menu.classList.remove("off"));
        c.addEventListener("touchstart", () => menu.classList.remove("off"), { passive: true });
        c.addEventListener("mouseleave", () => {
            if (activeBtn === moreBtn) return;
            if (activeEmoteBtn === emojiBtn && !emojiPicker.classList.contains("off")) return;
            menu.classList.add("off");
        });

        if (emojiBtn) {
            emojiBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (chatMenu.classList.contains("on")) closeMenu();
                if (activeEmoteBtn === emojiBtn && !emojiPicker.classList.contains("off")) {
                    closeEmojiPicker();
                    return;
                }
                openEmojiPicker(emojiBtn);
            });
        }

        if (moreBtn) {
            moreBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!emojiPicker.classList.contains("off")) closeEmojiPicker();
                if (activeBtn === moreBtn && chatMenu.classList.contains("on")) {
                    closeMenu();
                    return;
                }
                if (activeBtn) {
                    const prevMenu = activeBtn.closest(".Message-Buttons");
                    if (prevMenu) prevMenu.classList.add("off");
                }
                menu.classList.remove("off");
                activeBtn = moreBtn;
                const targetMsgId = c.dataset.messageId || "";
                if (targetMsgId) chatMenu.dataset.targetMessageId = targetMsgId;
                else delete chatMenu.dataset.targetMessageId;
                chatMenu.classList.remove("off");
                chatMenu.classList.add("on");
                updateMenuVisibility();
                updateMenuPosition();
            });
        }
    });

    // 8-5.스크롤시 메뉴 위치 갱신
    if (scrollContainer) {
        scrollContainer.addEventListener("scroll", () => {
            if (chatMenu.classList.contains("on")) updateMenuPosition();
        }, { passive: true });
    }

    // 8-6.메뉴 외부 클릭시 닫기
    document.addEventListener("click", (e) => {
        if (!chatMenu.contains(e.target)) closeMenu();
    });

    // 8-7.메뉴 버튼 클릭 이벤트
    const chatMenuBtns = chatMenu.querySelectorAll(".Extend-Menu-Button");
    chatMenuBtns.forEach((button) => {
        button.addEventListener("click", () => {
            const name = button.getAttribute("name");
            switch (name) {
                case "download":
                    const downloadTarget = activeBtn?.closest(".Each-Main-Content");
                    const fileId = downloadTarget?.querySelector(".Message-File")?.dataset.fileId;
                    closeMenu();
                    if (fileId) {
                        ChatService.getFileDownloadUrl(fileId).then((url) => {
                            window.open(url, "_blank");
                        }).catch(() => alert("파일 다운로드에 실패했습니다."));
                    }
                    break;
                case "copy":
                    const messageContent = activeBtn
                        ?.closest(".Each-Main-Content")
                        ?.querySelector(".Message-Content")?.innerText;
                    closeMenu();
                    if (!messageContent) break;
                    navigator.clipboard.writeText(messageContent)
                        .then(() => showToast("클립보드로 복사함"))
                        .catch(() => console.error("클립보드 복사 실패"));
                    break;
                case "delete":
                    const deleteTarget = activeBtn?.closest(".Each-Main-Content");
                    const deleteMessageId = deleteTarget?.dataset.messageId
                        || chatMenu.dataset.targetMessageId
                        || null;
                    closeMenu();
                    if (!deleteMessageId) {
                        showErrorToast("메시지를 찾을 수 없습니다");
                        break;
                    }
                    deleteChatModal.dataset.targetMessageId = deleteMessageId;
                    openModal(deleteChatModal);
                    break;
            }
        });
    });

    // 9.하단 입력란 이벤트

    // 9-1.입력값 변화시 전송 버튼 토글
    chatInput.addEventListener("keyup", () => {
        if (chatInput.value) {
            chatSubmit.classList.remove("off");
        } else if (!inputImageContainer || inputImageContainer.classList.contains("off")) {
            chatSubmit.classList.add("off");
        }
    });

    // 9-2.파일 첨부
    if (chatAttach) {
        chatAttach.addEventListener("change", () => {
            const file = chatAttach.files[0];
            if (!file) return;
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (inputImageEl) inputImageEl.src = ev.target.result;
                    if (inputImageContainer) inputImageContainer.classList.remove("off");
                    chatSubmit.classList.remove("off");
                };
                reader.readAsDataURL(file);
            } else {
                if (inputImageEl) inputImageEl.src = "";
                if (inputImageContainer) inputImageContainer.classList.add("off");
                chatSubmit.classList.remove("off");
            }
        });
    }

    // 9-3.이미지 제거 버튼
    if (removeImageBtn) {
        removeImageBtn.addEventListener("click", () => {
            if (inputImageEl) inputImageEl.src = "";
            if (inputImageContainer) inputImageContainer.classList.add("off");
            if (chatAttach) chatAttach.value = "";
            if (!chatInput.value) chatSubmit.classList.add("off");
        });
    }

    // 9-4.전송 버튼 클릭, 엔터 이벤트
    chatSubmit.addEventListener("keyup", (e) => {
        e.preventDefault();
        if (e.key === "Enter") chatForm.dispatchEvent(new Event("submit"));
    });
    chatSubmit.addEventListener("click", (e) => {
        e.preventDefault();
        chatForm.dispatchEvent(new Event("submit"));
    });

    // 10.모달 이벤트

    // 10-1.모달 열기
    function openModal(modal) {
        modal.querySelector(".Extend-Menu-Wrapper")?.classList.add("off");
        modalBackDrop.classList.remove("off");
        modal.classList.remove("off");
        if (modal.classList.contains("Big-Modal") || modal.classList.contains("Small-Modal")) {
            requestAnimationFrame(() => modal.classList.add("on"));
        }
        if (modal.classList.contains("Small-Modal")) {
            modalBackDrop.style.zIndex = "53";
        }
    }

    // 10-2.모달 닫기
    function closeModal(modal) {
        if (modal.classList.contains("Big-Modal")) {
            modal.classList.remove("on");
            modal.addEventListener("transitionend", () => {
                modal.classList.add("off");
                const anyOpen = document.querySelectorAll(".Big-Modal.on, .Small-Modal.on");
                if (anyOpen.length === 0) modalBackDrop.classList.add("off");
            }, { once: true });
        } else if (modal.classList.contains("Small-Modal")) {
            modal.classList.remove("on");
            modal.classList.add("off");
            modalBackDrop.style.zIndex = "";
            const anyOpen = document.querySelectorAll(".Big-Modal.on, .Small-Modal.on");
            if (anyOpen.length === 0) modalBackDrop.classList.add("off");
        } else {
            modalBackDrop.classList.add("off");
            modal.classList.add("off");
        }
    }

    // 10-3.백드롭 클릭시 모든 모달 닫기
    modalBackDrop.addEventListener("click", () => {
        const modals = document.querySelectorAll(".Big-Modal, .Small-Modal, .Search-Modal");
        modals.forEach((modal) => {
            modal.classList.remove("on");
            modal.classList.add("off");
        });
        modalBackDrop.style.zIndex = "";
        modalBackDrop.classList.add("off");
    });

    // 10-4.닫기 버튼 이벤트
    document.querySelectorAll(".Big-Modal-Button.Close").forEach((back) => {
        const currentModal = back.closest(".Big-Modal");
        back.addEventListener("click", () => closeModal(currentModal));
    });

    document.querySelectorAll(".Close-Button, .Cancel").forEach((closeBtn) => {
        const currentModal = closeBtn.closest(".Small-Modal");
        closeBtn.addEventListener("click", () => closeModal(currentModal));
    });

    // 10-5.상대방 정보 모달 이벤트
    chatUser.addEventListener("click", () => openModal(userInfoModal));

    const userInfoClose = userInfoModal.querySelector(".Big-Modal-Button.Close");
    userInfoClose.addEventListener("click", () => closeModal(userInfoModal));

    userInfoModal.addEventListener("click", async (e) => {
        let toggle = false;
        const btn = e.target.closest("button");
        const setting = e.target.closest(".Modal-Bottom-Setting");
        const upperBtn = e.target.closest(".Modal-Upper-Button");
        const menuBtns = userInfoModal.querySelectorAll(".Menu-Icon");

        if (btn?.classList.contains("Close")) return closeModal(userInfoModal);
        if (btn?.classList.contains("Alias")) return openModal(changeAliasModal);

        if (upperBtn) {
            if (upperBtn.classList.contains("Call")) startVideoCall();
            if (upperBtn.classList.contains("Profile")) {
                if (currentPartnerId) window.location.href = `/mypage?memberId=${currentPartnerId}`;
                return;
            }
            if (upperBtn.classList.contains("More")) {
                userInfoModal.querySelector(".Extend-Menu-Wrapper").classList.toggle("off");
                return;
            }
        }

        const extendMenu = userInfoModal.querySelector(".Extend-Menu-Wrapper");
        if (extendMenu && !extendMenu.contains(e.target)) {
            extendMenu.classList.add("off");
        }

        if (setting) {
            if (setting.classList.contains("BanUser") && setting.classList.contains("banned")) {
                try {
                    await ChatService.unblockUser(currentMemberId, currentPartnerId, currentRoomId);
                    isCurrentPartnerBlocked = false;
                } catch (err) {
                    console.error("차단 해제 실패", err);
                }
                setting.classList.remove("banned");
                const banText = setting.querySelector(".BanUser-Text");
                if (banText) banText.textContent = "사용자 차단하기";
                return;
            }

            const modalMap = {
                RemovedMsg: removedMsgModal,
                BanScreanShot: banScreanShotModal,
                BanUser: banUserModal,
            };
            const key = Object.keys(modalMap).find((k) => setting.classList.contains(k));
            if (key) return openModal(modalMap[key]);
        }
    });

    // 10-5-1.상대방 정보 모달 더보기 메뉴 버튼 이벤트
    const menuBtns = userInfoModal.querySelectorAll(".Menu-Icon");
    menuBtns.forEach((button) => {
        button.addEventListener("click", async () => {
            const name = button.classList[1];
            switch (name) {
                case "Delete":
                    userInfoModal.querySelector(".Extend-Menu-Wrapper").classList.add("off");
                    openModal(leaveModal);
                    break;
            }
        });
    });

    // 10-6.별명 변경 모달 이벤트
    const saveBtn = changeAliasModal.querySelector(".Big-Modal-Button.Save");
    const inputWrapper = changeAliasModal.querySelector(".Input-Area");
    const aliasInput = document.getElementById("user-alias");
    const tempBorder = inputWrapper.style.border;

    aliasInput.addEventListener("focus", () => { inputWrapper.style.border = "1px solid #1e9cf1"; });
    aliasInput.addEventListener("blur", () => { inputWrapper.style.border = tempBorder; });
    aliasInput.addEventListener("keyup", () => {
        if (aliasInput.value !== "") {
            saveBtn.disabled = false;
            saveBtn.classList.remove("disabled");
        } else {
            saveBtn.disabled = true;
            saveBtn.classList.add("disabled");
        }
    });
    saveBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (saveBtn.disabled) return;
        const newAlias = aliasInput.value.trim();
        if (!currentRoomId) return;
        try {
            await ChatService.updateAlias(currentRoomId, newAlias);
            currentPartnerAlias = newAlias;
            currentPartnerDisplayName = newAlias || currentPartnerName;
            applyStageOnePartnerProfile();
            closeModal(changeAliasModal);
            await loadStageOneRoomList();
            markCurrentStageOneRoom(currentRoomId);
        } catch (error) {
            console.error("별칭 저장 실패", error);
            alert("별칭 저장에 실패했습니다.");
        }
    });

    // 10-7.사라진 메세지 모달 이벤트
    function createDisappearNoticeLi(text) {
        const li = document.createElement("li");
        li.className = "Each-Main-Content DisappearNotice";
        li.innerHTML = `
            <div class="CallEnd-Wrapper">
                <div class="CallEnd-Container">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em" class="text-primary w-5 h-5 shrink-0">
                        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.42V7z"/>
                    </svg>
                    <div class="CallEnd-Text"></div>
                </div>
            </div>
        `;
        li.querySelector(".CallEnd-Text").textContent = text;
        return li;
    }

    // 방 진입 시: activatedAt 시간 기준으로 메시지 사이에 알림 삽입
    function updateDisappearNotice(setting, activatedAt) {
        if (!chatMessageList) return;
        chatMessageList.querySelectorAll(".DisappearNotice").forEach((el) => el.remove());
        if (!setting || setting === "none" || setting === "없음") return;

        const noticeLi = createDisappearNoticeLi(`사라진 메시지 시작 · ${setting} 후 삭제`);
        if (!activatedAt) {
            chatMessageList.appendChild(noticeLi);
            return;
        }

        const activatedTime = new Date(activatedAt).getTime();
        if (Number.isNaN(activatedTime)) {
            chatMessageList.appendChild(noticeLi);
            return;
        }

        // activatedAt 이후 생성된 첫 메시지 앞에 삽입 (data-created-at 기준)
        const allMessages = chatMessageList.querySelectorAll(".Left[data-created-at], .Right[data-created-at]");
        let insertBefore = null;
        for (const msg of allMessages) {
            const ts = new Date(msg.dataset.createdAt).getTime();
            if (Number.isNaN(ts)) continue;
            if (ts >= activatedTime) {
                insertBefore = msg;
                break;
            }
        }

        if (insertBefore) {
            chatMessageList.insertBefore(noticeLi, insertBefore);
        } else {
            chatMessageList.appendChild(noticeLi);
        }
    }

    // 설정 변경 시: 기존 알림 제거 후 새 알림 (항상 맨 아래)
    function onDisappearSettingChanged(setting) {
        if (!chatMessageList) return;
        chatMessageList.querySelectorAll(".DisappearNotice").forEach((el) => el.remove());
        const text = (!setting || setting === "none" || setting === "없음")
            ? "사라진 메시지가 해제되었습니다"
            : `사라진 메시지 시작 · ${setting} 후 삭제`;
        chatMessageList.appendChild(createDisappearNoticeLi(text));
    }

    const setRemoveTimes = removedMsgModal.querySelectorAll(".Set-Remove-Time");

    setRemoveTimes.forEach((setTime) => {
        setTime.addEventListener("click", async () => {
            if (!currentRoomId) return;
            const selectedTime = setTime.querySelector(".Area-Content-Text").textContent;
            const dbSetting = selectedTime === "없음" ? "none" : selectedTime;
            try {
                await ChatService.updateDisappearMessage(currentRoomId, dbSetting);
                setRemoveTimes.forEach((btn) => btn.querySelector("svg").classList.add("off"));
                setTime.querySelector("svg").classList.remove("off");
                userInfoModal.querySelector(".Modal-Bottom-Setting.RemovedMsg .Setting-Arrow").textContent = selectedTime;
                onDisappearSettingChanged(dbSetting);
            } catch (error) {
                console.error("사라진 메시지 설정 실패", error);
            }
        });
    });


    // 10-8.토스트 메시지 헬퍼 (텍스트 동적 변경)
    function showToast(message) {
        if (!toast) return;
        const inner = toast.querySelector("div");
        if (inner) inner.textContent = message;
        toast.classList.remove("show");
        void toast.offsetWidth;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), CONFIG.TOAST_DURATION);
    }

    // 10-8-1.스크린샷 차단 보호 적용/해제
    //   - 본문 user-select 차단, 우클릭/드래그 차단
    //   - PrintScreen / Ctrl(Cmd)+Shift+S / Win+Shift+S / Cmd+P 키 가로채고 토스트 안내
    //   - OS-레벨 캡처(Cmd+Shift+3 등)는 브라우저가 막을 수 없음 — best-effort
    let screenBlockHandlers = null;
    function applyScreenBlockProtection(enabled) {
        if (!chatDiv) return;
        if (enabled) {
            chatDiv.classList.add("screen-blocked");
            if (screenBlockHandlers) return;
            const onKey = (e) => {
                const isPrint = e.key === "PrintScreen";
                const ctrlOrMeta = e.ctrlKey || e.metaKey;
                const shotCombo =
                    (ctrlOrMeta && e.shiftKey && (e.key === "S" || e.key === "s")) ||
                    (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)) ||
                    (ctrlOrMeta && (e.key === "p" || e.key === "P"));
                if (isPrint || shotCombo) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (currentRoomId) ChatService.reportScreenshotAttempt(currentRoomId);
                }
            };
            const onContext = (e) => e.preventDefault();
            const onDragStart = (e) => e.preventDefault();
            window.addEventListener("keydown", onKey, true);
            chatDiv.addEventListener("contextmenu", onContext);
            chatDiv.addEventListener("dragstart", onDragStart);
            screenBlockHandlers = { onKey, onContext, onDragStart };
        } else {
            chatDiv.classList.remove("screen-blocked");
            if (!screenBlockHandlers) return;
            const { onKey, onContext, onDragStart } = screenBlockHandlers;
            window.removeEventListener("keydown", onKey, true);
            chatDiv.removeEventListener("contextmenu", onContext);
            chatDiv.removeEventListener("dragstart", onDragStart);
            screenBlockHandlers = null;
        }
    }

    // 10-8-1.스크린샷 차단하기 모달 이벤트
    const toggleBtn = banScreanShotModal.querySelector(".Toggle-Button");
    const toggleSpan = banScreanShotModal.querySelector(".Toggle-Switch");
    toggleBtn.addEventListener("click", async () => {
        if (!currentRoomId) return;
        try {
            const result = await ChatService.toggleScreenBlock(currentRoomId);
            if (result.blocked) {
                toggleBtn.classList.add("clicked");
                toggleSpan.classList.add("moved");
            } else {
                toggleBtn.classList.remove("clicked");
                toggleSpan.classList.remove("moved");
            }
            userInfoModal.querySelector(".Modal-Bottom-Setting.BanScreanShot .Setting-Arrow").textContent = result.blocked ? "켜기" : "끄기";
            applyScreenBlockProtection(result.blocked);
        } catch (error) {
            console.error("스크린샷 차단 토글 실패", error);
        }
    });

    // 10-9.작은 모달 버튼 이벤트
    const deleteChatBtn = deleteChatModal.querySelector(".Small-Button.Ban");
    deleteChatBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const targetMessageId = deleteChatModal.dataset.targetMessageId;
        if (!targetMessageId) return;
        try {
            await ChatService.deleteMessage(targetMessageId);
            const targetNode = chatMessageList?.querySelector(`[data-message-id="${targetMessageId}"]`);
            if (targetNode) targetNode.remove();
            closeModal(deleteChatModal);
            delete deleteChatModal.dataset.targetMessageId;
        } catch (error) {
            console.error("메시지 삭제 실패", error);
            showErrorToast("메시지 삭제에 실패했습니다");
        }
    });

    leaveModal.querySelector(".Small-Button.Ban").addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!currentRoomId) return;
        try {
            await ChatService.deleteConversation(currentRoomId);
            closeModal(leaveModal);
            closeModal(userInfoModal);
            closeChatRoom();
            await loadStageOneRoomList();
        } catch (error) {
            console.error("대화방 삭제 실패", error);
            alert("대화방 삭제에 실패했습니다.");
        }
    });


    banUserModal.querySelector(".Small-Button.Ban").addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
            await ChatService.blockUser(currentMemberId, currentPartnerId, currentRoomId);
            isCurrentPartnerBlocked = true;
        } catch (err) {
            console.error("차단 실패", err);
        }
        const banSettingDiv = userInfoModal.querySelector(".Modal-Bottom-Setting.BanUser");
        const banText = banSettingDiv?.querySelector(".BanUser-Text");
        banSettingDiv?.classList.add("banned");
        if (banText) banText.textContent = "사용자 차단 해제하기";
        userInfoModal.querySelector(".Extend-Menu-Wrapper")?.classList.add("off");
        closeModal(banUserModal);
    });

    // 11.채팅 핵심 로직

    // 11-1.현재 유저 정보
    // data-* 속성은 chat.html의 .Chat-Layout 요소에 렌더링되므로 그곳에서 읽는다.
    const chatLayoutEl = document.querySelector(".Chat-Layout") || document.body;
    let currentMemberId = Number(chatLayoutEl.dataset.memberId) || 0;
    let currentMemberName = chatLayoutEl.dataset.memberName || "";
    let currentMemberHandle = chatLayoutEl.dataset.memberHandle || "";
    let currentProfileImage = chatLayoutEl.dataset.profileImage || "/images/profile/default_image.png";
    let currentPartnerId = Number(chatLayoutEl.dataset.partnerId) || 0;
    let currentPartnerName = chatLayoutEl.dataset.partnerName || "";
    let currentPartnerHandle = chatLayoutEl.dataset.partnerHandle || "";
    let currentPartnerAlias = "";
    let currentPartnerDisplayName = currentPartnerName;
    const defaultConversationId = Number(chatLayoutEl.dataset.conversationId) || 0;
    const chatMessageList = chatDiv.querySelector(".ChatPage-Main-Content");
    let currentRoomId = defaultConversationId;
    let lastRenderedDateKey = null;
    let hasMoreMessages = false;
    let oldestMessageCursor = null;
    let isLoadingMore = false;
    let stompClient = null;
    const roomSubscriptions = new Map();
    let currentReadSubscription = null;
    let pendingSubscriptionRoomId = defaultConversationId || null;

    // 11-2.상대방 프로필 정보를 DOM에 반영
    let currentPartnerProfileImage = "/images/profile/default_image.png";

    function applyStageOnePartnerProfile(partner = null) {
        if (partner) {
            currentPartnerId = Number(partner.invitedId || currentPartnerId);
            currentPartnerName = partner.invitedName || currentPartnerName;
            currentPartnerHandle = partner.invitedHandle || currentPartnerHandle;
            currentPartnerAlias = typeof partner.alias === "string" ? partner.alias : "";
            currentPartnerDisplayName = partner.title || currentPartnerAlias || currentPartnerName;
            if (partner.partnerProfileFileName) {
                currentPartnerProfileImage = partner.partnerProfileFileName;
            }
        }

        const chatHeaderName = chatDiv.querySelector(".ChatPage-UserInfo .UserName-Text");
        const chatProfileName = chatDiv.querySelector(".UserProfile .UserName-Text");
        const chatProfileHandle = chatDiv.querySelector(".User-Id-Text");
        const chatProfileBtn = chatDiv.querySelector(".User-Profile-Btn");
        const chatProfileAvatar = chatDiv.querySelector(".UserProfile .Avatar-Image");
        const chatProfileImg = chatDiv.querySelector(".UserProfile .Avatar-Image img");
        const chatHeaderAvatar = chatDiv.querySelector(".ChatPage-UserInfo .Avatar-Image");
        const chatHeaderImg = chatDiv.querySelector(".ChatPage-UserInfo .Avatar-Image img");
        const infoModalName = userInfoModal.querySelector(".Text-Name");
        const infoModalHandle = userInfoModal.querySelector(".Info-Text-Id");
        const infoModalImageLink = userInfoModal.querySelector(".Modal-Info-Image .Image-Link");
        const infoModalImg = userInfoModal.querySelector(".Modal-Info-Image .Image-Link img");
        const currentRoomItem = getStageOneRoomItems().find(
            (roomItem) => Number(roomItem.dataset.conversationId || 0) === Number(currentRoomId),
        );

        const partnerMypageUrl = currentPartnerId ? `/mypage?memberId=${currentPartnerId}` : "#";

        chatLayoutEl.dataset.partnerId = String(currentPartnerId || "");
        chatLayoutEl.dataset.partnerName = currentPartnerName || "";
        chatLayoutEl.dataset.partnerHandle = currentPartnerHandle || "";
        if (currentRoomId) {
            chatLayoutEl.dataset.conversationId = String(currentRoomId);
        } else {
            delete chatLayoutEl.dataset.conversationId;
        }

        if (chatHeaderName) chatHeaderName.textContent = currentPartnerDisplayName;
        if (chatProfileName) chatProfileName.textContent = currentPartnerDisplayName;
        if (chatProfileHandle) chatProfileHandle.textContent = currentPartnerHandle?.startsWith("@") ? currentPartnerHandle : `@${currentPartnerHandle || ""}`;
        if (chatProfileBtn) chatProfileBtn.href = partnerMypageUrl;
        if (chatProfileAvatar) chatProfileAvatar.href = partnerMypageUrl;
        if (chatProfileImg) chatProfileImg.src = currentPartnerProfileImage;
        if (chatHeaderAvatar) chatHeaderAvatar.href = partnerMypageUrl;
        if (chatHeaderImg) chatHeaderImg.src = currentPartnerProfileImage;
        if (infoModalName) infoModalName.textContent = currentPartnerDisplayName || currentPartnerName;
        if (infoModalHandle) infoModalHandle.textContent = currentPartnerHandle?.startsWith("@") ? currentPartnerHandle : `@${currentPartnerHandle || ""}`;
        if (infoModalImageLink) infoModalImageLink.href = partnerMypageUrl;
        if (infoModalImg) infoModalImg.src = currentPartnerProfileImage;
        if (aliasInput) aliasInput.value = currentPartnerAlias || "";

        stageOneRooms = stageOneRooms.map((room) =>
            room.conversationId === Number(currentRoomId)
                ? {
                    ...room,
                    partnerId: currentPartnerId || room.partnerId,
                    partnerName: currentPartnerName || room.partnerName,
                    partnerHandle: currentPartnerHandle || room.partnerHandle,
                    displayName: currentPartnerDisplayName || room.displayName,
                }
                : room,
        );

        if (currentRoomItem) {
            currentRoomItem.dataset.partnerId = String(currentPartnerId || "");
            currentRoomItem.dataset.partnerName = currentPartnerName || "";
            currentRoomItem.dataset.partnerHandle = currentPartnerHandle || "";
            currentRoomItem.dataset.displayName = currentPartnerDisplayName || "";
            const roomName = currentRoomItem.querySelector(".Info-Upper .UserName-Text");
            if (roomName) roomName.textContent = currentPartnerDisplayName;
        }
    }

    // 11-3.서버에서 상대방 프로필 조회 후 반영
    async function refreshStageOnePartnerProfile(roomId) {
        try {
            const partner = await ChatService.getPartner(roomId);
            applyStageOnePartnerProfile(partner);
        } catch (error) {
            console.error("상대방 정보 조회 실패", error);
            applyStageOnePartnerProfile();
        }
    }

    // 11-4.채팅방 활성화
    async function activateStageOneRoom(roomId) {
        currentRoomId = roomId;
        pendingSubscriptionRoomId = roomId;
        const activeRoomEl = markCurrentStageOneRoom(roomId);
        if (activeRoomEl) activeRoomEl.classList.remove("disappear-expired");
        subscribeStageOneRoom(roomId);
        setStageOneRoomUnreadCount(roomId, 0);
        clearStageOneMessages();

        await refreshStageOnePartnerProfile(roomId);

        try {
            const blocked = await ChatService.isBlocked(currentMemberId, currentPartnerId);
            isCurrentPartnerBlocked = blocked;
            const banSettingDiv = userInfoModal.querySelector(".Modal-Bottom-Setting.BanUser");
            const banText = banSettingDiv?.querySelector(".BanUser-Text");
            if (blocked) {
                banSettingDiv?.classList.add("banned");
                if (banText) banText.textContent = "사용자 차단 해제하기";
            } else {
                banSettingDiv?.classList.remove("banned");
                if (banText) banText.textContent = "사용자 차단하기";
            }
        } catch (err) {
            console.error("차단 상태 확인 실패", err);
        }

        try {
            const screenBlock = await ChatService.getScreenBlock(currentRoomId);
            const sToggleBtn = banScreanShotModal.querySelector(".Toggle-Button");
            const sToggleSpan = banScreanShotModal.querySelector(".Toggle-Switch");
            const sArrow = userInfoModal.querySelector(".Modal-Bottom-Setting.BanScreanShot .Setting-Arrow");
            if (screenBlock.blocked) {
                sToggleBtn?.classList.add("clicked");
                sToggleSpan?.classList.add("moved");
                if (sArrow) sArrow.textContent = "켜기";
            } else {
                sToggleBtn?.classList.remove("clicked");
                sToggleSpan?.classList.remove("moved");
                if (sArrow) sArrow.textContent = "끄기";
            }
            applyScreenBlockProtection(!!screenBlock.blocked);
        } catch (e) {
            console.error("스크린샷 차단 상태 조회 실패", e);
        }

        let currentDisappearSetting = "none";
        let currentDisappearActivatedAt = "";
        try {
            const disappear = await ChatService.getDisappearMessage(currentRoomId);
            currentDisappearSetting = disappear.setting || "none";
            currentDisappearActivatedAt = disappear.activatedAt || "";
            const displayText = currentDisappearSetting === "none" ? "없음" : currentDisappearSetting;
            const dArrow = userInfoModal.querySelector(".Modal-Bottom-Setting.RemovedMsg .Setting-Arrow");
            if (dArrow) dArrow.textContent = displayText;
            const dTimeBtns = removedMsgModal.querySelectorAll(".Set-Remove-Time");
            dTimeBtns.forEach((btn) => {
                const btnText = btn.querySelector(".Area-Content-Text").textContent;
                const svgEl = btn.querySelector("svg");
                if (btnText === displayText) {
                    svgEl?.classList.remove("off");
                } else {
                    svgEl?.classList.add("off");
                }
            });
        } catch (e) {
            console.error("사라진 메시지 설정 조회 실패", e);
        }

        try {
            const result = await ChatService.getMessages(currentRoomId);
            const messages = result.messages || [];
            hasMoreMessages = result.hasMore || false;
            oldestMessageCursor = messages.length > 0 ? messages[0].id : null;

            if (!chatMessageList) return;
            clearStageOneMessages();
            renderLoadMoreButton();
            messages.forEach((message) => appendStageOneMessage(message, { refreshRoomList: false, scroll: false }));

            syncStageOneRoomPreview(messages);
            chatDiv.style.visibility = "";
            updateDisappearNotice(currentDisappearSetting, currentDisappearActivatedAt);
            scrollToBottom();

            loadStageOneReactions(messages);
            loadAllImagePreviews();
        } catch (error) {
            console.error("기본 대화 조회 실패", error);
            chatDiv.style.visibility = "";
        }

        if (!isCurrentPartnerBlocked) {
            try {
                await ChatService.markAsRead(roomId);
            } catch (e) {
                console.error("읽음 처리 실패", e);
            }
        }
        await loadStageOneRoomList();
        markCurrentStageOneRoom(roomId);
    }

    // 11-4-1.에러 토스트 표시
    function showErrorToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("on");
        setTimeout(() => toast.classList.remove("on"), CONFIG.TOAST_DURATION);
    }

    // 11-5-0-1.비속어 모달 열기. allowOverride=true면 "그래도 보내기" 버튼 노출.
    function openProfanityModal({ allowOverride }) {
        if (allowOverride) {
            profanityModalTitle.textContent = "비속어가 감지되었습니다";
            profanityModalMessage.textContent = "메시지에 비속어로 보이는 표현이 포함되어 있습니다. 그래도 보내시겠습니까?";
            profanitySendAnywayBtn.classList.remove("off");
        } else {
            profanityModalTitle.textContent = "전송할 수 없습니다";
            profanityModalMessage.textContent = "심한 비속어가 감지되어 메시지를 보낼 수 없습니다. 수정 후 다시 시도해주세요.";
            profanitySendAnywayBtn.classList.add("off");
        }
        openModal(profanityModal);
    }

    // 11-5-0-2.실제 전송 수행. 비속어 체크 통과 후 호출.
    async function performSend(content, file) {
        try {
            if (file) {
                await ChatService.sendMessageWithFile(currentRoomId, content, file);
                if (chatAttach) chatAttach.value = "";
                if (inputImageEl) inputImageEl.src = "";
                if (inputImageContainer) inputImageContainer.classList.add("off");
            } else {
                await ChatService.sendMessage(currentRoomId, content);
            }
            chatInput.value = "";
            chatSubmit.classList.add("off");
        } catch (error) {
            console.error("메시지 전송 실패", error);
            showErrorToast("메시지 전송에 실패했습니다");
            if (file) {
                if (chatAttach) chatAttach.value = "";
                if (inputImageEl) inputImageEl.src = "";
                if (inputImageContainer) inputImageContainer.classList.add("off");
            }
        }
    }

    // 11-5.메시지 전송 이벤트
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isSending) return;
        isSending = true;
        const content = chatInput.value.trim();
        const file = chatAttach?.files[0] || null;
        if (!content && !file) {
            isSending = false;
            return;
        }

        if (content) {
            const verdict = await ChatService.checkProfanity(content);
            if (verdict.action === "soften_required") {
                pendingSendPayload = null;
                openProfanityModal({ allowOverride: false });
                isSending = false;
                return;
            }
            if (verdict.action === "show_modal") {
                pendingSendPayload = { content, file };
                openProfanityModal({ allowOverride: true });
                isSending = false;
                return;
            }
        }

        await performSend(content, file);
        isSending = false;
    });

    // 11-5-1.비속어 모달 - "그래도 보내기" 클릭시 대기 페이로드 전송
    profanitySendAnywayBtn.addEventListener("click", async () => {
        const payload = pendingSendPayload;
        pendingSendPayload = null;
        closeModal(profanityModal);
        if (!payload || isSending) return;
        isSending = true;
        await performSend(payload.content, payload.file);
        isSending = false;
    });

    // 11-5-2.비속어 모달 - "수정하기" / 닫기 클릭시 전송 취소, 입력창 포커스
    function cancelProfanitySend() {
        pendingSendPayload = null;
        closeModal(profanityModal);
        chatInput.focus();
    }
    profanityEditBtn.addEventListener("click", cancelProfanitySend);
    profanityCloseBtn.addEventListener("click", cancelProfanitySend);

    // 11-5-3.비속어 모달 키보드 단축키 - ESC/Enter 모두 "수정하기"로 동작.
    // capture 단계에서 잡아 chatInput의 Enter→submit이 다시 트리거되지 않게 한다.
    document.addEventListener("keydown", (e) => {
        if (profanityModal.classList.contains("off")) return;
        if (e.key !== "Escape" && e.key !== "Enter") return;
        e.preventDefault();
        e.stopPropagation();
        cancelProfanitySend();
    }, true);

    // 11-6.한글 입력 조합 처리
    let isComposing = false;
    chatInput.addEventListener("compositionstart", () => { isComposing = true; });
    chatInput.addEventListener("compositionend", () => { isComposing = false; });
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && !isComposing) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event("submit"));
        }
    });

    // 12.WebSocket 관련

    // 12-1.소켓 연결
    let userRestoreSubscription = null;

    function disconnectExistingSocket() {
        if (currentReadSubscription) {
            currentReadSubscription.unsubscribe();
            currentReadSubscription = null;
        }
        if (userRestoreSubscription) {
            userRestoreSubscription.unsubscribe();
            userRestoreSubscription = null;
        }
        roomSubscriptions.forEach((subs) => {
            if (subs.msg) subs.msg.unsubscribe();
            if (subs.reaction) subs.reaction.unsubscribe();
        });
        roomSubscriptions.clear();
        if (stompClient && stompClient.connected) {
            try { stompClient.disconnect(); } catch (e) { /* ignore */ }
        }
        stompClient = null;
    }

    function connectStageOneSocket() {
        if (typeof SockJS === "undefined" || typeof Stomp === "undefined") return;

        disconnectExistingSocket();

        const socket = new SockJS("/ws/chat");
        stompClient = Stomp.over(socket);
        stompClient.debug = null;
        stompClient.connect({}, () => {
            syncStageOneRoomSubscriptions();
            if (pendingSubscriptionRoomId) subscribeStageOneRoom(pendingSubscriptionRoomId);
            subscribeUserRestore();
            subscribeVideoCallEvents();
        }, (error) => {
            console.error("채팅 소켓 연결 실패", error);
            clearTimeout(socketReconnectTimer);
            socketReconnectTimer = setTimeout(connectStageOneSocket, CONFIG.SOCKET_RETRY_DELAY);
        });
    }

    // 12-2.모든 방 구독 동기화
    function syncStageOneRoomSubscriptions() {
        const roomIds = new Set(
            stageOneRooms
                .map((room) => Number(room?.conversationId || 0))
                .filter((roomId) => roomId > 0),
        );

        roomSubscriptions.forEach((subs, roomId) => {
            if (roomIds.has(roomId)) return;
            if (subs.msg) subs.msg.unsubscribe();
            if (subs.reaction) subs.reaction.unsubscribe();
            if (typeof subs.unsubscribe === "function") subs.unsubscribe();
            roomSubscriptions.delete(roomId);
        });

        if (!stompClient || !stompClient.connected) return;

        roomIds.forEach((roomId) => {
            if (roomSubscriptions.has(roomId)) return;

            const msgSub = stompClient.subscribe(`/topic/room.${roomId}`, (message) => {
                handleStageOneRoomMessage(JSON.parse(message.body));
            });

            const reactionSub = stompClient.subscribe(`/topic/room.${roomId}.reaction`, (message) => {
                const payload = JSON.parse(message.body);
                if (Number(payload.memberId) === currentMemberId) return;
                applyRemoteReaction(payload);
            });

            const screenshotSub = stompClient.subscribe(`/topic/room.${roomId}.screenshot-attempt`, (message) => {
                const payload = JSON.parse(message.body);
                handleScreenshotAttemptNotice(roomId, payload);
            });

            const disappearSub = stompClient.subscribe(`/topic/room.${roomId}.disappear`, (message) => {
                const payload = JSON.parse(message.body);
                handleDisappearAutoDeactivated(roomId, payload);
            });

            roomSubscriptions.set(roomId, { msg: msgSub, reaction: reactionSub, screenshot: screenshotSub, disappear: disappearSub });
        });
    }

    // 12-2-2.사라진 메시지 윈도우 만료 처리
    //   - 현재 방이면: 모달 UI 갱신, 채팅 안내 추가, 메시지 fetch
    //   - 다른 방/페이지: 채팅 리스트의 해당 방 row에 빨간 점 마커 추가 (사용자가 인지하도록)
    function handleDisappearAutoDeactivated(roomId, payload) {
        const targetRoomId = Number(roomId);
        if (targetRoomId === Number(currentRoomId)) {
            if (removedMsgModal) {
                removedMsgModal.querySelectorAll(".Set-Remove-Time").forEach((btn) => {
                    const txt = btn.querySelector(".Area-Content-Text")?.textContent;
                    const svg = btn.querySelector("svg");
                    if (!svg) return;
                    if (txt === "없음") svg.classList.remove("off");
                    else svg.classList.add("off");
                });
            }
            const dArrow = userInfoModal?.querySelector(".Modal-Bottom-Setting.RemovedMsg .Setting-Arrow");
            if (dArrow) dArrow.textContent = "없음";
            if (chatMessageList) {
                chatMessageList.appendChild(createDisappearNoticeLi("사라진 메시지 윈도우 만료 — 메시지가 삭제되었습니다"));
                scrollToBottom();
            }
            activateStageOneRoom(currentRoomId);
        } else {
            // 다른 방에 있을 때: 리스트에서 해당 방을 시각적으로 마킹
            const item = getStageOneRoomItems().find(
                (el) => Number(el.dataset.conversationId || 0) === targetRoomId,
            );
            if (item) item.classList.add("disappear-expired");
        }
    }

    // 12-2-1.스크린샷 시도 알림 — 현재 방이면 채팅창에 시스템 메시지로 표시
    function handleScreenshotAttemptNotice(roomId, payload) {
        const isMine = Number(payload.actorId) === currentMemberId;
        const text = isMine
            ? "스크린샷이 차단되었습니다. 상대방에게도 알림이 전송되었습니다."
            : `${payload.actorName || "상대방"}님이 스크린샷을 시도했습니다.`;
        if (Number(roomId) === Number(currentRoomId) && chatMessageList) {
            chatMessageList.appendChild(createDisappearNoticeLi(text));
            scrollToBottom();
        } else if (!isMine) {
            showToast(text);
        }
    }

    // 12-3.현재 방 read receipt 구독
    function subscribeStageOneRoom(roomId) {
        pendingSubscriptionRoomId = roomId;
        if (!stompClient || !stompClient.connected) return;

        if (currentReadSubscription) currentReadSubscription.unsubscribe();

        currentReadSubscription = stompClient.subscribe(`/topic/room.${roomId}.read`, (message) => {
            const payload = JSON.parse(message.body);
            if (Number(payload.conversationId) !== currentRoomId) return;
            if (Number(payload.readerId) === currentMemberId) return;
            applyReadReceipt(payload);
        });
    }

    // 12-3-1.사용자별 방 복원 알림 구독
    function subscribeUserRestore() {
        if (!stompClient || !stompClient.connected) return;
        if (userRestoreSubscription) userRestoreSubscription.unsubscribe();
        userRestoreSubscription = stompClient.subscribe(`/topic/user.${currentMemberId}.restore`, async (message) => {
            const payload = JSON.parse(message.body);
            const restoredRoomId = Number(payload.conversationId || 0);
            if (!restoredRoomId) return;
            await loadStageOneRoomList();
            syncStageOneRoomSubscriptions();
        });
    }

    // 12-4.실시간 메시지 수신 처리
    async function handleStageOneRoomMessage(message) {
        const roomId = Number(message?.conversationId || 0);
        if (!roomId) return;
        const isMine = Number(message?.senderId || 0) === currentMemberId;

        if (!isMine && Number(message?.senderId || 0) === currentPartnerId && isCurrentPartnerBlocked) {
            return;
        }

        if (Number(currentRoomId) === roomId) {
            appendStageOneMessage(message, { refreshRoomList: false });
            if (!isMine && !isCurrentPartnerBlocked) {
                try {
                    await ChatService.markAsRead(roomId);
                } catch (e) {
                    console.error("읽음 처리 실패", e);
                }
            }
            scheduleStageOneRoomRefresh();
        } else {
            const targetRoom = stageOneRooms.find((r) => r.conversationId === roomId);
            if (!targetRoom) {
                await loadStageOneRoomList();
                return;
            }
            if (!isMine) incrementStageOneRoomUnreadCount(roomId);
            updateStageOneRoomPreviewLocally(roomId, message);
        }
    }

    // 13.메시지 렌더링 관련

    // 13-0.첨부파일 HTML 생성
    function getFileImageMarkup(message) {
        if (!message.fileId || message.fileContentType !== "image") return "";
        const fileName = escapeStageOneHtml(message.fileOriginalName || "파일");
        return `<div class="Message-File Message-File-Image" data-file-id="${message.fileId}">
            <img src="" alt="${fileName}" loading="lazy" class="Chat-Image" data-file-id="${message.fileId}">
        </div>`;
    }

    function getFileDocMarkup(message) {
        if (!message.fileId || message.fileContentType === "image") return "";
        const fileName = escapeStageOneHtml(message.fileOriginalName || "파일");
        const fileSize = message.fileSize ? formatFileSize(message.fileSize) : "";
        return `<div class="Message-File Message-File-Doc" data-file-id="${message.fileId}">
            <div class="File-Info">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                <div class="File-Detail">
                    <span class="File-Name">${fileName}</span>
                    <span class="File-Size">${fileSize}</span>
                </div>
            </div>
        </div>`;
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    // 13-1.메시지 목록에 메시지 하나 추가
    function appendStageOneMessage(message, { refreshRoomList = true, scroll = true } = {}) {
        if (!chatMessageList) return;

        const messageItem = document.createElement("li");
        const isMine = Number(message.senderId) === currentMemberId;
        const messageId = message.id || Date.now();
        const safeContent = escapeStageOneHtml(message.content || "");
        const timeText = ChatLayout.formatMessageTime(message.createdDatetime || new Date().toISOString());
        const msgTime = message.createdDatetime || new Date().toISOString();
        const dateKey = ChatLayout.getDateKey(msgTime);
        const readByPartner = Boolean(message.readByPartner);

        appendStageOneDateDividerIfNeeded(msgTime);

        messageItem.className = `Each-Main-Content ${isMine ? "Right" : "Left"}`;
        messageItem.dataset.chatId = `msg-${messageId}`;
        messageItem.dataset.messageId = String(messageId);
        messageItem.dataset.dateKey = dateKey;
        messageItem.dataset.createdAt = msgTime;
        const hasFile = Boolean(message.fileId);
        const downloadBtnHtml = hasFile ? `
                                <div class="Message-Button-Wrapper">
                                    <button class="Message-Button Download">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" data-icon="icon-arrow-down" viewBox="0 0 24 24" width="1em" height="1em" display="flex" role="img"><path d="M13 3v13.59l5.043-5.05 1.414 1.42L12 20.41l-7.457-7.45 1.414-1.42L11 16.59V3h2z"></path></svg>
                                    </button>
                                </div>` : "";
        const msgButtonsHtml = `
                            <div class="Message-Buttons off">
                                <div class="Message-Button-Wrapper">
                                    <button class="Message-Button Emote">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" data-icon="icon-heart-plus-stroke" viewBox="0 0 24 24" width="1em" height="1em" display="flex" role="img"><path d="M17 12v3h-2.998v2h3v3h2v-3h3v-2h-3.001v-3H17zm-5 6.839c-3.871-2.34-6.053-4.639-7.127-6.609-1.112-2.04-1.031-3.7-.479-4.82.561-1.13 1.667-1.84 2.91-1.91 1.222-.06 2.68.51 3.892 2.16l.806 1.09.805-1.09c1.211-1.65 2.668-2.22 3.89-2.16 1.242.07 2.347.78 2.908 1.91.334.677.49 1.554.321 2.59h2.011c.153-1.283-.039-2.469-.539-3.48-.887-1.79-2.647-2.91-4.601-3.01-1.65-.09-3.367.56-4.796 2.01-1.43-1.45-3.147-2.1-4.798-2.01-1.954.1-3.714 1.22-4.601 3.01-.896 1.81-.846 4.17.514 6.67 1.353 2.48 4.003 5.12 8.382 7.67l.502.299v-2.32z"></path></svg>
                                    </button>
                                </div>
                                ${downloadBtnHtml}
                                <div class="Message-Button-Wrapper">
                                    <button class="Message-Button Menu">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" data-icon="icon-more" viewBox="0 0 24 24" width="1em" height="1em" display="flex" role="img"><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
                                    </button>
                                </div>
                            </div>`;

        const imageHtml = getFileImageMarkup(message);
        const docHtml = getFileDocMarkup(message);
        const hasText = safeContent || docHtml;

        const bubbleHtml = hasText ? `
                        <div class="Chat-Message">
                            <div class="Message-Wrapper">
                                <div class="Message-Container">
                                    ${docHtml}
                                    ${safeContent ? `<span class="Message-Content">${safeContent}</span>` : ""}
                                </div>
                                <div class="Message-Reactions"></div>
                                <div class="Message-SendTime">
                                    <span>${timeText}</span>
                                </div>
                                ${isMine ? getStageOneReadStatusMarkup(readByPartner) : ""}
                            </div>
                        </div>` : "";

        const imageWithReactionHtml = imageHtml ? `
                        <div class="Message-Image-Wrapper">
                            ${imageHtml}
                            ${!hasText ? `<div class="Message-Reactions Message-Reactions-Image"></div>` : ""}
                        </div>` : "";

        messageItem.innerHTML = isMine
            ? `
                <div class="Chat-Left">
                    <div class="Chat-Message-Wrapper">
                        ${msgButtonsHtml}
                        <div class="Chat-Message-Content-Wrapper">
                            ${imageWithReactionHtml}
                            ${bubbleHtml}
                        </div>
                    </div>
                </div>
            `
            : `
                <div class="Chat-Left">
                    <div class="Chat-Message-Wrapper">
                        <div class="Chat-Message-Content-Wrapper">
                            ${imageWithReactionHtml}
                            ${bubbleHtml}
                        </div>
                        ${msgButtonsHtml}
                    </div>
                </div>
            `;

        chatMessageList.appendChild(messageItem);
        if (message.fileId && message.fileContentType === "image") {
            const imgEl = messageItem.querySelector(`.Chat-Image[data-file-id="${message.fileId}"]`);
            if (imgEl) {
                ensureStageOneImagePreview(imgEl).then(() => {
                    if (scroll) scrollToBottom();
                }).catch(() => {});
            }
        }
        bindMessageEvents(messageItem);
        messageItem.querySelectorAll(".Reaction-Badge").forEach((badge) => {
            badge.addEventListener("click", () => addReaction(badge.dataset.emoji, messageItem));
        });
        if (scroll) scrollToBottom();
        syncStageOneRoomPreview([message]);
        if (refreshRoomList) scheduleStageOneRoomRefresh();
    }

    // 13-2.동적으로 추가된 메시지에 hover, 이모지, 더보기 메뉴 이벤트 바인딩
    function bindMessageEvents(messageNode) {
        const menu = messageNode.querySelector(".Message-Buttons");
        if (!menu) return;

        const emojiBtn = menu.querySelector(".Message-Button.Emote");
        const downloadBtn = menu.querySelector(".Message-Button.Download");
        const moreBtn = menu.querySelector(".Message-Button.Menu");

        messageNode.addEventListener("mouseover", () => menu.classList.remove("off"));
        messageNode.addEventListener("touchstart", () => menu.classList.remove("off"), { passive: true });
        messageNode.addEventListener("mouseleave", () => {
            if (activeBtn === moreBtn) return;
            if (activeEmoteBtn === emojiBtn && !emojiPicker.classList.contains("off")) return;
            menu.classList.add("off");
        });

        if (emojiBtn) {
            emojiBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (chatMenu.classList.contains("on")) closeMenu();
                if (activeEmoteBtn === emojiBtn && !emojiPicker.classList.contains("off")) {
                    closeEmojiPicker();
                    return;
                }
                openEmojiPicker(emojiBtn);
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const fileEl = messageNode.querySelector(".Message-File");
                const fileId = fileEl?.dataset.fileId;
                if (fileId) {
                    ChatService.getFileDownloadUrl(fileId).then((url) => {
                        window.open(url, "_blank");
                    }).catch(() => alert("파일 다운로드에 실패했습니다."));
                }
            });
        }

        if (moreBtn) {
            moreBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!emojiPicker.classList.contains("off")) closeEmojiPicker();
                if (activeBtn === moreBtn && chatMenu.classList.contains("on")) {
                    closeMenu();
                    return;
                }
                if (activeBtn) {
                    const prevMenu = activeBtn.closest(".Message-Buttons");
                    if (prevMenu) prevMenu.classList.add("off");
                }
                menu.classList.remove("off");
                activeBtn = moreBtn;
                const targetMsgId = messageNode.dataset.messageId || "";
                if (targetMsgId) chatMenu.dataset.targetMessageId = targetMsgId;
                else delete chatMenu.dataset.targetMessageId;
                chatMenu.classList.remove("off");
                chatMenu.classList.add("on");
                updateMenuVisibility();
                updateMenuPosition();
            });
        }
    }

    // 13-3.메시지 목록 초기화
    function clearStageOneMessages() {
        if (!chatMessageList) return;
        chatMessageList.querySelectorAll(".Left, .Right, .Date, .CallEnd, .LoadMore-Wrapper, .DisappearNotice")
            .forEach((messageNode) => messageNode.remove());
        lastRenderedDateKey = null;
        hasMoreMessages = false;
        oldestMessageCursor = null;
        isLoadingMore = false;
    }

    // 13-4.실시간 메시지 수신시 최하단 스크롤
    function scrollToBottom() {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }

    // 13-4-1."이전 메시지 보기" 버튼 렌더링
    function renderLoadMoreButton() {
        if (!chatMessageList) return;
        chatMessageList.querySelectorAll(".LoadMore-Wrapper").forEach((el) => el.remove());

        if (!hasMoreMessages) return;

        const wrapper = document.createElement("li");
        wrapper.className = "LoadMore-Wrapper";
        wrapper.style.cssText = "display:flex; justify-content:center; padding:12px 0; list-style:none;";
        wrapper.innerHTML = `
            <button class="LoadMore-Button" style="
                display:flex; align-items:center; gap:6px; padding:8px 20px;
                background:transparent; border:1px solid #2f3336; border-radius:20px;
                color:#1d9bf0; font-size:13px; font-weight:600; cursor:pointer;
                transition:background 0.2s;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>
                이전 메시지 보기
            </button>
        `;

        const btn = wrapper.querySelector(".LoadMore-Button");
        btn.addEventListener("mouseover", () => { btn.style.background = "rgba(29,155,240,0.1)"; });
        btn.addEventListener("mouseout", () => { btn.style.background = "transparent"; });
        btn.addEventListener("click", loadPreviousMessages);

        const firstChild = chatMessageList.querySelector(".Left, .Right, .Date, .CallEnd");
        if (firstChild) {
            chatMessageList.insertBefore(wrapper, firstChild);
        } else {
            chatMessageList.appendChild(wrapper);
        }
    }

    // 13-4-2.이전 메시지 로드
    async function loadPreviousMessages() {
        if (isLoadingMore || !hasMoreMessages || !oldestMessageCursor) return;
        isLoadingMore = true;

        const btn = chatMessageList.querySelector(".LoadMore-Button");
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `
                <span style="width:14px;height:14px;border:2px solid #2f3336;border-top-color:#1d9bf0;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block;"></span>
                불러오는 중...
            `;
        }

        try {
            const result = await ChatService.getMessages(currentRoomId, oldestMessageCursor);
            const messages = result.messages || [];
            hasMoreMessages = result.hasMore || false;

            if (messages.length > 0) {
                oldestMessageCursor = messages[0].id;
                const prevScrollHeight = scrollContainer.scrollHeight;
                const prevScrollTop = scrollContainer.scrollTop;

                chatMessageList.querySelectorAll(".LoadMore-Wrapper").forEach((el) => el.remove());

                const savedDateKey = lastRenderedDateKey;
                lastRenderedDateKey = null;

                const refNode = chatMessageList.querySelector(".Left, .Right, .Date, .CallEnd");

                messages.forEach((message) => {
                    const msgTime = message.createdDatetime || new Date().toISOString();
                    const dateKey = ChatLayout.getDateKey(msgTime);

                    if (lastRenderedDateKey !== dateKey) {
                        const dateItem = document.createElement("li");
                        dateItem.className = "Each-Main-Content Date";
                        dateItem.dataset.dateKey = dateKey;
                        dateItem.style.visibility = "visible";
                        dateItem.innerHTML = `<div class="Date-Wrapper"><div class="Date-Text">${ChatLayout.formatDateDivider(msgTime)}</div></div>`;
                        if (refNode) {
                            chatMessageList.insertBefore(dateItem, refNode);
                        } else {
                            chatMessageList.appendChild(dateItem);
                        }
                        lastRenderedDateKey = dateKey;
                    }

                    const isMine = Number(message.senderId) === currentMemberId;
                    const messageItem = document.createElement("li");
                    const messageId = message.id || Date.now();
                    const safeContent = escapeStageOneHtml(message.content || "");
                    const timeText = ChatLayout.formatMessageTime(message.createdDatetime || new Date().toISOString());
                    const readByPartner = Boolean(message.readByPartner);
                    const hasFile = Boolean(message.fileId);

                    messageItem.className = `Each-Main-Content ${isMine ? "Right" : "Left"}`;
                    messageItem.dataset.chatId = `msg-${messageId}`;
                    messageItem.dataset.messageId = String(messageId);
                    messageItem.dataset.dateKey = dateKey;
                    messageItem.dataset.createdAt = msgTime;

                    const downloadBtnHtml = hasFile ? `<div class="Message-Button-Wrapper"><button class="Message-Button Download"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" data-icon="icon-arrow-down" viewBox="0 0 24 24" width="1em" height="1em" display="flex" role="img"><path d="M13 3v13.59l5.043-5.05 1.414 1.42L12 20.41l-7.457-7.45 1.414-1.42L11 16.59V3h2z"></path></svg></button></div>` : "";
                    const msgButtonsHtml = `<div class="Message-Buttons off"><div class="Message-Button-Wrapper"><button class="Message-Button Emote"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em"><path d="M17 12v3h-2.998v2h3v3h2v-3h3v-2h-3.001v-3H17zm-5 6.839c-3.871-2.34-6.053-4.639-7.127-6.609-1.112-2.04-1.031-3.7-.479-4.82.561-1.13 1.667-1.84 2.91-1.91 1.222-.06 2.68.51 3.892 2.16l.806 1.09.805-1.09c1.211-1.65 2.668-2.22 3.89-2.16 1.242.07 2.347.78 2.908 1.91.334.677.49 1.554.321 2.59h2.011c.153-1.283-.039-2.469-.539-3.48-.887-1.79-2.647-2.91-4.601-3.01-1.65-.09-3.367.56-4.796 2.01-1.43-1.45-3.147-2.1-4.798-2.01-1.954.1-3.714 1.22-4.601 3.01-.896 1.81-.846 4.17.514 6.67 1.353 2.48 4.003 5.12 8.382 7.67l.502.299v-2.32z"></path></svg></button></div>${downloadBtnHtml}<div class="Message-Button-Wrapper"><button class="Message-Button Menu"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em"><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg></button></div></div>`;

                    const imageHtml = getFileImageMarkup(message);
                    const docHtml = getFileDocMarkup(message);
                    const hasText = safeContent || docHtml;
                    const bubbleHtml = hasText ? `<div class="Chat-Message"><div class="Message-Wrapper"><div class="Message-Container">${docHtml}${safeContent ? `<span class="Message-Content">${safeContent}</span>` : ""}</div><div class="Message-Reactions"></div><div class="Message-SendTime"><span>${timeText}</span></div>${isMine ? getStageOneReadStatusMarkup(readByPartner) : ""}</div></div>` : "";
                    const imageWithReactionHtml = imageHtml ? `<div class="Message-Image-Wrapper">${imageHtml}${!hasText ? `<div class="Message-Reactions Message-Reactions-Image"></div>` : ""}</div>` : "";

                    messageItem.innerHTML = isMine
                        ? `<div class="Chat-Left"><div class="Chat-Message-Wrapper">${msgButtonsHtml}<div class="Chat-Message-Content-Wrapper">${imageWithReactionHtml}${bubbleHtml}</div></div></div>`
                        : `<div class="Chat-Left"><div class="Chat-Message-Wrapper"><div class="Chat-Message-Content-Wrapper">${imageWithReactionHtml}${bubbleHtml}</div>${msgButtonsHtml}</div></div>`;

                    if (refNode) {
                        chatMessageList.insertBefore(messageItem, refNode);
                    } else {
                        chatMessageList.appendChild(messageItem);
                    }
                    bindMessageEvents(messageItem);
                });

                lastRenderedDateKey = savedDateKey;

                const firstExistingDate = chatMessageList.querySelector(".Date:not(.LoadMore-Wrapper ~ .Date)");
                if (firstExistingDate) {
                    const prevDateKey = firstExistingDate.dataset.dateKey;
                    const lastLoaded = messages[messages.length - 1];
                    if (lastLoaded && ChatLayout.getDateKey(lastLoaded.createdDatetime) === prevDateKey) {
                        firstExistingDate.remove();
                    }
                }

                renderLoadMoreButton();
                loadStageOneReactions(messages);

                scrollContainer.scrollTop = prevScrollTop + (scrollContainer.scrollHeight - prevScrollHeight);
            } else {
                hasMoreMessages = false;
                chatMessageList.querySelectorAll(".LoadMore-Wrapper").forEach((el) => el.remove());
            }
        } catch (error) {
            console.error("이전 메시지 로드 실패", error);
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `이전 메시지 보기 (재시도)`;
            }
        }
        isLoadingMore = false;
    }

    // 13-5.이미지 로드 완료 대기
    function waitForStageOneImageLoad(imgEl) {
        return new Promise((resolve) => {
            if (imgEl.complete) {
                resolve();
                return;
            }
            const handleDone = () => {
                imgEl.removeEventListener("load", handleDone);
                imgEl.removeEventListener("error", handleDone);
                resolve();
            };
            imgEl.addEventListener("load", handleDone);
            imgEl.addEventListener("error", handleDone);
        });
    }

    // 13-6.개별 이미지 S3 미리보기 로드
    async function ensureStageOneImagePreview(imgEl) {
        if (!imgEl) return;
        if (imgEl.dataset.previewLoaded === "true") return;
        if (imgEl.__previewPromise) {
            await imgEl.__previewPromise;
            return;
        }

        imgEl.__previewPromise = (async () => {
            const fileId = imgEl.dataset.fileId;
            if (!fileId) return;
            try {
                if (!imgEl.getAttribute("src")) {
                    const url = await ChatService.getFilePreviewUrl(fileId);
                    imgEl.src = url;
                }
                await waitForStageOneImageLoad(imgEl);
                imgEl.dataset.previewLoaded = "true";
            } catch (e) {
            } finally {
                imgEl.__previewPromise = null;
            }
        })();

        await imgEl.__previewPromise;
    }

    // 13-7.모든 첨부 이미지 미리보기 병렬 로드
    async function loadAllImagePreviews() {
        const imgEls = chatMessageList.querySelectorAll(".Chat-Image[data-file-id]");
        await Promise.all(Array.from(imgEls).map((imgEl) => ensureStageOneImagePreview(imgEl)));
    }

    // 13-8.메시지별 반응 배지 서버 조회 후 렌더링
    async function loadStageOneReactions(messages) {
        await Promise.all(messages.map(async (message) => {
            const messageId = message.id;
            if (!messageId) return;
            try {
                const reactions = await ChatService.getReactions(messageId);
                if (!reactions || reactions.length === 0) return;
                const targetChat = chatMessageList.querySelector(`[data-message-id="${messageId}"]`);
                if (!targetChat) return;
                const reactionsDiv = targetChat.querySelector(".Message-Reactions");
                if (!reactionsDiv) return;

                const emojiMap = {};
                reactions.forEach((r) => {
                    if (!emojiMap[r.emoji]) emojiMap[r.emoji] = { count: 0, isMine: false };
                    emojiMap[r.emoji].count++;
                    if (Number(r.memberId) === currentMemberId) emojiMap[r.emoji].isMine = true;
                });

                Object.entries(emojiMap).forEach(([emoji, data]) => {
                    const badge = document.createElement("div");
                    badge.classList.add("Reaction-Badge");
                    if (data.isMine) badge.classList.add("my-reaction");
                    badge.dataset.emoji = emoji;
                    badge.innerHTML = `<span>${emoji}</span><span class="Reaction-Count">${data.count}</span>`;
                    badge.addEventListener("click", () => addReaction(emoji, targetChat));
                    reactionsDiv.appendChild(badge);
                });

                if (reactionsDiv.children.length > 0) targetChat.classList.add("has-reaction");
            } catch (e) {
                // 반응 조회 실패는 무시
            }
        }));
    }

    // 13-9.날짜 구분선 추가
    function appendStageOneDateDividerIfNeeded(dateStr) {
        if (!chatMessageList || !dateStr) return;
        const dateKey = ChatLayout.getDateKey(dateStr);
        if (lastRenderedDateKey === dateKey) return;
        lastRenderedDateKey = dateKey;

        const dateItem = document.createElement("li");
        dateItem.className = "Each-Main-Content Date";
        dateItem.dataset.dateKey = dateKey;
        dateItem.innerHTML = `
            <div class="Date-Wrapper">
                <div class="Date-Text">${ChatLayout.formatDateDivider(dateStr)}</div>
            </div>
        `;
        chatMessageList.appendChild(dateItem);
    }

    // 13-10.읽음 상태 아이콘 마크업 반환
    function getStageOneReadStatusMarkup(readByPartner) {
        const icon = readByPartner
            ? '<svg class="text-primary w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="currentColor" data-icon="icon-checkmark-circle-fill" viewBox="0 0 24 24" width="1em" height="1em" display="flex" role="img"><path d="M12 1.75C6.34 1.75 1.75 6.34 1.75 12S6.34 22.25 12 22.25 22.25 17.66 22.25 12 17.66 1.75 12 1.75zm-.81 14.68l-4.1-3.27 1.25-1.57 2.47 1.98 3.97-5.47 1.62 1.18-5.21 7.15z"></path></svg>'
            : '<svg class="text-primary w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="currentColor" data-icon="icon-checkmark-circle" viewBox="0 0 24 24" width="1em" height="1em" display="flex" role="img"><path d="M12 3.75c-4.56 0-8.25 3.69-8.25 8.25s3.69 8.25 8.25 8.25 8.25-3.69 8.25-8.25S16.56 3.75 12 3.75zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12zM16.4 9.28l-5.21 7.15-4.1-3.27 1.25-1.57 2.47 1.98 3.97-5.47 1.62 1.18z"></path></svg>';
        return `<span class="Message-ReadStatus" data-read-status="${readByPartner ? "read" : "unread"}">${icon}</span>`;
    }

    // 13-11.read receipt 수신시 체크마크 갱신
    function applyReadReceipt(receipt) {
        const lastReadMessageId = Number(receipt.lastReadMessageId || 0);
        if (!lastReadMessageId) return;
        chatMessageList.querySelectorAll(".Right[data-message-id]").forEach((messageNode) => {
            const messageId = Number(messageNode.dataset.messageId || 0);
            if (messageId <= lastReadMessageId) {
                const readStatus = messageNode.querySelector(".Message-ReadStatus");
                if (readStatus) readStatus.outerHTML = getStageOneReadStatusMarkup(true);
            }
        });
    }

    // 13-12.원격 반응 수신시 배지 갱신
    function applyRemoteReaction(reaction) {
        // 본인이 보낸 반응은 addReaction()에서 이미 낙관적으로 반영했으므로
        // 서버 에코는 무시한다 (중복 카운트 방지).
        if (Number(reaction.memberId) === currentMemberId) return;

        const messageId = reaction.messageId;
        const emoji = reaction.emoji;
        const isRemoved = reaction.removed === true;
        const targetChat = chatMessageList?.querySelector(`[data-message-id="${messageId}"]`);
        if (!targetChat) return;

        const reactionsDiv = targetChat.querySelector(".Message-Reactions");
        if (!reactionsDiv) return;

        if (isRemoved) {
            const existing = [...reactionsDiv.querySelectorAll(".Reaction-Badge")]
                .find((badge) => badge.dataset.emoji === emoji);
            if (existing) {
                const countEl = existing.querySelector(".Reaction-Count");
                const count = parseInt(countEl.textContent) - 1;
                if (count <= 0) {
                    existing.remove();
                } else {
                    countEl.textContent = count;
                }
            }
        } else {
            const existing = [...reactionsDiv.querySelectorAll(".Reaction-Badge")]
                .find((badge) => badge.dataset.emoji === emoji);
            if (existing) {
                const countEl = existing.querySelector(".Reaction-Count");
                countEl.textContent = parseInt(countEl.textContent) + 1;
            } else {
                const badge = document.createElement("div");
                badge.classList.add("Reaction-Badge");
                badge.dataset.emoji = emoji;
                badge.innerHTML = `<span>${emoji}</span><span class="Reaction-Count">1</span>`;
                badge.addEventListener("click", () => addReaction(emoji, targetChat));
                reactionsDiv.appendChild(badge);
            }
        }

        if (reactionsDiv.children.length > 0) {
            targetChat.classList.add("has-reaction");
        } else {
            targetChat.classList.remove("has-reaction");
        }
    }

    // 13-13.XSS 방지용 HTML 이스케이프
    function escapeStageOneHtml(value) {
        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    // 14.반응 추가 삭제
    async function addReaction(emoji, targetChat) {
        if (!targetChat) return;

        const reactionsDiv = targetChat.querySelector(".Message-Reactions");
        if (!reactionsDiv) return;
        const messageId = targetChat.dataset.messageId;

        const myCurrentReaction = reactionsDiv.querySelector(".Reaction-Badge.my-reaction");

        if (myCurrentReaction && myCurrentReaction.dataset.emoji === emoji) {
            try {
                if (messageId) await ChatService.removeReaction(messageId, emoji, currentRoomId);
            } catch (error) {
                console.error("반응 삭제 실패", error);
            }
            const countEl = myCurrentReaction.querySelector(".Reaction-Count");
            const count = parseInt(countEl.textContent) - 1;
            if (count <= 0) {
                myCurrentReaction.remove();
            } else {
                countEl.textContent = count;
                myCurrentReaction.classList.remove("my-reaction");
            }
            if (reactionsDiv.children.length === 0) targetChat.classList.remove("has-reaction");
            return;
        }

        if (myCurrentReaction) {
            const oldEmoji = myCurrentReaction.dataset.emoji;
            try {
                if (messageId) await ChatService.removeReaction(messageId, oldEmoji, currentRoomId);
            } catch (error) {
                console.error("기존 반응 삭제 실패", error);
            }
            const countEl = myCurrentReaction.querySelector(".Reaction-Count");
            const count = parseInt(countEl.textContent) - 1;
            if (count <= 0) {
                myCurrentReaction.remove();
            } else {
                countEl.textContent = count;
                myCurrentReaction.classList.remove("my-reaction");
            }
        }

        try {
            if (messageId) await ChatService.addReaction(messageId, emoji, currentRoomId);
        } catch (error) {
            console.error("반응 추가 실패", error);
            return;
        }

        const existing = [...reactionsDiv.querySelectorAll(".Reaction-Badge")]
            .find((badge) => badge.dataset.emoji === emoji);

        if (existing) {
            const countEl = existing.querySelector(".Reaction-Count");
            countEl.textContent = parseInt(countEl.textContent) + 1;
            existing.classList.add("my-reaction");
        } else {
            const badge = document.createElement("div");
            badge.classList.add("Reaction-Badge", "my-reaction");
            badge.dataset.emoji = emoji;
            badge.innerHTML = `<span>${emoji}</span><span class="Reaction-Count">1</span>`;
            badge.addEventListener("click", () => addReaction(emoji, targetChat));
            reactionsDiv.appendChild(badge);
        }

        if (reactionsDiv.children.length > 0) {
            targetChat.classList.add("has-reaction");
        } else {
            targetChat.classList.remove("has-reaction");
        }
    }

    // 15.초기화 실행
    applyStageOnePartnerProfile();
    connectStageOneSocket();

    async function initializeStageOneChat() {
        await loadStageOneRoomList();

        const initialRoomId = Number(chatLayoutEl.dataset.conversationId || defaultConversationId || 0);
        const hasInitialConversationId = initialRoomId > 0;
        const canAutoOpenRoom = hasInitialConversationId &&
            stageOneRooms.some((room) => room.conversationId === initialRoomId);

        if (canAutoOpenRoom) {
            openChatRoom();
            await activateStageOneRoom(initialRoomId);
            return;
        }

        currentRoomId = 0;
        pendingSubscriptionRoomId = null;
        closeChatRoom();
        applyStageOnePartnerProfile();
    }

    // -------------------------------------------------------
    // 화상통화 관련
    // -------------------------------------------------------

    // 화상통화 연결
    async function startVideoCall() {
        if (!currentMemberId || !currentPartnerId) {
            console.error("통화 상대방 정보가 없습니다.");
            return;
        }

        try {
            const response = await fetch("/api/video-chat/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: currentPartnerId,
                    receiverName: currentMemberName
                })
            });

            if (!response.ok) throw new Error("세션 생성 실패: " + response.status);

            const sessionData = await response.json();
            const roomName = sessionData.roomName || "conversation-" + sessionData.conversationId;
            sessionId = sessionData.id;
            console.log(sessionId);

            // [임시 - 로컬 테스트용 프록시] 배포 시 아래 requestLiveKitToken 원본으로 교체
            const token = await requestLiveKitToken(roomName);
            window.location.href = `/video-chat/join?token=${encodeURIComponent(token)}&roomName=${encodeURIComponent(roomName)}&sessionId=${sessionId}&userName=${encodeURIComponent(currentMemberName)}&partnerName=${encodeURIComponent(currentPartnerName)}&partnerId=${currentPartnerId}`;

        } catch (error) {
            console.error("화상통화 시작 실패:", error.message);
        }
    }

    async function requestLiveKitToken(roomName, participantName) {
        const response = await fetch(LIVEKIT_SERVER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName, participantName })
        });
        if (!response.ok) throw new Error("토큰 발급 실패: " + response.status);
        const data = await response.json();
        return data.token;
    }

    // 화상통화 STOMP 이벤트 구독
    async function subscribeVideoCallEvents() {
        if (!stompClient || !stompClient.connected) {
            console.warn("STOMP 미연결 상태 - 화상통화 구독 실패");
            return;
        }

        // 서버에서 현재 로그인한 유저 id 조회
        const response = await fetch("/api/video-chat/me");
        const { memberId, memberName, memberHandle } = await response.json();
        loginedMemberId = memberId;
        currentMemberName = memberName;
        currentMemberHandle = memberHandle;

        console.log("화상통화 구독 시작 - memberId: ", memberId);

        stompClient.subscribe(`/topic/video-call.${memberId}`, (message) => {
            const payload = JSON.parse(message.body);
            if (payload.type === "REQUEST") {
                showVideoCallModal(payload);
            } else if (payload.type === "REJECTED") {
                alert(`${payload.callerName}님이 통화를 거절했습니다.`);
            }
        });
    }

    // 수락/거절 모달 표시
    function showVideoCallModal(payload) {
        const modal = document.getElementById("videoCallModal");
        const message = document.getElementById("videoCallMessage");
        const acceptBtn = document.getElementById("videoCallAccept");
        const rejectBtn = document.getElementById("videoCallReject");

        message.textContent = `${payload.callerName}님이 화상통화를 요청했습니다.`;
        modal.classList.remove("off");
        modal.classList.add("on");
        modalBackDrop.classList.remove("off");

        // 수락 버튼
        acceptBtn.onclick = async () => {
            modal.classList.add("off");
            modal.classList.remove("on");
            modalBackDrop.classList.add("off");
            try {
                const token = await requestLiveKitToken(payload.roomName);
                window.location.href = `/video-chat/join?token=${encodeURIComponent(token)}&roomName=${encodeURIComponent(payload.roomName)}&sessionId=${payload.sessionId || ""}&userName=${encodeURIComponent(currentMemberName)}&partnerName=${encodeURIComponent(payload.callerName)}&partnerId=${payload.callerId}`;
            } catch (error) {
                console.error("통화 수락 실패:", error.message);
            }
        };

        // 거절 버튼
        rejectBtn.onclick = async () => {
            modal.classList.add("off");
            modal.classList.remove("on");
            modalBackDrop.classList.add("off");
            try {
                await fetch("/api/video-chat/session/reject", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ callerId: payload.callerId })
                });
            } catch (error) {
                console.error("통화 거절 실패:", error.message);
            }
        };
    }

    initializeStageOneChat();
};
