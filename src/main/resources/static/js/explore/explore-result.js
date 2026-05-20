window.onload = () => {
    // 사이드바 게시하기 + 공용 답글 모달 활성화. memberId는 explore-result.html inline top-level const.
    postModalApi.bootstrap({
        services: service,
        layout: layout,
        getMemberId: () => memberId,
        // 답글 게시 후 검색 결과 카드의 답글 카운트 +1.
        onReplySubmitSuccess: ({ button }) => {
            updateReplyCount(button);
        },
    });

    const tabPopular = document.getElementById("tabPopular");
    const tabLatest = document.getElementById("tabLatest");
    const tabMembers = document.getElementById("tabMembers");

    const popularSection = document.getElementById("popularSection");
    const latestSection = document.getElementById("latestSection");
    const membersSection = document.getElementById("membersSection");

    async function getLoginMemberInfo() {
        try {
            const response = await fetch("/api/member/info", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) throw new Error("유저 정보 조회 실패");
            let member = await response.json();
            return member.id;

        } catch (err) {
            console.error("getLoginMemberInfo 실패:", err);
            return null;
        }
    }

    if (tabPopular && tabLatest && tabMembers && popularSection && latestSection && membersSection) {
        function showPopularTab() {
            tabPopular.classList.add("isActive");
            tabPopular.setAttribute("aria-current", "page");
            tabLatest.classList.remove("isActive");
            tabLatest.removeAttribute("aria-current");
            tabMembers.classList.remove("isActive");
            tabMembers.removeAttribute("aria-current");

            popularSection.hidden = false;
            latestSection.hidden = true;
            membersSection.hidden = true;
        }

        function showLatestTab() {
            tabLatest.classList.add("isActive");
            tabLatest.setAttribute("aria-current", "page");
            tabPopular.classList.remove("isActive");
            tabPopular.removeAttribute("aria-current");
            tabMembers.classList.remove("isActive");
            tabMembers.removeAttribute("aria-current");

            popularSection.hidden = true;
            latestSection.hidden = false;
            membersSection.hidden = true;
        }

        function showMembersTab() {
            tabMembers.classList.add("isActive");
            tabMembers.setAttribute("aria-current", "page");
            tabPopular.classList.remove("isActive");
            tabPopular.removeAttribute("aria-current");
            tabLatest.classList.remove("isActive");
            tabLatest.removeAttribute("aria-current");

            popularSection.hidden = true;
            latestSection.hidden = true;
            membersSection.hidden = false;
        }

        tabPopular.addEventListener("click", () => {
            showPopularTab();
            currentTab = "popular";
            if (scrollStates.popular.page === 1) {
                loadTab("popular", true);
            }
        });
        tabLatest.addEventListener("click", () => {
            showLatestTab();
            currentTab = "latest";
            if (scrollStates.latest.page === 1) {
                loadTab("latest", true);
            }
        });
        tabMembers.addEventListener("click", () => {
            showMembersTab();
            currentTab = "members";
            if (scrollStates.members.page === 1) {
                loadTab("members", true);
            }
        });
    }

    // ── 탭별 무한 스크롤 상태 관리 ───────────────────────
    const scrollStates = {
        popular: { page: 1, isLoading: false, hasMore: true },
        latest:  { page: 1, isLoading: false, hasMore: true },
        members: { page: 1, isLoading: false, hasMore: true },
    };

    let currentTab = "popular";

    function attachSentinel(sectionEl, tab) {
        const existing = sectionEl.querySelector(".scrollSentinel");
        if (existing) existing.remove();

        const sentinel = document.createElement("div");
        sentinel.className = "scrollSentinel";
        sectionEl.appendChild(sentinel);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadTab(tab, false);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(sentinel);
    }

    async function loadTab(tab, isFirst = false) {
        const state = scrollStates[tab];
        if (!state || state.isLoading || !state.hasMore) return;

        const currentKeyword = new URLSearchParams(location.search).get("keyword") ?? "";
        if (!currentKeyword.trim()) return;

        state.isLoading = true;

        try {
            if (tab === "popular") {
                console.log('인기순');

                const criteria = await exploreService.searchPosts(
                    state.page,
                    { keyword: currentKeyword, type: "popular" },
                    (data) => {
                        exploreLayout.showSearchPosts(data, !isFirst, "popularSection");
                    }
                );
                state.hasMore = criteria?.hasMore ?? false;
                state.page++;
                if (isFirst) attachSentinel(popularSection, "popular");

            } else if (tab === "latest") {
                console.log('최신순');

                const criteria = await exploreService.searchPosts(
                    state.page,
                    { keyword: currentKeyword, type: "latest" },
                    (data) => {
                        exploreLayout.showSearchPosts(data, !isFirst, "latestSection");
                    }
                );
                state.hasMore = criteria?.hasMore ?? false;
                state.page++;
                if (isFirst) attachSentinel(latestSection, "latest");

            } else if (tab === "members") {
                console.log('유저 조회');

                const criteria = await exploreService.searchUsers(
                    state.page,
                    currentKeyword,
                    (data) => {
                        exploreLayout.showSearchMembers(data, !isFirst);
                    }
                );
                state.hasMore = criteria?.hasMore ?? false;
                state.page++;
                if (isFirst) attachSentinel(membersSection, "members");
            }

        } catch (e) {
            console.error(`${tab} 탭 로드 실패:`, e);
        } finally {
            state.isLoading = false;
        }
    }

// 검색 패널
// ── URL에서 현재 검색어 추출 ──────────────────────────────
    const keyword = new URLSearchParams(location.search).get("keyword") ?? "";

    const searchForm        = document.getElementById("searchForm");
    const searchInput       = document.getElementById("searchInput");
    const searchClearBtn    = document.getElementById("searchClearBtn");
    const searchPanel       = document.getElementById("searchPanel");
    const searchPanelEmpty  = document.getElementById("searchPanelEmpty");
    const searchRecentSec   = document.getElementById("searchRecentSection");
    const searchResultsEl   = document.getElementById("searchResults");
    const searchResultTopic = document.getElementById("searchResultTopic");
    const searchResultLabel = document.getElementById("searchResultLabel");
    const searchResultList  = document.getElementById("searchResultList");

    // ✅ 페이지 진입 시 URL의 keyword를 검색창에 미리 채워넣기
    if (searchInput && keyword) {
        searchInput.value = keyword;
    }

    let suggestionTimer = null;

    // ── 공통 toast 함수 ───────────────────────────────────
    // Post-Card IIFE 안의 showToast와 별개로, 검색 패널에서도 사용할 수 있도록 전역 선언
    function showToast(message, extraClass) {
        const existing = document.querySelector(".toast");
        if (existing) existing.remove();
        const toast = document.createElement("div");
        toast.className = "toast";
        if (extraClass) toast.classList.add(extraClass);
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    if (searchForm && searchInput && searchPanel) {

        // ── 최근검색 항목 개수 확인 ───────────────────────────
        function hasRecentItems() {
            return searchRecentSec &&
                searchRecentSec.querySelectorAll(".searchResultItem--recent").length > 0;
        }

        // ── 패널 케이스별 표시 ────────────────────────────────
        function showEmpty() {
            if (searchPanelEmpty) searchPanelEmpty.hidden = false;
            if (searchRecentSec)  searchRecentSec.hidden  = true;
            if (searchResultsEl)  searchResultsEl.hidden  = true;
        }

        function showRecent() {
            if (searchPanelEmpty) searchPanelEmpty.hidden = true;
            if (searchRecentSec)  searchRecentSec.hidden  = false;
            if (searchResultsEl)  searchResultsEl.hidden  = true;
        }

        function showResults(val) {
            if (searchResultLabel) searchResultLabel.textContent = `"${val}" 검색`;
            if (searchPanelEmpty)  searchPanelEmpty.hidden = true;
            if (searchRecentSec)   searchRecentSec.hidden  = true;
            if (searchResultsEl)   searchResultsEl.hidden  = false;
        }

        // ── 검색 이동 — 같은 페이지에서 API 재호출 ───────────
        function goToSearch(kw) {
            if (!kw.trim()) return;
            searchForm.classList.remove("isFocused");
            searchPanel.hidden = true;

            // 검색창 값 업데이트
            searchInput.value = kw.trim();

            // URL만 변경 (페이지 이동 없이)
            const newUrl = `/explore/search?keyword=${encodeURIComponent(kw.trim())}`;
            history.pushState(null, "", newUrl);

            // 탭 상태 초기화 후 인기순 탭 기준으로 재검색
            scrollStates.popular = { page: 1, isLoading: false, hasMore: true };
            scrollStates.latest  = { page: 1, isLoading: false, hasMore: true };
            scrollStates.members = { page: 1, isLoading: false, hasMore: true };

            loadTab("popular", true);
        }

        // ── 최근 검색어를 서버에서 받아 렌더링 ───────────────
        function loadRecentKeywords() {
            exploreService.getRecentKeywords((keywords) => {
                exploreLayout.showRecentKeywords(
                    keywords,
                    (kw) => goToSearch(kw),
                    (id) => exploreService.deleteKeyword(id),
                    () => showToast("검색어가 삭제되었습니다.")
                );
                updatePanel();
            });
        }

        // ── 연관 검색어를 서버에서 받아 렌더링 ───────────────
        function loadSuggestions(kw) {
            exploreService.getSuggestions(kw, (suggestions) => {
                exploreLayout.showSuggestions(suggestions, (suggestion) => {
                    goToSearch(suggestion);
                });
            });
        }

        // ── clear 버튼 표시 동기화 ────────────────────────────
        function updateSearchClearButton() {
            if (searchClearBtn) {
                searchClearBtn.hidden = searchInput.value.length === 0;
            }
        }

        // ── 패널 상태 통합 업데이트 ───────────────────────────
        function updatePanel() {
            const val = searchInput.value.trim();
            updateSearchClearButton();
            if (val.length > 0) {
                showResults(val);
                clearTimeout(suggestionTimer);
                suggestionTimer = setTimeout(() => {
                    loadSuggestions(val);
                }, 300);
            } else if (hasRecentItems()) {
                showRecent();
            } else {
                showEmpty();
            }
        }

        // ── 이벤트 바인딩 ─────────────────────────────────────
        searchPanel.addEventListener("mousedown", (e) => {
            e.preventDefault();
        });

        // 포커스 → 최근 검색어 로드 후 패널 열기
        searchInput.addEventListener("focus", () => {
            searchForm.classList.add("isFocused");
            searchPanel.hidden = false;
            loadRecentKeywords();
            updatePanel();
        });

        searchInput.addEventListener("input", () => {
            updatePanel();
        });

        if (searchClearBtn) {
            searchClearBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                searchInput.value = "";
                updatePanel();
                searchInput.focus();
            });
        }

        searchInput.addEventListener("blur", () => {
            if (!document.hasFocus()) return;
            searchForm.classList.remove("isFocused");
            searchPanel.hidden = true;
        });

        // Enter: 검색 이동 / Escape: 패널 닫기
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                goToSearch(searchInput.value);
            }
            if (e.key === "Escape") {
                searchForm.classList.remove("isFocused");
                searchPanel.hidden = true;
                searchInput.blur();
            }
        });

        if (searchResultTopic) {
            searchResultTopic.addEventListener("click", () => {
                goToSearch(searchInput.value);
            });
        }

        // 모두 지우기
        if (searchRecentSec) {
            const clearAllBtn = searchRecentSec.querySelector(".searchRecentClearAll");
            if (clearAllBtn) {
                clearAllBtn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    await exploreService.deleteAllKeywords();
                    searchRecentSec
                        .querySelectorAll(".searchResultItem--recent")
                        .forEach(el => el.remove());
                    const header = searchRecentSec.querySelector(".searchRecentHeader");
                    if (header) header.hidden = true;
                    showEmpty();
                    showToast("모든 검색어가 삭제되었습니다.");
                });
            }
        }

        updateSearchClearButton();
    }

// postMoreButton 더보기 드롭다운 (팔로우/차단/신고)
    (function () {
        let followState = {};
        const reportReasons = [
            "다른 회사 제품 도용 신고",
            "실제 존재하지 않는 제품 등록 신고",
            "스펙·원산지 허위 표기 신고",
            "특허 제품 무단 판매 신고",
            "수출입 제한 품목 신고",
            "반복적인 동일 게시물 신고"
        ];

        let activeMoreDropdown = null;
        let activeMoreButton = null;
        let activeMoreModal = null;

        function getUserMetaFromButton(button) {
            const card = button.closest(".postCard");
            const handleEl = card ? card.querySelector(".postHandle") : null;
            const nameEl = card ? card.querySelector(".postName") : null;
            const handle = handleEl ? (handleEl.textContent || "").trim() : "@user";
            const name = nameEl ? (nameEl.textContent || "").trim() : "사용자";
            return {handle: handle, name: name};
        }

        function showPostMoreToast(message) {
            const existing = document.querySelector(".notification-toast");
            if (existing) {
                existing.remove();
            }
            const toast = document.createElement("div");
            toast.className = "notification-toast";
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(function () {
                toast.remove();
            }, 3000);
        }

        function closePostMoreDropdown() {
            if (!activeMoreDropdown) {
                return;
            }
            activeMoreDropdown.remove();
            activeMoreDropdown = null;
            if (activeMoreButton) {
                activeMoreButton.setAttribute("aria-expanded", "false");
                activeMoreButton = null;
            }
        }

        function closePostMoreModal() {
            if (!activeMoreModal) {
                return;
            }
            activeMoreModal.remove();
            activeMoreModal = null;
            document.body.classList.remove("modal-open");
        }

        function openBlockModal(button) {
            const meta = getUserMetaFromButton(button);
            const handle = meta.handle;
            closePostMoreDropdown();
            closePostMoreModal();
            const modal = document.createElement("div");
            modal.className = "notification-dialog";
            modal.classList.add("notification-dialog--block");
            modal.innerHTML =
                '<div class="notification-dialog__backdrop"></div>' +
                '<div class="notification-dialog__card notification-dialog__card--small" role="alertdialog" aria-modal="true">' +
                '<h2 class="notification-dialog__title">' + handle + ' 님을 차단할까요?</h2>' +
                '<p class="notification-dialog__description">내 공개 게시물을 볼 수 있지만 더 이상 게시물에 참여할 수 없습니다. 또한 ' + handle + ' 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.</p>' +
                '<div class="notification-dialog__actions">' +
                '<button type="button" class="notification-dialog__danger notification-dialog__confirm-block">차단</button>' +
                '<button type="button" class="notification-dialog__secondary notification-dialog__close">취소</button>' +
                '</div>' +
                '</div>';
            modal.addEventListener("click", function (e) {
                if (
                    e.target.classList.contains("notification-dialog__backdrop") ||
                    e.target.closest(".notification-dialog__close")
                ) {
                    e.preventDefault();
                    closePostMoreModal();
                    return;
                }
                if (e.target.closest(".notification-dialog__confirm-block")) {
                    e.preventDefault();
                    showPostMoreToast(handle + " 님을 차단했습니다");
                    closePostMoreModal();
                }
            });
            document.body.appendChild(modal);
            document.body.classList.add("modal-open");
            activeMoreModal = modal;
        }

        function openReportModal(button) {
            closePostMoreDropdown();
            closePostMoreModal();
            let listHtml = "";
            for (let i = 0; i < reportReasons.length; i++) {
                listHtml +=
                    '<li><button type="button" class="notification-report__item">' +
                    '<span>' + reportReasons[i] + '</span>' +
                    '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.293 6.293 10.707 4.88 17.828 12l-7.121 7.12-1.414-1.413L14.999 12z"></path></g></svg>' +
                    '</button></li>';
            }
            const modal = document.createElement("div");
            modal.className = "notification-dialog";
            modal.classList.add("notification-dialog--report");
            modal.innerHTML =
                '<div class="notification-dialog__backdrop"></div>' +
                '<div class="notification-dialog__card notification-dialog__card--report" role="dialog" aria-modal="true">' +
                '<div class="notification-dialog__header">' +
                '<button type="button" class="notification-dialog__icon-btn notification-dialog__close" aria-label="돌아가기">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg>' +
                '</button>' +
                '<h2 class="notification-dialog__title">신고하기</h2>' +
                '</div>' +
                '<div class="notification-dialog__body">' +
                '<p class="notification-dialog__question">이 게시물에 어떤 문제가 있나요?</p>' +
                '<ul class="notification-report__list">' + listHtml + '</ul>' +
                '</div>' +
                '</div>';
            modal.addEventListener("click", function (e) {
                if (
                    e.target.classList.contains("notification-dialog__backdrop") ||
                    e.target.closest(".notification-dialog__close")
                ) {
                    e.preventDefault();
                    closePostMoreModal();
                    return;
                }
                if (e.target.closest(".notification-report__item")) {
                    e.preventDefault();
                    showPostMoreToast("신고가 접수되었습니다");
                    closePostMoreModal();
                }
            });
            document.body.appendChild(modal);
            document.body.classList.add("modal-open");
            activeMoreModal = modal;
        }

        function handleDropdownAction(button, actionClass) {
            const meta = getUserMetaFromButton(button);
            const handle = meta.handle;
            if (actionClass === "menu-item--follow-toggle") {
                const isF = followState[handle] ? true : false;
                followState[handle] = !isF;
                closePostMoreDropdown();
                showPostMoreToast(isF ? (handle + " 님 팔로우를 취소했습니다") : (handle + " 님을 팔로우했습니다"));
                return;
            }
            if (actionClass === "menu-item--block") {
                openBlockModal(button);
                return;
            }
            if (actionClass === "menu-item--report") {
                openReportModal(button);
            }
        }

        function openPostMoreDropdown(button) {
            closePostMoreDropdown();
            const meta = getUserMetaFromButton(button);
            const handle = meta.handle;
            const isF = followState[handle] ? true : false;
            const rect = button.getBoundingClientRect();
            const top = rect.bottom + window.scrollY + 8;
            const right = Math.max(16, window.innerWidth - rect.right);

            const followIcon = isF
                ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>'
                : '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></g></svg>';
            const followLabel = isF ? (handle + " 님 언팔로우하기") : (handle + " 님 팔로우하기");

            const lc = document.createElement("div");
            lc.className = "layers-dropdown-container";
            lc.innerHTML =
                '<div class="layers-overlay"></div>' +
                '<div class="layers-dropdown-inner">' +
                '<div role="menu" class="dropdown-menu" style="top:' + top + 'px;right:' + right + 'px;display:flex;">' +
                '<div><div class="dropdown-inner">' +
                '<button type="button" role="menuitem" class="menu-item menu-item--follow-toggle">' +
                '<span class="menu-item__icon">' + followIcon + '</span>' +
                '<span class="menu-item__label">' + followLabel + '</span>' +
                '</button>' +
                '<button type="button" role="menuitem" class="menu-item menu-item--block">' +
                '<span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></g></svg></span>' +
                '<span class="menu-item__label">' + handle + ' 님 차단하기</span>' +
                '</button>' +
                '<button type="button" role="menuitem" class="menu-item menu-item--report">' +
                '<span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg></span>' +
                '<span class="menu-item__label">게시물 신고하기</span>' +
                '</button>' +
                '</div></div>' +
                '</div>' +
                '</div>';
            lc.addEventListener("click", function (e) {
                const item = e.target.closest(".menu-item");
                if (!item) {
                    e.stopPropagation();
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                let ac = "";
                if (item.classList.contains("menu-item--follow-toggle")) {
                    ac = "menu-item--follow-toggle";
                } else if (item.classList.contains("menu-item--block")) {
                    ac = "menu-item--block";
                } else if (item.classList.contains("menu-item--report")) {
                    ac = "menu-item--report";
                }
                if (ac && activeMoreButton) {
                    handleDropdownAction(activeMoreButton, ac);
                }
            });
            document.body.appendChild(lc);
            activeMoreDropdown = lc;
            activeMoreButton = button;
            activeMoreButton.setAttribute("aria-expanded", "true");
        }

        // postMoreButton 클릭 (이벤트 위임)
        document.addEventListener("click", (e) => {
            const btn = e.target.closest(".postMoreButton");
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                if (activeMoreButton === btn) {
                    closePostMoreDropdown();
                    return;
                }
                openPostMoreDropdown(btn);
                return;
            }
            // 드롭다운 외부 클릭 시 닫기
            if (activeMoreDropdown && !activeMoreDropdown.contains(e.target)) {
                closePostMoreDropdown();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closePostMoreDropdown();
                closePostMoreModal();
            }
        });

        document.addEventListener("click", (e) => {
            // 버튼/액션 영역 클릭이면 무시
            if (e.target.closest(
                ".tweet-action-bar, .postMoreButton, [data-testid='reply'], " +
                ".tweet-action-btn--like, .tweet-action-btn--bookmark, " +
                ".tweet-action-btn--share, .postAvatar"
            )) return;

            const card = e.target.closest(".postCard");
            if (!card) return;

            const postId = card.dataset.postId;
            if (postId) {
                window.location.href = `/main/post/detail/${postId}`;
            }
        });
    })();

// Connect / Disconnect 버튼
    (function () {
        const modal = document.getElementById("disconnectModal");
        const modalTitle = document.getElementById("disconnectModalTitle");
        const modalConfirm = document.getElementById("disconnectConfirm");
        const modalCancel = document.getElementById("disconnectCancel");
        let pendingBtn = null;

        function getHandleFromButton(button) {
            const userCard = button.closest("[data-handle]");
            return userCard ? (userCard.dataset.handle || "") : "";
        }

        function setButtonToConnected(button) {
            button.classList.remove("default");
            button.classList.add("connected");
            button.textContent = "Connected";
        }

        function showConnectToast(message) {
            const existing = document.querySelector(".notification-toast");
            if (existing) existing.remove();
            const toast = document.createElement("div");
            toast.className = "notification-toast";
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        function resetButtonToDefault(button) {
            button.classList.remove("connected");
            button.classList.add("default");
            button.textContent = "Connect";
            button.style.borderColor = "";
            button.style.color = "";
            button.style.background = "";
        }

        function updateConnectedButtonHoverState(button, isHovering) {
            if (isHovering) {
                button.textContent = "Disconnect";
                button.style.borderColor = "#f4212e";
                button.style.color = "#f4212e";
                button.style.background = "rgba(244,33,46,.1)";
                return;
            }
            button.textContent = "Connected";
            button.style.borderColor = "#cfd9de";
            button.style.color = "#0f1419";
            button.style.background = "transparent";
        }

        function openDisconnectModal(button) {
            if (!modal || !modalTitle) {
                return;
            }
            pendingBtn = button;
            const handle = getHandleFromButton(button);
            modalTitle.textContent = handle ? (handle + " 님과의 연결을 끊으시겠습니까?") : "연결을 끊으시겠습니까?";
            modal.classList.add("active");
        }

        function closeDisconnectModal() {
            if (!modal) {
                return;
            }
            modal.classList.remove("active");
            pendingBtn = null;
        }

        document.addEventListener("click", async (e) => {
            const btn = e.target.closest(".connect-btn");
            if (!btn) return;
            const memberId = btn.dataset.memberId;
            if (!memberId) return;

            if (btn.classList.contains("default")) {
                try {
                    const result = await exploreService.checkFollow(memberId);
                    if (result.includes("팔로우")) {
                        setButtonToConnected(btn);
                        showConnectToast("팔로우했습니다.");
                    }
                } catch (err) {
                    console.error("팔로우 실패:", err);
                }
            } else if (btn.classList.contains("connected")) {
                openDisconnectModal(btn);
            }
        });

        document.addEventListener("mouseover", (e) => {
            const btn = e.target.closest(".connect-btn.connected");
            if (!btn) {
                return;
            }
            updateConnectedButtonHoverState(btn, true);
        });

        document.addEventListener("mouseout", (e) => {
            const btn = e.target.closest(".connect-btn.connected");
            if (!btn) {
                return;
            }
            updateConnectedButtonHoverState(btn, false);
        });

        if (modalConfirm) {
            modalConfirm.addEventListener("click", async (e) => {
                if (pendingBtn) {
                    const memberId = pendingBtn.dataset.memberId;
                    try {
                        if (memberId) {
                            const result = await exploreService.checkFollow(memberId);
                            if (result.includes("언팔로우")) {
                                resetButtonToDefault(pendingBtn);
                                showConnectToast("언팔로우했습니다.");
                            }
                        }
                    } catch (err) {
                        console.error("언팔로우 실패:", err);
                    }
                }
                closeDisconnectModal();
            });
        }

        if (modalCancel) {
            modalCancel.addEventListener("click", (e) => {
                closeDisconnectModal();
            });
        }

        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    closeDisconnectModal();
                }
            });
        }
    })();

// Post-Card 인터랙션 (Like / Bookmark / Share)
    (function () {
        // Toast 알림 — 이 IIFE 안에서만 사용하는 로컬 함수
        function showToast(message, extraClass) {
            const existing = document.querySelector(".toast");
            if (existing) {
                existing.remove();
            }
            const toast = document.createElement("div");
            toast.className = "toast";
            if (extraClass) {
                toast.classList.add(extraClass);
            }
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(function () {
                toast.remove();
            }, 2500);
        }

        function showShareToast(message) {
            const existing = document.querySelector(".share-toast");
            if (existing) {
                existing.remove();
            }
            const toast = document.createElement("div");
            toast.className = "share-toast";
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(function () {
                toast.remove();
            }, 3000);
        }

        function setBookmarkButtonState(button, isActive) {
            if (!button) {
                return;
            }
            const path = button.querySelector("path");
            if (!path) {
                return;
            }
            const activePath = path.getAttribute("data-path-active") || "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z";
            const inactivePath = path.getAttribute("data-path-inactive") || "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z";
            button.classList.toggle("active", isActive);
            path.setAttribute("d", isActive ? activePath : inactivePath);
        }

        let activeShareDropdown = null;
        let activeShareButton = null;
        let activeShareModal = null;

        function closeShareDropdown() {
            if (!activeShareDropdown) {
                return;
            }
            activeShareDropdown.remove();
            activeShareDropdown = null;
            if (activeShareButton) {
                activeShareButton.setAttribute("aria-expanded", "false");
                activeShareButton = null;
            }
        }

        function closeShareModal() {
            if (!activeShareModal) {
                return;
            }
            activeShareModal.remove();
            activeShareModal = null;
        }

        function copyShareLink() {
            closeShareDropdown();
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                showShareToast("링크를 복사하지 못했습니다");
                return;
            }
            navigator.clipboard.writeText(window.location.href).then(function () {
                showShareToast("클립보드로 복사함");
            }).catch(function () {
                showShareToast("링크를 복사하지 못했습니다");
            });
        }

        function openShareChatModal() {
            closeShareDropdown();
            closeShareModal();
            const modal = document.createElement("div");
            modal.className = "share-sheet";
            modal.innerHTML =
                '<div class="share-sheet__backdrop" data-share-close="true"></div>' +
                '<div class="share-sheet__card" role="dialog" aria-modal="true" aria-labelledby="share-chat-title">' +
                '<div class="share-sheet__header">' +
                '<button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button>' +
                '<h2 id="share-chat-title" class="share-sheet__title">공유하기</h2>' +
                '<span class="share-sheet__header-spacer"></span>' +
                '</div>' +
                '<div class="share-sheet__search"><input type="text" class="share-sheet__search-input" placeholder="검색" aria-label="검색"></div>' +
                '<div class="share-sheet__list">' +
                '<button type="button" class="share-sheet__user" data-share-user-id="tradehub-kr">' +
                '<span class="share-sheet__user-avatar"><img src="https://pbs.twimg.com/profile_images/2029361845321207808/LltLeaLS_bigger.jpg" alt="TradeHub KR"></span>' +
                '<span class="share-sheet__user-body"><span class="share-sheet__user-name">TradeHub KR</span><span class="share-sheet__user-handle">@TradeHub_KR</span></span>' +
                '</button>' +
                '</div>' +
                '</div>';
            modal.addEventListener("click", (e) => {
                if (
                    e.target.closest("[data-share-close='true']") ||
                    e.target.classList.contains("share-sheet__backdrop") ||
                    e.target.closest(".share-sheet__user")
                ) {
                    e.preventDefault();
                    closeShareModal();
                }
            });
            document.body.appendChild(modal);
            activeShareModal = modal;
        }

        function openShareBookmarkModal(button) {
            const actionBar = button.closest(".tweet-action-bar");
            const bookmarkButton = actionBar ? actionBar.querySelector(".tweet-action-btn--bookmark") : null;
            const isBookmarked = bookmarkButton ? bookmarkButton.classList.contains("active") : false;
            closeShareDropdown();
            closeShareModal();
            const checkClass = "share-sheet__folder-check" + (isBookmarked ? " share-sheet__folder-check--active" : "");
            const modal = document.createElement("div");
            modal.className = "share-sheet";
            modal.innerHTML =
                '<div class="share-sheet__backdrop" data-share-close="true"></div>' +
                '<div class="share-sheet__card share-sheet__card--bookmark" role="dialog" aria-modal="true" aria-labelledby="share-bookmark-title">' +
                '<div class="share-sheet__header">' +
                '<button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button>' +
                '<h2 id="share-bookmark-title" class="share-sheet__title">폴더에 추가</h2>' +
                '<span class="share-sheet__header-spacer"></span>' +
                '</div>' +
                '<button type="button" class="share-sheet__create-folder">새 북마크 폴더 만들기</button>' +
                '<button type="button" class="share-sheet__folder" data-share-folder="all-bookmarks">' +
                '<span class="share-sheet__folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"></path></g></svg></span>' +
                '<span class="share-sheet__folder-name">모든 북마크</span>' +
                '<span class="' + checkClass + '"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg></span>' +
                '</button>' +
                '</div>';
            modal.addEventListener("click", (e) => {
                if (
                    e.target.closest("[data-share-close='true']") ||
                    e.target.classList.contains("share-sheet__backdrop")
                ) {
                    e.preventDefault();
                    closeShareModal();
                    return;
                }
                if (e.target.closest(".share-sheet__create-folder")) {
                    e.preventDefault();
                    closeShareModal();
                    return;
                }
                if (e.target.closest("[data-share-folder='all-bookmarks']")) {
                    e.preventDefault();
                    setBookmarkButtonState(bookmarkButton, !isBookmarked);
                    closeShareModal();
                }
            });
            document.body.appendChild(modal);
            activeShareModal = modal;
        }

        function openShareDropdown(button) {
            closeShareDropdown();
            const rect = button.getBoundingClientRect();
            const top = rect.bottom + window.scrollY + 8;
            const right = Math.max(16, window.innerWidth - rect.right);
            const layer = document.createElement("div");
            layer.className = "layers-dropdown-container";
            layer.innerHTML =
                '<div class="layers-overlay"></div>' +
                '<div class="layers-dropdown-inner">' +
                '<div role="menu" class="dropdown-menu" style="top:' + top + 'px;right:' + right + 'px;display:flex;">' +
                '<div><div class="dropdown-inner">' +
                '<button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--copy">' +
                '<span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></g></svg></span>' +
                '<span class="menu-item__label">링크 복사하기</span>' +
                '</button>' +
                '<button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--chat">' +
                '<span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path></g></svg></span>' +
                '<span class="menu-item__label">Chat으로 전송하기</span>' +
                '</button>' +
                '<button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--bookmark">' +
                '<span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18 3V0h2v3h3v2h-3v3h-2V5h-3V3zm-7.5 1a.5.5 0 00-.5.5V7h3.5A2.5 2.5 0 0116 9.5v3.48l3 2.1V11h2v7.92l-5-3.5v7.26l-6.5-3.54L3 22.68V9.5A2.5 2.5 0 015.5 7H8V4.5A2.5 2.5 0 0110.5 2H12v2zm-5 5a.5.5 0 00-.5.5v9.82l4.5-2.46 4.5 2.46V9.5a.5.5 0 00-.5-.5z"></path></g></svg></span>' +
                '<span class="menu-item__label">폴더에 북마크 추가하기</span>' +
                '</button>' +
                '</div></div>' +
                '</div>' +
                '</div>';
            layer.addEventListener("click", (e) => {
                const actionButton = e.target.closest(".share-menu-item");
                if (!actionButton || !activeShareButton) {
                    e.stopPropagation();
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                if (actionButton.classList.contains("share-menu-item--copy")) {
                    copyShareLink();
                    return;
                }
                if (actionButton.classList.contains("share-menu-item--chat")) {
                    openShareChatModal();
                    return;
                }
                if (actionButton.classList.contains("share-menu-item--bookmark")) {
                    openShareBookmarkModal(activeShareButton);
                }
            });
            document.body.appendChild(layer);
            activeShareDropdown = layer;
            activeShareButton = button;
            activeShareButton.setAttribute("aria-expanded", "true");
        }

        // Like 버튼
        ["popularSection", "latestSection"].forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;

            section.addEventListener("click", async (e) => {
                const likeBtn = e.target.closest(".tweet-action-btn--like");
                if (!likeBtn) return;

                const card = likeBtn.closest("[data-post-id]");
                const postId = card?.dataset.postId;
                if (!postId) return;

                const isLiked = likeBtn.classList.contains("active");
                const svgInactive = likeBtn.querySelector(".svg-like-inactive");
                const svgActive   = likeBtn.querySelector(".svg-like-active");
                const countEl     = likeBtn.querySelector(".tweet-action-count");

                // 낙관적 업데이트
                likeBtn.classList.toggle("active", !isLiked);
                if (svgInactive) svgInactive.hidden = !isLiked;
                if (svgActive)   svgActive.hidden   = isLiked;
                if (countEl) {
                    const cur = parseInt(countEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                    countEl.textContent = isLiked ? cur - 1 : cur + 1;
                }

                try {
                    const result = await exploreService.toggleLike(postId);

                    // 서버 응답 기준으로 실제 상태 동기화
                    const serverLiked = result.includes("생성");
                    likeBtn.classList.toggle("active", serverLiked);
                    if (svgInactive) svgInactive.hidden = serverLiked;
                    if (svgActive)   svgActive.hidden   = !serverLiked;

                    // 낙관적 업데이트와 서버 결과가 다를 경우 카운트 보정
                    if (serverLiked !== !isLiked && countEl) {
                        const cur = parseInt(countEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                        countEl.textContent = serverLiked ? cur + 1 : cur - 1;
                    }

                    const message = serverLiked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.";
                    showToast(message, "toast--like");

                } catch (err) {
                    // 실패 시 롤백
                    likeBtn.classList.toggle("active", isLiked);
                    if (svgInactive) svgInactive.hidden = isLiked;
                    if (svgActive)   svgActive.hidden   = !isLiked;
                    if (countEl) {
                        const cur = parseInt(countEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                        countEl.textContent = isLiked ? cur + 1 : cur - 1;
                    }
                    showToast("오류가 발생했습니다. 다시 시도해주세요.");
                    console.error("좋아요 요청 실패:", err);
                }
            });
        });

        // Bookmark 버튼
        ["popularSection", "latestSection"].forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;

            section.addEventListener("click", async (e) => {
                const bookmarkBtn = e.target.closest(".tweet-action-btn--bookmark");
                if (!bookmarkBtn) return;

                const postId = bookmarkBtn.dataset.postId;
                if (!postId) return;

                try {
                    const result = await exploreService.checkBookmark(postId);
                    const isBookmarked = result.includes("등록");
                    setBookmarkButtonState(bookmarkBtn, isBookmarked);
                    showToast(isBookmarked ? "북마크에 저장되었습니다." : "북마크가 해제되었습니다.");
                } catch (err) {
                    console.error("북마크 요청 실패:", err);
                    showToast("오류가 발생했습니다. 다시 시도해주세요.");
                }
            });
        });

        // Share 버튼
        document.querySelectorAll(".tweet-action-btn--share").forEach((shareButton) => {
            shareButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (activeShareButton === shareButton) {
                    closeShareDropdown();
                    return;
                }
                openShareDropdown(shareButton);
            });
        });

        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener("click", (e) => {
            closeShareDropdown();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeShareDropdown();
                closeShareModal();
            }
        });
    })();


// ===== reply부분 =====
    // ===== 1. DOM =====
    const tabLinks = document.querySelectorAll(".tab-link");
    const notifTabs = document.querySelectorAll(".notif-tab");
    const bottombarSlide = document.querySelector(".bottombar-slide");
    const layersRoot = document.getElementById("layers");

    const replyModalOverlay = document.querySelector("[data-explore-reply-modal]");
    const q = (sel) => replyModalOverlay?.querySelector(sel);
    const qAll = (sel) => replyModalOverlay?.querySelectorAll(sel) ?? [];

    const replyModal = q(".explore-modal");
    const replyCloseButton = q(".explore-modal__close");
    const replyEditor = q(".explore-modal__editor");
    const replySubmitButton = q(".explore-modal__submit");
    const replyGauge = q("#replyGauge");
    const replyGaugeText = q("#replyGaugeText");
    const replyProductButton = q("[data-testid='productSelectButton']");
    const replyProductView = q("[data-product-select-modal]");
    const productSelectClose = replyProductView?.querySelector("[data-product-select-close]");
    const productSelectList = replyProductView?.querySelector("[data-product-select-list]");
    const productSelectComplete = replyProductView?.querySelector("[data-product-select-complete]");
    const productSelectEmpty = replyProductView?.querySelector("[data-product-empty]");
    const replyContextButton = q(".explore-modal__context-button");
    const replyFooterMeta = q(".explore-modal__footer-meta");
    const replySourceAvatar = q(".explore-modal__source-avatar");
    const replySourceName = q(".explore-modal__source-name");
    const replySourceHandle = q(".explore-modal__source-handle");
    const replySourceTime = q(".explore-modal__source-time");
    const replySourceText = q(".explore-modal__source-text");
    const replyFormatButtons = qAll("[data-format]");
    const replyEmojiButton = q("[data-testid='emojiButton']");
    const replyEmojiPicker = q(".explore-modal__emoji-picker");
    const replyEmojiSearchInput = q("[data-testid='emojiSearchInput']");
    const replyEmojiTabs = qAll(".explore-modal__emoji-tab");
    const replyEmojiContent = q("[data-testid='emojiPickerContent']");
    const replyMediaUploadButton = q("[data-testid='mediaUploadButton']");
    const replyFileInput = q("[data-testid='fileInput']");
    const replyAttachmentPreview = q("[data-attachment-preview]");
    const replyAttachmentMedia = q("[data-attachment-media]");
    const composeView = q(".explore-modal__compose-view");
    const replyGeoButton = q("[data-testid='geoButton']");
    const replyGeoButtonPath = replyGeoButton?.querySelector("path");
    const replyLocationDisplayButton = q("[data-location-display]");
    const replyLocationName = q("[data-location-name]");
    const replyLocationView = q(".explore-modal__location-view");
    const replyLocationCloseButton = q(".explore-modal__location-close");
    const replyLocationDeleteButton = q("[data-location-delete]");
    const replyLocationCompleteButton = q("[data-location-complete]");
    const replyLocationSearchInput = q("[data-location-search]");
    const replyLocationList = q("[data-location-list]");
    const replyUserTagTrigger = q("[data-user-tag-trigger]");
    const replyUserTagLabel = q("[data-user-tag-label]");
    const replyTagView = q(".explore-modal__tag-view");
    const replyTagCloseButton = q("[data-testid='tag-back']");
    const replyTagCompleteButton = q("[data-tag-complete]");
    const replyTagSearchForm = q("[data-tag-search-form]");
    const replyTagSearchInput = q("[data-tag-search]");
    const replyTagChipList = q("[data-tag-chip-list]");
    const replyTagResults = q("[data-tag-results]");
    const replyMediaAltTrigger = q("[data-media-alt-trigger]");
    const replyMediaAltLabel = q("[data-media-alt-label]");
    const replyMediaView = q(".explore-modal__media-view");
    const replyMediaBackButton = q("[data-testid='media-back']");
    const replyMediaPrevButton = q("[data-media-prev]");
    const replyMediaNextButton = q("[data-media-next]");
    const replyMediaSaveButton = q("[data-media-save]");
    const replyMediaTitle = q("[data-media-title]");
    const replyMediaPreviewImages = qAll("[data-media-preview-image]");
    const replyMediaAltInput = q("[data-media-alt-input]");
    const replyMediaAltCount = q("[data-media-alt-count]");

    // ===== 2. State =====
    let lastScrollY = 0,
        activeReplyTrigger = null,
        activeShareDropdown = null,
        activeShareButton = null;
    let activeShareModal = null,
        activeShareToast = null,
        activeMoreDropdown = null,
        activeMoreButton = null;
    let activeNotificationModal = null, activeNotificationToast = null, savedReplySelection = null;
    let savedReplySelectionOffsets = null;

    let pendingReplyFormats = new Set(),
        activeEmojiCategory = "recent";
    let selectedLocation = null,
        pendingLocation = null;
    let selectedTaggedUsers = [],
        pendingTaggedUsers = [];
    let replyMediaEdits = [],
        pendingReplyMediaEdits = [],
        activeReplyMediaIndex = 0;
    let attachedReplyFiles = [],
        attachedReplyFileUrls = [];
    let pendingAttachmentEditIndex = null, currentTagResults = [], cachedLocationNames = [];
    let replyEmojiLibraryPicker = null;
    let shouldRestoreReplyEditorAfterEmojiInsert = false;
    let isInsertingReplyEmoji = false;
    const notificationFollowState = new Map();
    const maxReplyImages = 4,
        maxReplyMediaAltLength = 1000,
        replyMaxLength = 500;
    let selectedProduct = null;

    // ===== 3. Config =====
    const emojiRecentsKey = "notification_reply_recent_emojis";
    const maxRecentEmojis = 18;
    const notificationReportReasons = [
        "다른 회사 제품 도용 신고",
        "실제 존재하지 않는 제품 등록 신고",
        "스펙·원산지 허위 표기 신고",
        "특허 제품 무단 판매 신고",
        "수출입 제한 품목 신고",
        "반복적인 동일 게시물 신고",
    ];

    const emojiCategoryMeta = {
        recent: {
            label: "최근",
            sectionTitle: "최근",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="explore-modal__emoji-tab-icon"><g><path d="M12 1.75A10.25 10.25 0 112.75 12 10.26 10.26 0 0112 1.75zm0 1.5A8.75 8.75 0 1020.75 12 8.76 8.76 0 0012 3.25zm.75 3.5v5.19l3.03 1.75-.75 1.3-3.78-2.18V6.75h1.5z"></path></g></svg>'
        },
        smileys: {
            label: "스마일리 및 사람",
            sectionTitle: "스마일리 및 사람",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="explore-modal__emoji-tab-icon"><g><path d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20c-5.109 0-9.25 4.141-9.25 9.25s4.141 9.25 9.25 9.25 9.25-4.141 9.25-9.25S17.109 2.75 12 2.75zM9 11.75c-.69 0-1.25-.56-1.25-1.25S8.31 9.25 9 9.25s1.25.56 1.25 1.25S9.69 11.75 9 11.75zm6 0c-.69 0-1.25-.56-1.25-1.25S14.31 9.25 15 9.25s1.25.56 1.25 1.25S15.69 11.75 15 11.75zm-8.071 3.971c.307-.298.771-.397 1.188-.253.953.386 2.403.982 3.883.982s2.93-.596 3.883-.982c.417-.144.88-.044 1.188.253a.846.846 0 01-.149 1.34c-1.254.715-3.059 1.139-4.922 1.139s-3.668-.424-4.922-1.139a.847.847 0 01-.149-1.39z"></path></g></svg>'
        },
        animals: {
            label: "동물 및 자연",
            sectionTitle: "동물 및 자연",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="explore-modal__emoji-tab-icon"><g><path d="M12 3.5c3.77 0 6.75 2.86 6.75 6.41 0 3.17-1.88 4.94-4.15 6.28-.74.44-1.54.9-1.6 1.86-.02.38-.33.68-.71.68h-.6a.71.71 0 01-.71-.67c-.07-.95-.86-1.42-1.6-1.85C7.13 14.85 5.25 13.08 5.25 9.91 5.25 6.36 8.23 3.5 12 3.5zm-4.79-.97c.61 0 1.1.49 1.1 1.1 0 .32-.14.63-.39.84-.4.34-.78.78-1.08 1.3-.18.3-.49.48-.84.48-.61 0-1.1-.49-1.1-1.1 0-.14.03-.29.09-.42.47-1.04 1.17-1.93 2.02-2.63.19-.15.43-.24.7-.24zm9.58 0c.27 0 .51.09.7.24.85.7 1.55 1.6 2.02 2.63.06.13.09.28.09.42 0 .61-.49 1.1-1.1 1.1-.35 0-.66-.18-.84-.48-.3-.52-.68-.96-1.08-1.3a1.1 1.1 0 01-.39-.84c0-.61.49-1.1 1.1-1.1z"></path></g></svg>'
        },
        food: {
            label: "음식 및 음료",
            sectionTitle: "음식 및 음료",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="explore-modal__emoji-tab-icon"><g><path d="M5 10.5c0-3.59 3.36-6.5 7.5-6.5s7.5 2.91 7.5 6.5v.58a5.42 5.42 0 01-2.08 4.26L16.5 21H8.5l-1.42-5.66A5.42 5.42 0 015 11.08v-.58zm2 0v.58c0 1.08.5 2.08 1.36 2.76l.3.24.95 3.92h5.78l.95-3.92.3-.24a3.42 3.42 0 001.36-2.76v-.58c0-2.48-2.47-4.5-5.5-4.5S7 8.02 7 10.5z"></path></g></svg>'
        },
        activities: {
            label: "활동",
            sectionTitle: "활동",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="explore-modal__emoji-tab-icon"><g><path d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75S17.385 21.75 12 21.75 2.25 17.385 2.25 12 6.615 2.25 12 2.25zm0 1.5A8.25 8.25 0 103.75 12 8.26 8.26 0 0012 3.75zm-4.1 4.5c.27 0 .53.12.71.33l1.94 2.55 3.12-2.29c.36-.27.87-.22 1.18.12l2.83 3.12a.88.88 0 01-.07 1.24.88.88 0 01-1.24-.07l-2.3-2.54-3.16 2.33a.88.88 0 01-1.23-.16L7.2 9.64a.88.88 0 01.7-1.39z"></path></g></svg>'
        },
        travel: {
            label: "여행 및 장소",
            sectionTitle: "여행 및 장소",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="explore-modal__emoji-tab-icon"><g><path d="M12 2.25c-4.142 0-7.5 3.245-7.5 7.248 0 5.207 6.46 11.611 6.735 11.881a1.08 1.08 0 001.53 0c.275-.27 6.735-6.674 6.735-11.881 0-4.003-3.358-7.248-7.5-7.248zm0 17.493c-1.758-1.878-6-6.838-6-10.245 0-3.172 2.686-5.748 6-5.748s6 2.576 6 5.748c0 3.407-4.242 8.367-6 10.245zm0-13.243a3 3 0 100 6 3 3 0 000-6z"></path></g></svg>'
        },
        objects: {
            label: "사물",
            sectionTitle: "사물",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="explore-modal__emoji-tab-icon"><g><path d="M12 2.5c2.07 0 3.75 1.68 3.75 3.75 0 1.45-.83 2.71-2.04 3.33l-.21.11V11h.5A2.5 2.5 0 0116.5 13.5v1.38c0 1.27-.7 2.43-1.82 3.03l-.93.5V21.5h-3.5v-3.09l-.93-.5A3.44 3.44 0 017.5 14.88V13.5A2.5 2.5 0 0110 11h.5V9.69l-.21-.11A3.75 3.75 0 018.25 6.25 3.75 3.75 0 0112 2.5zm0 1.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm-2 8.5a1 1 0 00-1 1v1.38c0 .72.4 1.39 1.04 1.73l1.71.92v1.47h.5v-1.47l1.71-.92A1.97 1.97 0 0015 14.88V13.5a1 1 0 00-1-1h-4z"></path></g></svg>'
        },
        symbols: {
            label: "기호",
            sectionTitle: "기호",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="explore-modal__emoji-tab-icon"><g><path d="M5 4h14v4.5h-2V6H7v2.5H5V4zm2 6h4v4H7v-4zm6 0h4v4h-4v-4zM5 16h6v4H5v-4zm8 0h6v4h-6v-4z"></path></g></svg>'
        },
        flags: {
            label: "깃발",
            sectionTitle: "깃발",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="explore-modal__emoji-tab-icon"><g><path d="M6 2.75A.75.75 0 016.75 2h.5a.75.75 0 01.75.75V3h9.38c.97 0 1.45 1.17.76 1.85L16.1 6.9l2.05 2.05c.69.68.21 1.85-.76 1.85H8v10.45a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75V2.75z"></path></g></svg>'
        },
    };

    const emojiCategoryData = {
        smileys: ["😀", "😃", "😄", "😁", "😆", "🥹", "😂", "🤣", "😊", "😉", "😍", "🥰", "😘", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "😐", "😑", "😌", "🙃", "😏", "🥳", "😭", "😤", "😴", "😵", "🤯", "😎", "🤓", "🫠", "😇", "🤠"],
        animals: ["🐶", "🐱", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐧", "🐦", "🦄", "🐝", "🦋", "🌸", "🌻", "🍀", "🌿", "🌈", "🌞", "⭐", "🌙"],
        food: ["🍔", "🍟", "🍕", "🌭", "🍗", "🍜", "🍣", "🍩", "🍪", "🍫", "🍿", "🥐", "🍎", "🍓", "🍉", "🍇", "☕", "🍵", "🧃", "🥤", "🍺", "🍷"],
        activities: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🎮", "🎲", "🎯", "🎳", "🎸", "🎧", "🎬", "📚", "🧩", "🏆", "🥇", "🏃", "🚴", "🏊"],
        travel: ["🚗", "🚕", "🚌", "🚎", "🚓", "🚑", "✈️", "🚀", "🛸", "🚲", "⛵", "🚉", "🏠", "🏙️", "🌋", "🏝️", "🗼", "🗽", "🎡", "🌁"],
        objects: ["💡", "📱", "💻", "⌚", "📷", "🎥", "🕹️", "💰", "💎", "🔑", "🪄", "🎁", "📌", "🧸", "🛒", "🧴", "💊", "🧯", "📢", "🧠"],
        symbols: ["❤️", "💙", "💚", "💛", "💜", "🖤", "✨", "💫", "💥", "💯", "✔️", "❌", "⚠️", "🔔", "♻️", "➕", "➖", "➗", "✖️", "🔣"],
        flags: ["🏳️", "🏴", "🏁", "🚩", "🎌", "🏳️‍🌈", "🇰🇷", "🇺🇸", "🇯🇵", "🇫🇷", "🇬🇧", "🇩🇪", "🇨🇦", "🇦🇺"],
    };

    const formatButtonLabels = {
        bold: {inactive: "굵게, (CTRL+B) 님", active: "굵게, 활성 상태, (CTRL+B) 님 님"},
        italic: {inactive: "기울임꼴, (CTRL+I) 님", active: "기울임꼴, 활성 상태, (CTRL+I) 님 님"},
    };

    // ===== 4. Utils ~ 8. Init & Events =====
    // (reply 관련 전체 로직은 원본과 동일하게 유지)

    function getTextContent(el) {
        return el?.textContent.trim() ?? "";
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[c] ?? c);
    }

    function getRecentEmojis() {
        try {
            const s = window.localStorage.getItem(emojiRecentsKey);
            const p = s ? JSON.parse(s) : [];
            return Array.isArray(p) ? p : [];
        } catch {
            return [];
        }
    }

    function saveRecentEmoji(emoji) {
        const recent = getRecentEmojis().filter((i) => i !== emoji);
        recent.unshift(emoji);
        try {
            window.localStorage.setItem(emojiRecentsKey, JSON.stringify(recent.slice(0, maxRecentEmojis)));
        } catch {
            return;
        }
    }

    function clearRecentEmojis() {
        try {
            window.localStorage.removeItem(emojiRecentsKey);
        } catch {
            return;
        }
    }

    function getEmojiSearchTerm() {
        return replyEmojiSearchInput?.value.trim().toLowerCase() ?? "";
    }

    function getEmojiEntriesForCategory(category) {
        if (category === "recent") return getRecentEmojis().map((emoji) => ({emoji, keywords: [emoji]}));
        return (emojiCategoryData[category] ?? []).map((emoji) => ({
            emoji,
            keywords: [emoji, emojiCategoryMeta[category]?.label ?? ""]
        }));
    }

    function getFilteredEmojiEntries(category) {
        const entries = getEmojiEntriesForCategory(category);
        const term = getEmojiSearchTerm();
        if (!term) return entries;
        return entries.filter((e) => e.keywords.some((k) => k.toLowerCase().includes(term)));
    }

    function buildEmojiSection(title, emojis, {clearable = false, emptyText = ""} = {}) {
        const headerAction = clearable ? '<button type="button" class="explore-modal__emoji-clear" data-action="clear-recent">모두 지우기</button>' : "";
        const body = emojis.length ? `<div class="explore-modal__emoji-grid">${emojis.map((e) => `<button type="button" class="explore-modal__emoji-option" data-emoji="${e}" role="menuitem">${e}</button>`).join("")}</div>` : `<p class="explore-modal__emoji-empty">${emptyText}</p>`;
        return `<section class="explore-modal__emoji-section"><div class="explore-modal__emoji-section-header"><h3 class="explore-modal__emoji-section-title">${title}</h3>${headerAction}</div>${body}</section>`;
    }

    function renderEmojiTabs() {
        replyEmojiTabs.forEach((tab) => {
            const cat = tab.getAttribute("data-emoji-category");
            const meta = cat ? emojiCategoryMeta[cat] : null;
            const active = cat === activeEmojiCategory;
            tab.classList.toggle("explore-modal__emoji-tab--active", active);
            tab.setAttribute("aria-selected", String(active));
            if (meta) tab.innerHTML = meta.icon;
        });
    }

    function renderEmojiPickerContent() {
        if (!replyEmojiContent) return;
        const searchTerm = getEmojiSearchTerm();
        if (searchTerm) {
            const sections = Object.keys(emojiCategoryData).map((cat) => {
                const entries = getFilteredEmojiEntries(cat);
                return entries.length === 0 ? "" : buildEmojiSection(emojiCategoryMeta[cat].sectionTitle, entries.map((e) => e.emoji));
            }).join("");
            replyEmojiContent.innerHTML = sections || buildEmojiSection("검색 결과", [], {emptyText: "일치하는 이모티콘이 없습니다."});
            return;
        }
        if (activeEmojiCategory === "recent") {
            const recent = getRecentEmojis();
            replyEmojiContent.innerHTML = buildEmojiSection("최근", recent, {
                clearable: recent.length > 0,
                emptyText: "최근 사용한 이모티콘이 없습니다."
            }) + buildEmojiSection(emojiCategoryMeta.smileys.sectionTitle, getEmojiEntriesForCategory("smileys").map((e) => e.emoji));
            return;
        }
        replyEmojiContent.innerHTML = buildEmojiSection(emojiCategoryMeta[activeEmojiCategory].sectionTitle, getEmojiEntriesForCategory(activeEmojiCategory).map((e) => e.emoji));
    }

    function renderEmojiPicker() {
        renderEmojiTabs();
        renderEmojiPickerContent();
    }

    function cloneTaggedUsers(users) {
        return users.map((u) => ({...u}));
    }

    function getCurrentPageTagUsers() {
        const tweetItems = document.querySelectorAll(".notif-tweet-item");
        const seen = new Set();
        return Array.from(tweetItems).map((item, i) => {
            const name = getTextContent(item.querySelector(".tweet-displayname"));
            const handle = getTextContent(item.querySelector(".tweet-handle"));
            const avatar = item.querySelector(".tweet-avatar")?.getAttribute("src") ?? "";
            if (!name || !handle || seen.has(handle)) return null;
            seen.add(handle);
            return {id: `${handle.replace("@", "") || "user"}-${i}`, name, handle, avatar};
        }).filter(Boolean);
    }

    function isTagModalOpen() {
        return Boolean(replyTagView && !replyTagView.hidden);
    }

    function getTagSearchTerm() {
        return replyTagSearchInput?.value.trim() ?? "";
    }

    function getTaggedUserSummary(users) {
        return users.length === 0 ? "사용자 태그하기" : users.map((u) => u.name).join(", ");
    }

    function syncUserTagTrigger() {
        const can = isReplyImageSet();
        const label = getTaggedUserSummary(selectedTaggedUsers);
        if (replyUserTagTrigger) {
            replyUserTagTrigger.hidden = !can;
            replyUserTagTrigger.disabled = !can;
            replyUserTagTrigger.setAttribute("aria-label", label);
        }
        if (replyUserTagLabel) replyUserTagLabel.textContent = label;
        if (!can && isTagModalOpen()) closeTagPanel({restoreFocus: false});
    }

    function renderTagChipList() {
        if (!replyTagChipList) return;
        if (pendingTaggedUsers.length === 0) {
            replyTagChipList.innerHTML = "";
            return;
        }
        replyTagChipList.innerHTML = pendingTaggedUsers.map((u) => {
            const av = u.avatar ? `<span class="explore-modal__tag-chip-avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" /></span>` : '<span class="explore-modal__tag-chip-avatar"></span>';
            return `<button type="button" class="explore-modal__tag-chip" data-tag-remove-id="${escapeHtml(u.id)}">${av}<span class="explore-modal__tag-chip-name">${escapeHtml(u.name)}</span><svg viewBox="0 0 24 24" aria-hidden="true" class="explore-modal__tag-chip-icon"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button>`;
        }).join("");
    }

    function getFilteredTagUsers(query) {
        const nq = query.trim().toLowerCase();
        if (!nq) return [];
        return getCurrentPageTagUsers().filter((u) => `${u.name} ${u.handle}`.toLowerCase().includes(nq)).slice(0, 6);
    }

    function renderTagResults(users) {
        if (!replyTagResults || !replyTagSearchInput) return;
        currentTagResults = users;
        const hasQuery = getTagSearchTerm().length > 0;
        if (!hasQuery) {
            replyTagSearchInput.setAttribute("aria-expanded", "false");
            replyTagSearchInput.removeAttribute("aria-controls");
            replyTagResults.removeAttribute("role");
            replyTagResults.removeAttribute("id");
            replyTagResults.innerHTML = "";
            return;
        }
        replyTagSearchInput.setAttribute("aria-expanded", "true");
        replyTagSearchInput.setAttribute("aria-controls", "notification-tag-results");
        replyTagResults.setAttribute("role", "listbox");
        replyTagResults.id = "notification-tag-results";
        if (users.length === 0) {
            replyTagResults.innerHTML = '<p class="explore-modal__tag-empty">일치하는 사용자를 찾지 못했습니다.</p>';
            return;
        }
        replyTagResults.innerHTML = users.map((u) => {
            const sel = pendingTaggedUsers.some((t) => t.id === u.id);
            const sub = sel ? `${u.handle} 이미 태그됨` : u.handle;
            const av = u.avatar ? `<span class="explore-modal__tag-avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" /></span>` : '<span class="explore-modal__tag-avatar"></span>';
            return `<div role="option" class="explore-modal__tag-option" data-testid="typeaheadResult"><div role="checkbox" aria-checked="${sel}" aria-disabled="${sel}" class="explore-modal__tag-checkbox"><button type="button" class="explore-modal__tag-user" data-tag-user-id="${escapeHtml(u.id)}" ${sel ? "disabled" : ""}>${av}<span class="explore-modal__tag-user-body"><span class="explore-modal__tag-user-name">${escapeHtml(u.name)}</span><span class="explore-modal__tag-user-handle">${escapeHtml(sub)}</span></span></button></div></div>`;
        }).join("");
    }

    function runTagSearch() {
        const tq = getTagSearchTerm();
        renderTagResults(tq ? getFilteredTagUsers(tq) : []);
    }

    function openTagPanel() {
        if (!composeView || !replyTagView || !isReplyImageSet()) return;
        closeEmojiPicker();
        pendingTaggedUsers = cloneTaggedUsers(selectedTaggedUsers);
        composeView.hidden = true;
        replyTagView.hidden = false;
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList();
        renderTagResults([]);
        window.requestAnimationFrame(() => {
            replyTagSearchInput?.focus();
        });
    }

    function closeTagPanel({restoreFocus = true} = {}) {
        if (!composeView || !replyTagView || replyTagView.hidden) return;
        replyTagView.hidden = true;
        composeView.hidden = false;
        pendingTaggedUsers = cloneTaggedUsers(selectedTaggedUsers);
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList();
        renderTagResults([]);
        if (restoreFocus) window.requestAnimationFrame(() => {
            replyUserTagTrigger && !replyUserTagTrigger.hidden ? replyUserTagTrigger.focus() : replyEditor?.focus();
        });
    }

    function applyPendingTaggedUsers() {
        selectedTaggedUsers = cloneTaggedUsers(pendingTaggedUsers);
        syncUserTagTrigger();
    }

    function resetTaggedUsers() {
        selectedTaggedUsers = [];
        pendingTaggedUsers = [];
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList();
        renderTagResults([]);
        syncUserTagTrigger();
    }

    function createDefaultReplyMediaEdit() {
        return {alt: ""};
    }

    function cloneReplyMediaEdits(edits) {
        return edits.map((e) => ({alt: e.alt}));
    }

    function isMediaEditorOpen() {
        return Boolean(replyMediaView && !replyMediaView.hidden);
    }

    function getReplyMediaTriggerLabel() {
        return replyMediaEdits.some((e) => e.alt.trim().length > 0) ? "설명 수정" : "설명 추가";
    }

    function syncReplyMediaEditsToAttachments() {
        if (!isReplyImageSet()) {
            replyMediaEdits = [];
            pendingReplyMediaEdits = [];
            activeReplyMediaIndex = 0;
            syncMediaAltTrigger();
            return;
        }
        replyMediaEdits = attachedReplyFiles.map((_, i) => {
            const ex = replyMediaEdits[i];
            return ex ? {alt: ex.alt ?? ""} : createDefaultReplyMediaEdit();
        });
        if (pendingReplyMediaEdits.length !== replyMediaEdits.length) pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits);
        activeReplyMediaIndex = Math.min(activeReplyMediaIndex, Math.max(replyMediaEdits.length - 1, 0));
        syncMediaAltTrigger();
    }

    function getCurrentReplyMediaUrl() {
        return attachedReplyFileUrls[activeReplyMediaIndex] ?? "";
    }

    function getReplyMediaImageAlt(index) {
        return replyMediaEdits[index]?.alt ?? "";
    }

    function getCurrentPendingReplyMediaEdit() {
        return pendingReplyMediaEdits[activeReplyMediaIndex] ?? createDefaultReplyMediaEdit();
    }

    function getReplyMediaTitle() {
        return "이미지 설명 수정";
    }

    function syncMediaAltTrigger() {
        const can = isReplyImageSet();
        const label = getReplyMediaTriggerLabel();
        if (replyMediaAltTrigger) {
            replyMediaAltTrigger.hidden = !can;
            replyMediaAltTrigger.disabled = !can;
            replyMediaAltTrigger.setAttribute("aria-label", label);
        }
        if (replyMediaAltLabel) replyMediaAltLabel.textContent = label;
        if (!can && isMediaEditorOpen()) closeMediaEditor({restoreFocus: false, discardChanges: true});
    }

    function renderMediaEditor() {
        if (!replyMediaView || pendingReplyMediaEdits.length === 0) return;
        const edit = getCurrentPendingReplyMediaEdit();
        const url = getCurrentReplyMediaUrl();
        const alt = edit.alt ?? "";
        if (replyMediaTitle) replyMediaTitle.textContent = getReplyMediaTitle();
        if (replyMediaPrevButton) replyMediaPrevButton.disabled = activeReplyMediaIndex === 0;
        if (replyMediaNextButton) replyMediaNextButton.disabled = activeReplyMediaIndex >= pendingReplyMediaEdits.length - 1;
        replyMediaPreviewImages.forEach((img) => {
            img.src = url;
            img.alt = alt;
            img.style.transform = "";
        });
        if (replyMediaAltInput) replyMediaAltInput.value = alt;
        if (replyMediaAltCount) replyMediaAltCount.textContent = `${alt.length} / ${maxReplyMediaAltLength.toLocaleString()}`;
    }

    function openMediaEditor() {
        if (!composeView || !replyMediaView || !isReplyImageSet()) return;
        closeEmojiPicker();
        pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits);
        activeReplyMediaIndex = 0;
        composeView.hidden = true;
        replyMediaView.hidden = false;
        renderMediaEditor();
        window.requestAnimationFrame(() => {
            replyMediaAltInput?.focus();
        });
    }

    function closeMediaEditor({restoreFocus = true, discardChanges = true} = {}) {
        if (!composeView || !replyMediaView || replyMediaView.hidden) return;
        if (discardChanges) pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits);
        replyMediaView.hidden = true;
        composeView.hidden = false;
        if (restoreFocus) window.requestAnimationFrame(() => {
            replyMediaAltTrigger && !replyMediaAltTrigger.hidden ? replyMediaAltTrigger.focus() : replyEditor?.focus();
        });
    }

    function saveReplyMediaEdits() {
        replyMediaEdits = cloneReplyMediaEdits(pendingReplyMediaEdits);
        renderReplyAttachment();
        syncMediaAltTrigger();
        closeMediaEditor({discardChanges: false});
    }

    function isLocationModalOpen() {
        return Boolean(replyLocationView && !replyLocationView.hidden);
    }

    function getLocationSearchTerm() {
        return replyLocationSearchInput?.value.trim() ?? "";
    }

    function getFilteredLocations() {
        const term = getLocationSearchTerm();
        if (cachedLocationNames.length === 0 && replyLocationList) {
            cachedLocationNames = Array.from(replyLocationList.querySelectorAll(".explore-modal__location-item-label")).map((i) => getTextContent(i)).filter(Boolean);
        }
        return term ? cachedLocationNames.filter((l) => l.includes(term)) : cachedLocationNames;
    }

    function syncLocationUI() {
        const has = Boolean(selectedLocation);
        if (replyFooterMeta) replyFooterMeta.hidden = !has;
        if (replyLocationName) replyLocationName.textContent = selectedLocation ?? "";
        if (replyLocationDisplayButton) {
            replyLocationDisplayButton.hidden = !has;
            replyLocationDisplayButton.setAttribute("aria-label", has ? `위치 ${selectedLocation}` : "위치 태그하기");
        }
        if (replyGeoButton) {
            replyGeoButton.hidden = false;
            replyGeoButton.setAttribute("aria-label", has ? `위치 태그하기, ${selectedLocation}` : "위치 태그하기");
        }
        if (replyGeoButtonPath) {
            const np = has ? replyGeoButtonPath.dataset.pathActive : replyGeoButtonPath.dataset.pathInactive;
            if (np) replyGeoButtonPath.setAttribute("d", np);
        }
        if (replyLocationDeleteButton) replyLocationDeleteButton.hidden = !has;
        if (replyLocationCompleteButton) replyLocationCompleteButton.disabled = !pendingLocation;
    }

    function renderLocationList() {
        if (!replyLocationList) return;
        const locs = getFilteredLocations();
        if (locs.length === 0) {
            replyLocationList.innerHTML = '<p class="explore-modal__location-empty">일치하는 위치를 찾지 못했습니다.</p>';
            return;
        }
        replyLocationList.innerHTML = locs.map((loc) => {
            const sel = pendingLocation === loc;
            return `<button type="button" class="explore-modal__location-item" role="menuitem"><span class="explore-modal__location-item-label">${loc}</span><span class="explore-modal__location-item-check">${sel ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>' : ""}</span></button>`;
        }).join("");
    }

    function openLocationPanel() {
        if (!composeView || !replyLocationView) return;
        closeEmojiPicker();
        pendingLocation = selectedLocation;
        composeView.hidden = true;
        replyLocationView.hidden = false;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        renderLocationList();
        syncLocationUI();
        window.requestAnimationFrame(() => {
            replyLocationSearchInput?.focus();
        });
    }

    function closeLocationPanel({restoreFocus = true} = {}) {
        if (!composeView || !replyLocationView || replyLocationView.hidden) return;
        replyLocationView.hidden = true;
        composeView.hidden = false;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        pendingLocation = selectedLocation;
        renderLocationList();
        syncLocationUI();
        if (restoreFocus) window.requestAnimationFrame(() => {
            replyEditor?.focus();
        });
    }

    function applyLocation(loc) {
        selectedLocation = loc;
        pendingLocation = loc;
        syncLocationUI();
    }

    function resetLocationState() {
        selectedLocation = null;
        pendingLocation = null;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        renderLocationList();
        syncLocationUI();
    }

    function hasReplyAttachment() {
        return attachedReplyFiles.length > 0;
    }

    function clearAttachedReplyFileUrls() {
        attachedReplyFileUrls = [];
    }

    function isReplyImageSet() {
        return attachedReplyFiles.length > 0 && attachedReplyFiles.every((f) => f.type.startsWith("image/"));
    }

    function isReplyVideoSet() {
        return attachedReplyFiles.length === 1 && attachedReplyFiles[0].type.startsWith("video/");
    }

    function resetReplyAttachment() {
        clearAttachedReplyFileUrls();
        attachedReplyFiles = [];
        pendingAttachmentEditIndex = null;
        resetTaggedUsers();
        syncReplyMediaEditsToAttachments();
        if (replyFileInput) replyFileInput.value = "";
        if (replyAttachmentMedia) replyAttachmentMedia.innerHTML = "";
        if (replyAttachmentPreview) replyAttachmentPreview.hidden = true;
    }

    function createReplyAttachmentUrls() {
        clearAttachedReplyFileUrls();
        return Promise.all(attachedReplyFiles.map((file) => new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.addEventListener("load", (e) => {
                resolve(e.target?.result ?? "");
            });
        }))).then((urls) => {
            attachedReplyFileUrls = urls;
        });
    }

    function getReplyImageCell(index, url, cls) {
        const alt = getReplyMediaImageAlt(index);
        return `<div class="media-cell ${cls}"><div class="media-cell-inner"><div class="media-img-container" aria-label="미디어" role="group"><div class="media-bg" style="background-image: url('${url}');"></div><img alt="${escapeHtml(alt)}" draggable="false" src="${url}" class="media-img"></div><div class="media-btn-row"><button type="button" class="media-btn" data-attachment-edit-index="${index}"><span>수정</span></button></div><button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-attachment-remove-index="${index}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div>`;
    }

    function renderReplyImageGrid() {
        const n = attachedReplyFiles.length, urls = attachedReplyFileUrls;
        if (!replyAttachmentMedia || n === 0) return;
        if (n === 1) {
            replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer">${getReplyImageCell(0, urls[0], "media-cell--single")}</div>`;
            return;
        }
        if (n === 2) {
            replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--left")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--right")}</div></div></div>`;
            return;
        }
        if (n === 3) {
            replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--left-tall")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--right-top")}${getReplyImageCell(2, urls[2], "media-cell--right-bottom")}</div></div></div>`;
            return;
        }
        replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--top-left")}${getReplyImageCell(2, urls[2], "media-cell--bottom-left")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--top-right")}${getReplyImageCell(3, urls[3], "media-cell--bottom-right")}</div></div></div>`;
    }

    function renderReplyVideoAttachment() {
        if (!replyAttachmentMedia || attachedReplyFiles.length === 0) return;
        const [file] = attachedReplyFiles, [fileUrl] = attachedReplyFileUrls;
        replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer"><div class="media-cell media-cell--single"><div class="media-cell-inner"><div class="media-img-container" aria-label="미디어" role="group"><video class="explore-modal__attachment-video" controls preload="metadata"><source src="${fileUrl}" type="${file.type}"></video></div><div class="media-btn-row"><button type="button" class="media-btn" data-attachment-edit-index="0"><span>수정</span></button></div><button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-attachment-remove-index="0"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div></div>`;
    }

    function renderReplyAttachment() {
        if (!replyAttachmentPreview || !replyAttachmentMedia) return;
        if (attachedReplyFiles.length === 0) {
            replyAttachmentMedia.innerHTML = "";
            replyAttachmentPreview.hidden = true;
            resetTaggedUsers();
            syncReplyMediaEditsToAttachments();
            return;
        }
        replyAttachmentPreview.hidden = false;
        if (isReplyImageSet()) {
            syncReplyMediaEditsToAttachments();
            syncUserTagTrigger();
            renderReplyImageGrid();
            return;
        }
        if (isReplyVideoSet()) {
            resetTaggedUsers();
            syncReplyMediaEditsToAttachments();
            renderReplyVideoAttachment();
            return;
        }
        resetTaggedUsers();
        syncReplyMediaEditsToAttachments();
        replyAttachmentMedia.innerHTML = "";
        const fp = document.createElement("div");
        const fi = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const fg = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const fpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const fn = document.createElement("span");
        fp.className = "explore-modal__attachment-file";
        fi.setAttribute("viewBox", "0 0 24 24");
        fi.setAttribute("width", "22");
        fi.setAttribute("height", "22");
        fi.setAttribute("aria-hidden", "true");
        fpath.setAttribute("d", "M14 2H7.75C5.68 2 4 3.68 4 5.75v12.5C4 20.32 5.68 22 7.75 22h8.5C18.32 22 20 20.32 20 18.25V8l-6-6zm0 2.12L17.88 8H14V4.12zm2.25 15.88h-8.5c-.97 0-1.75-.78-1.75-1.75V5.75C6 4.78 6.78 4 7.75 4H12v5.25c0 .41.34.75.75.75H18v8.25c0 .97-.78 1.75-1.75 1.75z");
        fn.className = "explore-modal__attachment-file-name";
        fn.textContent = attachedReplyFiles[0]?.name ?? "";
        fg.appendChild(fpath);
        fi.appendChild(fg);
        fp.appendChild(fi);
        fp.appendChild(fn);
        replyAttachmentMedia.appendChild(fp);
    }

    function removeReplyAttachment(index) {
        attachedReplyFiles = attachedReplyFiles.filter((_, i) => i !== index);
        attachedReplyFileUrls = attachedReplyFileUrls.filter((_, i) => i !== index);
        pendingAttachmentEditIndex = null;
        renderReplyAttachment();
    }

    function applyReplyFiles(nextFiles) {
        attachedReplyFiles = nextFiles;
        return createReplyAttachmentUrls().then(() => {
            renderReplyAttachment();
            syncReplySubmitState();
        });
    }

    function handleReplyFileChange(e) {
        const next = Array.from(e.target.files ?? []);
        if (next.length === 0) {
            pendingAttachmentEditIndex = null;
            syncReplySubmitState();
            return;
        }
        const rep = next[0];
        const vid = next.find((f) => f.type.startsWith("video/"));
        const imgs = next.filter((f) => f.type.startsWith("image/"));
        if (pendingAttachmentEditIndex !== null) {
            if (!rep) {
                pendingAttachmentEditIndex = null;
                return;
            }
            let nextFiles = [];
            if (rep.type.startsWith("video/")) {
                nextFiles = [rep];
            } else {
                const ed = isReplyVideoSet() ? [] : [...attachedReplyFiles];
                nextFiles = ed.length === 0 ? [rep] : ((ed[pendingAttachmentEditIndex] = rep), ed.slice(0, maxReplyImages));
            }
            pendingAttachmentEditIndex = null;
            applyReplyFiles(nextFiles);
            return;
        }
        if (vid) {
            applyReplyFiles([vid]);
            return;
        }
        if (imgs.length > 0) {
            applyReplyFiles([...(isReplyImageSet() ? [...attachedReplyFiles] : []), ...imgs].slice(0, maxReplyImages));
            return;
        }
        applyReplyFiles([rep]);
    }

    function hasReplyEditorText() {
        return replyEditor ? replyEditor.textContent.replace(/ /g, " ").trim().length > 0 : false;
    }

    function togglePendingReplyFormat(fmt) {
        pendingReplyFormats.has(fmt) ? pendingReplyFormats.delete(fmt) : pendingReplyFormats.add(fmt);
    }

    function syncActiveFormatsFromCursor() {
        if (!replyEditor) return;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (!replyEditor.contains(range.startContainer)) return;
        const node = range.startContainer;
        let el = node.nodeType === 3 ? node.parentElement : node;
        let isBold = false, isItalic = false;
        while (el && el !== replyEditor) {
            if (el.style) {
                if (el.style.fontWeight === "bold" || el.style.fontWeight === "700") isBold = true;
                if (el.style.fontStyle === "italic") isItalic = true;
            }
            el = el.parentElement;
        }
        if (isBold) pendingReplyFormats.add("bold"); else pendingReplyFormats.delete("bold");
        if (isItalic) pendingReplyFormats.add("italic"); else pendingReplyFormats.delete("italic");
    }

    function cleanupEmptyFormatSpans() {
        if (!replyEditor) return;
        const sel = window.getSelection();
        const cursorNode = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).startContainer : null;
        const spans = replyEditor.querySelectorAll("span");
        spans.forEach(function (span) {
            if (span.textContent === "" && !span.contains(cursorNode)) {
                span.parentNode && span.parentNode.removeChild(span);
            }
        });
    }

    function getFormatSpanAtCursor(range) {
        const node = range.startContainer;
        let el = node.nodeType === 3 ? node.parentElement : node;
        while (el && el !== replyEditor) {
            if (el.tagName === "SPAN") return el;
            el = el.parentElement;
        }
        return null;
    }

    function handleFormatKeydown(e) {
        if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return false;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return false;
        let range = sel.getRangeAt(0);
        if (!replyEditor.contains(range.startContainer)) return false;
        const isBold = pendingReplyFormats.has("bold");
        const isItalic = pendingReplyFormats.has("italic");
        const parentSpan = getFormatSpanAtCursor(range);
        const curIsBold = parentSpan ? parentSpan.style.fontWeight === "bold" : false;
        const curIsItalic = parentSpan ? parentSpan.style.fontStyle === "italic" : false;
        if (isBold === curIsBold && isItalic === curIsItalic) {
            if (!isBold && !isItalic) return false;
            if (!parentSpan) return false;
            e.preventDefault();
            if (!range.collapsed) range.deleteContents();
            range.collapse(true);
            const inSpanTextNode = document.createTextNode(e.key);
            range.insertNode(inSpanTextNode);
            const inSpanRange = document.createRange();
            inSpanRange.setStart(inSpanTextNode, e.key.length);
            inSpanRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(inSpanRange);
            saveReplySelection();
            syncReplySubmitState();
            syncReplyFormatButtons();
            return true;
        }
        e.preventDefault();
        if (!range.collapsed) range.deleteContents();
        range.collapse(true);
        if (parentSpan) {
            const escapeRange = document.createRange();
            escapeRange.setStartAfter(parentSpan);
            escapeRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(escapeRange);
            range = escapeRange;
        }
        const span = document.createElement("span");
        if (isBold) span.style.fontWeight = "bold";
        if (isItalic) span.style.fontStyle = "italic";
        const textNode = document.createTextNode(e.key);
        span.appendChild(textNode);
        range.insertNode(span);
        const newRange = document.createRange();
        newRange.setStart(textNode, e.key.length);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        saveReplySelection();
        syncReplySubmitState();
        syncReplyFormatButtons();
        return true;
    }

    function saveReplySelection() {
        if (!replyEditor || isInsertingReplyEmoji) return;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (!replyEditor.contains(range.commonAncestorContainer)) return;
        savedReplySelection = range.cloneRange();
        savedReplySelectionOffsets = getReplySelectionOffsets(range);
    }

    function getReplySelectionOffsets(range) {
        if (!replyEditor) return null;
        const pre = range.cloneRange();
        pre.selectNodeContents(replyEditor);
        pre.setEnd(range.startContainer, range.startOffset);
        const start = pre.toString().length;
        return {start, end: start + range.toString().length};
    }

    function resolveReplySelectionPosition(targetOffset) {
        if (!replyEditor) return null;
        const walker = document.createTreeWalker(replyEditor, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        let remaining = Math.max(0, targetOffset);
        let lastTextNode = null;
        while (node) {
            lastTextNode = node;
            const length = node.textContent?.length ?? 0;
            if (remaining <= length) {
                return {node, offset: remaining};
            }
            remaining -= length;
            node = walker.nextNode();
        }
        if (lastTextNode) {
            return {node: lastTextNode, offset: lastTextNode.textContent?.length ?? 0};
        }
        return {node: replyEditor, offset: replyEditor.childNodes.length};
    }

    function buildReplySelectionRangeFromOffsets(offsets) {
        if (!replyEditor || !offsets) return null;
        const startPos = resolveReplySelectionPosition(offsets.start);
        const endPos = resolveReplySelectionPosition(offsets.end);
        if (!startPos || !endPos) return null;
        const range = document.createRange();
        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);
        return range;
    }

    function restoreReplySelection() {
        if (!replyEditor) return false;
        const sel = window.getSelection();
        if (!sel) return false;
        const range = buildReplySelectionRangeFromOffsets(savedReplySelectionOffsets) ?? savedReplySelection;
        if (!range) return false;
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
    }

    function hasEmojiButtonLibrary() {
        return typeof window.EmojiButton === "function";
    }

    function restoreReplyEditorAfterEmojiInsert() {
        if (!shouldRestoreReplyEditorAfterEmojiInsert || !replyEditor || replyModalOverlay?.hidden) return;
        shouldRestoreReplyEditorAfterEmojiInsert = false;
        window.requestAnimationFrame(() => {
            isInsertingReplyEmoji = true;
            replyEditor.focus();
            isInsertingReplyEmoji = false;
            restoreReplySelection();
            saveReplySelection();
            syncReplyFormatButtons();
        });
    }

    function ensureReplyEmojiLibraryPicker() {
        if (!replyEmojiButton || !replyEditor || !hasEmojiButtonLibrary()) return null;
        if (replyEmojiLibraryPicker) return replyEmojiLibraryPicker;
        replyEmojiLibraryPicker = new window.EmojiButton({
            position: "bottom-start",
            rootElement: replyModalOverlay ?? undefined,
            zIndex: 1400
        });
        replyEmojiLibraryPicker.on("emoji", (selection) => {
            const emoji = typeof selection === "string" ? selection : selection?.emoji;
            if (!emoji) return;
            shouldRestoreReplyEditorAfterEmojiInsert = true;
            insertReplyEmoji(emoji);
            closeEmojiPicker();
            restoreReplyEditorAfterEmojiInsert();
        });
        replyEmojiLibraryPicker.on("hidden", () => {
            replyEmojiButton?.setAttribute("aria-expanded", "false");
            if (shouldRestoreReplyEditorAfterEmojiInsert) {
                restoreReplyEditorAfterEmojiInsert();
                return;
            }
            saveReplySelection();
        });
        if (replyEmojiPicker) {
            replyEmojiPicker.hidden = true;
        }
        return replyEmojiLibraryPicker;
    }

    function applyReplyFormat(format) {
        if (!replyEditor) return;
        replyEditor.focus();
        togglePendingReplyFormat(format);
        syncReplySubmitState();
        syncReplyFormatButtons();
    }

    function syncReplyFormatButtons() {
        if (!replyEditor) return;
        replyFormatButtons.forEach((btn) => {
            const fmt = btn.getAttribute("data-format");
            if (!fmt) return;
            const active = pendingReplyFormats.has(fmt);
            const labels = formatButtonLabels[fmt];
            btn.classList.toggle("explore-modal__tool-btn--active", active);
            if (labels) btn.setAttribute("aria-label", active ? labels.active : labels.inactive);
        });
    }

    function closeEmojiPicker() {
        const libraryPicker = replyEmojiLibraryPicker;
        if (libraryPicker) {
            if (libraryPicker.pickerVisible) {
                libraryPicker.hidePicker();
            }
            replyEmojiButton?.setAttribute("aria-expanded", "false");
            restoreReplyEditorAfterEmojiInsert();
            return;
        }
        if (!replyEmojiPicker || !replyEmojiButton) return;
        replyEmojiPicker.hidden = true;
        replyEmojiButton.setAttribute("aria-expanded", "false");
        restoreReplyEditorAfterEmojiInsert();
    }

    function updateEmojiPickerPosition() {
        if (!replyEmojiPicker || !replyEmojiButton) return;
        const rect = replyEmojiButton.getBoundingClientRect();
        const pw = Math.min(565, window.innerWidth - 32);
        const ml = Math.max(16, window.innerWidth - pw - 16);
        const left = Math.min(Math.max(16, rect.left), ml);
        const top = Math.min(rect.bottom + 8, window.innerHeight - 24);
        const mh = Math.max(220, window.innerHeight - top - 16);
        replyEmojiPicker.style.left = `${left}px`;
        replyEmojiPicker.style.top = `${top}px`;
        replyEmojiPicker.style.maxHeight = `${mh}px`;
    }

    function openEmojiPicker() {
        const libraryPicker = ensureReplyEmojiLibraryPicker();
        if (libraryPicker && replyEmojiButton) {
            saveReplySelection();
            replyEmojiButton.setAttribute("aria-expanded", "true");
            libraryPicker.showPicker(replyEmojiButton);
            return;
        }
        if (!replyEmojiPicker || !replyEmojiButton) return;
        renderEmojiPicker();
        replyEmojiPicker.hidden = false;
        replyEmojiButton.setAttribute("aria-expanded", "true");
        updateEmojiPickerPosition();
    }

    function toggleEmojiPicker() {
        const libraryPicker = ensureReplyEmojiLibraryPicker();
        if (libraryPicker && replyEmojiButton) {
            saveReplySelection();
            if (libraryPicker.pickerVisible) {
                libraryPicker.hidePicker();
                replyEmojiButton.setAttribute("aria-expanded", "false");
            } else {
                replyEmojiButton.setAttribute("aria-expanded", "true");
                libraryPicker.showPicker(replyEmojiButton);
            }
            return;
        }
        if (!replyEmojiPicker) return;
        replyEmojiPicker.hidden ? openEmojiPicker() : closeEmojiPicker();
    }

    function insertReplyEmoji(emoji) {
        if (!replyEditor) return;
        isInsertingReplyEmoji = true;
        replyEditor.focus();
        if (!restoreReplySelection()) {
            const range = document.createRange();
            range.selectNodeContents(replyEditor);
            range.collapse(false);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
        const sel = window.getSelection();
        if (!sel) {
            isInsertingReplyEmoji = false;
            return;
        }
        let range;
        if (sel.rangeCount === 0) {
            range = document.createRange();
            range.selectNodeContents(replyEditor);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            range = sel.getRangeAt(0);
        }
        if (!replyEditor.contains(range.commonAncestorContainer)) {
            range = document.createRange();
            range.selectNodeContents(replyEditor);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        const emojiNode = document.createTextNode(emoji);
        range.deleteContents();
        range.insertNode(emojiNode);
        const nextRange = document.createRange();
        nextRange.setStartAfter(emojiNode);
        nextRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nextRange);
        isInsertingReplyEmoji = false;
        cleanupEmptyFormatSpans();
        syncActiveFormatsFromCursor();
        saveRecentEmoji(emoji);
        saveReplySelection();
        syncReplySubmitState();
        syncReplyFormatButtons();
        if (replyEmojiPicker && !replyEmojiPicker.hidden) {
            renderEmojiPicker();
        }
    }

    function setActiveTab(tabName) {
        tabLinks.forEach((link) => {
            const path = link.querySelector("path");
            if (!path) return;
            const active = link.dataset.tab === tabName;
            path.setAttribute("d", active ? path.dataset.active : path.dataset.inactive);
            link.classList.toggle("tab-link--active", active);
        });
    }

    function syncReplySubmitState() {
        if (!replyEditor) return;
        let content = replyEditor.textContent?.replace(/ /g, " ") ?? "";
        if (content.length > replyMaxLength) {
            content = content.slice(0, replyMaxLength);
            const walker = document.createTreeWalker(replyEditor, NodeFilter.SHOW_TEXT);
            let remaining2 = replyMaxLength;
            let node2;
            while ((node2 = walker.nextNode())) {
                if (remaining2 <= 0) {
                    node2.textContent = "";
                } else if (node2.textContent.length > remaining2) {
                    node2.textContent = node2.textContent.slice(0, remaining2);
                    remaining2 = 0;
                } else {
                    remaining2 -= node2.textContent.length;
                }
            }
            cleanupEmptyFormatSpans();
            placeCaretAtEnd(replyEditor);
            saveReplySelection();
        }
        const currentLength = content.length;
        const remaining = Math.max(replyMaxLength - currentLength, 0);
        const canSubmit = content.trim().length > 0 || hasReplyAttachment();
        const progress = `${Math.min(currentLength / replyMaxLength, 1) * 360}deg`;
        if (replySubmitButton) {
            replySubmitButton.disabled = !canSubmit;
        }
        if (replyGauge) {
            replyGauge.style.setProperty("--gauge-progress", progress);
            replyGauge.setAttribute("aria-valuenow", String(currentLength));
        }
        if (replyGaugeText) {
            replyGaugeText.textContent = String(remaining);
        }
    }

    function populateReplyModal(button) {
        const ti = button.closest(".postCard") || button.closest(".post-detail-reply-card");
        if (!ti) return;
        if (replyContextButton) replyContextButton.textContent = getTextContent(ti.querySelector(".postHandle")) + " 님에게 보내는 답글";
        if (replySourceAvatar) {
            const avatarImg = ti.querySelector(".postAvatarImage");
            if (avatarImg) replySourceAvatar.src = avatarImg.getAttribute("src") ?? replySourceAvatar.src;
        }
        if (replySourceName) replySourceName.textContent = getTextContent(ti.querySelector(".postName"));
        if (replySourceHandle) replySourceHandle.textContent = getTextContent(ti.querySelector(".postHandle"));
        if (replySourceTime) replySourceTime.textContent = getTextContent(ti.querySelector(".postTime") || ti.querySelector(".post-detail-reply-identity span:last-child"));
        if (replySourceText) replySourceText.textContent = getTextContent(ti.querySelector(".postText") || ti.querySelector(".post-detail-reply-text"));
    }

    function openReplyModal(button) {
        if (!replyModalOverlay || !replyEditor) return;
        activeReplyTrigger = button;
        shouldRestoreReplyEditorAfterEmojiInsert = false;
        document.body.classList.add("modal-open");
        replyModalOverlay.hidden = false;
        populateReplyModal(button);
        closeEmojiPicker();
        replyEditor.textContent = "";
        savedReplySelection = null;
        savedReplySelectionOffsets = null;
        pendingReplyFormats = new Set();
        activeEmojiCategory = "recent";
        selectedLocation = null;
        pendingLocation = null;
        selectedTaggedUsers = [];
        pendingTaggedUsers = [];
        selectedProduct = null;
        if (replyProductButton) replyProductButton.disabled = false;
        const existingProductCard = replyModalOverlay?.querySelector("[data-selected-product]");
        if (existingProductCard) existingProductCard.remove();
        resetReplyAttachment();
        if (replyEmojiSearchInput) replyEmojiSearchInput.value = "";
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        if (composeView) composeView.hidden = false;
        if (replyLocationView) replyLocationView.hidden = true;
        if (replyTagView) replyTagView.hidden = true;
        if (replyMediaView) replyMediaView.hidden = true;
        if (replyProductView) replyProductView.hidden = true;
        closeDraftPanel({restoreFocus: false});
        renderDraftPanel();
        renderLocationList();
        syncLocationUI();
        syncUserTagTrigger();
        syncReplyMediaEditsToAttachments();
        syncReplySubmitState();
        syncReplyFormatButtons();
        window.requestAnimationFrame(() => {
            replyEditor.focus();
        });
    }

    function canCloseReplyModal() {
        if (!replyEditor) return (!hasReplyAttachment() || window.confirm("게시물을 삭제하시겠어요?"));
        const hasDraft = replyEditor.textContent.replace(/ /g, " ").trim().length > 0;
        return (!hasDraft && !hasReplyAttachment()) || window.confirm("게시물을 삭제하시겠어요?");
    }

    function closeReplyModal(options = {}) {
        const {skipConfirm = false, restoreFocus = true} = options;
        if (!replyModalOverlay || replyModalOverlay.hidden) return;
        if (!skipConfirm && !canCloseReplyModal()) return;
        shouldRestoreReplyEditorAfterEmojiInsert = false;
        replyModalOverlay.hidden = true;
        document.body.classList.remove("modal-open");
        closeEmojiPicker();
        closeLocationPanel({restoreFocus: false});
        closeTagPanel({restoreFocus: false});
        closeMediaEditor({restoreFocus: false, discardChanges: true});
        closeDraftPanel({restoreFocus: false});
        if (replyProductView) replyProductView.hidden = true;
        if (replyEditor) replyEditor.textContent = "";
        savedReplySelection = null;
        savedReplySelectionOffsets = null;
        pendingReplyFormats = new Set();
        selectedLocation = null;
        pendingLocation = null;
        selectedTaggedUsers = [];
        pendingTaggedUsers = [];
        selectedProduct = null;
        if (replyProductButton) replyProductButton.disabled = false;
        const existingProductCard = replyModalOverlay?.querySelector("[data-selected-product]");
        if (existingProductCard) existingProductCard.remove();
        resetReplyAttachment();
        renderLocationList();
        syncLocationUI();
        syncUserTagTrigger();
        syncReplyMediaEditsToAttachments();
        syncReplySubmitState();
        syncReplyFormatButtons();
        if (restoreFocus) activeReplyTrigger?.focus();
        activeReplyTrigger = null;
    }

    function trapFocus(e) {
        if (!replyModal || e.key !== "Tab") return;
        const focusable = Array.from(replyModal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute("hidden"));
        if (focusable.length === 0) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function updateReplyCount(button) {
        const cnt = button.querySelector(".tweet-action-count");
        if (!cnt) return;
        const next = (Number.parseInt(cnt.textContent || "0", 10) || 0) + 1;
        cnt.textContent = String(next);
        button.setAttribute("aria-label", `${next} 답글`);
    }

    function pushSharePath(p) {
        try {
            window.history.pushState({}, "", p);
        } catch {
            return;
        }
    }

    function getSharePostMeta(button) {
        const ti = button.closest(".notif-tweet-item");
        const all = Array.from(document.querySelectorAll(".notif-tweet-item"));
        const handle = getTextContent(ti?.querySelector(".tweet-handle")) || "@sokkomann";
        const bk = ti?.querySelector(".tweet-action-btn--bookmark") ?? null;
        const tid = String(Math.max(all.indexOf(ti), 0) + 1);
        const url = new URL(window.location.href);
        url.pathname = `/${handle.replace("@", "") || "user"}/status/${tid}`;
        url.hash = "";
        url.search = "";
        return {handle, tweetItem: ti, tweetId: tid, permalink: url.toString(), bookmarkButton: bk};
    }

    function showShareToast(message) {
        activeShareToast?.remove();
        const toast = document.createElement("div");
        toast.className = "share-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.textContent = message;
        document.body.appendChild(toast);
        activeShareToast = toast;
        window.setTimeout(() => {
            if (activeShareToast === toast) activeShareToast = null;
            toast.remove();
        }, 3000);
    }

    function setBookmarkButtonState(button, isActive) {
        const path = button?.querySelector("path");
        if (!button || !path) return;
        button.classList.toggle("active", isActive);
        button.setAttribute("data-testid", isActive ? "removeBookmark" : "bookmark");
        button.setAttribute("aria-label", isActive ? "북마크에 추가됨" : "북마크");
        path.setAttribute("d", isActive ? path.dataset.pathActive : path.dataset.pathInactive);
    }

    function closeShareModal({restorePath = true} = {}) {
        if (!activeShareModal) return;
        activeShareModal.remove();
        activeShareModal = null;
        document.body.classList.remove("modal-open");
        if (restorePath) pushSharePath("/notifications");
    }

    function copyShareLink(button) {
        const {permalink} = getSharePostMeta(button);
        closeShareDropdown();
        if (!navigator.clipboard?.writeText) {
            showShareToast("링크를 복사하지 못했습니다");
            return;
        }
        navigator.clipboard.writeText(permalink).then(() => showShareToast("클립보드로 복사함")).catch(() => showShareToast("링크를 복사하지 못했습니다"));
    }

    function getShareUserRows() {
        const users = getCurrentPageTagUsers();
        if (users.length === 0) return `<div class="share-sheet__empty"><p>전송할 수 있는 사용자가 없습니다.</p></div>`;
        return users.map((u) => `<button type="button" class="share-sheet__user" data-share-user-id="${escapeHtml(u.id)}"><span class="share-sheet__user-avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" /></span><span class="share-sheet__user-body"><span class="share-sheet__user-name">${escapeHtml(u.name)}</span><span class="share-sheet__user-handle">${escapeHtml(u.handle)}</span></span></button>`).join("");
    }

    function openShareChatModal(button) {
        closeShareDropdown();
        closeShareModal({restorePath: false});
        pushSharePath("/messages/compose");
        const modal = document.createElement("div");
        modal.className = "share-sheet";
        modal.innerHTML = `<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card" role="dialog" aria-modal="true" aria-labelledby="share-chat-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 id="share-chat-title" class="share-sheet__title">공유하기</h2><span class="share-sheet__header-spacer"></span></div><div class="share-sheet__search"><input type="text" class="share-sheet__search-input" placeholder="검색" aria-label="검색" /></div><div class="share-sheet__list">${getShareUserRows()}</div></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.closest("[data-share-close='true']") || e.target.classList.contains("share-sheet__backdrop")) {
                e.preventDefault();
                closeShareModal();
                return;
            }
            if (e.target.closest(".share-sheet__user")) {
                e.preventDefault();
                const userName = e.target.closest(".share-sheet__user")?.querySelector(".share-sheet__user-name")?.textContent || "사용자";
                showShareToast(`${userName}에게 전송함`);
                closeShareModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
    }

    function openShareBookmarkModal(button) {
        const {bookmarkButton} = getSharePostMeta(button);
        closeShareDropdown();
        closeShareModal({restorePath: false});
        pushSharePath("/i/bookmarks/add");
        const modal = document.createElement("div");
        const isBookmarked = bookmarkButton?.classList.contains("active") ?? false;
        modal.className = "share-sheet";
        modal.innerHTML = `<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card share-sheet__card--bookmark" role="dialog" aria-modal="true" aria-labelledby="share-bookmark-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button><h2 id="share-bookmark-title" class="share-sheet__title">폴더에 추가</h2><span class="share-sheet__header-spacer"></span></div><button type="button" class="share-sheet__create-folder">새 북마크 폴더 만들기</button><button type="button" class="share-sheet__folder" data-share-folder="all-bookmarks"><span class="share-sheet__folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"></path></g></svg></span><span class="share-sheet__folder-name">모든 북마크</span><span class="share-sheet__folder-check${isBookmarked ? " share-sheet__folder-check--active" : ""}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg></span></button></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.closest("[data-share-close='true']") || e.target.classList.contains("share-sheet__backdrop")) {
                e.preventDefault();
                closeShareModal();
                return;
            }
            if (e.target.closest(".share-sheet__create-folder")) {
                e.preventDefault();
                showShareToast("새 폴더 만들기는 준비 중입니다");
                closeShareModal();
                return;
            }
            if (e.target.closest("[data-share-folder='all-bookmarks']")) {
                e.preventDefault();
                setBookmarkButtonState(bookmarkButton, !isBookmarked);
                showShareToast(isBookmarked ? "북마크가 해제되었습니다" : "북마크에 추가되었습니다");
                closeShareModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
    }

    function closeShareDropdown() {
        if (!activeShareDropdown) return;
        activeShareDropdown.remove();
        activeShareDropdown = null;
        if (activeShareButton) {
            activeShareButton.setAttribute("aria-expanded", "false");
            activeShareButton = null;
        }
    }

    function openShareDropdown(button) {
        if (!layersRoot) return;
        closeShareDropdown();
        closeNotificationDropdown();
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const right = Math.max(16, window.innerWidth - rect.right);
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top: ${top}px; right: ${right}px;"><div><div class="dropdown-inner"><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--copy"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></g></svg></span><span class="menu-item__label">링크 복사하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--chat"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path></g></svg></span><span class="menu-item__label">Chat으로 전송하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--bookmark"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18 3V0h2v3h3v2h-3v3h-2V5h-3V3zm-7.5 1a.5.5 0 00-.5.5V7h3.5A2.5 2.5 0 0116 9.5v3.48l3 2.1V11h2v7.92l-5-3.5v7.26l-6.5-3.54L3 22.68V9.5A2.5 2.5 0 015.5 7H8V4.5A2.5 2.5 0 0110.5 2H12v2zm-5 5a.5.5 0 00-.5.5v9.82l4.5-2.46 4.5 2.46V9.5a.5.5 0 00-.5-.5z"></path></g></svg></span><span class="menu-item__label">폴더에 북마크 추가하기</span></button></div></div></div></div>`;
        lc.addEventListener("click", (e) => {
            const ab = e.target.closest(".share-menu-item");
            if (!ab || !activeShareButton) {
                e.stopPropagation();
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            if (ab.classList.contains("share-menu-item--copy")) {
                copyShareLink(activeShareButton);
                return;
            }
            if (ab.classList.contains("share-menu-item--chat")) {
                openShareChatModal(activeShareButton);
                return;
            }
            if (ab.classList.contains("share-menu-item--bookmark")) openShareBookmarkModal(activeShareButton);
        });
        layersRoot.appendChild(lc);
        activeShareDropdown = lc;
        activeShareButton = button;
        activeShareButton.setAttribute("aria-expanded", "true");
    }

    function getNotificationDropdownItems(button) {
        const ti = button.closest(".notif-tweet-item");
        const handle = getTextContent(ti?.querySelector(".tweet-handle")) || "@sokkomann";
        const isF = notificationFollowState.get(handle) ?? false;
        return [{
            actionClass: "menu-item--follow-toggle",
            label: isF ? `${handle} 님 언팔로우하기` : `${handle} 님 팔로우하기`,
            icon: isF ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></g></svg>'
        }, {
            actionClass: "menu-item--block",
            label: `${handle} 님 차단하기`,
            testid: "block",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></g></svg>'
        }, {
            actionClass: "menu-item--report",
            label: "게시물 신고하기",
            testid: "report",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg>'
        }];
    }

    function closeNotificationDropdown() {
        if (!activeMoreDropdown) return;
        activeMoreDropdown.remove();
        activeMoreDropdown = null;
        if (activeMoreButton) {
            activeMoreButton.setAttribute("aria-expanded", "false");
            activeMoreButton = null;
        }
    }

    function getNotificationUserMeta(button) {
        const ti = button.closest(".notif-tweet-item");
        const all = Array.from(document.querySelectorAll(".notif-tweet-item"));
        const handle = getTextContent(ti?.querySelector(".tweet-handle")) || "@sokkomann";
        const displayName = getTextContent(ti?.querySelector(".tweet-displayname")) || "사용자";
        const tweetId = String(Math.max(all.indexOf(ti), 0) + 1);
        return {tweetItem: ti, handle, displayName, tweetId};
    }

    function showNotificationToast(message) {
        activeNotificationToast?.remove();
        const toast = document.createElement("div");
        toast.className = "notification-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.textContent = message;
        document.body.appendChild(toast);
        activeNotificationToast = toast;
        window.setTimeout(() => {
            if (activeNotificationToast === toast) activeNotificationToast = null;
            toast.remove();
        }, 3000);
    }

    function closeNotificationModal() {
        if (!activeNotificationModal) return;
        activeNotificationModal.remove();
        activeNotificationModal = null;
        document.body.classList.remove("modal-open");
    }

    function openNotificationBlockModal(button) {
        const {handle} = getNotificationUserMeta(button);
        closeNotificationDropdown();
        closeNotificationModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog";
        modal.classList.add("notification-dialog--block");
        modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--small" role="alertdialog" aria-modal="true" aria-labelledby="notification-block-title" aria-describedby="notification-block-desc"><h2 id="notification-block-title" class="notification-dialog__title">${handle} 님을 차단할까요?</h2><p id="notification-block-desc" class="notification-dialog__description">내 공개 게시물을 볼 수 있지만 더 이상 게시물에 참여할 수 없습니다. 또한 ${handle} 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.</p><div class="notification-dialog__actions"><button type="button" class="notification-dialog__danger notification-dialog__confirm-block">차단</button><button type="button" class="notification-dialog__secondary notification-dialog__close">취소</button></div></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) {
                e.preventDefault();
                closeNotificationModal();
                return;
            }
            if (e.target.closest(".notification-dialog__confirm-block")) {
                e.preventDefault();
                showNotificationToast(`${handle} 님을 차단했습니다`);
                closeNotificationModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeNotificationModal = modal;
    }

    function openNotificationReportModal(button) {
        const {tweetId} = getNotificationUserMeta(button);
        closeNotificationDropdown();
        closeNotificationModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog";
        modal.classList.add("notification-dialog--report");
        modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--report" role="dialog" aria-modal="true" aria-labelledby="notification-report-title"><div class="notification-dialog__header"><button type="button" class="notification-dialog__icon-btn notification-dialog__close" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 id="notification-report-title" class="notification-dialog__title">신고하기</h2></div><div class="notification-dialog__body"><p class="notification-dialog__question">이 게시물에 어떤 문제가 있나요?</p><ul class="notification-report__list">${notificationReportReasons.map((r) => `<li><button type="button" class="notification-report__item"><span>${r}</span><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.293 6.293 10.707 4.88 17.828 12l-7.121 7.12-1.414-1.413L14.999 12z"></path></g></svg></button></li>`).join("")}</ul></div></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) {
                e.preventDefault();
                closeNotificationModal();
                return;
            }
            if (e.target.closest(".notification-report__item")) {
                e.preventDefault();
                showNotificationToast("신고가 접수되었습니다");
                closeNotificationModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeNotificationModal = modal;
    }

    function handleNotificationDropdownAction(button, actionClass) {
        const {handle} = getNotificationUserMeta(button);
        if (actionClass === "menu-item--follow-toggle") {
            const isF = notificationFollowState.get(handle) ?? false;
            notificationFollowState.set(handle, !isF);
            closeNotificationDropdown();
            showNotificationToast(isF ? `${handle} 님 팔로우를 취소했습니다` : `${handle} 님을 팔로우했습니다`);
            return;
        }
        if (actionClass === "menu-item--block") {
            openNotificationBlockModal(button);
            return;
        }
        if (actionClass === "menu-item--report") openNotificationReportModal(button);
    }

    function openNotificationDropdown(button) {
        if (!layersRoot) return;
        closeShareDropdown();
        closeNotificationDropdown();
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const items = getNotificationDropdownItems(button);
        const right = Math.max(16, window.innerWidth - rect.right);
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top: ${top}px; right: ${right}px;"><div><div class="dropdown-inner" data-testid="Dropdown">${items.map((it) => {
            const ta = it.testid ? ` data-testid="${it.testid}"` : "";
            return `<button type="button" role="menuitem" class="menu-item ${it.actionClass}"${ta}><span class="menu-item__icon">${it.icon}</span><span class="menu-item__label">${it.label}</span></button>`;
        }).join("")}</div></div></div></div>`;
        lc.addEventListener("click", (e) => {
            const item = e.target.closest(".menu-item");
            if (item) {
                e.preventDefault();
                e.stopPropagation();
                if (activeMoreButton) {
                    const ac = Array.from(item.classList).find((c) => c.startsWith("menu-item--")) ?? "";
                    handleNotificationDropdownAction(activeMoreButton, ac);
                }
                return;
            }
            e.stopPropagation();
        });
        layersRoot.appendChild(lc);
        activeMoreDropdown = lc;
        activeMoreButton = button;
        activeMoreButton.setAttribute("aria-expanded", "true");
    }

    // ===== 7. Draft Panel =====
    const draftView = q(".explore-modal__draft-view");
    const draftButton = q(".explore-modal__draft");
    const draftBackButton = draftView?.querySelector(".draft-panel__back");
    const draftActionButton = draftView?.querySelector(".draft-panel__action");
    const draftList = draftView?.querySelector(".draft-panel__list");
    const draftEmpty = draftView?.querySelector(".draft-panel__empty");
    const draftEmptyTitle = draftView?.querySelector(".draft-panel__empty-title");
    const draftEmptyBody = draftView?.querySelector(".draft-panel__empty-body");
    const draftFooter = draftView?.querySelector(".draft-panel__footer");
    const draftSelectAllButton = draftView?.querySelector(".draft-panel__select-all");
    const draftDeleteButton = draftView?.querySelector(".draft-panel__footer-delete");
    const draftConfirmOverlay = draftView?.querySelector(".draft-panel__confirm-overlay");
    const draftConfirmBackdrop = draftView?.querySelector(".draft-panel__confirm-backdrop");
    const draftConfirmTitle = draftView?.querySelector(".draft-panel__confirm-title");
    const draftConfirmDesc = draftView?.querySelector(".draft-panel__confirm-desc");
    const draftConfirmDeleteButton = draftView?.querySelector(".draft-panel__confirm-primary");
    const draftConfirmCancelButton = draftView?.querySelector(".draft-panel__confirm-secondary");
    const draftPanelState = {isEditMode: false, confirmOpen: false, selectedItems: new Set()};

    function getDraftItems() {
        return draftList ? Array.from(draftList.querySelectorAll(".draft-panel__item")) : [];
    }

    function clearDraftSelection() {
        draftPanelState.selectedItems.clear();
        draftPanelState.confirmOpen = false;
    }

    function exitDraftEditMode() {
        draftPanelState.isEditMode = false;
        clearDraftSelection();
    }

    function enterDraftEditMode() {
        if (getDraftItems().length === 0) return;
        draftPanelState.isEditMode = true;
        draftPanelState.confirmOpen = false;
    }

    function hasDraftItem(item) {
        return item instanceof HTMLElement && getDraftItems().includes(item);
    }

    function toggleDraftSelection(item) {
        if (!draftPanelState.isEditMode || !hasDraftItem(item)) return;
        draftPanelState.selectedItems.has(item) ? draftPanelState.selectedItems.delete(item) : draftPanelState.selectedItems.add(item);
        draftPanelState.confirmOpen = false;
    }

    function areAllDraftItemsSelected() {
        const items = getDraftItems();
        return items.length > 0 && items.every((i) => draftPanelState.selectedItems.has(i));
    }

    function toggleDraftSelectAll() {
        if (!draftPanelState.isEditMode) return;
        const items = getDraftItems();
        if (items.length === 0) return;
        areAllDraftItemsSelected() ? draftPanelState.selectedItems.clear() : (draftPanelState.selectedItems = new Set(items));
        draftPanelState.confirmOpen = false;
    }

    function hasDraftSelection() {
        return draftPanelState.selectedItems.size > 0;
    }

    function openDraftConfirm() {
        if (draftPanelState.isEditMode && hasDraftSelection()) draftPanelState.confirmOpen = true;
    }

    function closeDraftConfirm() {
        draftPanelState.confirmOpen = false;
    }

    function deleteSelectedDrafts() {
        if (!hasDraftSelection()) return;
        getDraftItems().forEach((i) => {
            if (draftPanelState.selectedItems.has(i)) i.remove();
        });
        exitDraftEditMode();
    }

    function resetDraftPanel() {
        exitDraftEditMode();
        closeDraftConfirm();
    }

    function isDraftPanelOpen() {
        return Boolean(draftView && !draftView.hidden);
    }

    function isDraftConfirmOpen() {
        return draftPanelState.confirmOpen;
    }

    function getDraftEmptyCopy() {
        return {title: "잠시 생각을 정리합니다", body: "아직 게시할 준비가 되지 않았나요? 임시저장해 두고 나중에 이어서 작성하세요."};
    }

    function getDraftConfirmCopy() {
        return {title: "전송하지 않은 게시물 삭제하기", body: "이 작업은 취소할 수 없으며 선택한 전송하지 않은 게시물이 삭제됩니다."};
    }

    function buildDraftCheckbox(sel) {
        const cb = document.createElement("span");
        cb.className = "draft-panel__checkbox";
        if (sel) {
            cb.classList.add("draft-panel__checkbox--checked");
        }
        cb.setAttribute("aria-hidden", "true");
        cb.innerHTML = '<svg viewBox="0 0 24 24"><g><path d="M9.86 18a1 1 0 01-.73-.31l-3.9-4.11 1.45-1.38 3.2 3.38 7.46-8.1 1.47 1.36-8.19 8.9A1 1 0 019.86 18z"></path></g></svg>';
        return cb;
    }

    function renderDraftItems() {
        if (!draftList) return;
        getDraftItems().forEach((item) => {
            const sel = draftPanelState.selectedItems.has(item);
            const old = item.querySelector(".draft-panel__checkbox");
            if (old) old.remove();
            item.className = ["draft-panel__item", draftPanelState.isEditMode ? "draft-panel__item--selectable" : "", sel ? "draft-panel__item--selected" : ""].filter(Boolean).join(" ");
            item.setAttribute("aria-pressed", draftPanelState.isEditMode ? String(sel) : "false");
            if (draftPanelState.isEditMode) item.prepend(buildDraftCheckbox(sel));
        });
    }

    function renderDraftPanel() {
        if (!draftView) return;
        const hasItems = getDraftItems().length > 0;
        const ec = getDraftEmptyCopy(), cc = getDraftConfirmCopy();
        if (draftActionButton) {
            draftActionButton.textContent = draftPanelState.isEditMode ? "완료" : "수정";
            draftActionButton.disabled = !hasItems;
            draftActionButton.classList.toggle("draft-panel__action--done", draftPanelState.isEditMode);
        }
        renderDraftItems();
        if (draftEmpty) draftEmpty.hidden = hasItems;
        if (draftEmptyTitle) draftEmptyTitle.textContent = ec.title;
        if (draftEmptyBody) draftEmptyBody.textContent = ec.body;
        if (draftFooter) draftFooter.hidden = !draftPanelState.isEditMode;
        if (draftSelectAllButton) draftSelectAllButton.textContent = areAllDraftItemsSelected() ? "모두 선택 해제" : "모두 선택";
        if (draftDeleteButton) draftDeleteButton.disabled = !hasDraftSelection();
        if (draftConfirmOverlay) draftConfirmOverlay.hidden = !draftPanelState.confirmOpen;
        if (draftConfirmTitle) draftConfirmTitle.textContent = cc.title;
        if (draftConfirmDesc) draftConfirmDesc.textContent = cc.body;
    }

    function openDraftPanel() {
        if (!composeView || !draftView) return;
        renderDraftPanel();
        composeView.hidden = true;
        draftView.hidden = false;
    }

    function closeDraftPanel({restoreFocus = true} = {}) {
        if (!composeView || !draftView) return;
        resetDraftPanel();
        renderDraftPanel();
        draftView.hidden = true;
        composeView.hidden = false;
        if (restoreFocus) draftButton?.focus();
    }

    function getDraftItemByElement(target) {
        return target.closest(".draft-panel__item");
    }

    function loadDraftIntoComposer(item) {
        if (!item || !replyEditor) return;
        replyEditor.textContent = getTextContent(item.querySelector(".draft-panel__text"));
        closeDraftPanel({restoreFocus: false});
        syncReplySubmitState();
        saveReplySelection();
        window.requestAnimationFrame(() => {
            replyEditor.focus();
        });
    }

    // ===== 8. Init & Events =====
    renderLocationList();
    syncLocationUI();
    syncUserTagTrigger();
    setActiveTab("notifications");

    tabLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            setActiveTab(link.dataset.tab);
        });
    });
    ensureReplyEmojiLibraryPicker();
    window.addEventListener("scroll", (e) => {
        if (!bottombarSlide) return;
        const cy = window.scrollY;
        bottombarSlide.style.transform = cy > lastScrollY && cy > 100 ? "translateY(100%)" : "translateY(0)";
        lastScrollY = cy;
    }, {passive: true});
    notifTabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            notifTabs.forEach((t) => {
                t.classList.remove("notif-tab--active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("notif-tab--active");
            tab.setAttribute("aria-selected", "true");
            const filter = tab.dataset.notifTab;
            const notifItems = document.querySelectorAll(".notif-list > [data-notif-type]");
            notifItems.forEach((item) => {
                if (filter === "all") {
                    item.style.display = "";
                } else if (filter === "mentions") {
                    item.style.display = item.dataset.notifType === "mention" ? "" : "none";
                }
            });
        });
    });
    // 답글 트리거는 공용 답글 모달(post-modal.js setupReply)이 처리한다.
    // 자체 답글 모달 마크업/CSS/핸들러는 Phase 3 후속 PR에서 통째 제거 예정.

    replyCloseButton?.addEventListener("click", closeReplyModal);
    replyModalOverlay?.addEventListener("click", (e) => {
        if (e.target === replyModalOverlay) closeReplyModal();
    });
    replyModalOverlay?.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            if (isMediaEditorOpen()) {
                closeMediaEditor();
                return;
            }
            if (isTagModalOpen()) {
                closeTagPanel();
                return;
            }
            if (isLocationModalOpen()) {
                closeLocationPanel();
                return;
            }
            if (replyProductView && !replyProductView.hidden) {
                closeProductSelectPanel();
                return;
            }
            if (isDraftConfirmOpen()) {
                closeDraftConfirm();
                renderDraftPanel();
                return;
            }
            if (isDraftPanelOpen()) {
                closeDraftPanel();
                return;
            }
            closeReplyModal();
            return;
        }
        trapFocus(e);
    });
    replyEditor?.addEventListener("input", () => {
        cleanupEmptyFormatSpans();
        syncActiveFormatsFromCursor();
        if (!hasReplyEditorText()) pendingReplyFormats = new Set();
        syncReplySubmitState();
        syncReplyFormatButtons();
        saveReplySelection();
    });
    replyEditor?.addEventListener("keyup", (e) => {
        syncActiveFormatsFromCursor();
        saveReplySelection();
        syncReplyFormatButtons();
    });
    replyEditor?.addEventListener("mouseup", (e) => {
        syncActiveFormatsFromCursor();
        saveReplySelection();
        syncReplyFormatButtons();
    });
    replyEditor?.addEventListener("focus", (e) => {
        syncActiveFormatsFromCursor();
        saveReplySelection();
        syncReplyFormatButtons();
    });
    replyEditor?.addEventListener("click", (e) => {
        syncActiveFormatsFromCursor();
        syncReplyFormatButtons();
    });
    replyEditor?.addEventListener("keydown", (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (!e.altKey) {
                const key = e.key.toLowerCase();
                if (key === "b" || key === "i") {
                    e.preventDefault();
                    applyReplyFormat(key === "b" ? "bold" : "italic");
                }
            }
            return;
        }
        handleFormatKeydown(e);
    });
    replyMediaUploadButton?.addEventListener("click", (e) => {
        e.preventDefault();
        pendingAttachmentEditIndex = null;
        if (replyFileInput) replyFileInput.value = "";
        replyFileInput?.click();
    });
    replyFileInput?.addEventListener("change", handleReplyFileChange);
    replyAttachmentMedia?.addEventListener("click", (e) => {
        const rm = e.target.closest("[data-attachment-remove-index]");
        if (rm) {
            const ri = Number.parseInt(rm.getAttribute("data-attachment-remove-index") ?? "-1", 10);
            if (ri >= 0) removeReplyAttachment(ri);
            syncReplySubmitState();
            return;
        }
        const eb = e.target.closest("[data-attachment-edit-index]");
        if (eb) {
            pendingAttachmentEditIndex = Number.parseInt(eb.getAttribute("data-attachment-edit-index") ?? "-1", 10);
            if (replyFileInput) replyFileInput.value = "";
            replyFileInput?.click();
        }
    });
    replyFormatButtons.forEach((btn) => {
        btn.addEventListener("mousedown", (e) => e.preventDefault());
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const fmt = btn.getAttribute("data-format");
            if (fmt) {
                applyReplyFormat(fmt);
                syncReplyFormatButtons();
            }
        });
    });
    replyEmojiButton?.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        saveReplySelection();
    });
    replyEmojiButton?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleEmojiPicker();
    });
    replyGeoButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openLocationPanel();
    });
    replyUserTagTrigger?.addEventListener("click", (e) => {
        e.preventDefault();
        openTagPanel();
    });
    replyMediaAltTrigger?.addEventListener("click", (e) => {
        e.preventDefault();
        openMediaEditor();
    });
    replyLocationDisplayButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openLocationPanel();
    });
    replyEmojiPicker?.addEventListener("click", (e) => e.stopPropagation());
    replyEmojiSearchInput?.addEventListener("input", () => renderEmojiPickerContent());
    replyLocationSearchInput?.addEventListener("input", () => renderLocationList());
    replyTagSearchForm?.addEventListener("submit", (e) => e.preventDefault());
    replyTagSearchInput?.addEventListener("input", () => runTagSearch());
    replyMediaBackButton?.addEventListener("click", () => closeMediaEditor());
    replyMediaSaveButton?.addEventListener("click", () => saveReplyMediaEdits());
    replyMediaPrevButton?.addEventListener("click", () => {
        if (activeReplyMediaIndex === 0) return;
        activeReplyMediaIndex -= 1;
        renderMediaEditor();
    });
    replyMediaNextButton?.addEventListener("click", () => {
        if (activeReplyMediaIndex >= pendingReplyMediaEdits.length - 1) return;
        activeReplyMediaIndex += 1;
        renderMediaEditor();
    });
    replyMediaAltInput?.addEventListener("input", () => {
        const edit = pendingReplyMediaEdits[activeReplyMediaIndex];
        if (!edit) return;
        edit.alt = replyMediaAltInput.value.slice(0, maxReplyMediaAltLength);
        renderMediaEditor();
    });
    replyEmojiTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const cat = tab.getAttribute("data-emoji-category");
            if (cat) {
                activeEmojiCategory = cat;
                renderEmojiPicker();
            }
        });
    });
    replyEmojiContent?.addEventListener("mousedown", (e) => {
        if (e.target.closest(".explore-modal__emoji-option, .explore-modal__emoji-clear")) e.preventDefault();
    });
    replyEmojiContent?.addEventListener("click", (e) => {
        if (e.target.closest("[data-action='clear-recent']")) {
            clearRecentEmojis();
            activeEmojiCategory = "recent";
            renderEmojiPicker();
            return;
        }
        const eb = e.target.closest(".explore-modal__emoji-option");
        if (!eb) return;
        const emoji = eb.getAttribute("data-emoji");
        if (emoji) {
            insertReplyEmoji(emoji);
            closeEmojiPicker();
        }
    });
    replyLocationCloseButton?.addEventListener("click", () => closeLocationPanel());
    replyTagCloseButton?.addEventListener("click", () => closeTagPanel());
    replyTagCompleteButton?.addEventListener("click", () => {
        applyPendingTaggedUsers();
        closeTagPanel();
    });
    replyLocationDeleteButton?.addEventListener("click", () => {
        resetLocationState();
        closeLocationPanel();
    });
    replyLocationCompleteButton?.addEventListener("click", () => {
        if (pendingLocation) {
            applyLocation(pendingLocation);
            closeLocationPanel();
        }
    });
    replyLocationList?.addEventListener("click", (e) => {
        const lb = e.target.closest(".explore-modal__location-item");
        if (!lb) return;
        const loc = getTextContent(lb.querySelector(".explore-modal__location-item-label"));
        if (loc) {
            applyLocation(loc);
            closeLocationPanel();
        }
    });
    replyTagChipList?.addEventListener("click", (e) => {
        const cb = e.target.closest("[data-tag-remove-id]");
        if (!cb) return;
        const uid = cb.getAttribute("data-tag-remove-id");
        pendingTaggedUsers = pendingTaggedUsers.filter((u) => u.id !== uid);
        renderTagChipList();
        runTagSearch();
        replyTagSearchInput?.focus();
    });
    replyTagResults?.addEventListener("click", (e) => {
        const ub = e.target.closest("[data-tag-user-id]");
        if (!ub || ub.hasAttribute("disabled")) return;
        const uid = ub.getAttribute("data-tag-user-id");
        const user = currentTagResults.find((u) => u.id === uid);
        if (!user || pendingTaggedUsers.some((u) => u.id === user.id)) return;
        pendingTaggedUsers = [...pendingTaggedUsers, {...user}];
        renderTagChipList();
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagResults([]);
        replyTagSearchInput?.focus();
    });
    document.addEventListener("click", (e) => {
        if (replyEmojiPicker && !replyEmojiPicker.hidden && !replyEmojiPicker.contains(e.target) && !replyEmojiButton?.contains(e.target)) closeEmojiPicker();
        if (activeShareDropdown && !activeShareDropdown.contains(e.target)) closeShareDropdown();
        if (activeMoreDropdown && !activeMoreDropdown.contains(e.target) && !activeMoreButton?.contains(e.target)) closeNotificationDropdown();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeShareModal();
            closeNotificationModal();
            closeShareDropdown();
            closeNotificationDropdown();
        }
    });
    window.addEventListener("resize", () => {
        if (replyEmojiPicker && !replyEmojiPicker.hidden) updateEmojiPickerPosition();
    }, {passive: true});
    window.addEventListener("scroll", () => {
        if (replyEmojiPicker && !replyEmojiPicker.hidden) updateEmojiPickerPosition();
    }, {passive: true});

    // Draft panel events
    draftButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openDraftPanel();
    });
    draftBackButton?.addEventListener("click", (e) => {
        e.preventDefault();
        closeDraftPanel();
    });
    draftActionButton?.addEventListener("click", (e) => {
        e.preventDefault();
        draftPanelState.isEditMode ? exitDraftEditMode() : enterDraftEditMode();
        renderDraftPanel();
    });
    draftSelectAllButton?.addEventListener("click", (e) => {
        e.preventDefault();
        toggleDraftSelectAll();
        renderDraftPanel();
    });
    draftDeleteButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openDraftConfirm();
        renderDraftPanel();
    });
    draftConfirmDeleteButton?.addEventListener("click", (e) => {
        e.preventDefault();
        deleteSelectedDrafts();
        renderDraftPanel();
    });
    draftConfirmCancelButton?.addEventListener("click", (e) => {
        e.preventDefault();
        closeDraftConfirm();
        renderDraftPanel();
    });
    draftConfirmBackdrop?.addEventListener("click", (e) => {
        e.preventDefault();
        closeDraftConfirm();
        renderDraftPanel();
    });
    draftList?.addEventListener("click", (e) => {
        const item = getDraftItemByElement(e.target);
        if (!item) return;
        if (draftPanelState.isEditMode) {
            toggleDraftSelection(item);
            renderDraftPanel();
            return;
        }
        loadDraftIntoComposer(item);
    });

    // ===== 판매글 선택 서브뷰 =====
    replyProductButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openProductSelectPanel();
    });
    productSelectClose?.addEventListener("click", () => {
        closeProductSelectPanel();
    });
    productSelectComplete?.addEventListener("click", () => {
        const checkedItem = productSelectList?.querySelector(".draft-panel__item--selected");
        if (checkedItem) {
            selectedProduct = {
                name: checkedItem.querySelector(".draft-panel__text")?.textContent ?? "",
                price: checkedItem.querySelector(".draft-panel__date")?.textContent ?? "",
                image: checkedItem.querySelector(".draft-panel__avatar")?.src ?? "",
                id: checkedItem.dataset.productId ?? ""
            };
            renderSelectedProduct();
            if (replyProductButton) replyProductButton.disabled = true;
        }
        closeProductSelectPanel();
    });

    function openProductSelectPanel() {
        if (!replyProductView) return;
        renderProductList();
        if (composeView) composeView.hidden = true;
        replyProductView.hidden = false;
    }

    function closeProductSelectPanel() {
        if (!replyProductView) return;
        replyProductView.hidden = true;
        if (composeView) composeView.hidden = false;
    }

    function renderProductList() {
        if (!productSelectList) return;
        const sampleProducts = [{
            id: "1",
            name: "상품 이름 1",
            price: "₩50,000",
            stock: "100개",
            image: "/images/main/global-gates-logo.png",
            tags: ["#부품", "#전자"]
        }, {
            id: "2",
            name: "상품 이름 2",
            price: "₩30,000",
            stock: "50개",
            image: "/images/main/global-gates-logo.png",
            tags: ["#부품", "#기계"]
        }, {
            id: "3",
            name: "상품 이름 3",
            price: "₩80,000",
            stock: "200개",
            image: "/images/main/global-gates-logo.png",
            tags: ["#부품", "#소재"]
        }];
        if (sampleProducts.length === 0) {
            productSelectList.innerHTML = "";
            if (productSelectEmpty) productSelectEmpty.hidden = false;
            return;
        }
        if (productSelectEmpty) productSelectEmpty.hidden = true;
        productSelectList.innerHTML = sampleProducts.map((p) => `<button type="button" class="draft-panel__item draft-panel__item--selectable" data-product-id="${p.id}" aria-pressed="false"><span class="draft-panel__checkbox"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9 20c-.264 0-.518-.104-.707-.293l-4.785-4.785 1.414-1.414L9 17.586 19.072 7.5l1.42 1.416L9.708 19.7c-.188.19-.442.3-.708.3z"></path></g></svg></span><img class="draft-panel__avatar" alt="" src="${p.image}"><span class="draft-panel__item-body"><span class="draft-panel__text">${p.name}</span><span class="draft-panel__meta">${p.tags.join(" ")}</span><span class="draft-panel__date">${p.price} · ${p.stock}</span></span></button>`).join("");
    }

    productSelectList?.addEventListener("click", (e) => {
        const item = e.target.closest(".draft-panel__item");
        if (!item) return;
        const wasSelected = item.classList.contains("draft-panel__item--selected");
        productSelectList.querySelectorAll(".draft-panel__item--selected").forEach((el) => {
            el.classList.remove("draft-panel__item--selected");
            el.setAttribute("aria-pressed", "false");
            const cb = el.querySelector(".draft-panel__checkbox");
            if (cb) cb.classList.remove("draft-panel__checkbox--checked");
        });
        if (!wasSelected) {
            item.classList.add("draft-panel__item--selected");
            item.setAttribute("aria-pressed", "true");
            const cb = item.querySelector(".draft-panel__checkbox");
            if (cb) cb.classList.add("draft-panel__checkbox--checked");
        }
        if (productSelectComplete) {
            productSelectComplete.disabled = !productSelectList.querySelector(".draft-panel__item--selected");
        }
    });

    function renderSelectedProduct() {
        const existing = replyModalOverlay?.querySelector("[data-selected-product]");
        if (existing) existing.remove();
        if (!selectedProduct || !replyEditor) return;
        const card = document.createElement("div");
        card.setAttribute("data-selected-product", "");
        card.className = "explore-modal__selected-product";
        card.innerHTML = `<div class="selected-product__card"><img class="selected-product__image" src="${selectedProduct.image}" alt="${selectedProduct.name}"><div class="selected-product__info"><strong class="selected-product__name">${selectedProduct.name}</strong><span class="selected-product__price">${selectedProduct.price}</span></div><button type="button" class="selected-product__remove" aria-label="판매글 제거"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div>`;
        card.querySelector(".selected-product__remove")?.addEventListener("click", () => {
            selectedProduct = null;
            card.remove();
            if (replyProductButton) replyProductButton.disabled = false;
        });
        replyEditor.parentElement?.appendChild(card);
    }

    function placeCaretAtEnd(element) {
        const selection = window.getSelection();
        if (!selection) return;
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    if (keyword) {
        loadTab("popular", true);
    }
};