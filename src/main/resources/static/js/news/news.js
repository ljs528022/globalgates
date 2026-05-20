window.onload = () => {
    function formatCount(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
        }

        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
        }

        return String(num);
    }

    let toastTimer = null;
    function showToast(message) {
        const toastEl = document.getElementById("newsToast");
        if (!toastEl) return;

        toastEl.textContent = message;
        toastEl.hidden = false;

        if (toastTimer) {
            window.clearTimeout(toastTimer);
        }
        toastTimer = window.setTimeout(() => {
            toastEl.hidden = true;
            toastTimer = null;
        }, 3000);
    }

    const showShareToast = showToast;

    function closeSortMenu() {
        if (!sortButton || !sortDropdown) {
            return;
        }

        sortDropdown.classList.remove("show");
        sortButton.setAttribute("aria-expanded", "false");
    }

    function setBookmarkButtonState(button, isActive) {
        const path = button?.querySelector("path");

        if (!button || !path) {
            return;
        }

        const activePath = path.dataset.pathActive || "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z";
        const inactivePath = path.dataset.pathInactive || "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z";

        button.classList.toggle("active", isActive);
        path.setAttribute("d", isActive ? activePath : inactivePath);
    }

    function getSharePostMeta(button) {
        const actionBar = button.closest(".post-detail-actions");
        const bookmarkButton = actionBar ? actionBar.querySelector(".tweet-action-btn-bookmark") : null;

        return {
            permalink: window.location.href,
            bookmarkButton: bookmarkButton,
        };
    }

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

    function copyShareLink(button) {
        const permalink = getSharePostMeta(button).permalink;
        closeShareDropdown();

        if (!navigator.clipboard?.writeText) {
            showShareToast("링크를 복사하지 못했습니다");
            return;
        }

        navigator.clipboard.writeText(permalink).then(() => {
            showShareToast("클립보드로 복사함");
        }).catch(() => {
            showShareToast("링크를 복사하지 못했습니다");
        });
    }

    function openShareChatModal(button) {
        closeShareDropdown();
        closeShareModal();

        const modal = document.createElement("div");
        modal.className = "share-sheet";
        modal.innerHTML = '<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card" role="dialog" aria-modal="true" aria-labelledby="share-chat-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 id="share-chat-title" class="share-sheet__title">공유하기</h2><span class="share-sheet__header-spacer"></span></div><div class="share-sheet__search"><input type="text" class="share-sheet__search-input" placeholder="검색" aria-label="검색"></div><div class="share-sheet__list"><button type="button" class="share-sheet__user" data-share-user-id="tradehub-kr"><span class="share-sheet__user-avatar"><img src="https://pbs.twimg.com/profile_images/2029361845321207808/LltLeaLS_bigger.jpg" alt="TradeHub KR"></span><span class="share-sheet__user-body"><span class="share-sheet__user-name">TradeHub KR</span><span class="share-sheet__user-handle">@TradeHub_KR</span></span></button></div></div>';
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
        const bookmarkButton = getSharePostMeta(button).bookmarkButton;
        const isBookmarked = bookmarkButton?.classList.contains("active") ?? false;
        closeShareDropdown();
        closeShareModal();

        const modal = document.createElement("div");
        modal.className = "share-sheet";
        modal.innerHTML = '<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card share-sheet__card--bookmark" role="dialog" aria-modal="true" aria-labelledby="share-bookmark-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button><h2 id="share-bookmark-title" class="share-sheet__title">폴더에 추가</h2><span class="share-sheet__header-spacer"></span></div><button type="button" class="share-sheet__create-folder">새 북마크 폴더 만들기</button><button type="button" class="share-sheet__folder" data-share-folder="all-bookmarks"><span class="share-sheet__folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"></path></g></svg></span><span class="share-sheet__folder-name">모든 북마크</span><span class="share-sheet__folder-check' + (isBookmarked ? ' share-sheet__folder-check--active' : '') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg></span></button></div>';
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
        if (!layersRoot) {
            return;
        }

        closeShareDropdown();
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const right = Math.max(16, window.innerWidth - rect.right);
        const layer = document.createElement("div");
        layer.className = "layers-dropdown-container";
        layer.innerHTML = '<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top: ' + top + 'px; right: ' + right + 'px; display: flex;"><div><div class="dropdown-inner"><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--copy"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></g></svg></span><span class="menu-item__label">링크 복사하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--chat"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path></g></svg></span><span class="menu-item__label">Chat으로 전송하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--bookmark"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18 3V0h2v3h3v2h-3v3h-2V5h-3V3zm-7.5 1a.5.5 0 00-.5.5V7h3.5A2.5 2.5 0 0116 9.5v3.48l3 2.1V11h2v7.92l-5-3.5v7.26l-6.5-3.54L3 22.68V9.5A2.5 2.5 0 015.5 7H8V4.5A2.5 2.5 0 0110.5 2H12v2zm-5 5a.5.5 0 00-.5.5v9.82l4.5-2.46 4.5 2.46V9.5a.5.5 0 00-.5-.5z"></path></g></svg></span><span class="menu-item__label">폴더에 북마크 추가하기</span></button></div></div></div></div>';
        layer.addEventListener("click", (e) => {
            const actionButton = e.target.closest(".share-menu-item");

            if (!actionButton || !activeShareButton) {
                e.stopPropagation();
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if (actionButton.classList.contains("share-menu-item--copy")) {
                copyShareLink(activeShareButton);
                return;
            }

            if (actionButton.classList.contains("share-menu-item--chat")) {
                openShareChatModal(activeShareButton);
                return;
            }

            if (actionButton.classList.contains("share-menu-item--bookmark")) {
                openShareBookmarkModal(activeShareButton);
            }
        });

        layersRoot.appendChild(layer);
        activeShareDropdown = layer;
        activeShareButton = button;
        activeShareButton.setAttribute("aria-expanded", "true");
    }

    const backButton = document.getElementById("newsBackButton");
    const layersRoot = document.getElementById("layers");
    const sortButton = document.querySelector(".post-detail-sort-button");
    const sortDropdown = document.querySelector(".post-detail-sort-menu");
    const replyInput = document.querySelector(".post-detail-reply-input");
    const replySubmit = document.querySelector(".post-detail-reply-submit");
    let activeShareDropdown = null;
    let activeShareButton = null;
    let activeShareModal = null;

    if (backButton) {
        backButton.addEventListener("click", (e) => {
            if (window.history.length > 1) {
                window.history.back();
                return;
            }

            window.location.href = "/explore?tab=news";
        });
    }

    document.querySelectorAll(".tweet-action-btn-like").forEach((likeButton) => {
        const countElement = likeButton.querySelector(".tweet-action-count");
        const path = likeButton.querySelector("svg path");

        if (!countElement || !path) {
            return;
        }

        const outlinePath = path.getAttribute("d");
        const filledPath = "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
        let count = Number(likeButton.dataset.count || countElement.textContent.replace(/[^0-9]/g, ""));
        let isLiked = false;

        likeButton.addEventListener("click", (e) => {
            isLiked = !isLiked;
            count += isLiked ? 1 : -1;

            likeButton.classList.toggle("active", isLiked);
            likeButton.dataset.count = String(count);
            path.setAttribute("d", isLiked ? filledPath : outlinePath);
            countElement.textContent = formatCount(count);
            showToast(isLiked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.", "toast--like");
        });
    });

    document.querySelectorAll(".tweet-action-btn-bookmark").forEach((bookmarkButton) => {
        const path = bookmarkButton.querySelector("svg path");

        if (!path) {
            return;
        }

        let isBookmarked = false;

        bookmarkButton.addEventListener("click", (e) => {
            isBookmarked = !isBookmarked;
            setBookmarkButtonState(bookmarkButton, isBookmarked);
            showToast(isBookmarked ? "북마크에 저장되었습니다." : "북마크가 해제되었습니다.");
        });
    });

    document.querySelectorAll(".tweet-action-btn-share").forEach((shareButton) => {
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

    if (sortButton && sortDropdown) {
        sortButton.addEventListener("click", (e) => {
            e.stopPropagation();
            const willOpen = !sortDropdown.classList.contains("show");
            closeSortMenu();

            if (willOpen) {
                sortDropdown.classList.add("show");
                sortButton.setAttribute("aria-expanded", "true");
            }
        });

        sortDropdown.querySelectorAll(".dropdown-item").forEach((item) => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                sortButton.querySelector("span").textContent = item.textContent;
                closeSortMenu();
            });
        });

        document.addEventListener("click", closeSortMenu);
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeSortMenu();
                closeShareDropdown();
                closeShareModal();
            }
        });
        document.addEventListener("scroll", closeSortMenu, true);
    }

    document.addEventListener("click", (e) => {
        closeShareDropdown();
    });

    if (replyInput && replySubmit) {
        replyInput.addEventListener("input", (e) => {
            const hasValue = replyInput.value.trim().length > 0;

            replySubmit.disabled = !hasValue;
            replySubmit.classList.toggle("disabled", !hasValue);
        });
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
        document.addEventListener("click", function (e) {
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

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                closePostMoreDropdown();
                closePostMoreModal();
            }
        });
    })();

// Post-Card 인터랙션 (Like / Bookmark / Share)
    (function () {
        let innerToastTimer = null;
        function showToast(message) {
            const toastEl = document.getElementById("newsToast");
            if (!toastEl) return;
            toastEl.textContent = message;
            toastEl.hidden = false;
            if (innerToastTimer) {
                window.clearTimeout(innerToastTimer);
            }
            innerToastTimer = window.setTimeout(() => {
                toastEl.hidden = true;
                innerToastTimer = null;
            }, 3000);
        }
        const showShareToast = showToast;

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
            modal.addEventListener("click", function (e) {
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
            modal.addEventListener("click", function (e) {
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
            layer.addEventListener("click", function (e) {
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
        document.querySelectorAll(".tweet-action-btn--like").forEach(function (likeButton) {
            const countEl = likeButton.querySelector(".tweet-action-count");
            const path = likeButton.querySelector("svg path");
            if (!path) {
                return;
            }
            let isLiked = false;
            likeButton.addEventListener("click", function (e) {
                isLiked = !isLiked;
                likeButton.classList.toggle("active", isLiked);
                path.setAttribute("d", isLiked ? path.getAttribute("data-path-active") : path.getAttribute("data-path-inactive"));
                if (countEl) {
                    const cur = parseInt(countEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                    countEl.textContent = isLiked ? cur + 1 : cur - 1;
                }
                showToast(isLiked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.", "toast--like");
            });
        });

        // Bookmark 버튼
        document.querySelectorAll(".tweet-action-btn--bookmark").forEach(function (bookmarkButton) {
            const path = bookmarkButton.querySelector("svg path");
            if (!path) {
                return;
            }
            let isBookmarked = false;
            bookmarkButton.addEventListener("click", function (e) {
                isBookmarked = !isBookmarked;
                setBookmarkButtonState(bookmarkButton, isBookmarked);
                showToast(isBookmarked ? "북마크에 저장되었습니다." : "북마크가 해제되었습니다.");
            });
        });

        // Share 버튼
        document.querySelectorAll(".tweet-action-btn--share").forEach(function (shareButton) {
            shareButton.addEventListener("click", function (e) {
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
        document.addEventListener("click", function (e) {
            closeShareDropdown();
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                closeShareDropdown();
                closeShareModal();
            }
        });
    })();

};
