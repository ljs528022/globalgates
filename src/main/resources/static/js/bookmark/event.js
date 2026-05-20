(function () {
    "use strict";

    // 사이드바 게시하기 + 공용 답글 모달 활성화. memberId는 HTML inline top-level const.
    postModalApi.bootstrap({
        services: service,
        layout: layout,
        getMemberId: () => memberId,
        // 답글 게시 후 카드의 답글 카운트 +1 + aria-label 갱신. 토스트는 공용 모달이 처리.
        onReplySubmitSuccess: ({ button }) => {
            const countSpan = button?.querySelector(".tweet-action-count");
            if (countSpan) {
                const count = (parseInt(countSpan.textContent, 10) || 0) + 1;
                countSpan.textContent = String(count);
                const ariaLabel = button.getAttribute("aria-label") || "";
                button.setAttribute("aria-label", ariaLabel.replace(/^\d+/, String(count)));
            }
        },
    });

    const headerTitle = document.getElementById("headerTitle");
    const defaultHeaderTitle =
        headerTitle?.dataset.defaultTitle || "모든 북마크";
    const backButton = document.getElementById("headerBack");
    const modalOpenButton = document.getElementById("modalOpenButton");
    const detailMoreButton = document.getElementById("detailMoreButton");
    const listView = document.getElementById("bookmarkListView");
    const detailView = document.getElementById("bookmarkDetailView");
    const bookmarkPosts = document.getElementById("bookmarkPosts");
    const searchInput = document.getElementById("bookmarkSearch");
    const searchBox = document.getElementById("searchBox");
    const bookmarkFolderButton = document.getElementById("bookmarkFolderButton");
    const bookmarkFolderLabel = document.getElementById("bookmarkFolderLabel");
    const bookmarkList = document.querySelector(".bookmark-list");
    const bookmarkPostsEmpty = document.getElementById("bookmarkPostsEmpty");
    const detailFolderMenu = document.getElementById("detailFolderMenu");
    const detailFolderEditButton = document.getElementById(
        "detailFolderEditButton",
    );
    const shareDropdown = document.getElementById("shareDropdown");
    const shareBookmarkModal = document.getElementById("shareBookmarkModal");
    const shareBookmarkCreateFolder = document.getElementById(
        "shareBookmarkCreateFolder",
    );
    const shareBookmarkFolderList = document.getElementById(
        "shareBookmarkFolderList",
    );

    const bookmarkModal = document.getElementById("bookmarkModal");
    const modalCloseButton = document.getElementById("modalCloseButton");
    const modalSubmitButton = document.getElementById("modalSubmitButton");
    const folderNameInput = document.getElementById("folderNameInput");
    const folderNameCount = document.getElementById("folderNameCount");
    const bookmarkEditModal = document.getElementById("bookmarkEditModal");
    const editModalCloseButton = document.getElementById("editModalCloseButton");
    const editModalSubmitButton = document.getElementById(
        "editModalSubmitButton",
    );
    const editModalDeleteButton = document.getElementById(
        "editModalDeleteButton",
    );
    const editFolderNameInput = document.getElementById("editFolderNameInput");
    const editFolderNameCount = document.getElementById("editFolderNameCount");
    const bookmarkDeleteModal = document.getElementById("bookmarkDeleteModal");
    const deleteModalSubmitButton = document.getElementById(
        "deleteModalSubmitButton",
    );
    const deleteModalCancelButton = document.getElementById(
        "deleteModalCancelButton",
    );
    const bookmarkToast = document.getElementById("bookmarkToast");
    const bookmarkBlockModal = document.getElementById("bookmarkBlockModal");
    const bookmarkBlockTitle = document.getElementById("bookmarkBlockTitle");
    const bookmarkBlockDesc = document.getElementById("bookmarkBlockDesc");
    const bookmarkBlockConfirmButton = document.getElementById(
        "bookmarkBlockConfirmButton",
    );
    const bookmarkBlockCancelButton = document.getElementById(
        "bookmarkBlockCancelButton",
    );
    const bookmarkReportModal = document.getElementById("bookmarkReportModal");

    const mediaPreviewOverlay = document.getElementById("mediaPreviewOverlay");
    const mediaPreviewImage = document.getElementById("mediaPreviewImage");
    const mediaPreviewClose = document.getElementById("mediaPreviewClose");

    let isDetailViewOpen = false;
    let activeShareDropdown = null;
    let activeShareButton = null;
    let activeShareModal = null;
    let activeShareBookmarkButton = null;
    let activeShareBookmarkPostId = "";
    let activeShareBookmarkNewsId = "";
    let activeShareBookmarkType = "post";
    let activeMorePostMeta = null;
    let toastTimer = null;
    let currentFolderId = null;
    let currentFolderName = "모든 북마크";
    const bookmarkFollowState = new Map();
    let pendingShareBookmarkReopen = false;
    const bookmarkFolderList = document.getElementById("bookmarkFolderList");

    // ── API + 렌더링은 service.js, layout.js 모듈 사용 ──

    function handleResult(result) {
        if (!result.ok && result.message) showToast(result.message);
        return result.ok ? result.data : null;
    }

    async function loadFolders() {
        if (typeof memberId === "undefined" || !memberId) return;
        const result = await BookmarkService.getFolders(memberId);
        if (result.ok) BookmarkLayout.renderFolderList(bookmarkFolderList, result.data);
        else if (result.message) showToast(result.message);
    }

    async function loadAllBookmarks() {
        if (typeof memberId === "undefined" || !memberId) return;
        const result = await BookmarkService.getAll(memberId);
        if (result.ok) BookmarkLayout.renderPostList(bookmarkPosts, result.data, bookmarkPostsEmpty);
        else if (result.message) showToast(result.message);
    }

    async function loadFolderBookmarks(folderId) {
        const result = await BookmarkService.getByFolder(folderId);
        if (result.ok) BookmarkLayout.renderPostList(bookmarkPosts, result.data, bookmarkPostsEmpty);
        else if (result.message) showToast(result.message);
    }

    async function loadUncategorizedBookmarks() {
        if (typeof memberId === "undefined" || !memberId) return;
        const result = await BookmarkService.getUncategorized(memberId);
        if (result.ok) BookmarkLayout.renderPostList(bookmarkPosts, result.data, bookmarkPostsEmpty);
        else if (result.message) showToast(result.message);
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function getBookmarkPostCards() {
        return Array.from(bookmarkPosts?.querySelectorAll(".bookmark-post") ?? []);
    }

    function toggleClassModal(modal, isOpen) {
        if (!modal) {
            return;
        }
        modal.classList.toggle("is-open", isOpen);
        modal.setAttribute("aria-hidden", String(!isOpen));
    }

    function toggleHiddenLayer(layer, isOpen) {
        if (!layer) {
            return;
        }
        layer.hidden = !isOpen;
    }

    function resetFloatingLayer(layer, button) {
        if (!layer) {
            return;
        }
        layer.hidden = true;
        layer.style.removeProperty("top");
        layer.style.removeProperty("left");
        button?.setAttribute("aria-expanded", "false");
    }

    function resetPostMoreMenus() {
        document.querySelectorAll(".bookmark-post-more-menu").forEach((menu) => {
            menu.hidden = true;
        });
        document.querySelectorAll("[data-post-more]").forEach((button) => {
            button.setAttribute("aria-expanded", "false");
        });
    }

    function syncBookmarkPostsEmpty() {
        if (bookmarkPostsEmpty) {
            bookmarkPostsEmpty.hidden = getBookmarkPostCards().length !== 0;
        }
    }

    function setHeaderTitle(title) {
        if (headerTitle) {
            headerTitle.textContent = title;
        }
    }

    function getTextContent(element) {
        return element?.textContent?.replace(/\s+/g, " ").trim() || "";
    }

    function syncFolderNameUI() {
        if (isDetailViewOpen) {
            setHeaderTitle(currentFolderName);
        }
    }

    function showToast(message) {
        if (!bookmarkToast) {
            return;
        }
        bookmarkToast.textContent = message;
        bookmarkToast.hidden = false;
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            bookmarkToast.hidden = true;
        }, 3000);
    }

    function closeShareModal() {
        if (!activeShareModal) {
            return;
        }
        toggleHiddenLayer(activeShareModal, false);
        activeShareModal = null;
        activeShareBookmarkButton = null;
        if (!pendingShareBookmarkReopen) {
            activeShareBookmarkPostId = "";
            activeShareBookmarkNewsId = "";
            activeShareBookmarkType = "post";
        }
        updateBodyScrollLock();
    }

    function closeShareDropdown() {
        resetFloatingLayer(shareDropdown, activeShareButton);
        activeShareDropdown = null;
        activeShareButton = null;
    }

    function closeDetailFolderMenu() {
        resetFloatingLayer(detailFolderMenu, detailMoreButton);
    }

    function closePostMenus() {
        closeShareModal();
        closeShareDropdown();
        closeDetailFolderMenu();
        activeMorePostMeta = null;
        resetPostMoreMenus();
    }

    function setBookmarkButtonState(button, isActive) {
        const path = button?.querySelector("path");
        if (!button || !path) {
            return;
        }
        button.classList.toggle("active", isActive);
        button.setAttribute(
            "aria-label",
            isActive ? "북마크에 추가됨" : "북마크",
        );
        path.setAttribute(
            "d",
            isActive
                ? path.dataset.pathActive || path.getAttribute("d")
                : path.dataset.pathInactive || path.getAttribute("d"),
        );
    }

    function getSharePostMeta(button) {
        const postCard = button.closest(".bookmark-post");
        const handle =
            postCard?.querySelector(".postHandle")?.textContent?.trim() ||
            "@user";
        const postId = postCard?.dataset.postId || "1";
        const newsId = postCard?.dataset.newsId || "";
        const bookmarkType = postCard?.dataset.bookmarkType || "post";
        const bookmarkButton =
            postCard?.querySelector("[data-action='bookmark']") ?? null;
        const url = new URL(window.location.href);
        url.pathname = bookmarkType === "news" && newsId
            ? `/news/detail/${newsId}`
            : `/${handle.replace("@", "")}/status/${postId}`;
        url.hash = "";
        url.search = "";
        return {permalink: url.toString(), bookmarkButton, postId, newsId, bookmarkType};
    }

    function getBookmarkMoreMeta(button) {
        const postCard = button.closest(".bookmark-post");
        const handle =
            postCard?.querySelector(".postHandle")?.textContent?.trim() ||
            "@user";
        const postMemberId = postCard?.dataset.postMemberId || null;
        const postId = postCard?.dataset.postId || null;
        return {postCard, handle, postMemberId, postId};
    }

    function getFollowMenuIcon(isFollowing) {
        return isFollowing
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></svg>';
    }

    function syncBookmarkMoreMenu(menu, handle) {
        const isFollowing = bookmarkFollowState.get(handle) ?? false;
        const followLabel = menu.querySelector("[data-follow-label]");
        const followIcon = menu.querySelector("[data-follow-icon]");
        if (followLabel) {
            followLabel.textContent = isFollowing
                ? `${handle} 님 언팔로우하기`
                : `${handle} 님 팔로우하기`;
        }
        if (followIcon) {
            followIcon.innerHTML = getFollowMenuIcon(isFollowing);
        }
    }

    function copyShareLink(button) {
        const {permalink} = getSharePostMeta(button);
        closeShareDropdown();
        if (!navigator.clipboard?.writeText) {
            showToast("링크를 복사하지 못했습니다");
            return;
        }
        navigator.clipboard
            .writeText(permalink)
            .then(() => showToast("클립보드로 복사함"))
            .catch(() => showToast("링크를 복사하지 못했습니다"));
    }

    async function loadShareBookmarkFolders() {
        if (typeof memberId === "undefined" || !memberId || !shareBookmarkFolderList) return;
        const result = await BookmarkService.getFolders(memberId);
        if (!result.ok) return;
        const folders = result.data || [];
        let html = `<button type="button" class="bookmark-share-sheet-folder" data-share-folder-id="">
            <span class="bookmark-share-sheet-folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.75 3h10.5A2.25 2.25 0 0119.5 5.25v15.07a.75.75 0 01-1.2.6L12 16.2l-6.3 4.72a.75.75 0 01-1.2-.6V5.25A2.25 2.25 0 016.75 3z"/></svg></span>
            <span class="bookmark-share-sheet-folder-name">미분류</span>
        </button>`;
        folders.forEach((f) => {
            html += `<button type="button" class="bookmark-share-sheet-folder" data-share-folder-id="${f.id}">
                <span class="bookmark-share-sheet-folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.75 3h10.5A2.25 2.25 0 0119.5 5.25v15.07a.75.75 0 01-1.2.6L12 16.2l-6.3 4.72a.75.75 0 01-1.2-.6V5.25A2.25 2.25 0 016.75 3z"/></svg></span>
                <span class="bookmark-share-sheet-folder-name">${escapeHtml(f.folderName)}</span>
            </button>`;
        });
        shareBookmarkFolderList.innerHTML = html;
    }

    async function addActiveShareBookmarkToFolder(folderId) {
        if (typeof memberId === "undefined" || !memberId) return false;

        if (activeShareBookmarkType === "news") {
            const newsId = activeShareBookmarkNewsId;
            if (!newsId) return false;
            const existing = await BookmarkService.getByMemberAndNews(memberId, newsId);
            if (existing.ok && existing.data) {
                await BookmarkService.moveNewsFolder(existing.data.id, folderId);
            } else {
                await BookmarkService.addNews(memberId, Number(newsId), folderId);
            }
            return true;
        }

        const postId = activeShareBookmarkPostId;
        if (!postId) return false;
        const existing = await BookmarkService.getByMemberAndPost(memberId, postId);
        if (existing.ok && existing.data) {
            await BookmarkService.moveFolder(existing.data.id, folderId);
        } else {
            await BookmarkService.add(memberId, postId, folderId);
        }
        return true;
    }

    function openShareBookmarkModal(button) {
        const {bookmarkButton, postId, newsId, bookmarkType} = getSharePostMeta(button);
        closeShareDropdown();
        closeShareModal();
        activeShareBookmarkButton = bookmarkButton;
        activeShareBookmarkPostId = postId;
        activeShareBookmarkNewsId = newsId;
        activeShareBookmarkType = bookmarkType;
        if (!shareBookmarkModal) {
            return;
        }
        toggleHiddenLayer(shareBookmarkModal, true);
        activeShareModal = shareBookmarkModal;
        updateBodyScrollLock();
        loadShareBookmarkFolders();
    }

    function positionDropdownLayer(layer, anchorRect) {
        const menu = layer.querySelector(".dropdown-menu");
        if (!menu) {
            return;
        }
        const wasHidden = layer.hidden;
        if (wasHidden) {
            layer.hidden = false;
            layer.style.visibility = "hidden";
        }
        const spacing = 8;
        const viewportPadding = 8;
        const menuRect = menu.getBoundingClientRect();
        const top = Math.min(
            Math.max(viewportPadding, anchorRect.bottom + spacing),
            Math.max(
                viewportPadding,
                window.innerHeight - menuRect.height - viewportPadding,
            ),
        );
        const left = Math.min(
            Math.max(
                viewportPadding,
                anchorRect.right - menuRect.width,
            ),
            Math.max(
                viewportPadding,
                window.innerWidth - menuRect.width - viewportPadding,
            ),
        );
        if (wasHidden) {
            layer.hidden = true;
            layer.style.removeProperty("visibility");
        }
        layer.style.top = `${top}px`;
        layer.style.left = `${left}px`;
    }

    function positionDetailFolderMenu() {
        if (!detailFolderMenu || !detailMoreButton) {
            return;
        }
        const rect = detailMoreButton.getBoundingClientRect();
        const spacing = 8;
        const viewportPadding = 8;
        const menuRect = detailFolderMenu.getBoundingClientRect();
        const top = Math.min(
            Math.max(viewportPadding, rect.bottom + spacing),
            Math.max(
                viewportPadding,
                window.innerHeight - menuRect.height - viewportPadding,
            ),
        );
        const left = Math.min(
            Math.max(viewportPadding, rect.right - menuRect.width),
            Math.max(
                viewportPadding,
                window.innerWidth - menuRect.width - viewportPadding,
            ),
        );
        detailFolderMenu.style.top = `${top}px`;
        detailFolderMenu.style.left = `${left}px`;
    }

    function openDetailFolderMenu() {
        if (!detailFolderMenu || !detailMoreButton || detailMoreButton.hidden) {
            return;
        }
        closePostMenus();
        detailFolderMenu.hidden = false;
        detailMoreButton.setAttribute("aria-expanded", "true");
        positionDetailFolderMenu();
    }

    function closeDeleteModal() {
        toggleClassModal(bookmarkDeleteModal, false);
        updateBodyScrollLock();
    }

    function openDeleteModal() {
        if (!bookmarkDeleteModal) {
            return;
        }
        closeDetailFolderMenu();
        toggleClassModal(bookmarkDeleteModal, true);
        updateBodyScrollLock();
        window.setTimeout(() => deleteModalSubmitButton?.focus(), 0);
    }

    async function deleteCurrentFolder() {
        if (!currentFolderId) return;
        await BookmarkService.deleteFolder(currentFolderId);
        closeDeleteModal();
        if (isDetailViewOpen) {
            closeBookmarkDetail();
        }
        currentFolderId = null;
        currentFolderName = "모든 북마크";
        window.history.replaceState({bookmarkView: "list"}, "", "/bookmark");
        await loadFolders();
        showToast("폴더를 삭제했습니다");
    }

    function openShareDropdown(button) {
        if (!shareDropdown) {
            return;
        }
        closePostMenus();
        const rect = button.getBoundingClientRect();
        positionDropdownLayer(shareDropdown, rect);
        toggleHiddenLayer(shareDropdown, true);
        activeShareDropdown = shareDropdown;
        activeShareButton = button;
        activeShareButton.setAttribute("aria-expanded", "true");
    }

    function isBookmarkNotificationModalOpen() {
        return (
            bookmarkBlockModal?.hidden === false ||
            bookmarkReportModal?.hidden === false
        );
    }

    function closeBookmarkNotificationModal() {
        toggleHiddenLayer(bookmarkBlockModal, false);
        toggleHiddenLayer(bookmarkReportModal, false);
        activeMorePostMeta = null;
        updateBodyScrollLock();
    }

    function openBookmarkBlockModal(meta) {
        if (!bookmarkBlockModal || !bookmarkBlockTitle || !bookmarkBlockDesc) {
            return;
        }
        closePostMenus();
        activeMorePostMeta = meta;
        bookmarkBlockTitle.textContent = `${meta.handle} 님을 차단할까요?`;
        bookmarkBlockDesc.textContent = `내 공개 게시물을 볼 수 있지만 더 이상 게시물에 참여할 수 없습니다. 또한 ${meta.handle} 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.`;
        toggleHiddenLayer(bookmarkBlockModal, true);
        updateBodyScrollLock();
    }

    function openBookmarkReportModal(meta) {
        if (!bookmarkReportModal) {
            return;
        }
        closePostMenus();
        activeMorePostMeta = meta;
        toggleHiddenLayer(bookmarkReportModal, true);
        updateBodyScrollLock();
    }

    function handleBookmarkMoreAction(action, menuItem) {
        const button = menuItem
            .closest(".bookmark-post-more-wrap")
            ?.querySelector("[data-post-more]");
        const meta = button ? getBookmarkMoreMeta(button) : null;
        if (!meta) {
            return;
        }
        if (action === "follow-toggle") {
            const isFollowing = bookmarkFollowState.get(meta.handle) ?? false;
            bookmarkFollowState.set(meta.handle, !isFollowing);
            if (meta.postMemberId && typeof memberId !== "undefined" && memberId) {
                if (isFollowing) {
                    fetch(`/api/main/follows/${memberId}/${meta.postMemberId}/delete`, { method: "POST" });
                } else {
                    fetch("/api/main/follows", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ followerId: memberId, followingId: Number(meta.postMemberId) }),
                    });
                }
            }
            closePostMenus();
            showToast(
                isFollowing
                    ? `${meta.handle} 님 팔로우를 취소했습니다`
                    : `${meta.handle} 님을 팔로우했습니다`,
            );
            return;
        }
        if (action === "block") {
            openBookmarkBlockModal(meta);
            return;
        }
        if (action === "report") {
            openBookmarkReportModal(meta);
        }
    }

    async function removeBookmarkedPost(idOrCard) {
        const postCard = idOrCard instanceof Element
            ? idOrCard
            : bookmarkPosts?.querySelector(`.bookmark-post[data-post-id="${idOrCard}"]`);
        if (!postCard) return false;
        const bookmarkType = postCard.dataset.bookmarkType;
        const newsId = postCard.dataset.newsId;
        const postId = postCard.dataset.postId;
        if (bookmarkType === "news" && newsId) {
            // 뉴스 북마크 토글 (POST /api/news/{newsId}/bookmarks)
            await fetch(`/api/news/${newsId}/bookmarks`, { method: "POST" });
        } else {
            const bookmarkId = postCard.dataset.bookmarkId;
            if (bookmarkId) {
                await BookmarkService.remove(bookmarkId);
            } else if (postId && typeof memberId !== "undefined" && memberId) {
                await BookmarkService.removeByPost(memberId, postId);
            }
        }
        postCard.remove();
        syncBookmarkPostsEmpty();
        showToast("북마크에서 삭제했습니다");
        return true;
    }

    function updateBodyScrollLock() {
        const shouldLock =
            Boolean(activeShareModal) ||
            isBookmarkNotificationModalOpen() ||
            bookmarkModal?.classList.contains("is-open") ||
            bookmarkEditModal?.classList.contains("is-open") ||
            bookmarkDeleteModal?.classList.contains("is-open") ||
            mediaPreviewOverlay?.hidden === false;
        document.body.classList.toggle("modal-open", shouldLock);
    }

    function closeMediaPreview() {
        if (!mediaPreviewOverlay || !mediaPreviewImage) {
            return;
        }
        mediaPreviewOverlay.hidden = true;
        mediaPreviewImage.removeAttribute("src");
        mediaPreviewImage.removeAttribute("alt");
        updateBodyScrollLock();
    }

    function openBookmarkDetail(folderName) {
        if (!listView || !detailView || isDetailViewOpen) {
            return;
        }
        currentFolderName = folderName || currentFolderName;
        syncFolderNameUI();
        syncBookmarkPostsEmpty();
        isDetailViewOpen = true;
        listView.hidden = true;
        detailView.hidden = false;
        modalOpenButton?.setAttribute("hidden", "");
        if (currentFolderId) {
            detailMoreButton?.removeAttribute("hidden");
        } else {
            detailMoreButton?.setAttribute("hidden", "");
        }
        setHeaderTitle(currentFolderName);
        window.scrollTo({top: 0, behavior: "auto"});
    }

    function closeBookmarkDetail() {
        if (!listView || !detailView || !isDetailViewOpen) {
            return;
        }
        isDetailViewOpen = false;
        closePostMenus();
        closeMediaPreview();
        listView.hidden = false;
        detailView.hidden = true;
        modalOpenButton?.removeAttribute("hidden");
        detailMoreButton?.setAttribute("hidden", "");
        setHeaderTitle(defaultHeaderTitle);
    }

    syncFolderNameUI();

    if (backButton) {
        backButton.addEventListener("click", () => {
            window.history.back();
        });
    }

    // 폴더 detail 뷰 진입/이탈을 브라우저 히스토리에 반영. 게시물 상세에서 뒤로가기 시 폴더 컨텍스트 복원용.
    function buildBookmarkUrl(folderId) {
        return folderId
            ? `/bookmark?folderId=${encodeURIComponent(folderId)}`
            : `/bookmark?uncategorized=1`;
    }

    function pushDetailHistory(folderId, folderName) {
        const state = {bookmarkView: "detail", folderId: folderId || "", folderName};
        window.history.pushState(state, "", buildBookmarkUrl(folderId || ""));
    }

    function applyDetailViewFromState(folderId, folderName) {
        currentFolderId = folderId || null;
        if (!isDetailViewOpen) {
            openBookmarkDetail(folderName);
        } else {
            currentFolderName = folderName || currentFolderName;
            setHeaderTitle(currentFolderName);
        }
        if (folderId) {
            loadFolderBookmarks(folderId);
        } else {
            loadUncategorizedBookmarks();
        }
    }

    window.addEventListener("popstate", (event) => {
        const state = event.state;
        if (state && state.bookmarkView === "detail") {
            applyDetailViewFromState(state.folderId || "", state.folderName || "북마크");
        } else if (isDetailViewOpen) {
            closeBookmarkDetail();
            currentFolderId = null;
        }
    });

    document.addEventListener("click", (event) => {
        const folderButton = event.target.closest("[data-bookmark-folder]");
        if (folderButton) {
            const folderName = folderButton.dataset.bookmarkFolder || "북마크";
            const folderId = folderButton.dataset.folderId || "";
            currentFolderId = folderId || null;
            openBookmarkDetail(folderName);
            pushDetailHistory(folderId, folderName);
            if (!folderId || folderId === "") {
                loadUncategorizedBookmarks();
            } else {
                loadFolderBookmarks(folderId);
            }
            return;
        }
    });

    if (detailMoreButton) {
        detailMoreButton.addEventListener("click", (event) => {
            event.stopPropagation();
            if (detailFolderMenu && !detailFolderMenu.hidden) {
                closeDetailFolderMenu();
                return;
            }
            openDetailFolderMenu();
        });
    }

    if (searchInput && searchBox) {
        const syncSearchState = () => {
            searchBox.classList.toggle(
                "is-active",
                document.activeElement === searchInput ||
                searchInput.value.trim().length > 0,
            );
        };
        const filterFolders = () => {
            const query = searchInput.value.trim().toLowerCase();
            const folderButtons = bookmarkFolderList?.querySelectorAll(".bookmark-item") ?? [];
            folderButtons.forEach((btn) => {
                const label = btn.querySelector(".bookmark-item-label")?.textContent?.toLowerCase() || "";
                btn.style.display = !query || label.includes(query) ? "" : "none";
            });
        };
        searchInput.addEventListener("focus", syncSearchState);
        searchInput.addEventListener("blur", syncSearchState);
        searchInput.addEventListener("input", () => {
            syncSearchState();
            filterFolders();
        });
        syncSearchState();
    }

    if (
        modalOpenButton &&
        bookmarkModal &&
        modalCloseButton &&
        modalSubmitButton &&
        folderNameInput &&
        folderNameCount
    ) {
        const folderNameError = document.getElementById("folderNameError");

        async function checkDuplicateFolderName(name) {
            const result = await BookmarkService.getFolders(memberId);
            if (!result.ok) return false;
            return (result.data || []).some(f => f.folderName === name);
        }

        function showFolderError(msg) {
            if (!folderNameError) return;
            folderNameError.textContent = msg;
            folderNameError.hidden = false;
        }

        function hideFolderError() {
            if (!folderNameError) return;
            folderNameError.textContent = "";
            folderNameError.hidden = true;
        }

        function updateModalState() {
            const value = folderNameInput.value.trim();
            folderNameCount.textContent = `${folderNameInput.value.length} / 25`;
            modalSubmitButton.disabled = value.length === 0;
            hideFolderError();
        }

        function resetModalForm() {
            folderNameInput.value = "";
            hideFolderError();
            updateModalState();
        }

        function closeModal({reset = true} = {}) {
            toggleClassModal(bookmarkModal, false);
            if (reset) {
                resetModalForm();
                pendingShareBookmarkReopen = false;
            }
            updateBodyScrollLock();
        }

        function openModal() {
            resetModalForm();
            toggleClassModal(bookmarkModal, true);
            updateBodyScrollLock();
            window.setTimeout(() => folderNameInput.focus(), 0);
        }

        modalOpenButton.addEventListener("click", openModal);
        modalCloseButton.addEventListener("click", () => closeModal());
        bookmarkModal.addEventListener("click", (event) => {
            if (event.target === bookmarkModal) {
                closeModal({reset: false});
            }
        });
        folderNameInput.addEventListener("input", updateModalState);
        modalSubmitButton.addEventListener("click", async () => {
            const value = folderNameInput.value.trim();
            if (!value) return;
            modalSubmitButton.disabled = true;
            const isDuplicate = await checkDuplicateFolderName(value);
            if (isDuplicate) {
                showFolderError("중복된 북마크 이름입니다");
                modalSubmitButton.disabled = false;
                return;
            }
            const shouldAddBookmark = pendingShareBookmarkReopen && (
                (activeShareBookmarkType === "news" && activeShareBookmarkNewsId) ||
                (activeShareBookmarkType !== "news" && activeShareBookmarkPostId)
            );
            const result = await BookmarkService.createFolder(memberId, value);
            if (result.ok) {
                const newFolderId = result.data?.id;
                if (shouldAddBookmark && newFolderId) {
                    await addActiveShareBookmarkToFolder(newFolderId);
                    showToast(`${value} 폴더에 추가했습니다`);
                } else {
                    showToast(`${value} 폴더를 만들었습니다`);
                }
                await loadFolders();
            } else if (result.message) {
                showToast(result.message);
            }
            pendingShareBookmarkReopen = false;
            activeShareBookmarkPostId = "";
            activeShareBookmarkNewsId = "";
            activeShareBookmarkType = "post";
            closeModal();
        });
    }

    if (
        bookmarkEditModal &&
        editModalCloseButton &&
        editModalSubmitButton &&
        editFolderNameInput &&
        editFolderNameCount
    ) {
        function updateEditModalState() {
            const value = editFolderNameInput.value.trim();
            editFolderNameCount.textContent = `${editFolderNameInput.value.length} / 25`;
            editModalSubmitButton.disabled =
                value.length === 0 || value === currentFolderName;
        }

        function resetEditModalForm() {
            editFolderNameInput.value = currentFolderName;
            updateEditModalState();
        }

        function closeEditModal() {
            toggleClassModal(bookmarkEditModal, false);
            updateBodyScrollLock();
        }

        function openEditModal() {
            closeDetailFolderMenu();
            resetEditModalForm();
            toggleClassModal(bookmarkEditModal, true);
            updateBodyScrollLock();
            window.setTimeout(() => {
                editFolderNameInput.focus();
                editFolderNameInput.select();
            }, 0);
        }

        detailFolderEditButton?.addEventListener("click", () => {
            openEditModal();
        });
        editModalDeleteButton?.addEventListener("click", () => {
            closeEditModal();
            openDeleteModal();
        });
        editModalCloseButton.addEventListener("click", closeEditModal);
        bookmarkEditModal.addEventListener("click", (event) => {
            if (event.target === bookmarkEditModal) {
                closeEditModal();
            }
        });
        editFolderNameInput.addEventListener("input", updateEditModalState);
        editModalSubmitButton.addEventListener("click", async () => {
            const value = editFolderNameInput.value.trim();
            if (!value || value === currentFolderName) return;
            if (!currentFolderId) return;
            editModalSubmitButton.disabled = true;
            await BookmarkService.updateFolder(currentFolderId, value);
            currentFolderName = value;
            syncFolderNameUI();
            setHeaderTitle(value);
            closeEditModal();
            await loadFolders();
            showToast("폴더를 수정했습니다");
        });
    }

    if (
        bookmarkDeleteModal &&
        deleteModalSubmitButton &&
        deleteModalCancelButton
    ) {
        deleteModalSubmitButton.addEventListener("click", deleteCurrentFolder);
        deleteModalCancelButton.addEventListener("click", closeDeleteModal);
        bookmarkDeleteModal.addEventListener("click", (event) => {
            if (event.target === bookmarkDeleteModal) {
                closeDeleteModal();
            }
        });
    }

    shareBookmarkModal?.addEventListener("click", (event) => {
        if (
            event.target.closest("[data-share-close='true']") ||
            event.target.classList.contains("bookmark-share-sheet-backdrop")
        ) {
            closeShareModal();
            return;
        }
    });

    shareBookmarkCreateFolder?.addEventListener("click", () => {
        pendingShareBookmarkReopen = true;
        closeShareModal();
        modalOpenButton?.click();
    });

    shareBookmarkModal?.addEventListener("click", async (event) => {
        const folderBtn = event.target.closest("[data-share-folder-id]");
        if (!folderBtn) return;
        const folderId = folderBtn.dataset.shareFolderId || null;
        const saved = await addActiveShareBookmarkToFolder(folderId);
        if (!saved) return;

        if (activeShareBookmarkButton) {
            setBookmarkButtonState(activeShareBookmarkButton, true);
        }
        closeShareModal();
        const folderName = folderBtn.querySelector(".bookmark-share-sheet-folder-name")?.textContent || "폴더";
        showToast(`${folderName}에 추가했습니다`);
    });

    shareDropdown?.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-share-action]");
        if (!actionButton || !activeShareButton) {
            return;
        }
        const action = actionButton.dataset.shareAction;
        if (action === "copy") {
            copyShareLink(activeShareButton);
            return;
        }
        if (action === "bookmark") {
            openShareBookmarkModal(activeShareButton);
        }
    });

    bookmarkBlockModal?.addEventListener("click", (event) => {
        if (
            event.target === bookmarkBlockModal ||
            event.target === bookmarkBlockCancelButton
        ) {
            closeBookmarkNotificationModal();
        }
    });

    bookmarkBlockConfirmButton?.addEventListener("click", async () => {
        const handle = activeMorePostMeta?.handle || "@user";
        const targetMemberId = activeMorePostMeta?.postMemberId;
        const targetPostCard = activeMorePostMeta?.postCard;
        if (targetMemberId && typeof memberId !== "undefined" && memberId) {
            await fetch("/api/main/blocks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blockerId: memberId, blockedId: Number(targetMemberId) }),
            });
            bookmarkPosts?.querySelectorAll(`.bookmark-post[data-post-member-id="${targetMemberId}"]`).forEach(card => card.remove());
            syncBookmarkPostsEmpty();
        }
        closeBookmarkNotificationModal();
        showToast(`${handle} 님을 차단했습니다`);
    });

    bookmarkReportModal?.addEventListener("click", async (event) => {
        if (
            event.target === bookmarkReportModal ||
            event.target.closest("#bookmarkReportCloseButton")
        ) {
            closeBookmarkNotificationModal();
            return;
        }
        const reportItem = event.target.closest("[data-report-reason]");
        if (!reportItem) {
            return;
        }
        const reason = reportItem.dataset.reportReason || "신고";
        const reportPostId = activeMorePostMeta?.postId;
        if (reportPostId && typeof memberId !== "undefined" && memberId) {
            await fetch("/api/main/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reporterId: memberId, targetId: Number(reportPostId), targetType: "post", reason: reason }),
            });
            const reportedCard = bookmarkPosts?.querySelector(`.bookmark-post[data-post-id="${reportPostId}"]`);
            if (reportedCard) {
                reportedCard.remove();
                syncBookmarkPostsEmpty();
            }
        }
        closeBookmarkNotificationModal();
        showToast("신고가 접수되었습니다");
    });

    mediaPreviewClose?.addEventListener("click", closeMediaPreview);
    mediaPreviewOverlay?.addEventListener("click", (event) => {
        if (event.target === mediaPreviewOverlay) {
            closeMediaPreview();
        }
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        const mediaTarget = target.closest("[data-media-preview='true']");
        if (mediaTarget && mediaPreviewOverlay && mediaPreviewImage) {
            mediaPreviewImage.src = mediaTarget.getAttribute("src") || "";
            mediaPreviewImage.alt =
                mediaTarget.getAttribute("alt") || "게시물 이미지 미리보기";
            mediaPreviewOverlay.hidden = false;
            updateBodyScrollLock();
            return;
        }

        const postTextToggle = target.closest(".bookmark-post-text-toggle");
        if (postTextToggle) {
            const postText = postTextToggle.closest("[data-expandable-text='true']");
            const postTextContent = postText?.querySelector(
                ".bookmark-post-text-content",
            );
            if (postText && postTextContent) {
                postTextContent.textContent = postText.dataset.fullText || "";
                postTextToggle.hidden = true;
            }
            return;
        }

        const moreButton = target.closest("[data-post-more]");
        if (moreButton) {
            const menu =
                moreButton.parentElement?.querySelector(".bookmark-post-more-menu");
            const willOpen = Boolean(menu?.hidden);
            closeShareDropdown();
            resetPostMoreMenus();
            if (menu && willOpen) {
                const meta = getBookmarkMoreMeta(moreButton);
                syncBookmarkMoreMenu(menu, meta.handle);
                menu.hidden = false;
                moreButton.setAttribute("aria-expanded", "true");
            }
            return;
        }

        const moreMenuItem = target.closest("[data-more-action]");
        if (moreMenuItem) {
            const action = moreMenuItem.getAttribute("data-more-action");
            if (action) {
                handleBookmarkMoreAction(action, moreMenuItem);
            }
            return;
        }

        const actionButton = target.closest(".bookmark-post-action[data-action]");
        if (actionButton) {
            const action = actionButton.dataset.action;
            const countNode = actionButton.querySelector("span");
            if (action !== "share") {
                closeShareDropdown();
            }

            // 답글 트리거는 공용 답글 모달(post-modal.js setupReply)이 처리한다.
            // 자체 답글 모달 마크업/CSS는 Phase 3 후속 PR에서 통째 제거 예정.

            if (action === "like") {
                const isActive = !actionButton.classList.contains("active");
                const path = actionButton.querySelector("path");
                const postCard = actionButton.closest(".bookmark-post");
                const postId = postCard?.dataset.postId;
                const baseCount = Number.parseInt(
                    actionButton.dataset.baseCount || "0",
                    10,
                );
                const nextCount = isActive ? baseCount + 1 : baseCount;
                actionButton.classList.toggle("active", isActive);
                actionButton.setAttribute("aria-label", `마음 ${nextCount}`);
                if (countNode) {
                    countNode.textContent = String(nextCount);
                }
                if (path) {
                    path.setAttribute(
                        "d",
                        isActive
                            ? path.dataset.pathActive || path.getAttribute("d")
                            : path.dataset.pathInactive || path.getAttribute("d"),
                    );
                }
                if (postId && typeof memberId !== "undefined" && memberId) {
                    if (isActive) {
                        fetch("/api/main/likes", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ memberId: memberId, postId: Number(postId) }),
                        });
                    } else {
                        fetch(`/api/main/likes/posts/${postId}/delete`, { method: "POST" });
                    }
                }
                return;
            }

            if (action === "bookmark") {
                if (actionButton.classList.contains("active")) {
                    const card = actionButton.closest(".bookmark-post");
                    if (card) removeBookmarkedPost(card);
                } else {
                    setBookmarkButtonState(actionButton, true);
                }
                return;
            }

            if (action === "share") {
                if (
                    activeShareButton === actionButton &&
                    activeShareDropdown
                ) {
                    closeShareDropdown();
                    return;
                }
                openShareDropdown(actionButton);
                return;
            }
        }

        // 게시글 클릭 시 상세 페이지 이동
        const clickedPost = target.closest(".bookmark-post");
        if (clickedPost && !target.closest(".bookmark-post-action, .bookmark-post-more-wrap, .bookmark-post-more-menu, [data-more-action], [data-media-preview]")) {
            const bookmarkType = clickedPost.dataset.bookmarkType;
            if (bookmarkType === "news") {
                const newsId = clickedPost.dataset.newsId;
                if (newsId) {
                    window.location.href = `/news/detail/${newsId}`;
                    return;
                }
            } else {
                const postId = clickedPost.dataset.postId;
                if (postId && typeof memberId !== "undefined" && memberId) {
                    window.location.href = `/main/post/detail/${postId}?memberId=${memberId}`;
                    return;
                }
            }
        }

        if (!target.closest("#shareDropdown .dropdown-menu")) {
            closeShareDropdown();
        }

        if (
            !target.closest("#detailFolderMenu") &&
            !target.closest("#detailMoreButton")
        ) {
            closeDetailFolderMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }
        if (activeShareModal) {
            closeShareModal();
            updateBodyScrollLock();
            return;
        }
        if (bookmarkModal?.classList.contains("is-open")) {
            bookmarkModal.classList.remove("is-open");
            bookmarkModal.setAttribute("aria-hidden", "true");
            updateBodyScrollLock();
            return;
        }
        if (bookmarkEditModal?.classList.contains("is-open")) {
            bookmarkEditModal.classList.remove("is-open");
            bookmarkEditModal.setAttribute("aria-hidden", "true");
            updateBodyScrollLock();
            return;
        }
        if (bookmarkDeleteModal?.classList.contains("is-open")) {
            closeDeleteModal();
            return;
        }
        if (isBookmarkNotificationModalOpen()) {
            closeBookmarkNotificationModal();
            return;
        }
        if (mediaPreviewOverlay?.hidden === false) {
            closeMediaPreview();
            return;
        }
        if (detailFolderMenu && !detailFolderMenu.hidden) {
            closeDetailFolderMenu();
            return;
        }
        if (activeShareDropdown) {
            closeShareDropdown();
            return;
        }
        const openedMenu = document.querySelector(".bookmark-post-more-menu:not([hidden])");
        if (openedMenu) {
            closePostMenus();
        }
    });

    window.addEventListener("resize", () => {
        if (detailFolderMenu && !detailFolderMenu.hidden) {
            positionDetailFolderMenu();
        }
        closeShareDropdown();
        resetPostMoreMenus();
    });

    window.addEventListener(
        "scroll",
        () => {
            if (detailFolderMenu && !detailFolderMenu.hidden) {
                positionDetailFolderMenu();
            }
            closeShareDropdown();
            resetPostMoreMenus();
        },
        true,
    );


    // ── 페이지 초기화: 폴더 목록 로드 ──
    (async () => {
        await loadFolders();
        const params = new URLSearchParams(window.location.search);
        const folderIdParam = params.get("folderId");
        const isUncategorized = params.get("uncategorized") === "1";
        if (folderIdParam) {
            const btn = bookmarkFolderList?.querySelector(
                `[data-folder-id="${CSS.escape(folderIdParam)}"]`
            );
            const folderName = btn?.dataset.bookmarkFolder || "북마크";
            currentFolderId = folderIdParam;
            openBookmarkDetail(folderName);
            window.history.replaceState(
                {bookmarkView: "detail", folderId: folderIdParam, folderName},
                "",
                buildBookmarkUrl(folderIdParam)
            );
            loadFolderBookmarks(folderIdParam);
        } else if (isUncategorized) {
            currentFolderId = null;
            const folderName = "미분류";
            openBookmarkDetail(folderName);
            window.history.replaceState(
                {bookmarkView: "detail", folderId: "", folderName},
                "",
                buildBookmarkUrl("")
            );
            loadUncategorizedBookmarks();
        } else {
            window.history.replaceState({bookmarkView: "list"}, "", "/bookmark");
        }
    })();

})();
