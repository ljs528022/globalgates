window.onload = () => {
    let memberId = null;

    // ── 1. 탭 전환 + 데이터 로드 + 무한스크롤 ──
    let activeTab = "feed";
    let postPage = 1;
    let postCheckScroll = true;
    let postHasMore = true;
    let expertPage = 1;
    let expertCheckScroll = true;
    let expertHasMore = true;
    let expertLoaded = false;

    const tabFeed = document.getElementById("tabFeed");
    const tabFriends = document.getElementById("tabFriends");
    const feedSection = document.getElementById("feedSection");
    const friendsSection = document.getElementById("friendsSection");

    tabFeed.addEventListener("click", (e) => {
        activeTab = "feed";
        tabFeed.classList.add("isActive");
        tabFriends.classList.remove("isActive");
        feedSection.classList.add("isActive");
        friendsSection.classList.remove("isActive");
    });

    tabFriends.addEventListener("click", async (e) => {
        activeTab = "expert";
        tabFriends.classList.add("isActive");
        tabFeed.classList.remove("isActive");
        friendsSection.classList.add("isActive");
        feedSection.classList.remove("isActive");

        if (!expertLoaded) {
            await service.getExpertList(expertPage, memberId, (data) => {
                layout.showExpertList(data.experts, expertPage);
                expertHasMore = data.criteria.hasMore;
            });
            expertLoaded = true;
        }
    });

    // 광고 데이터 준비 후 게시글 렌더링 (게시글 3개마다 광고 1개 삽입)
    const initFollowState = (posts) => {
        posts.forEach((post) => {
            const handle = post.memberHandle ? post.memberHandle : "";
            if (post.followed) {
                followState[handle] = true;
            }
        });
    };

    const loadFeed = async () => {
        const postData = await service.getPostList(postPage, memberId);
        const ads = await service.getAds(postPage, 3);
        const posts = layout.showPostList(postData.posts, ads, postPage);
        initFollowState(posts);
        postHasMore = postData.criteria.hasMore;
    };

    window.addEventListener("scroll", async (e) => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight < scrollHeight - 100) return;

        if (activeTab === "feed" && postCheckScroll && postHasMore) {
            postCheckScroll = false;
            postPage++;
            const postData = await service.getPostList(postPage, memberId);
            const ads = await service.getAds(postPage, 3);
            const posts = layout.showPostList(postData.posts, ads, postPage);
            initFollowState(posts);
            postHasMore = postData.criteria.hasMore;
            setTimeout(() => { postCheckScroll = true; }, 1000);
        }

        if (activeTab === "expert" && expertCheckScroll && expertHasMore) {
            expertCheckScroll = false;
            expertPage++;
            await service.getExpertList(expertPage, memberId, (data) => {
                layout.showExpertList(data.experts, expertPage);
                expertHasMore = data.criteria.hasMore;
            });
            setTimeout(() => { expertCheckScroll = true; }, 1000);
        }
    });

    // 게시물 상세에서 토글된 좋아요/북마크 상태를 목록 카드에 반영하기 위한 sessionStorage 동기화
    const POST_STATE_KEY = "postStateChanges";

    function readPostStateChanges() {
        try { return JSON.parse(sessionStorage.getItem(POST_STATE_KEY) || "{}"); }
        catch (e) { return {}; }
    }

    function savePostStateChange(postId, field, value) {
        if (!postId) return;
        const changes = readPostStateChanges();
        changes[postId] = changes[postId] || {};
        changes[postId][field] = value;
        sessionStorage.setItem(POST_STATE_KEY, JSON.stringify(changes));
    }

    function applyPostStateChanges() {
        const changes = readPostStateChanges();
        if (!changes || Object.keys(changes).length === 0) return;
        Object.keys(changes).forEach((postId) => {
            const card = document.querySelector(`.postCard[data-post-id="${postId}"]`);
            if (!card) return;
            const change = changes[postId] || {};

            if (Object.prototype.hasOwnProperty.call(change, "liked")) {
                const likeBtn = card.querySelector(".tweet-action-btn--like");
                if (likeBtn) {
                    const wasActive = likeBtn.classList.contains("active");
                    if (wasActive !== change.liked) {
                        const countSpan = likeBtn.querySelector(".tweet-action-count");
                        const cur = parseInt(countSpan?.textContent || "0") || 0;
                        if (countSpan) countSpan.textContent = String(Math.max(0, cur + (change.liked ? 1 : -1)));
                        likeBtn.classList.toggle("active", change.liked);
                        const p = likeBtn.querySelector("path");
                        if (p) {
                            const next = change.liked ? p.dataset.pathActive : p.dataset.pathInactive;
                            if (next) p.setAttribute("d", next);
                        }
                    }
                }
            }

            if (Object.prototype.hasOwnProperty.call(change, "bookmarked")) {
                const bkBtn = card.querySelector(".tweet-action-btn--bookmark");
                if (bkBtn) {
                    bkBtn.classList.toggle("active", change.bookmarked);
                    const p = bkBtn.querySelector("path");
                    if (p) {
                        const next = change.bookmarked ? p.dataset.pathActive : p.dataset.pathInactive;
                        if (next) p.setAttribute("d", next);
                    }
                }
            }
        });
    }

    // 피드 카드가 새로 그려진 뒤에 sessionStorage 변경분을 한번 더 입혀준다.
    const _origShowPostList = layout.showPostList;
    layout.showPostList = function (posts, ads, page) {
        const result = _origShowPostList(posts, ads, page);
        applyPostStateChanges();
        return result;
    };

    // bfcache 로 복원되어 showPostList 가 다시 호출되지 않을 때를 대비해 pageshow 에서도 한번 더 적용한다.
    window.addEventListener("pageshow", () => applyPostStateChanges());

    // 2. 게시물 버튼 이벤트 ──
    const mainShareDropdown = document.getElementById("mainShareDropdown");
    let activeMoreDropdown = null;
    let activeMoreButton = null;
    let activeMoreModal = null;
    let followState = {};
    const reportReasons = [
        "다른 회사 제품 도용 신고",
        "실제 존재하지 않는 제품 등록 신고",
        "스펙·원산지 허위 표기 신고",
        "특허 제품 무단 판매 신고",
        "수출입 제한 품목 신고",
        "반복적인 동일 게시물 신고"
    ];

    function getUserMetaFromButton(button) {
        const card = button.closest(".postCard");
        const handleEl = card ? card.querySelector(".postHandle") : null;
        const handle = handleEl ? (handleEl.textContent || "").trim() : "@user";
        return { handle: handle };
    }

    function getPostMemberIdFromButton(button) {
        const card = button.closest(".postCard");
        return card ? card.dataset.memberId : null;
    }

    function getPostIdFromButton(button) {
        const card = button.closest(".postCard");
        return card ? card.dataset.postId : null;
    }

    function closeAllMenus() {
        closePostMoreDropdown();
        mainShareDropdown.classList.add("off");
    }

    function showPostMoreToast(message) {
        const existing = document.querySelector(".notification-toast");
        if (existing) { existing.remove(); }
        const toast = document.createElement("div");
        toast.className = "notification-toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 3000);
    }

    function closePostMoreDropdown() {
        if (!activeMoreDropdown) { return; }
        activeMoreDropdown.remove();
        activeMoreDropdown = null;
        activeMoreButton = null;
    }

    function closePostMoreModal() {
        if (!activeMoreModal) { return; }
        activeMoreModal.remove();
        activeMoreModal = null;
        document.body.classList.remove("modal-open");
    }

    function openDeleteModal(button, postId) {
        closePostMoreDropdown();
        closePostMoreModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--delete";
        modal.innerHTML =
            '<div class="notification-dialog__backdrop"></div>' +
            '<div class="notification-dialog__card notification-dialog__card--small" role="alertdialog" aria-modal="true">' +
            '<h2 class="notification-dialog__title">게시물을 삭제할까요?</h2>' +
            '<p class="notification-dialog__description">삭제된 게시물은 복구할 수 없습니다.</p>' +
            '<div class="notification-dialog__actions">' +
            '<button type="button" class="notification-dialog__danger notification-dialog__confirm-delete">삭제</button>' +
            '<button type="button" class="notification-dialog__secondary notification-dialog__close">취소</button>' +
            '</div>' +
            '</div>';
        modal.addEventListener("click", async function (e) {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) {
                e.preventDefault();
                closePostMoreModal();
                return;
            }
            if (e.target.closest(".notification-dialog__confirm-delete")) {
                e.preventDefault();
                await service.deletePost(postId);
                const card = document.querySelector(`.postCard[data-post-id="${postId}"]`);
                if (card) card.remove();
                showPostMoreToast("게시물이 삭제되었습니다");
                closePostMoreModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeMoreModal = modal;
    }

    function openBlockModal(button) {
        const meta = getUserMetaFromButton(button);
        const handle = meta.handle;
        const targetMemberId = getPostMemberIdFromButton(button);
        closePostMoreDropdown();
        closePostMoreModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--block";
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
        modal.addEventListener("click", async function (e) {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) {
                e.preventDefault();
                closePostMoreModal();
                return;
            }
            if (e.target.closest(".notification-dialog__confirm-block")) {
                e.preventDefault();
                if (targetMemberId) {
                    await service.block(memberId, targetMemberId);
                    document.querySelectorAll(`.postCard[data-member-id="${targetMemberId}"]`).forEach(card => card.remove());
                    document.querySelectorAll(`.user-card[data-expert-id="${targetMemberId}"]`).forEach(card => card.remove());
                    document.querySelectorAll(`.suggestionItem .connect-btn-sm[data-member-id="${targetMemberId}"]`).forEach(btn => btn.closest(".suggestionItem").remove());
                }
                showPostMoreToast(handle + " 님을 차단했습니다");
                closePostMoreModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeMoreModal = modal;
    }

    function openReportModal(button) {
        const postId = getPostIdFromButton(button);
        closePostMoreDropdown();
        closePostMoreModal();
        let listHtml = "";
        for (let i = 0; i < reportReasons.length; i++) {
            listHtml +=
                '<li><button type="button" class="notification-report__item" data-reason="' + reportReasons[i] + '">' +
                '<span>' + reportReasons[i] + '</span>' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.293 6.293 10.707 4.88 17.828 12l-7.121 7.12-1.414-1.413L14.999 12z"></path></g></svg>' +
                '</button></li>';
        }
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--report";
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
        modal.addEventListener("click", async function (e) {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) {
                e.preventDefault();
                closePostMoreModal();
                return;
            }
            const reportItem = e.target.closest(".notification-report__item");
            if (reportItem) {
                e.preventDefault();
                if (postId) {
                    console.log("신고 접수 postId:", postId);
                    await service.report(memberId, postId, 'post', reportItem.dataset.reason);
                    // 신고된 카드 즉시 제거.
                    const card = document.querySelector(`.postCard[data-post-id="${postId}"]`);
                    if (card) { card.remove(); }
                }
                showPostMoreToast("신고가 접수되었습니다");
                closePostMoreModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeMoreModal = modal;
    }

    async function handleDropdownAction(button, actionClass) {
        const meta = getUserMetaFromButton(button);
        const handle = meta.handle;
        const targetMemberId = getPostMemberIdFromButton(button);

        if (actionClass === "menu-item--follow-toggle") {
            if (!targetMemberId) return;
            const isF = followState[handle] ? true : false;
            if (isF) {
                await service.unfollow(memberId, targetMemberId);
            } else {
                await service.follow(memberId, targetMemberId);
            }
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
            return;
        }
        if (actionClass === "menu-item--edit") {
            const postId = getPostIdFromButton(button);
            closePostMoreDropdown();
            postModalApi.openEdit(postId);
            return;
        }
        if (actionClass === "menu-item--delete") {
            const postId = getPostIdFromButton(button);
            openDeleteModal(button, postId);
            return;
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
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm13 4v3h2v-3h3V8h-3V5h-2v3h-3v2h3zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>';
        const followLabel = isF ? (handle + " 님 언팔로우하기") : (handle + " 님 팔로우하기");

        const targetMemberId = getPostMemberIdFromButton(button);
        const isMyPost = targetMemberId && Number(targetMemberId) === memberId;

        let menuItemsHtml = "";
        if (isMyPost) {
            menuItemsHtml =
                '<button type="button" role="menuitem" class="menu-item menu-item--edit">' +
                '<span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g></svg></span>' +
                '<span class="menu-item__label">게시물 수정하기</span>' +
                '</button>' +
                '<button type="button" role="menuitem" class="menu-item menu-item--delete">' +
                '<span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"></path></g></svg></span>' +
                '<span class="menu-item__label">게시물 삭제하기</span>' +
                '</button>';
        } else {
            menuItemsHtml =
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
                '</button>';
        }

        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.style.position = "absolute";
        lc.style.top = "0";
        lc.style.left = "0";
        lc.style.width = "100%";
        lc.style.height = "0";
        lc.style.pointerEvents = "none";
        lc.style.zIndex = "30";
        lc.innerHTML =
            '<div class="layers-overlay"></div>' +
            '<div class="layers-dropdown-inner">' +
            '<div role="menu" class="dropdown-menu" style="top:' + top + 'px;right:' + right + 'px;display:flex;">' +
            '<div><div class="dropdown-inner">' +
            menuItemsHtml +
            '</div></div>' +
            '</div>' +
            '</div>';
        lc.addEventListener("click", function (e) {
            const item = e.target.closest(".menu-item");
            if (!item) { e.stopPropagation(); return; }
            e.preventDefault();
            e.stopPropagation();
            let ac = "";
            if (item.classList.contains("menu-item--follow-toggle")) { ac = "menu-item--follow-toggle"; }
            else if (item.classList.contains("menu-item--block")) { ac = "menu-item--block"; }
            else if (item.classList.contains("menu-item--report")) { ac = "menu-item--report"; }
            else if (item.classList.contains("menu-item--edit")) { ac = "menu-item--edit"; }
            else if (item.classList.contains("menu-item--delete")) { ac = "menu-item--delete"; }
            if (ac && activeMoreButton) {
                handleDropdownAction(activeMoreButton, ac);
            }
        });
        document.body.appendChild(lc);
        activeMoreDropdown = lc;
        activeMoreButton = button;
    }

    // 더보기 버튼 클릭 (이벤트 위임)
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
        if (activeMoreDropdown && !activeMoreDropdown.contains(e.target)) {
            closePostMoreDropdown();
        }
    });

    // 좋아요/북마크 svg path 토글
    function syncActionPath(btn, active) {
        const p = btn?.querySelector("path");
        if (!p) return;
        const next = active ? p.dataset.pathActive : p.dataset.pathInactive;
        if (next) p.setAttribute("d", next);
    }

    // 좋아요 토글
    document.addEventListener("click", async (e) => {
        const likeBtn = e.target.closest(".tweet-action-btn--like");
        if (!likeBtn) return;
        const postId = likeBtn.closest(".postCard").dataset.postId;
        let isActive = likeBtn.classList.contains("active");
        const countSpan = likeBtn.querySelector(".tweet-action-count");
        let count = parseInt(countSpan.textContent);

        if (isActive) {
            await service.deleteLike(memberId, postId);
            likeBtn.classList.remove("active");
            countSpan.textContent = count - 1;
        } else {
            await service.addLike(memberId, postId);
            likeBtn.classList.add("active");
            countSpan.textContent = count + 1;
        }
        syncActionPath(likeBtn, !isActive);
        savePostStateChange(postId, "liked", !isActive);
    });

    // 북마크 토글
    document.addEventListener("click", async (e) => {
        const bookmarkBtn = e.target.closest(".tweet-action-btn--bookmark");
        if (!bookmarkBtn) return;
        const postId = bookmarkBtn.closest(".postCard").dataset.postId;
        let isActive = bookmarkBtn.classList.contains("active");

        if (isActive) {
            await service.deleteBookmark(memberId, postId);
            bookmarkBtn.classList.remove("active");
        } else {
            await service.addBookmark(memberId, postId);
            bookmarkBtn.classList.add("active");
        }
        syncActionPath(bookmarkBtn, !isActive);
        savePostStateChange(postId, "bookmarked", !isActive);
    });

    // 공유 드롭다운 토글
    let shareTargetPostId = null;
    document.addEventListener("click", (e) => {
        const shareBtn = e.target.closest(".tweet-action-btn--share");
        if (!shareBtn) return;
        e.stopPropagation();
        const card = shareBtn.closest(".postCard");
        shareTargetPostId = card ? card.dataset.postId : null;
        let isOpen = !mainShareDropdown.classList.contains("off");
        closeAllMenus();
        if (!isOpen) {
            let rect = shareBtn.getBoundingClientRect();
            let menu = document.getElementById("mainShareDropdownMenu");
            menu.style.position = "fixed";
            menu.style.left = rect.left + "px";
            menu.style.top = (rect.bottom + 4) + "px";
            mainShareDropdown.classList.remove("off");
        }
    });

    // 공유 드롭다운 항목
    function showShareToast(message) {
        const existing = document.querySelector(".share-toast");
        if (existing) { existing.remove(); }
        const toast = document.createElement("div");
        toast.className = "share-toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 3000);
    }

    document.querySelector(".share-menu-item--copy").addEventListener("click", (e) => {
        const url = window.location.origin + "/post/detail/" + shareTargetPostId;
        navigator.clipboard.writeText(url);
        closeAllMenus();
        showShareToast("링크가 복사되었습니다.");
    });

    // 2-2. 북마크 폴더에 추가하기
    const shareBookmarkModal = document.getElementById("shareBookmarkModal");
    const shareBookmarkFolderList = document.getElementById("shareBookmarkFolderList");
    const shareBookmarkCreateFolder = document.getElementById("shareBookmarkCreateFolder");

    document.querySelector(".share-menu-item--bookmark").addEventListener("click", async (e) => {
        console.log("북마크폴더 들어옴1, postId:", shareTargetPostId);
        closeAllMenus();
        if (!shareBookmarkModal) return;
        shareBookmarkModal.hidden = false;
        // 폴더 목록 로드
        const memberId = loginMember.id;
        const result = await BookmarkService.getFolders(memberId);
        console.log("북마크폴더 들어옴2 폴더목록:", result);
        if (!result.ok) return;
        const folders = result.data || [];
        let html = `<button type="button" class="bookmark-share-sheet-folder" data-share-folder-id="">
            <span class="bookmark-share-sheet-folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.75 3h10.5A2.25 2.25 0 0119.5 5.25v15.07a.75.75 0 01-1.2.6L12 16.2l-6.3 4.72a.75.75 0 01-1.2-.6V5.25A2.25 2.25 0 016.75 3z"/></svg></span>
            <span class="bookmark-share-sheet-folder-name">미분류</span>
        </button>`;
        folders.forEach((f) => {
            html += `<button type="button" class="bookmark-share-sheet-folder" data-share-folder-id="${f.id}">
                <span class="bookmark-share-sheet-folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.75 3h10.5A2.25 2.25 0 0119.5 5.25v15.07a.75.75 0 01-1.2.6L12 16.2l-6.3 4.72a.75.75 0 01-1.2-.6V5.25A2.25 2.25 0 016.75 3z"/></svg></span>
                <span class="bookmark-share-sheet-folder-name">${f.folderName}</span>
            </button>`;
        });
        shareBookmarkFolderList.innerHTML = html;
    });

    // 폴더 선택시 북마크 추가
    if (shareBookmarkFolderList) {
        shareBookmarkFolderList.addEventListener("click", async (e) => {
            const folderBtn = e.target.closest(".bookmark-share-sheet-folder");
            if (!folderBtn) return;
            const folderId = folderBtn.dataset.shareFolderId || null;
            const memberId = loginMember.id;
            console.log("북마크폴더 들어옴3 선택:", memberId, shareTargetPostId, folderId);
            const result = await BookmarkService.add(memberId, shareTargetPostId, folderId);
            console.log("북마크폴더 들어옴4 결과:", result);
            shareBookmarkModal.hidden = true;
            if (result.ok) {
                // 북마크 아이콘 active 처리
                const card = document.querySelector(`.postCard[data-post-id="${shareTargetPostId}"]`);
                if (card) {
                    const btn = card.querySelector(".tweet-action-btn--bookmark");
                    if (btn) {
                        btn.classList.add("active");
                        syncActionPath(btn, true);
                    }
                }
                savePostStateChange(shareTargetPostId, "bookmarked", true);
                showShareToast("북마크 폴더에 추가되었습니다.");
            } else if (result.status === 409) {
                showShareToast("이 폴더에 이미 북마크된 게시물입니다.");
            } else {
                showShareToast("북마크 추가에 실패했습니다.");
            }
        });
    }

    // 새폴더 만들기
    const createFolderModal = document.getElementById("createFolderModal");
    const createFolderInput = document.getElementById("createFolderInput");
    const createFolderSubmit = document.getElementById("createFolderSubmit");
    const createFolderClose = document.getElementById("createFolderClose");
    const createFolderCount = document.getElementById("createFolderCount");

    if (shareBookmarkCreateFolder && createFolderModal) {
        shareBookmarkCreateFolder.addEventListener("click", (e) => {
            console.log("새폴더생성 들어옴1 모달열기");
            shareBookmarkModal.hidden = true;
            createFolderInput.value = "";
            createFolderSubmit.disabled = true;
            createFolderCount.textContent = "0 / 25";
            createFolderModal.classList.add("is-open");
            createFolderInput.focus();
        });

        createFolderInput.addEventListener("input", (e) => {
            const len = createFolderInput.value.length;
            createFolderCount.textContent = len + " / 25";
            createFolderSubmit.disabled = !createFolderInput.value.trim();
        });

        createFolderSubmit.addEventListener("click", async (e) => {
            const folderName = createFolderInput.value.trim();
            if (!folderName) return;
            console.log("새폴더생성 들어옴2:", folderName);
            createFolderSubmit.disabled = true;
            const result = await BookmarkService.createFolder(loginMember.id, folderName);
            console.log("새폴더생성 들어옴3 결과:", result);
            createFolderModal.classList.remove("is-open");
            if (result.ok) {
                showShareToast(folderName + " 폴더를 만들었습니다.");
                // 폴더 선택 모달 다시 열기
                document.querySelector(".share-menu-item--bookmark").click();
            }
        });

        createFolderClose.addEventListener("click", (e) => {
            createFolderModal.classList.remove("is-open");
        });
    }

    // 모달 닫기
    if (shareBookmarkModal) {
        shareBookmarkModal.addEventListener("click", (e) => {
            if (e.target.closest("[data-share-close]") || e.target.classList.contains("bookmark-share-sheet-backdrop")) {
                shareBookmarkModal.hidden = true;
            }
        });
    }

    document.addEventListener("click", (e) => {
        if (!e.target.closest("#mainShareDropdown") && !e.target.closest(".tweet-action-btn--share")) {
            mainShareDropdown.classList.add("off");
        }
    });

    // 3. 이미지 미리보기
    const mediaPreviewOverlay = document.getElementById("mediaPreviewOverlay");
    const mediaPreviewImage = document.getElementById("mediaPreviewImage");
    const mediaPreviewClose = document.getElementById("mediaPreviewClose");

    document.addEventListener("click", (e) => {
        const img = e.target.closest(".postMediaImage");
        if (!img) return;
        mediaPreviewImage.src = img.src;
        mediaPreviewOverlay.classList.remove("off");
    });

    mediaPreviewClose.addEventListener("click", (e) => {
        mediaPreviewOverlay.classList.add("off");
    });

    mediaPreviewOverlay.addEventListener("click", (e) => {
        if (e.target === mediaPreviewOverlay) {
            mediaPreviewOverlay.classList.add("off");
        }
    });

    // 3-1. 게시글 클릭하면 상세로
    document.addEventListener("click", (e) => {
        if (e.target.closest(".postAvatar, .postHeader, .postMedia, .tweet-action-bar")) return;
        const card = e.target.closest(".postCard");
        if (!card || card.classList.contains("postCard--ad")) return;
        const postId = card.dataset.postId;
        if (postId) {
            window.location.href = `/main/post/detail/${postId}`;
        }
    });

    // 4. 좌측 네비게이션 더보기
    // /js/common/header.js 에서 모든 페이지(layout, layout-left-one, main) 공통으로 처리한다.

    // 검색
    const searchInput = document.getElementById("searchInput");
    const searchPanel = document.getElementById("searchPanel");
    const searchPanelEmpty = document.getElementById("searchPanelEmpty");
    const searchResults = document.getElementById("searchResults");

    const searchHistoryList = [];

    function renderSearchHistories(histories) {
        const panelEmpty = document.getElementById("searchPanelEmpty");
        if (!histories || histories.length === 0) {
            panelEmpty.innerHTML = '<p class="searchPanelText">인물이나 키워드를 검색해 보세요.</p>';
            return;
        }
        let html = '<div class="searchHistoryHeader" style="display:flex;justify-content:space-between;align-items:center;padding:8px 16px;">' +
            '<span style="font-weight:700;font-size:18px;">최근 검색</span>' +
            '<button type="button" id="clearAllHistories" style="color:#1d9bf0;font-size:13px;background:none;border:none;cursor:pointer;">전체 삭제</button></div>';
        html += '<div class="searchHistoryItems">';
        histories.forEach(h => {
            html += '<div class="searchHistoryItem" data-history-id="' + h.id + '" style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;cursor:pointer;">' +
                '<div style="display:flex;align-items:center;gap:12px;">' +
                '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:#71767b;"><g><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path></g></svg>' +
                '<span>' + h.searchKeyword + '</span></div>' +
                '<button type="button" class="deleteHistoryBtn" data-history-id="' + h.id + '" style="background:none;border:none;cursor:pointer;color:#71767b;font-size:16px;">✕</button></div>';
        });
        html += '</div>';
        panelEmpty.innerHTML = html;

        panelEmpty.querySelector("#clearAllHistories").addEventListener("click", async (e) => {
            e.stopPropagation();
            await service.deleteAllSearchHistories(memberId);
            renderSearchHistories([]);
        });

        panelEmpty.querySelectorAll(".deleteHistoryBtn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const historyId = btn.dataset.historyId;
                await service.deleteSearchHistory(historyId);
                btn.closest(".searchHistoryItem").remove();
            });
        });

        panelEmpty.querySelectorAll(".searchHistoryItem").forEach(item => {
            item.addEventListener("click", (e) => {
                if (e.target.closest(".deleteHistoryBtn")) return;
                const keyword = item.querySelector("span").textContent;
                searchInput.value = keyword;
                searchInput.dispatchEvent(new Event("input"));
            });
        });
    }

    searchInput.addEventListener("focus", async (e) => {
        searchPanel.classList.remove("off");
        if (searchInput.value.trim().length === 0) {
            const histories = await service.getSearchHistories(memberId);
            renderSearchHistories(histories);
            searchPanelEmpty.classList.remove("off");
            searchResults.classList.add("off");
        }
    });

    let searchTimer = null;
    searchInput.addEventListener("input", (e) => {
        const keyword = searchInput.value.trim();
        if (keyword.length > 0) {
            searchPanelEmpty.classList.add("off");
            searchResults.classList.remove("off");
            document.getElementById("searchResultLabel").textContent = keyword;

            clearTimeout(searchTimer);
            searchTimer = setTimeout(async () => {
                const members = await service.searchMembers(keyword);
                const listEl = document.getElementById("searchResultList");
                if (members.length === 0) {
                    listEl.innerHTML = '<p style="padding:16px;color:#71767b;text-align:center;">검색 결과가 없습니다.</p>';
                } else {
                    listEl.innerHTML = members.map(m => {
                        const initial = (m.memberName || m.memberHandle || "?").charAt(0);
                        const avatarHtml = m.memberProfileFileName
                            ? `<img class="searchResultAvatar" src="${m.memberProfileFileName}" />`
                            : `<img class="searchResultAvatar" src="/images/profile/default_image.png" />`;
                        return `<div class="searchResultItem" data-member-id="${m.id}" data-profile-id="${m.id}">
                            ${avatarHtml}
                            <div class="searchResultProfile">
                                <span class="searchResultName">${m.memberName || ""}</span>
                                <span class="searchResultHandle">${m.memberHandle || ""}</span>
                            </div>
                        </div>`;
                    }).join("");
                }
            }, 300);
        } else {
            searchPanelEmpty.classList.remove("off");
            searchResults.classList.add("off");
        }
    });

    document.getElementById("searchResultTopic").addEventListener("click", async (e) => {
        const keyword = searchInput.value.trim();
        if (keyword) {
            await service.saveSearchHistory(memberId, keyword);
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".searchForm")) {
            searchPanel.classList.add("off");
        }
    });

    // 5-1. 팔로우 추천 (사이드바)
    const suggestionTitle = document.getElementById("suggestionTitle");
    const suggestionContainer = suggestionTitle ? suggestionTitle.closest(".suggestionCard") : null;

    // 6. 커넥트 버튼
    const disconnectModal = document.getElementById("disconnectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalConfirm = document.getElementById("modalConfirm");
    const modalCancel = document.getElementById("modalCancel");
    let disconnectTarget = null;

    // expert 탭
    const isExpertButton = (btn) => !!btn.closest("#friendsSection");

    function openDisconnectModal(btn) {
        if (!disconnectModal || !modalTitle) { return; }
        disconnectTarget = btn;
        const userCard = btn.closest("[data-handle]");
        const handle = userCard ? (userCard.dataset.handle || "") : "";
        const expert = isExpertButton(btn);
        const askText = expert ? "님을 Unfollow 하시겠습니까?" : "님과의 연결을 끊으시겠습니까?";
        const fallback = expert ? "Unfollow 하시겠습니까?" : "연결을 끊으시겠습니까?";
        modalTitle.textContent = handle ? (handle + " " + askText) : fallback;
        disconnectModal.classList.add("active");
    }

    function closeDisconnectModal() {
        if (!disconnectModal) { return; }
        disconnectModal.classList.remove("active");
        disconnectTarget = null;
    }

    document.addEventListener("click", async (e) => {
        const connectBtn = e.target.closest(".connect-btn, .connect-btn-sm");
        if (!connectBtn) return;
        e.stopPropagation();
        const targetMemberId = connectBtn.dataset.memberId;
        const expert = isExpertButton(connectBtn);
        if (connectBtn.classList.contains("default")) {
            await service.follow(memberId, targetMemberId);
            connectBtn.classList.remove("default");
            connectBtn.classList.add("connected");
            connectBtn.textContent = expert ? "Following" : "Connected";
        } else {
            openDisconnectModal(connectBtn);
        }
    });

    // expert 면 Connect 아니고 Following, hover 시 Unfollow 임.
    document.addEventListener("mouseover", (e) => {
        const btn = e.target.closest(".connect-btn.connected, .connect-btn-sm.connected");
        if (!btn || !isExpertButton(btn)) return;
        btn.textContent = "Unfollow";
        btn.style.borderColor = "#f4212e";
        btn.style.color = "#f4212e";
        btn.style.background = "rgba(244,33,46,.1)";
    });

    document.addEventListener("mouseout", (e) => {
        const btn = e.target.closest(".connect-btn.connected, .connect-btn-sm.connected");
        if (!btn || !isExpertButton(btn)) return;
        btn.textContent = "Following";
        btn.style.borderColor = "";
        btn.style.color = "";
        btn.style.background = "";
    });

    if (modalConfirm) {
        modalConfirm.addEventListener("click", async (e) => {
            if (disconnectTarget) {
                const targetMemberId = disconnectTarget.dataset.memberId;
                const expert = isExpertButton(disconnectTarget);
                await service.unfollow(memberId, targetMemberId);
                disconnectTarget.classList.remove("connected");
                disconnectTarget.classList.add("default");
                disconnectTarget.textContent = expert ? "Follow" : "Connect";
                disconnectTarget.style.borderColor = "";
                disconnectTarget.style.color = "";
                disconnectTarget.style.background = "";
            }
            closeDisconnectModal();
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener("click", (e) => {
            closeDisconnectModal();
        });
    }

    if (disconnectModal) {
        disconnectModal.addEventListener("click", (e) => {
            if (e.target === disconnectModal) { closeDisconnectModal(); }
        });
    }


    // 작성/답글 모달 — 한번 호출로 양쪽 처리 마크업 없으면 자동 skip
    const refreshFeed = async () => {
        postPage = 1;
        const postData = await service.getPostList(postPage, memberId);
        const ads = await service.getAds(postPage, 3);
        const posts = layout.showPostList(postData.posts, ads, postPage);
        initFollowState(posts);
        postHasMore = postData.criteria.hasMore;
    };
    postModalApi.bootstrap({
        services: service,
        layout: layout,
        getMemberId: () => memberId,
        onSubmitSuccess: refreshFeed,
        onReplySubmitSuccess: refreshFeed,
    });

    document.addEventListener("click", (e) => {
        const boardMenu = document.getElementById("boardMenu");
        if (boardMenu && !e.target.closest("#boardMenu") && !e.target.closest(".audienceButton")) {
            boardMenu.classList.add("off");
        }
    });

    // 10. 뉴스 로딩
    const newsFeedList = document.getElementById("newsFeedList");
    if (newsFeedList) {
        service.getLatestNews((newsList) => {
            if (!newsList || newsList.length === 0) {
                newsFeedList.innerHTML = '<p style="padding:16px;color:#71767b;text-align:center;">뉴스가 없습니다.</p>';
                return;
            }
            newsFeedList.innerHTML = newsList.map(news => `
                <div class="newsFeedItem">
                    <div class="newsFeedContent">
                        <h3 class="newsFeedHeadline">${news.newsTitle || ""}</h3>
                        <p class="newsFeedSummary">${news.newsContent || ""}</p>
                    </div>
                </div>
            `).join("");
        });
    }

    // 11. 모바일 네비게이션
    const mobileItems = document.querySelectorAll(".mobileItem");
    mobileItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            mobileItems.forEach((mi) => { mi.classList.remove("active"); });
            item.classList.add("active");
        });
    });

    // 11. 환율 피드
    const exchangeRateFeedContent = document.getElementById("exchangeRateFeedContent");
    const exchangeRateFeedSubtitle = document.getElementById("exchangeRateFeedSubtitle");

    if (exchangeRateFeedContent) {
        const currencyLabels = { KRW: "대한민국 원", EUR: "유로", JPY: "일본 엔", CNY: "중국 위안", GBP: "영국 파운드" };
        const codes = ["KRW", "EUR", "JPY", "CNY", "GBP"];

        function renderRates(rates, dateStr) {
            let html = "";
            for (let i = 0; i < codes.length; i++) {
                const code = codes[i]; const label = currencyLabels[code] || code; const value = rates[code];
                const digits = code === "JPY" ? 2 : 4;
                const formatted = value.toLocaleString("ko-KR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
                html += '<div class="exchangeRateRow"><div class="exchangeRateMain"><div class="exchangeRateCurrencyLine"><span class="exchangeRateCurrency">' + code + '</span><span class="exchangeRateCurrencyName">' + label + '</span></div><span class="exchangeRateMeta">1 USD</span></div><div class="exchangeRateValueWrap"><span class="exchangeRateValue">' + formatted + '</span></div></div>';
            }
            exchangeRateFeedContent.innerHTML = html;
            if (exchangeRateFeedSubtitle && dateStr) {
                const d = new Date(dateStr); const month = (d.getMonth() + 1); const day = d.getDate();
                exchangeRateFeedSubtitle.textContent = "USD 기준 주요 통화 · " + month + "월 " + day + "일 기준";
            }
        }

        fetch("https://open.er-api.com/v6/latest/USD")
            .then((res) => { return res.json(); })
            .then((data) => { renderRates(data.rates, data.time_last_update_utc); })
            .catch((err) => { exchangeRateFeedContent.innerHTML = '<p class="exchangeRateFeedState">환율 정보를 불러오지 못했습니다.</p>'; });
    }

    // 12. 사이드바 sticky
    const trendPanel = document.querySelector(".trendPanel");
    if (trendPanel) {
        const updateStickyTop = () => {
            const panelH = trendPanel.offsetHeight; const viewH = window.innerHeight;
            if (panelH > viewH) { trendPanel.style.top = -(panelH - viewH) + "px"; } else { trendPanel.style.top = "0px"; }
        };
        setTimeout(updateStickyTop, 0);
        window.addEventListener("resize", updateStickyTop);
    }

    // 초기 데이터 로딩
    function load() {
        memberId = loginMember.id;

        layout.setLoginMemberId(memberId);
        layout.setAdInterval(loginMember.tier);

        // 프로필 이미지 없으면 기본 이미지 설정
        const avatarTargets = [
            document.getElementById("accountAvatar"),
            document.getElementById("composeAvatar"),
            document.getElementById("replyAvatar")
        ];
        avatarTargets.forEach(el => {
            if (!el) return;
            if (el.querySelector("img")) return;
            el.innerHTML = `<img src="/images/profile/default_image.png" alt="" />`;
        });

        loadFeed();

        if (suggestionContainer) {
            service.getSuggestions(memberId, (members) => {
                const itemsContainer = suggestionContainer.querySelectorAll(".suggestionItem");
                itemsContainer.forEach(item => item.remove());
                const moreLink = suggestionContainer.querySelector(".suggestionLink");
                if (!members || members.length === 0) {
                    const empty = document.createElement("p");
                    empty.style.cssText = "padding:16px;color:#71767b;text-align:center;";
                    empty.textContent = "추천할 회원이 없습니다.";
                    suggestionContainer.insertBefore(empty, moreLink);
                    return;
                }
                members.forEach(m => {
                    console.log("팔로우추천 들어옴1:", m.memberName, m.memberHandle);
                    const initial = (m.memberName || m.memberHandle || "?").charAt(0);
                    const avatarHtml = m.fileName
                        ? `<img class="suggestionAvatarImg" src="${m.fileName}" />`
                        : `<img class="suggestionAvatarImg" src="/images/profile/default_image.png" />`;
                    const div = document.createElement("div");
                    div.className = "suggestionItem trend-item";
                    div.dataset.profileId = m.id;
                    div.innerHTML =
                        `<div class="suggestionAvatar">${avatarHtml}</div>` +
                        `<div class="suggestionProfile">` +
                            `<span class="suggestionName">${m.memberName || ""}</span>` +
                            `<span class="sidebar-user-handle">${m.memberHandle || ""}</span>` +
                        `</div>` +
                        `<button class="connect-btn-sm default" data-member-id="${m.id}">Connect</button>`;
                    suggestionContainer.insertBefore(div, moreLink);
                });
            });
        }
        // 로그아웃 핸들러는 공통 header.js 에서 바인딩한다 (모든 탭에서 동일 동작).
    }

    load();
};
