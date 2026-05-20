/**
 * bookmark/service.js — 북마크 API 통신 모듈
 */
const BookmarkService = (function () {
    "use strict";

    const BASE = "/api/bookmarks";

    async function request(url, options = {}) {
        try {
            const res = await fetch(url, {
                headers: { "Content-Type": "application/json" },
                ...options,
            });
            if (res.status === 401) {
                window.location.href = "/member/login";
                return { ok: false, status: 401 };
            }
            if (res.status === 409) {
                return { ok: false, status: 409, message: "이 폴더에 이미 북마크된 게시물입니다" };
            }
            if (!res.ok) {
                return { ok: false, status: res.status, message: "오류가 발생했습니다" };
            }
            const text = await res.text();
            return { ok: true, data: text ? JSON.parse(text) : null };
        } catch (e) {
            return { ok: false, status: 0, message: "네트워크 오류가 발생했습니다" };
        }
    }

    return {
        // 폴더
        getFolders: (memberId) => request(`${BASE}/folders/${memberId}`),
        createFolder: (memberId, folderName) => request(`${BASE}/folders`, {
            method: "POST", body: JSON.stringify({ memberId, folderName }),
        }),
        updateFolder: (id, folderName) => request(`${BASE}/folders`, {
            method: "PUT", body: JSON.stringify({ id, folderName }),
        }),
        deleteFolder: (id) => request(`${BASE}/folders/${id}/delete`, { method: "POST" }),

        // 북마크
        getAll: (memberId) => request(`${BASE}/members/${memberId}`),
        getByMemberAndPost: (memberId, postId) => request(`${BASE}/members/${memberId}/posts/${postId}`),
        getByMemberAndNews: (memberId, newsId) => request(`${BASE}/members/${memberId}/news/${newsId}`),
        getByFolder: (folderId) => request(`${BASE}/folders/${folderId}/items`),
        getUncategorized: (memberId) => request(`${BASE}/members/${memberId}/uncategorized`),
        add: (memberId, postId, folderId) => {
            const body = { memberId, postId };
            if (folderId) body.folderId = folderId;
            return request(BASE, { method: "POST", body: JSON.stringify(body) });
        },
        addNews: (memberId, newsId, folderId) => {
            const body = { memberId, newsId };
            if (folderId) body.folderId = folderId;
            return request(`${BASE}/news`, { method: "POST", body: JSON.stringify(body) });
        },
        remove: (id) => request(`${BASE}/${id}/delete`, { method: "POST" }),
        removeByPost: (memberId, postId) => request(`${BASE}/members/${memberId}/posts/${postId}/delete`, { method: "POST" }),
        moveFolder: (id, folderId) => request(`${BASE}/${id}/folder`, {
            method: "PUT", body: JSON.stringify({ folderId }),
        }),
        moveNewsFolder: (id, folderId) => request(`${BASE}/news/${id}/folder`, {
            method: "PUT", body: JSON.stringify({ folderId }),
        }),
    };
})();
