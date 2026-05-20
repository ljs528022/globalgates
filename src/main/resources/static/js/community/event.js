window.onload = () => {
    // 공용 답글 모달 + 작성 모달 활성화 (community 목록 페이지 — 일반 게시물 처리).
    postModalApi.bootstrap({
        services: CommunityService,
        layout: CommunityLayout,
        getMemberId: () => document.querySelector("[data-member-id]")?.dataset.memberId,
        onReplySubmitSuccess: ({ button }) => {
            const cnt = button?.querySelector(".tweet-action-count");
            if (cnt) {
                const next = (Number.parseInt(cnt.textContent || "0", 10) || 0) + 1;
                cnt.textContent = String(next);
                button.setAttribute("aria-label", `답글 ${next}`);
            }
        },
    });

    // ===== 카테고리 스크롤 (탐색 탭) =====
    const scrollEl = document.getElementById("categoryScroll");
    const btnLeft  = document.getElementById("scrollLeft");
    const btnRight = document.getElementById("scrollRight");
    const initialMarkup = scrollEl?.innerHTML ?? "";

    const syncArrows = () => {
        if (!scrollEl || !btnLeft || !btnRight) return;
        btnLeft.style.display  = scrollEl.scrollLeft > 0 ? "flex" : "none";
        btnRight.style.display = scrollEl.scrollLeft < scrollEl.scrollWidth - scrollEl.clientWidth - 1 ? "flex" : "none";
    };

    const restoreCategories = () => {
        if (!scrollEl) return;
        scrollEl.innerHTML = initialMarkup;
        scrollEl.scrollLeft = 0;
        setTimeout(syncArrows, 30);
    };

    const renderSubCategories = (label, subs, subIds) => {
        if (!scrollEl) return;
        const ids = (subIds ?? "").split(",");
        scrollEl.innerHTML =
            `<button class="cat-back-btn" type="button" aria-label="대카테고리로 돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"></path></svg></button>` +
            `<button class="cat-chip parent-highlight" type="button">${label}</button>` +
            subs.map((s, i) => `<button class="cat-chip" type="button" data-cat="${s}" data-category-id="${ids[i] ?? ''}" data-is-sub="true">${s}</button>`).join("");
        scrollEl.scrollLeft = 0;
        setTimeout(syncArrows, 30);
    };

    const setActiveChip = (chip) => {
        scrollEl?.querySelectorAll(".cat-chip:not(.parent-highlight)").forEach(c => c.classList.remove("active", "sub-active"));
        chip.classList.add(chip.dataset.isSub ? "sub-active" : "active");
    };

    document.querySelector('.communityTopbar .communityIconButton[aria-label="뒤로 가기"]')?.addEventListener("click", () => window.history.back());

    // ===== 새 커뮤니티 만들기 모달 =====
    const createCommunityModal   = document.querySelector("[data-create-community-modal]");
    const communityNameInput     = createCommunityModal?.querySelector("[data-community-name]");
    const communityNameCount     = createCommunityModal?.querySelector("[data-community-name-count]");
    const communitySubmitBtn     = createCommunityModal?.querySelector("[data-community-submit]");

    function openCreateCommunityModal() {
        if (!createCommunityModal) return;
        createCommunityModal.hidden = false;
        document.body.classList.add("modal-open");
        communityNameInput?.focus();
    }

    function closeCreateCommunityModal() {
        if (!createCommunityModal) return;
        createCommunityModal.hidden = true;
        document.body.classList.remove("modal-open");
        if (communityNameInput) communityNameInput.value = "";
        if (communityNameCount) communityNameCount.textContent = "0";
        if (communitySubmitBtn) communitySubmitBtn.disabled = true;
        const tagsResetEl = createCommunityModal.querySelector("[data-community-tags]");
        if (tagsResetEl) tagsResetEl.value = "";
        const descResetEl = createCommunityModal.querySelector("[data-community-description]");
        if (descResetEl) descResetEl.value = "";
        const categoryResetEl = createCommunityModal.querySelector("[data-community-category]");
        if (categoryResetEl) categoryResetEl.value = "";
        createCommunityModal.querySelector("input[name='communityType']")?.click();
    }

    communityNameInput?.addEventListener("input", () => {
        const val = communityNameInput.value;
        if (communityNameCount) communityNameCount.textContent = val.length;
        if (communitySubmitBtn) communitySubmitBtn.disabled = val.length < 3 || /[#@]/.test(val);
    });

    createCommunityModal?.addEventListener("click", (e) => {
        if (e.target.closest("[data-community-close]")) { closeCreateCommunityModal(); return; }
        if (e.target.closest("[data-community-submit]") && !communitySubmitBtn?.disabled) { closeCreateCommunityModal(); }
    });

    document.querySelector("[data-create-community-btn]")?.addEventListener("click", openCreateCommunityModal);

    scrollEl?.addEventListener("click", (e) => {
        const chip = e.target.closest(".cat-chip");
        if (!chip) return;
        setActiveChip(chip);
        const catId = chip.dataset.categoryId;
        state.exploreTab = { page: 1, isLoading: false, hasMore: true, categoryId: catId || null };
        if (exploreFeedSection) exploreFeedSection.innerHTML = "";
        setupInfiniteScroll(exploreFeedSection, loadExploreFeed, state.exploreTab);
        loadExploreFeed();
    });
    scrollEl?.addEventListener("scroll", syncArrows, { passive: true });
    btnLeft?.addEventListener("click",  () => scrollEl?.scrollBy({ left: -220, behavior: "smooth" }));
    btnRight?.addEventListener("click", () => scrollEl?.scrollBy({ left:  220, behavior: "smooth" }));
    window.addEventListener("resize", syncArrows);
    syncArrows();

    // ===== 상태 관리 =====
    const state = {
        homeTab: { page: 1, isLoading: false, hasMore: true },
        homeFeed: { page: 1, isLoading: false, hasMore: true },
        exploreTab: { page: 1, isLoading: false, hasMore: true },
        activeTab: "home",
    };

    // ===== DOM 요소 =====
    const communityRail = document.querySelector(".communityRail");
    const homeFeedSection = document.querySelector(".communityFeedSection--home");
    const exploreFeedSection = document.querySelector(".communityFeedSection--explore");
    const homeTabInput = document.getElementById("communityTabHome");
    const exploreTabInput = document.getElementById("communityTabExplore");

    // ===== 커뮤니티 목록 가로 스크롤 화살표 =====
    const railLeft = document.getElementById("railScrollLeft");
    const railRight = document.getElementById("railScrollRight");
    const syncRailArrows = () => {
        if (!communityRail || !railLeft || !railRight) return;
        railLeft.style.display = communityRail.scrollLeft > 0 ? "flex" : "none";
        railRight.style.display = communityRail.scrollLeft < communityRail.scrollWidth - communityRail.clientWidth - 1 ? "flex" : "none";
    };
    communityRail?.addEventListener("scroll", syncRailArrows, { passive: true });
    railLeft?.addEventListener("click", () => communityRail?.scrollBy({ left: -220, behavior: "smooth" }));
    railRight?.addEventListener("click", () => communityRail?.scrollBy({ left: 220, behavior: "smooth" }));
    window.addEventListener("resize", syncRailArrows);

    // ===== 탐색 커뮤니티 레일 (가로 스크롤) =====
    const exploreRail = document.querySelector(".communityRail--explore");
    const exploreRailLeft = document.getElementById("exploreRailLeft");
    const exploreRailRight = document.getElementById("exploreRailRight");
    const syncExploreRailArrows = () => {
        if (!exploreRail || !exploreRailLeft || !exploreRailRight) return;
        exploreRailLeft.style.display = exploreRail.scrollLeft > 0 ? "flex" : "none";
        exploreRailRight.style.display = exploreRail.scrollLeft < exploreRail.scrollWidth - exploreRail.clientWidth - 1 ? "flex" : "none";
    };
    exploreRail?.addEventListener("scroll", syncExploreRailArrows, { passive: true });
    exploreRailLeft?.addEventListener("click", () => exploreRail?.scrollBy({ left: -220, behavior: "smooth" }));
    exploreRailRight?.addEventListener("click", () => exploreRail?.scrollBy({ left: 220, behavior: "smooth" }));

    async function loadExploreCommunities() {
        try {
            const data = await CommunityService.getList(1);
            if (exploreRail && data.communities.length > 0) {
                exploreRail.innerHTML = data.communities.map(c => CommunityLayout.renderCommunityCard(c)).join("");
                setTimeout(syncExploreRailArrows, 50);
            }
        } catch (err) { console.error("탐색 커뮤니티 로드 실패:", err); }
    }

    // ===== 무한 스크롤 (IntersectionObserver) =====
    const _observerMap = new Map();
    function setupInfiniteScroll(container, loadFn, tabState) {
        // 이전 observer 정리
        const prev = _observerMap.get(container);
        if (prev) { prev.observer.disconnect(); prev.sentinel?.remove(); }

        const sentinel = document.createElement("div");
        sentinel.className = "scrollSentinel";
        container.appendChild(sentinel);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !tabState.isLoading && tabState.hasMore) {
                    loadFn();
                }
            });
        }, { threshold: 0.1 });

        observer.observe(sentinel);
        _observerMap.set(container, { sentinel, observer });
        return { sentinel, observer };
    }

    // ===== 홈 탭: 내 커뮤니티 카드 로드 =====
    async function loadHomeCommunities() {
        const s = state.homeTab;
        if (s.isLoading || !s.hasMore) return;
        s.isLoading = true;
        try {
            const data = await CommunityService.getMyList(s.page);
            if (communityRail) {
                const html = data.communities.map(c => CommunityLayout.renderCommunityCard(c)).join("");
                if (s.page === 1) {
                    communityRail.innerHTML = html;
                } else {
                    communityRail.insertAdjacentHTML("beforeend", html);
                }
            }
            if (data.communities.length === 0 && s.page === 1 && communityRail) {
                communityRail.innerHTML = CommunityLayout.renderEmptyState("가입한 커뮤니티가 없습니다.");
            }
            s.hasMore = data.criteria?.hasMore ?? false;
            s.page++;
        } catch (error) { console.error("홈 커뮤니티 로드 실패:", error); }
        finally { s.isLoading = false; setTimeout(syncRailArrows, 50); }
    }

    // ===== 홈 피드: 내가 속한 커뮤니티의 모든 멤버 게시글 =====
    async function loadHomeFeed() {
        const s = state.homeFeed;
        if (s.isLoading || !s.hasMore) return;
        s.isLoading = true;
        if (s.page === 1) homeFeedSection?.classList.add("is-loading");
        try {
            const data = await CommunityService.getHomeFeed(s.page);
            const sentinel = homeFeedSection?.querySelector(".scrollSentinel");
            const html = data.posts.map(p => CommunityLayout.renderCommunityPostCard(p)).join("");
            if (sentinel) sentinel.insertAdjacentHTML("beforebegin", html);
            else if (homeFeedSection) homeFeedSection.innerHTML += html;
            if (data.posts.length === 0 && s.page === 1) {
                if (homeFeedSection) {
                    homeFeedSection.innerHTML = CommunityLayout.renderEmptyState("가입한 커뮤니티에 게시글이 없습니다.");
                    setupInfiniteScroll(homeFeedSection, loadHomeFeed, state.homeFeed);
                }
            }
            s.hasMore = data.criteria?.hasMore ?? false;
            s.page++;
        } catch (error) { console.error("홈 피드 로드 실패:", error); }
        finally { s.isLoading = false; homeFeedSection?.classList.remove("is-loading"); }
    }

    // ===== 탐색 피드: 미가입 커뮤니티 관리자 게시글 =====
    async function loadExploreFeed() {
        const s = state.exploreTab;
        if (s.isLoading || !s.hasMore) return;
        s.isLoading = true;
        if (s.page === 1) exploreFeedSection?.classList.add("is-loading");
        try {
            const data = await CommunityService.getExploreFeed(s.page, s.categoryId || null);
            const sentinel = exploreFeedSection?.querySelector(".scrollSentinel");
            const html = data.posts.map(p => CommunityLayout.renderCommunityPostCard(p)).join("");
            if (sentinel) sentinel.insertAdjacentHTML("beforebegin", html);
            else if (exploreFeedSection) exploreFeedSection.innerHTML += html;
            if (data.posts.length === 0 && s.page === 1) {
                if (exploreFeedSection) {
                    exploreFeedSection.innerHTML = CommunityLayout.renderEmptyState("탐색할 게시글이 없습니다.");
                    setupInfiniteScroll(exploreFeedSection, loadExploreFeed, state.exploreTab);
                }
            }
            s.hasMore = data.criteria?.hasMore ?? false;
            s.page++;
        } catch (error) { console.error("탐색 피드 로드 실패:", error); }
        finally { s.isLoading = false; exploreFeedSection?.classList.remove("is-loading"); }
    }

    // ===== 탭 전환 이벤트 =====
    homeTabInput?.addEventListener("change", () => {
        state.activeTab = "home";
        if (state.homeTab.page === 1) loadHomeCommunities();
        if (state.homeFeed.page === 1) loadHomeFeed();
    });

    exploreTabInput?.addEventListener("change", () => {
        state.activeTab = "explore";
        if (!exploreRail?.children.length) loadExploreCommunities();
        if (state.exploreTab.page === 1) loadExploreFeed();
    });

    // ===== 커뮤니티 카드/리스트 클릭 → 상세 페이지 이동 (버튼 제외) =====
    document.addEventListener("click", (e) => {
        if (e.target.closest("button") || e.target.closest(".tweet-action-btn") || e.target.closest(".postMoreButton")) return;
        // 커뮤니티 카드(게시글이 아닌)만 상세 이동
        const communityCard = e.target.closest(".communityCard, .communityListItem");
        if (communityCard) {
            location.href = `/community/${communityCard.dataset.communityId}`;
            return;
        }
        // 게시글 카드 클릭 → 게시글 상세
        const postCard = e.target.closest(".postCard[data-post-id]");
        if (postCard) {
            const memberId = document.querySelector("[data-member-id]")?.dataset.memberId;
            location.href = `/main/post/detail/${postCard.dataset.postId}?memberId=${memberId}`;
        }
    });

    // ===== 커뮤니티 생성 모달 submit API 연동 =====
    const communitySubmitBtnEl = document.querySelector("[data-community-submit]");
    communitySubmitBtnEl?.addEventListener("click", async () => {
        if (communitySubmitBtnEl.disabled) return;
        const formData = new FormData();
        const nameInput = document.querySelector("[data-community-name]");
        const descInput = document.querySelector("[data-community-description]");
        const categoryInput = document.querySelector("[data-community-category]");
        const coverInput = document.querySelector("[data-cover-file]");

        const tagsInput = document.querySelector("[data-community-tags]");

        formData.append("communityName", nameInput?.value ?? "");
        formData.append("description", descInput?.value ?? "");
        if (categoryInput?.value) formData.append("categoryId", categoryInput.value);
        // 공백만 입력된 케이스 ("   ") 는 의미 없는 데이터이므로 전송 자체를 생략.
        // 서버 DTO setter 도 같은 정규화를 하지만 네트워크 비용도 절약.
        const tagsValue = tagsInput?.value?.trim();
        if (tagsValue) formData.append("tags", tagsValue);
        if (coverInput?.files[0]) formData.append("coverImage", coverInput.files[0]);

        try {
            await CommunityService.create(formData);
            closeCreateCommunityModal();
            state.homeTab = { page: 1, isLoading: false, hasMore: true };
            state.exploreTab = { page: 1, isLoading: false, hasMore: true, categoryId: state.exploreTab.categoryId };
            if (communityRail) communityRail.innerHTML = "";
            if (exploreFeedSection) exploreFeedSection.innerHTML = "";
            loadHomeCommunities();
            setupInfiniteScroll(exploreFeedSection, loadExploreFeed, state.exploreTab);
        } catch (err) {
            console.error("커뮤니티 생성 실패:", err);
        }
    });

    // ===== 커버 이미지 미리보기 =====
    const coverUpload = document.querySelector("[data-cover-upload]");
    const coverFile = document.querySelector("[data-cover-file]");
    const coverPreview = document.querySelector("[data-cover-preview]");
    coverFile?.addEventListener("change", () => {
        const file = coverFile.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (coverPreview) {
                    coverPreview.src = e.target.result;
                    coverPreview.hidden = false;
                }
                const uploadText = coverUpload?.querySelector(".communityModal__coverUploadText");
                if (uploadText) uploadText.hidden = true;
            };
            reader.readAsDataURL(file);
        }
    });

    // ===== 커뮤니티 검색 (메인 스타일 인라인 드롭다운) =====
    const searchForm = document.getElementById("communitySearchForm");
    const searchInput = document.getElementById("communitySearchInput");
    const searchPanel = document.getElementById("communitySearchPanel");
    const searchPanelEmpty = document.getElementById("communitySearchPanelEmpty");
    const searchResults = document.getElementById("communitySearchResults");

    let searchTimer = null;

    searchInput?.addEventListener("focus", () => {
        searchForm?.classList.add("isFocused");
        searchPanel?.classList.remove("off");
        if (!searchInput.value.trim()) {
            if (searchPanelEmpty) searchPanelEmpty.hidden = false;
            if (searchResults) searchResults.innerHTML = "";
        }
    });

    searchInput?.addEventListener("input", () => {
        const keyword = searchInput.value.trim();
        if (keyword.length > 0) {
            if (searchPanelEmpty) searchPanelEmpty.hidden = true;
            clearTimeout(searchTimer);
            searchTimer = setTimeout(async () => {
                try {
                    const data = await CommunityService.search(keyword, 1);
                    if (!searchResults) return;
                    if (data.communities.length === 0) {
                        searchResults.innerHTML = CommunityLayout.renderEmptyState(`"${keyword}" 검색 결과가 없습니다.`);
                    } else {
                        searchResults.innerHTML = data.communities.map(c => CommunityLayout.renderCommunityListItem(c)).join("");
                    }
                } catch (err) { console.error("검색 실패:", err); }
            }, 300);
        } else {
            if (searchPanelEmpty) searchPanelEmpty.hidden = false;
            if (searchResults) searchResults.innerHTML = "";
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".communitySearchForm")) {
            searchPanel?.classList.add("off");
            searchForm?.classList.remove("isFocused");
        }
    });

    // ===== 초기 로드 =====
    function reloadAllData() {
        state.homeTab = { page: 1, isLoading: false, hasMore: true };
        state.homeFeed = { page: 1, isLoading: false, hasMore: true };
        state.exploreTab = { page: 1, isLoading: false, hasMore: true, categoryId: state.exploreTab.categoryId };

        if (communityRail) communityRail.innerHTML = "";
        loadHomeCommunities();

        if (homeFeedSection) {
            homeFeedSection.querySelectorAll(".postCard").forEach(el => el.remove());
            setupInfiniteScroll(homeFeedSection, loadHomeFeed, state.homeFeed);
            loadHomeFeed();
        }

        if (exploreRail) exploreRail.innerHTML = "";
        loadExploreCommunities();

        if (exploreFeedSection) {
            exploreFeedSection.querySelectorAll(".postCard, .communityEmpty").forEach(el => el.remove());
            setupInfiniteScroll(exploreFeedSection, loadExploreFeed, state.exploreTab);
            loadExploreFeed();
        }
    }

    // bfcache 복원 시 데이터 재로드 (뒤로가기 후 목록 사라지는 버그 수정)
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            console.log("[community] bfcache 복원 감지 → 데이터 재로드");
            reloadAllData();
        }
    });

    loadHomeCommunities();
    if (homeFeedSection) {
        setupInfiniteScroll(homeFeedSection, loadHomeFeed, state.homeFeed);
        loadHomeFeed();
    }
    if (exploreFeedSection) {
        setupInfiniteScroll(exploreFeedSection, loadExploreFeed, state.exploreTab);
    }
    loadExploreCommunities();

    // ===== Toast =====
    const showToast = (msg) => {
        const el = Object.assign(document.createElement("div"), { className: "postToast", textContent: msg });
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2200);
    };

    let activeMoreButton = null, activeMoreDropdown = null;
    let activeShareButton = null, activeShareDropdown = null;
    let activeShareModal = null, activeShareToast = null;
    let activeCommunityModal = null, activeCommunityToast = null;
    const layersRoot = document.getElementById("layers");
    const communityFollowState = new Map();
    const communityReportReasons = [
        "다른 회사 제품 도용 신고",
        "실제 존재하지 않는 제품 등록 신고",
        "스펙·원산지 허위 표기 신고",
        "특허 제품 무단 판매 신고",
        "수출입 제한 품목 신고",
        "반복적인 동일 게시물 신고",
    ];


    // ===== Utils =====
    function getTextContent(el) { return el?.textContent.trim() ?? ""; }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
    }

    // ===== Global document events =====
    document.addEventListener("click", (e) => {

        // 좋아요
        const likeBtn = e.target.closest(".tweet-action-btn--like");
        if (likeBtn && !likeBtn.closest("[data-reply-modal]")) {
            e.stopPropagation();
            if (likeBtn.dataset.inFlight === "1") return;
            likeBtn.dataset.inFlight = "1";
            const LIKE_ON = "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
            const LIKE_OFF = "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
            const on = likeBtn.classList.toggle("active");
            const cnt = likeBtn.querySelector(".tweet-action-count");
            const prevCount = cnt?.textContent?.trim();
            if (cnt && /^\d+$/.test(prevCount)) cnt.textContent = Math.max(0, parseInt(prevCount, 10) + (on ? 1 : -1));
            const likePath = likeBtn.querySelector("path");
            if (likePath) likePath.setAttribute("d", on ? LIKE_ON : LIKE_OFF);
            const postId = likeBtn.dataset.postId;
            const loginMemberId = document.querySelector("[data-member-id]")?.dataset.memberId;
            const rollback = () => {
                likeBtn.classList.toggle("active", !on);
                if (likePath) likePath.setAttribute("d", !on ? LIKE_ON : LIKE_OFF);
                if (cnt && prevCount != null) cnt.textContent = prevCount;
            };
            const finish = () => { delete likeBtn.dataset.inFlight; };
            if (postId && loginMemberId) {
                const req = on
                    ? fetch("/api/main/likes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: loginMemberId, postId }) })
                    : fetch(`/api/main/likes/posts/${postId}/delete`, { method: "POST" });
                req.then(r => { if (!r.ok) { rollback(); showCommunityToast("요청을 처리하지 못했습니다. 다시 시도해 주세요."); console.error("like API failed", r.status); } })
                   .catch(err => { rollback(); showCommunityToast("요청을 처리하지 못했습니다. 다시 시도해 주세요."); console.error(err); })
                   .finally(finish);
            } else { finish(); }
            return;
        }

        // 북마크
        const bookmarkBtn = e.target.closest(".tweet-action-btn--bookmark");
        if (bookmarkBtn && !bookmarkBtn.closest("[data-reply-modal]")) {
            e.stopPropagation();
            if (bookmarkBtn.dataset.inFlight === "1") return;
            bookmarkBtn.dataset.inFlight = "1";
            const BK_ON = "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z";
            const BK_OFF = "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z";
            const on = bookmarkBtn.classList.toggle("active");
            const bkPath = bookmarkBtn.querySelector("path");
            if (bkPath) bkPath.setAttribute("d", on ? BK_ON : BK_OFF);
            const postId = bookmarkBtn.dataset.postId;
            const loginMemberId = document.querySelector("[data-member-id]")?.dataset.memberId;
            const rollback = () => {
                bookmarkBtn.classList.toggle("active", !on);
                if (bkPath) bkPath.setAttribute("d", !on ? BK_ON : BK_OFF);
            };
            const finish = () => { delete bookmarkBtn.dataset.inFlight; };
            if (postId && loginMemberId) {
                const req = on
                    ? fetch("/api/main/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: loginMemberId, postId }) })
                    : fetch(`/api/main/bookmarks/members/${loginMemberId}/posts/${postId}/delete`, { method: "POST" });
                req.then(r => { if (!r.ok) { rollback(); showCommunityToast("요청을 처리하지 못했습니다. 다시 시도해 주세요."); console.error("bookmark API failed", r.status); } })
                   .catch(err => { rollback(); showCommunityToast("요청을 처리하지 못했습니다. 다시 시도해 주세요."); console.error(err); })
                   .finally(finish);
            } else { finish(); }
            return;
        }

        // 공유
        const shareBtn = e.target.closest(".tweet-action-btn--share");
        if (shareBtn && !shareBtn.closest("[data-reply-modal]")) {
            e.stopPropagation();
            activeShareButton === shareBtn ? closeShareDropdown() : openShareDropdown(shareBtn);
            return;
        }

        // 더보기
        const moreBtn = e.target.closest(".postMoreButton");
        if (moreBtn) {
            e.stopPropagation();
            activeMoreButton === moreBtn ? closeMoreDropdown() : openMoreDropdown(moreBtn);
            return;
        }

        if (!e.target.closest(".layers-dropdown-container")) { closeShareDropdown(); closeMoreDropdown(); }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { closeShareDropdown(); closeMoreDropdown(); closeCommunityModal(); closeShareModal(); closeCreateCommunityModal(); }
    });

    // ===== 공유 드롭다운 =====
    function closeShareDropdown() {
        if (!activeShareDropdown) return;
        activeShareDropdown.remove(); activeShareDropdown = null;
        if (activeShareButton) { activeShareButton.setAttribute("aria-expanded", "false"); activeShareButton = null; }
    }

    function getSharePostMeta(button) {
        const card = button.closest(".communityPostCard");
        const handle = getTextContent(card?.querySelector(".postHandle")) || "@user";
        const bk = card?.querySelector(".tweet-action-btn--bookmark") ?? null;
        const postId = card?.dataset.postId ?? "0";
        const loginMemberId = document.querySelector("[data-member-id]")?.dataset.memberId ?? "";
        const permalink = `${window.location.origin}/main/post/detail/${postId}?memberId=${loginMemberId}`;
        return { handle, permalink, bookmarkButton: bk };
    }

    function showShareToast(message) {
        activeShareToast?.remove();
        const toast = document.createElement("div");
        toast.className = "share-toast"; toast.setAttribute("role", "status"); toast.textContent = message;
        document.body.appendChild(toast); activeShareToast = toast;
        window.setTimeout(() => { if (activeShareToast === toast) activeShareToast = null; toast.remove(); }, 3000);
    }

    function closeShareModal() {
        if (!activeShareModal) return;
        activeShareModal.remove(); activeShareModal = null;
        document.body.classList.remove("modal-open");
    }

    function setBookmarkButtonState(button, isActive) {
        const path = button?.querySelector("path"); if (!button || !path) return;
        button.classList.toggle("active", isActive);
        button.setAttribute("data-testid", isActive ? "removeBookmark" : "bookmark");
        button.setAttribute("aria-label", isActive ? "북마크에 추가됨" : "북마크");
        // renderCommunityPostCard SVG에는 data-path-active/-inactive 속성이 없으므로 BK 상수로 직접 swap
        const activeD = path.dataset.pathActive ?? "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z";
        const inactiveD = path.dataset.pathInactive ?? "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z";
        path.setAttribute("d", isActive ? activeD : inactiveD);
    }

    function openShareBookmarkModal(button) {
        const { bookmarkButton } = getSharePostMeta(button);
        closeShareDropdown(); closeShareModal();
        const isBookmarked = bookmarkButton?.classList.contains("active") ?? false;
        const modal = document.createElement("div");
        modal.className = "share-sheet";
        modal.innerHTML = `<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card share-sheet__card--bookmark" role="dialog" aria-modal="true" aria-labelledby="share-bookmark-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button><h2 id="share-bookmark-title" class="share-sheet__title">폴더에 추가</h2><span class="share-sheet__header-spacer"></span></div><button type="button" class="share-sheet__create-folder">새 북마크 폴더 만들기</button><button type="button" class="share-sheet__folder" data-share-folder="all-bookmarks"><span class="share-sheet__folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"></path></g></svg></span><span class="share-sheet__folder-name">모든 북마크</span><span class="share-sheet__folder-check${isBookmarked ? " share-sheet__folder-check--active" : ""}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg></span></button></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.closest("[data-share-close='true']") || e.target.classList.contains("share-sheet__backdrop")) { e.preventDefault(); closeShareModal(); return; }
            if (e.target.closest(".share-sheet__create-folder")) { e.preventDefault(); showShareToast("새 폴더 만들기는 준비 중입니다"); closeShareModal(); return; }
            if (e.target.closest("[data-share-folder='all-bookmarks']")) {
                e.preventDefault();
                const nextActive = !isBookmarked;
                setBookmarkButtonState(bookmarkButton, nextActive);
                // bookmarkCount는 같은 카드의 .tweet-action-btn--views 카운터에 있음
                const countButton = bookmarkButton?.closest(".tweet-action-bar")?.querySelector(".tweet-action-btn--views");
                const cnt = countButton?.querySelector(".tweet-action-count");
                const prevCountText = cnt?.textContent?.trim();
                const prevAriaLabel = countButton?.getAttribute("aria-label");
                if (cnt && /^\d+$/.test(prevCountText)) {
                    const nextCount = Math.max(0, parseInt(prevCountText, 10) + (nextActive ? 1 : -1));
                    cnt.textContent = nextCount;
                    countButton?.setAttribute("aria-label", `북마크 ${nextCount}`);
                }
                const postId = bookmarkButton?.dataset.postId;
                const loginMemberId = document.querySelector("[data-member-id]")?.dataset.memberId;
                const rollbackShareBookmark = () => {
                    setBookmarkButtonState(bookmarkButton, isBookmarked);
                    if (cnt && prevCountText != null) cnt.textContent = prevCountText;
                    if (countButton && prevAriaLabel != null) countButton.setAttribute("aria-label", prevAriaLabel);
                };
                if (postId && loginMemberId) {
                    const req = nextActive
                        ? fetch("/api/main/bookmarks", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ memberId:loginMemberId, postId }) })
                        : fetch(`/api/main/bookmarks/members/${loginMemberId}/posts/${postId}/delete`, { method:"POST" });
                    req.then(r => { if (!r.ok) { rollbackShareBookmark(); showShareToast("요청을 처리하지 못했습니다. 다시 시도해 주세요."); console.error("share-bookmark API failed", r.status); } })
                       .catch(err => { rollbackShareBookmark(); showShareToast("요청을 처리하지 못했습니다. 다시 시도해 주세요."); console.error(err); });
                }
                showShareToast(isBookmarked ? "북마크가 해제되었습니다" : "북마크에 추가되었습니다");
                closeShareModal();
            }
        });
        document.body.appendChild(modal); document.body.classList.add("modal-open"); activeShareModal = modal;
    }

    function copyShareLink(button) {
        const { permalink } = getSharePostMeta(button);
        closeShareDropdown();
        if (!navigator.clipboard?.writeText) { showShareToast("링크를 복사하지 못했습니다"); return; }
        navigator.clipboard.writeText(permalink).then(() => showShareToast("클립보드로 복사함")).catch(() => showShareToast("링크를 복사하지 못했습니다"));
    }

    function openShareDropdown(button) {
        if (!layersRoot) return;
        closeShareDropdown(); closeMoreDropdown();
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const right = Math.max(16, window.innerWidth - rect.right);
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top:${top}px;right:${right}px;"><div class="dropdown-inner"><button type="button" role="menuitem" class="menu-item share-menu-item--copy"><span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></g></svg></span><span class="menu-item__label">링크 복사하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item--bookmark"><span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18 3V0h2v3h3v2h-3v3h-2V5h-3V3zm-7.5 1a.5.5 0 00-.5.5V7h3.5A2.5 2.5 0 0116 9.5v3.48l3 2.1V11h2v7.92l-5-3.5v7.26l-6.5-3.54L3 22.68V9.5A2.5 2.5 0 015.5 7H8V4.5A2.5 2.5 0 0110.5 2H12v2zm-5 5a.5.5 0 00-.5.5v9.82l4.5-2.46 4.5 2.46V9.5a.5.5 0 00-.5-.5z"></path></g></svg></span><span class="menu-item__label">폴더에 북마크 추가하기</span></button></div></div></div>`;
        lc.addEventListener("click", (e) => {
            const item = e.target.closest(".menu-item");
            if (!item) { e.stopPropagation(); return; }
            e.preventDefault(); e.stopPropagation();
            if (item.classList.contains("share-menu-item--copy")) { copyShareLink(activeShareButton ?? button); return; }
            if (item.classList.contains("share-menu-item--bookmark")) { openShareBookmarkModal(activeShareButton ?? button); return; }
            closeShareDropdown();
        });
        layersRoot.appendChild(lc);
        activeShareDropdown = lc; activeShareButton = button;
        button.setAttribute("aria-expanded", "true");
    }

    // ===== 더보기 드롭다운 =====
    function closeMoreDropdown() {
        if (!activeMoreDropdown) return;
        activeMoreDropdown.remove(); activeMoreDropdown = null;
        if (activeMoreButton) { activeMoreButton.setAttribute("aria-expanded", "false"); activeMoreButton = null; }
    }

    function getCommunityUserMeta(button) {
        const card = button.closest(".communityPostCard");
        const handle = getTextContent(card?.querySelector(".postHandle")) || "@user";
        const displayName = getTextContent(card?.querySelector(".postName")) || "사용자";
        return { card, handle, displayName };
    }

    function showCommunityToast(message) {
        activeCommunityToast?.remove();
        const toast = document.createElement("div");
        toast.className = "notification-toast"; toast.setAttribute("role", "status"); toast.textContent = message;
        document.body.appendChild(toast); activeCommunityToast = toast;
        window.setTimeout(() => { if (activeCommunityToast === toast) activeCommunityToast = null; toast.remove(); }, 3000);
    }

    function closeCommunityModal() {
        if (!activeCommunityModal) return;
        activeCommunityModal.remove(); activeCommunityModal = null;
        document.body.classList.remove("modal-open");
    }

    function openCommunityBlockModal(button) {
        const { card, handle } = getCommunityUserMeta(button);
        const targetMemberId = card?.dataset.memberId;
        const loginMemberId = document.querySelector("[data-member-id]")?.dataset.memberId;
        closeMoreDropdown(); closeCommunityModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--block";
        modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--small" role="alertdialog" aria-modal="true" aria-labelledby="community-block-title" aria-describedby="community-block-desc"><h2 id="community-block-title" class="notification-dialog__title">${escapeHtml(handle)} 님을 차단할까요?</h2><p id="community-block-desc" class="notification-dialog__description">내 공개 게시물을 볼 수 있지만 더 이상 게시물에 참여할 수 없습니다. 또한 ${escapeHtml(handle)} 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.</p><div class="notification-dialog__actions"><button type="button" class="notification-dialog__danger notification-dialog__confirm-block">차단</button><button type="button" class="notification-dialog__secondary notification-dialog__close">취소</button></div></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) { e.preventDefault(); closeCommunityModal(); return; }
            if (e.target.closest(".notification-dialog__confirm-block")) {
                e.preventDefault();
                if (loginMemberId && targetMemberId) {
                    fetch('/api/main/blocks', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({blockerId:loginMemberId, blockedId:targetMemberId}) }).catch(err => console.error(err));
                    document.querySelectorAll(`.postCard[data-member-id="${targetMemberId}"]`).forEach(el => el.remove());
                }
                showCommunityToast(`${handle} 님을 차단했습니다`);
                closeCommunityModal();
            }
        });
        document.body.appendChild(modal); document.body.classList.add("modal-open"); activeCommunityModal = modal;
    }

    function openCommunityReportModal(button) {
        closeMoreDropdown(); closeCommunityModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--report";
        modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--report" role="dialog" aria-modal="true" aria-labelledby="community-report-title"><div class="notification-dialog__header"><button type="button" class="notification-dialog__icon-btn notification-dialog__close" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 id="community-report-title" class="notification-dialog__title">신고하기</h2></div><div class="notification-dialog__body"><p class="notification-dialog__question">이 게시물에 어떤 문제가 있나요?</p><ul class="notification-report__list">${communityReportReasons.map(r => `<li><button type="button" class="notification-report__item"><span>${escapeHtml(r)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.293 6.293 10.707 4.88 17.828 12l-7.121 7.12-1.414-1.413L14.999 12z"></path></g></svg></button></li>`).join("")}</ul></div></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) { e.preventDefault(); closeCommunityModal(); return; }
            const reportItem = e.target.closest(".notification-report__item");
            if (reportItem) {
                e.preventDefault();
                const reason = reportItem.querySelector("span")?.textContent ?? "";
                const reportCard = activeMoreButton?.closest(".communityPostCard");
                const reportPostId = reportCard?.dataset.postId;
                const loginMemberId = document.querySelector("[data-member-id]")?.dataset.memberId;
                if (reportPostId && loginMemberId) {
                    fetch("/api/main/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reporterId: loginMemberId, targetId: reportPostId, targetType: "post", reason }) })
                        .then(res => {
                            if (!res.ok) throw new Error(`report failed: ${res.status}`);
                            showCommunityToast("신고가 접수되었습니다");
                            closeCommunityModal();
                            if (reportCard) reportCard.remove();
                        })
                        .catch(err => {
                            console.error(err);
                            showCommunityToast("신고 접수에 실패했습니다");
                        });
                    return;
                }
                showCommunityToast("신고 접수에 실패했습니다");
            }
        });
        document.body.appendChild(modal); document.body.classList.add("modal-open"); activeCommunityModal = modal;
    }

    function handleMoreDropdownAction(button, actionClass) {
        const { card, handle } = getCommunityUserMeta(button);
        const targetMemberId = card?.dataset.memberId;
        const loginMemberId = document.querySelector("[data-member-id]")?.dataset.memberId;

        if (actionClass === "menu-item--delete") {
            const postId = card?.dataset.postId;
            if (postId && confirm("게시물을 삭제할까요?")) {
                fetch(`/api/main/posts/delete/${postId}`, { method: "POST" }).then(() => { card.remove(); showCommunityToast("게시물이 삭제되었습니다"); }).catch(err => console.error(err));
            }
            closeMoreDropdown();
            return;
        }
        if (actionClass === "menu-item--follow-toggle") {
            const isF = card?.dataset.isFollowed === "true";
            if (card) card.dataset.isFollowed = isF ? "false" : "true";
            closeMoreDropdown();
            if (loginMemberId && targetMemberId) {
                if (isF) fetch(`/api/main/follows/${loginMemberId}/${targetMemberId}/delete`, { method: "POST" }).catch(err => console.error(err));
                else fetch("/api/main/follows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ followerId: loginMemberId, followingId: targetMemberId }) }).catch(err => console.error(err));
            }
            showCommunityToast(isF ? `${handle} 님 팔로우를 취소했습니다` : `${handle} 님을 팔로우했습니다`);
            return;
        }
        if (actionClass === "menu-item--block") { openCommunityBlockModal(button); return; }
        if (actionClass === "menu-item--report") { openCommunityReportModal(button); }
    }

    function getMoreDropdownItems(button) {
        const { card, handle } = getCommunityUserMeta(button);
        const targetMemberId = card?.dataset.memberId;
        const loginMemberId = document.querySelector("[data-member-id]")?.dataset.memberId;
        const isOwner = targetMemberId && targetMemberId == loginMemberId;

        if (isOwner) {
            return [
                { actionClass: "menu-item--delete", label: "게시물 삭제하기", icon: '<svg viewBox="0 0 24 24"><g><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"></path></g></svg>' },
            ];
        }

        const isF = card?.dataset.isFollowed === "true";
        return [
            {
                actionClass: "menu-item--follow-toggle",
                label: isF ? `${handle} 님 언팔로우하기` : `${handle} 님 팔로우하기`,
                icon: isF
                    ? '<svg viewBox="0 0 24 24"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>'
                    : '<svg viewBox="0 0 24 24"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></g></svg>',
            },
            { actionClass: "menu-item--block", label: `${handle} 님 차단하기`, icon: '<svg viewBox="0 0 24 24"><g><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></g></svg>' },
            { actionClass: "menu-item--report", label: "게시물 신고하기", icon: '<svg viewBox="0 0 24 24"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg>' },
        ];
    }

    function openMoreDropdown(button) {
        if (!layersRoot) return;
        closeMoreDropdown(); closeShareDropdown();
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const right = Math.max(16, window.innerWidth - rect.right);
        const items = getMoreDropdownItems(button);
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top:${top}px;right:${right}px;"><div class="dropdown-inner" data-testid="Dropdown">${items.map(it => `<button type="button" role="menuitem" class="menu-item ${it.actionClass}"><span class="menu-item__icon">${it.icon}</span><span class="menu-item__label">${escapeHtml(it.label)}</span></button>`).join("")}</div></div></div>`;
        lc.addEventListener("click", (e) => {
            const item = e.target.closest(".menu-item");
            if (item) {
                e.preventDefault(); e.stopPropagation();
                const ac = Array.from(item.classList).find(c => c.startsWith("menu-item--")) ?? "";
                if (activeMoreButton) handleMoreDropdownAction(activeMoreButton, ac);
                return;
            }
            e.stopPropagation();
        });
        layersRoot.appendChild(lc);
        activeMoreDropdown = lc; activeMoreButton = button;
        button.setAttribute("aria-expanded", "true");
    }

};

// contenteditable에 공통으로 쓰는 커서 이동 유틸이다.
function placeCaretAtEnd(element) {
    const selection = window.getSelection(); if (!selection) return;
    const range = document.createRange(); range.selectNodeContents(element); range.collapse(false);
    selection.removeAllRanges(); selection.addRange(range);
}
