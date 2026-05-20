/**
 * Notification/service.js — 알림 API 통신 + DOM 렌더링
 */
const NotificationService = (function () {
    "use strict";

    const BASE = "/api/notifications";
    const container = document.getElementById("notif-list-container");

    // ── API 통신 ──
    async function request(url, options = {}) {
        try {
            const res = await fetch(url, {
                headers: { "Content-Type": "application/json" },
                ...options,
            });
            if (res.status === 401) {
                window.location.href = "/member/login";
                return { ok: false };
            }
            if (!res.ok) return { ok: false };
            const text = await res.text();
            return { ok: true, data: text ? JSON.parse(text) : null };
        } catch (e) {
            return { ok: false };
        }
    }

    function getAll(recipientId) {
        return request(`${BASE}/${recipientId}`);
    }

    function getMentions(recipientId) {
        return request(`${BASE}/${recipientId}/mentions`);
    }

    function markAsRead(id) {
        return request(`${BASE}/${id}/read`, { method: "PUT" });
    }

    function markAllAsRead(recipientId) {
        return request(`${BASE}/${recipientId}/read-all`, { method: "PUT" });
    }

    function deleteOne(id) {
        return request(`${BASE}/${id}`, { method: "DELETE" });
    }

    function getUnreadCount(recipientId) {
        return request(`${BASE}/${recipientId}/unread-count`);
    }

    // ── 게시물 액션 API (기존 MainAPIController 재사용) ──
    async function addLike(memberId, postId) {
        await fetch('/api/main/likes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId, postId })
        });
    }

    async function deleteLike(memberId, postId) {
        await fetch(`/api/main/likes/posts/${postId}/delete`, { method: 'POST' });
    }

    async function addBookmark(memberId, postId) {
        await fetch('/api/main/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId, postId })
        });
    }

    async function deleteBookmark(memberId, postId) {
        await fetch(`/api/main/bookmarks/members/${memberId}/posts/${postId}/delete`, { method: 'POST' });
    }

    async function writeReply(postId, formData) {
        await fetch(`/api/main/posts/${postId}/replies`, {
            method: 'POST',
            body: formData
        });
    }

    async function searchMentionMembers(keyword, memberId) {
        const response = await fetch(`/api/main/mentions/search?keyword=${encodeURIComponent(keyword)}&memberId=${memberId}`);
        return await response.json();
    }

    // ── 시간 포맷 ──
    function formatTime(datetimeStr) {
        if (!datetimeStr) return "";
        const date = new Date(datetimeStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "방금";
        if (minutes < 60) return minutes + "분";
        if (hours < 24) return hours + "시간";
        if (days < 7) return days + "일";
        return (date.getMonth() + 1) + "월 " + date.getDate() + "일";
    }

    // ── 아이콘 SVG ──
    const ICONS = {
        connect: `<svg viewBox="0 0 24 24" aria-hidden="true" class="notif-icon notif-icon--follow"><g><path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z"></path></g></svg>`,
        approve: `<svg viewBox="0 0 24 24" aria-hidden="true" class="notif-icon notif-icon--follow"><g><path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z"></path></g></svg>`,
        like: `<svg viewBox="0 0 24 24" aria-hidden="true" class="notif-icon notif-icon--like"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" style="fill:#f91880;"></path></g></svg>`,
        post: `<svg viewBox="0 0 24 24" aria-hidden="true" class="notif-icon notif-icon--bell"><g><path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958C19.48 5.017 16.054 2 11.996 2zM9.171 18h5.658c-.412 1.165-1.523 2-2.829 2s-2.417-.835-2.829-2z"></path></g></svg>`,
        reply: `<svg viewBox="0 0 24 24" aria-hidden="true" class="notif-icon notif-icon--bell"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z"></path></g></svg>`,
        message: `<svg viewBox="0 0 24 24" aria-hidden="true" class="notif-icon notif-icon--bell"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13z"></path></g></svg>`,
        estimation: `<svg viewBox="0 0 24 24" aria-hidden="true" class="notif-icon notif-icon--bell"><g><path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958C19.48 5.017 16.054 2 11.996 2zM9.171 18h5.658c-.412 1.165-1.523 2-2.829 2s-2.417-.835-2.829-2z"></path></g></svg>`,
        system: `<svg viewBox="0 0 24 24" aria-hidden="true" class="notif-icon notif-icon--lock"><g><path d="M17.5 7H17v-.25c0-2.76-2.24-5-5-5s-5 2.24-5 5V7h-.5C5.12 7 4 8.12 4 9.5v9C4 19.88 5.12 21 6.5 21h11c1.39 0 2.5-1.12 2.5-2.5v-9C20 8.12 18.89 7 17.5 7zM13 14.73V17h-2v-2.27c-.59-.34-1-.99-1-1.73 0-1.1.9-2 2-2 1.11 0 2 .9 2 2 0 .74-.4 1.39-1 1.73zM15 7H9v-.25c0-1.66 1.35-3 3-3 1.66 0 3 1.34 3 3V7z"></path></g></svg>`,
        handle: `<svg viewBox="0 0 24 24" aria-hidden="true" class="notif-icon notif-icon--bell"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z"></path></g></svg>`,
    };

    // ── notification_type → 프론트 data-notif-type 매핑 ──
    function mapType(type) {
        const map = {
            connect: "follow",
            approve: "follow",
            like: "follow",
            post: "post",
            reply: "mention",
            message: "post",
            estimation: "post",
            system: "system",
            handle: "mention",
        };
        return map[type] || "system";
    }

    // ── 알림 타입별 이동 링크 ──
    function getNotificationLink(n) {
        switch (n.notificationType) {
            case "connect":
            case "approve":
                return n.senderId ? `/mypage?memberId=${n.senderId}` : null;
            case "like":
            case "post":
            case "reply":
            case "handle":
                return n.targetId ? `/main/post/detail/${n.targetId}?memberId=${MEMBER_ID}` : null;
            case "message":
                return `/chat`;
            case "estimation":
                return `/estimation/list`;
            default:
                return null;
        }
    }

    // 알림 타입별 아바타 결정 — 시스템 알림은 발신자가 없으므로 로고, 그 외엔 발신자 프로필(없으면 기본 아바타)
    function resolveAvatar(n) {
        if (n.notificationType === "system" || !n.senderId) {
            return "/images/main/global-gates-logo.png";
        }
        return n.senderProfileImage || "/images/profile/default_image.png";
    }

    // ── DOM 렌더링: 일반 알림 ──
    function renderStandardItem(n) {
        const type = n.notificationType;
        const profileImg = resolveAvatar(n);
        const name = n.senderName || "";
        const handle = n.senderHandle || "";
        const time = formatTime(n.createdDatetime);
        const readClass = n.read ? " notif-item--read" : "";
        const link = getNotificationLink(n);
        const hrefAttr = link ? ` data-href="${link}"` : "";

        return `
        <article class="notif-item${readClass}" role="article" tabindex="0"
                 data-testid="notification" data-notif-type="${mapType(type)}" data-notif-id="${n.id}"${hrefAttr}>
            <div class="notif-item__inner">
                <div class="notif-item__icon-col">
                    ${ICONS[type] || ICONS.system}
                </div>
                <div class="notif-item__body">
                    ${name ? `
                    <ul class="notif-avatar-list" role="list">
                        <li class="notif-avatar-item">
                            <a href="/mypage?memberId=${n.senderId}" aria-hidden="true" role="link" tabindex="-1" class="notif-avatar-link">
                                <img src="${profileImg}" alt="" draggable="true" class="notif-avatar"/>
                            </a>
                        </li>
                    </ul>` : ""}
                    <div class="notif-content">
                        <p class="notif-message">
                            ${name ? `<a href="/mypage?memberId=${n.senderId}" role="link" class="notif-username">${name}</a>${type === "connect" ? "님이" : ""} ` : ""}${n.content || n.title}
                            <span class="notif-sep" aria-hidden="true">&middot;</span>
                            <time class="notif-time" datetime="${n.createdDatetime || ""}">${time}</time>
                        </p>
                        ${n.postContent ? `<p class="notif-description">${n.postContent}</p>` : ""}
                    </div>
                </div>
            </div>
        </article>`;
    }

    // ── DOM 렌더링: 멘션(handle/reply) 알림 ──
    function renderMentionItem(n) {
        const profileImg = resolveAvatar(n);
        const name = n.senderName || "";
        const handle = n.senderHandle || "";
        const time = formatTime(n.createdDatetime);
        const postText = n.postContent || n.content || "";
        const readClass = n.read ? " notif-item--read" : "";
        const link = getNotificationLink(n);
        const hrefAttr = link ? ` data-href="${link}"` : "";

        return `
        <article class="notif-tweet-item${readClass}" role="article" tabindex="0"
                 data-testid="tweet" data-notif-type="mention" data-notif-id="${n.id}" data-target-id="${n.targetId || ''}"${hrefAttr}>
            <div class="notif-item__inner">
                <div class="tweet-body">
                    <div class="tweet-header">
                        <a href="/mypage?memberId=${n.senderId}" class="tweet-avatar-link" aria-hidden="true" role="link" tabindex="-1">
                            <img src="${profileImg}" alt="" draggable="true" class="tweet-avatar"/>
                        </a>
                        <div class="tweet-meta">
                            <a href="/mypage?memberId=${n.senderId}" role="link" class="tweet-displayname">${name}</a>
                            <a href="/mypage?memberId=${n.senderId}" role="link" tabindex="-1" class="tweet-handle">${handle}</a>
                            <span class="tweet-sep">&middot;</span>
                            <time class="tweet-time" datetime="${n.createdDatetime || ""}">${time}</time>
                        </div>
                    </div>
                    <p class="tweet-text">${postText}</p>
                    <div class="tweet-action-bar">
                        <button type="button" class="tweet-action-btn" data-testid="reply" data-action="reply" aria-label="답글">
                            <svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-action-icon"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                        </button>
                        <button type="button" class="tweet-action-btn tweet-action-btn--like" data-testid="like" aria-label="0 마음에 들어요">
                            <svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-action-icon"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" data-path-inactive="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" data-path-active="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                            <span class="tweet-action-count"></span>
                        </button>
                    </div>
                </div>
            </div>
        </article>`;
    }

    // ── 알림 렌더링 분기 ──
    function renderItem(n) {
        const type = n.notificationType;
        if (type === "handle" || type === "reply") {
            return renderMentionItem(n);
        }
        return renderStandardItem(n);
    }

    // ── 목록 렌더링 ──
    function renderList(notifications, emptyMessage = "알림이 없습니다.") {
        if (!container) return;
        if (!notifications || notifications.length === 0) {
            container.innerHTML = `<div class="notif-empty" style="text-align:center;padding:40px 20px;color:#536471;">${emptyMessage}</div>`;
            return;
        }
        container.innerHTML = notifications.map(renderItem).join("");
        // 알림 클릭 시 해당 페이지로 이동 + 읽음 처리
        container.querySelectorAll("[data-href]").forEach((el) => {
            el.addEventListener("click", (e) => {
                // 내부 a태그, 버튼 클릭은 자체 동작 유지
                if (e.target.closest("a, button")) return;
                const id = el.dataset.notifId;
                if (id) markAsRead(id);
                window.location.href = el.dataset.href;
            });
        });
        // 동적 렌더링 후 event.js의 이벤트 바인딩 재실행
        if (typeof window.bindNotificationItemEvents === "function") {
            window.bindNotificationItemEvents();
        }
    }

    // ── 초기 로드 ──
    async function loadAll() {
        if (!MEMBER_ID || MEMBER_ID === 0) return;
        const res = await getAll(MEMBER_ID);
        if (res.ok) renderList(res.data);
    }

    async function loadMentions() {
        if (!MEMBER_ID || MEMBER_ID === 0) return;
        const res = await getMentions(MEMBER_ID);
        if (res.ok) renderList(res.data, "멘션이 없습니다.");
    }

    // 현재 활성화된 탭 기준으로 목록 새로고침 — '전체'면 loadAll, '멘션'이면 loadMentions
    function reloadCurrentTab() {
        const activeTab = document.querySelector(".notif-tab--active");
        const type = activeTab ? activeTab.getAttribute("data-notif-tab") : "all";
        if (type === "mentions") loadMentions();
        else loadAll();
    }

    // 좌측 nav의 알림 배지도 함께 갱신 — header.js가 노출한 함수가 있으면 호출
    function refreshNavBadge() {
        if (typeof window.refreshNotificationBadge === "function") {
            window.refreshNotificationBadge();
        }
    }

    // ── 탭 전환 연동 ──
    document.querySelectorAll("[data-notif-tab]").forEach((tab) => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            const type = tab.getAttribute("data-notif-tab");
            if (type === "all") loadAll();
            else if (type === "mentions") loadMentions();
        });
    });

    // ── 전체 읽음 버튼 ──
    document.querySelectorAll("[data-notif-mark-all]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            if (!MEMBER_ID || MEMBER_ID === 0) return;
            btn.disabled = true;
            try {
                const res = await markAllAsRead(MEMBER_ID);
                if (res.ok) {
                    reloadCurrentTab();
                    refreshNavBadge();
                }
            } finally {
                btn.disabled = false;
            }
        });
    });

    // 페이지 로드 시 전체 알림 가져오기
    document.addEventListener("DOMContentLoaded", loadAll);

    return {
        getAll,
        getMentions,
        markAsRead,
        markAllAsRead,
        deleteOne,
        getUnreadCount,
        loadAll,
        loadMentions,
        renderList,
        addLike,
        deleteLike,
        addBookmark,
        deleteBookmark,
        writeReply,
        searchMentionMembers,
    };
})();
