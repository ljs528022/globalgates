window.onload = () => {
    "use strict";

    let memberId = null;  // 로그인 사용자 = viewerId

    // 페이지 주인 정보 (서버 렌더 데이터 속성에서 읽음)
    const mainEl = document.querySelector(".main-content");
    const pageMemberIdAttr = mainEl ? mainEl.dataset.pageMemberId : "";
    const isOwnerAttr = mainEl ? mainEl.dataset.isOwner : "true";
    const pageMemberId = pageMemberIdAttr ? Number(pageMemberIdAttr) : null;
    const isOwner = isOwnerAttr !== "false";

    // URL 파라미터로 초기 탭 결정 (mypage에서 진입 시 tab=followers/followings)
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    const allowedTabs = isOwner
        ? ["recommend", "followers", "followings"]
        : ["followers", "followings"];
    const initialTab = allowedTabs.includes(tabParam)
        ? tabParam
        : (isOwner ? "recommend" : "followers");

    // 사이드바 게시하기 모달 활성화. memberId는 비동기로 채워지므로 getter로 늦은 바인딩.
    postModalApi.bootstrap({
        services: service,
        layout: friendsLayout,
        getMemberId: () => memberId,
    });

    // ===== 1. DOM 참조 =====
    const scrollEl = document.getElementById("categoryScroll");
    const btnLeft = document.getElementById("scrollLeft");
    const btnRight = document.getElementById("scrollRight");

    const modal = document.getElementById("disconnectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalConfirm = document.getElementById("modalConfirm");
    const modalCancel = document.getElementById("modalCancel");

    const headerBackButton = document.getElementById("headerBack");

    // ===== 2. 화면 상태 =====
    let pendingDisconnectButton = null;
    let selectedCategoryId = null;
    let currentTab = initialTab;

    // 실제 조회 대상 회원 = pageMemberId (없으면 본인 = memberId)
    const targetProfileId = () => pageMemberId || memberId;

    // ===== 3. 페이징 + 무한스크롤 =====
    let page = 1;
    let checkScroll = true;
    let hasMore = true;

    // 카테고리 데이터 (서버에서 로드)
    let categories = [];
    let originalChipsHTML = "";

    const loadList = async () => {
        if (currentTab === "recommend") {
            await friendsService.getFriendsList(page, memberId, selectedCategoryId, (data) => {
                if (page === 1 && data.friends.length === 0) {
                    friendsLayout.showEmptyState("추천할 회원이 없습니다");
                    hasMore = false;
                    return;
                }
                friendsLayout.showFriendsList(data.friends, page, "recommend");
                hasMore = data.criteria.hasMore;
            });
            return;
        }
        if (currentTab === "followers") {
            await friendsService.getFollowersList(page, targetProfileId(), memberId, (data) => {
                updateTabCount("followers", data.total);
                if (page === 1 && data.friends.length === 0) {
                    friendsLayout.showEmptyState("아직 커넥터가 없습니다");
                    hasMore = false;
                    return;
                }
                friendsLayout.showFriendsList(data.friends, page, "followers");
                hasMore = data.criteria.hasMore;
            });
            return;
        }
        if (currentTab === "followings") {
            await friendsService.getFollowingsList(page, targetProfileId(), memberId, (data) => {
                updateTabCount("followings", data.total);
                if (page === 1 && data.friends.length === 0) {
                    friendsLayout.showEmptyState("아직 커넥팅한 회원이 없습니다");
                    hasMore = false;
                    return;
                }
                friendsLayout.showFriendsList(data.friends, page, "followings");
                hasMore = data.criteria.hasMore;
            });
        }
    };

    // 탭 옆 카운트 갱신
    const updateTabCount = (tabName, total) => {
        if (total === undefined || total === null) return;
        const tab = document.querySelector(`.friends-tab[data-tab="${tabName}"]`);
        if (!tab) return;
        const countSpan = tab.querySelector(".friends-tab-count");
        if (countSpan) countSpan.textContent = total;
    };

    // 카테고리 칩 렌더링 (대카테고리만)
    const renderCategoryChips = () => {
        if (!scrollEl) return;
        console.log("들어옴1 renderCategoryChips, categories:", categories);

        const parents = categories.filter(c => c.productCategoryParentId === null);

        let html = `<button class="cat-chip active" data-cat-id="">전체</button>`;
        parents.forEach(parent => {
            html += `<button class="cat-chip" data-cat-id="${parent.id}">${parent.categoryName}</button>`;
        });

        scrollEl.innerHTML = html;
        originalChipsHTML = html;
        scrollEl.scrollLeft = 0;
        scheduleScrollArrowVisibilityUpdate();
    };

    // 초기 데이터 로드
    const loadInitialData = async () => {
        const member = await friendsService.getMyInfo();
        memberId = member.id;

        // 본인 페이지 + 추천 탭 진입일 때만 카테고리 칩 로드
        if (isOwner) {
            await friendsService.getCategories((data) => {
                categories = data;
                renderCategoryChips();
            });
        }

        await loadList();
    };

    loadInitialData();

    // 무한스크롤
    window.addEventListener("scroll", async () => {
        if (!checkScroll || !hasMore) return;
        const { scrollY, innerHeight } = window;
        const documentHeight = document.documentElement.scrollHeight;
        if (scrollY + innerHeight >= documentHeight - 1) {
            checkScroll = false;
            page++;
            await loadList();
            setTimeout(() => { checkScroll = true; }, 1000);
        }
    });

    // ===== 4. 카테고리 배너 =====
    function updateScrollArrowVisibility() {
        if (!scrollEl || !btnLeft || !btnRight) return;
        btnLeft.style.display = scrollEl.scrollLeft > 0 ? "flex" : "none";
        btnRight.style.display =
            scrollEl.scrollLeft < scrollEl.scrollWidth - scrollEl.clientWidth - 1
                ? "flex" : "none";
    }

    function scheduleScrollArrowVisibilityUpdate() {
        window.setTimeout(updateScrollArrowVisibility, 50);
    }

    function setActiveChip(chip) {
        if (!scrollEl || !chip) return;
        const allChips = scrollEl.querySelectorAll(".cat-chip");
        allChips.forEach((chipButton) => {
            chipButton.classList.remove("active");
        });
        chip.classList.add("active");
    }

    async function handleCategoryClick(event) {
        const clickedChip = event.target.closest(".cat-chip");
        if (!clickedChip) return;
        console.log("들어옴1 handleCategoryClick, catId:", clickedChip.dataset.catId);

        setActiveChip(clickedChip);

        // 카테고리 필터 적용
        const catId = clickedChip.dataset.catId;
        selectedCategoryId = catId || null;
        page = 1;
        await loadList();
    }

    // ===== 5. Connect/Disconnect =====
    function isExpertButton(button) {
        return button.dataset.expert === "true";
    }

    function getHandleFromButton(button) {
        const userCard = button.closest("[data-handle]");
        if (userCard) return userCard.dataset.handle || "";
        return "";
    }

    function getMemberIdFromButton(button) {
        const userCard = button.closest("[data-member-id]");
        if (userCard) return userCard.dataset.memberId;
        return button.dataset.memberId;
    }

    function openDisconnectModal(button) {
        if (!modal || !modalTitle) return;
        pendingDisconnectButton = button;
        const handle = getHandleFromButton(button);
        const expert = isExpertButton(button);
        const askText = expert ? "님을 Unfollow 하시겠습니까?" : "님과의 연결을 끊으시겠습니까?";
        const fallback = expert ? "Unfollow 하시겠습니까?" : "연결을 끊으시겠습니까?";
        modalTitle.textContent = handle ? (handle + " " + askText) : fallback;
        modal.classList.add("active");
    }

    function closeDisconnectModal() {
        if (!modal) return;
        modal.classList.remove("active");
        pendingDisconnectButton = null;
    }

    function resetButtonToDefault(button) {
        button.classList.remove("connected");
        button.classList.add("default");
        button.textContent = isExpertButton(button) ? "Follow" : "Connect";
        button.style.borderColor = "";
        button.style.color = "";
        button.style.background = "";
    }

    function setButtonToConnected(button) {
        button.classList.remove("default");
        button.classList.add("connected");
        button.textContent = isExpertButton(button) ? "Following" : "Connected";
    }

    function updateConnectedButtonHoverState(button, isHovering) {
        const expert = isExpertButton(button);
        if (isHovering) {
            button.textContent = expert ? "Unfollow" : "Disconnect";
            button.style.borderColor = "#f4212e";
            button.style.color = "#f4212e";
            button.style.background = "rgba(244,33,46,.1)";
            return;
        }
        button.textContent = expert ? "Following" : "Connected";
        button.style.borderColor = "#cfd9de";
        button.style.color = "#0f1419";
        button.style.background = "transparent";
    }

    function handleConnectedButtonMouseOver(event) {
        const hoveredButton = event.target.closest(".connect-btn.connected");
        if (!hoveredButton) return;
        updateConnectedButtonHoverState(hoveredButton, true);
    }

    function handleConnectedButtonMouseOut(event) {
        const hoveredButton = event.target.closest(".connect-btn.connected");
        if (!hoveredButton) return;
        updateConnectedButtonHoverState(hoveredButton, false);
    }

    async function handleConnectButtonClick(event) {
        const clickedButton = event.target.closest(".connect-btn");
        if (!clickedButton) return;

        const followingId = getMemberIdFromButton(clickedButton);

        if (clickedButton.classList.contains("default")) {
            await friendsService.follow(memberId, followingId);
            setButtonToConnected(clickedButton);
            return;
        }

        if (clickedButton.classList.contains("connected")) {
            openDisconnectModal(clickedButton);
        }
    }

    // ===== 6. 이벤트 바인딩 =====
    const tabs = document.querySelectorAll(".friends-tab");
    const categoryBanner = document.getElementById("categoryBanner");

    // 초기 탭 active 동기화 (URL 파라미터로 진입한 경우 Thymeleaf 기본값을 덮어씀)
    tabs.forEach(tab => {
        if (tab.dataset.tab === currentTab) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
    if (categoryBanner) {
        categoryBanner.style.display = currentTab === "recommend" ? "" : "none";
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", async () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentTab = tab.dataset.tab;
            page = 1;
            if (categoryBanner) {
                categoryBanner.style.display = currentTab === "recommend" ? "" : "none";
            }
            await loadList();
        });
    });

    if (scrollEl) {
        scrollEl.addEventListener("scroll", updateScrollArrowVisibility);
        scrollEl.addEventListener("click", handleCategoryClick);
        window.addEventListener("resize", updateScrollArrowVisibility);
        updateScrollArrowVisibility();
    }

    if (btnLeft && scrollEl) {
        btnLeft.addEventListener("click", () => {
            scrollEl.scrollBy({ left: -200, behavior: "smooth" });
        });
    }

    if (btnRight && scrollEl) {
        btnRight.addEventListener("click", () => {
            scrollEl.scrollBy({ left: 200, behavior: "smooth" });
        });
    }

    if (modalConfirm) {
        modalConfirm.addEventListener("click", async () => {
            if (pendingDisconnectButton) {
                const followingId = getMemberIdFromButton(pendingDisconnectButton);
                await friendsService.unfollow(memberId, followingId);
                resetButtonToDefault(pendingDisconnectButton);
            }
            closeDisconnectModal();
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener("click", closeDisconnectModal);
    }

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeDisconnectModal();
            }
        });
    }

    document.addEventListener("click", handleConnectButtonClick);
    document.addEventListener("mouseover", handleConnectedButtonMouseOver);
    document.addEventListener("mouseout", handleConnectedButtonMouseOut);

    if (headerBackButton) {
        headerBackButton.addEventListener("click", () => {
            history.back();
        });
    }

    console.log("[Friends] 페이지 로드 완료.");
};
