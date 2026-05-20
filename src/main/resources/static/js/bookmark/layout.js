/**
 * bookmark/layout.js — 북마크 페이지 UI 렌더링 모듈
 */
const BookmarkLayout = (function () {
    "use strict";

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function renderFolderItem(folder) {
        return `<button class="bookmark-item" type="button" data-bookmark-folder="${escapeHtml(folder.folderName)}" data-folder-id="${folder.id}" aria-label="${escapeHtml(folder.folderName)} 북마크 열기">
            <span class="bookmark-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6.75 3h10.5A2.25 2.25 0 0119.5 5.25v15.07a.75.75 0 01-1.2.6L12 16.2l-6.3 4.72a.75.75 0 01-1.2-.6V5.25A2.25 2.25 0 016.75 3z"/></svg></span>
            <span class="bookmark-item-label">${escapeHtml(folder.folderName)}</span>
            <span class="bookmark-item-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z"/></svg></span>
        </button>`;
    }

    function renderFolderList(container, folders) {
        if (!container) return;
        let html = `<button class="bookmark-item" type="button" data-bookmark-folder="미분류" data-folder-id="" aria-label="미분류 북마크 열기">
            <span class="bookmark-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6.75 3h10.5A2.25 2.25 0 0119.5 5.25v15.07a.75.75 0 01-1.2.6L12 16.2l-6.3 4.72a.75.75 0 01-1.2-.6V5.25A2.25 2.25 0 016.75 3z"/></svg></span>
            <span class="bookmark-item-label">미분류</span>
            <span class="bookmark-item-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z"/></svg></span>
        </button>`;
        html += folders.map(renderFolderItem).join("");
        container.innerHTML = html;
    }

    function renderPostCard(b) {
        const isNews = b.bookmarkType === "news";
        const isDeleted = !b.postContent && !b.postTitle;
        const title = b.postTitle ? escapeHtml(b.postTitle) : (isDeleted ? (isNews ? "삭제된 뉴스" : "삭제된 게시물") : "");
        const content = b.postContent ? escapeHtml(b.postContent) : "";
        const nickname = isNews ? "뉴스" : (b.memberNickname ? escapeHtml(b.memberNickname) : (b.memberHandle ? escapeHtml(b.memberHandle.replace(/^@/, "")) : "사용자"));
        const rawHandle = b.memberHandle || "";
        const handle = rawHandle.startsWith("@") ? escapeHtml(rawHandle) : (rawHandle ? escapeHtml("@" + rawHandle) : "");
        const avatarInitial = (b.memberNickname || b.memberHandle || "?").charAt(0);
        const profileSrc = b.memberProfileFileName || "/images/profile/default_image.png";
        const avatarHtml = `<div class="postAvatar postAvatar--image"><img class="postAvatarImage" src="${escapeHtml(profileSrc)}" alt="${nickname} 프로필 이미지"/></div>`;
        const likeCount = b.likeCount || 0;
        const replyCount = b.replyCount || 0;
        const bookmarkCount = b.bookmarkCount || 0;
        const isLiked = b.liked || false;
        const postFiles = b.postFiles || [];
        const mediaHtml = postFiles.length > 0
            ? `<div class="bookmark-post-media bookmark-post-media--${Math.min(postFiles.length, 4)}">${postFiles.slice(0, 4).map(pf => `<img src="${escapeHtml(pf.filePath)}" alt="${escapeHtml(pf.originalName || '')}" class="bookmark-post-media-img" data-media-preview="true"/>`).join("")}</div>`
            : "";
        // 해시태그 (post 북마크에서만 데이터 채워짐, 뉴스/삭제 게시글은 빈 배열)
        const hashtags = b.hashtags || [];
        const hashtagHtml = hashtags.length > 0
            ? `<div class="postHashtags">${hashtags.map(tag => `<a class="postHashtag" href="/explore/search?keyword=${encodeURIComponent(tag.tagName)}">#${escapeHtml(tag.tagName)}</a>`).join(" ")}</div>`
            : "";
        return `<article class="bookmark-post postCard${isDeleted ? " bookmark-post--deleted" : ""}${isNews ? " bookmark-post--news" : ""}" data-post-id="${b.postId || ""}" data-news-id="${b.newsId || ""}" data-bookmark-type="${isNews ? "news" : "post"}" data-bookmark-id="${b.id}" data-post-member-id="${b.postMemberId || ""}">
            <div class="bookmark-post-body">
                <header class="bookmark-post-header">
                    <div class="bookmark-post-identity">
                        ${avatarHtml}
                        <div class="postIdentity__copy">
                            <div class="postIdentity__nameRow">
                                <strong class="postName">${nickname}</strong>
                            </div>
                            <div class="postIdentity__metaRow">
                                ${handle ? `<span class="postHandle">${handle}</span>` : ""}
                            </div>
                        </div>
                    </div>
                    <div class="bookmark-post-more-wrap">
                        <button class="bookmark-post-more" type="button" aria-label="게시물 더 보기" aria-haspopup="menu" aria-expanded="false" data-post-more>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
                        </button>
                        <div class="bookmark-post-more-menu dropdown-menu" role="menu" hidden>
                            <button type="button" class="menu-item menu-item--follow-toggle" role="menuitem" data-more-action="follow-toggle">
                                <span class="menu-item__icon" data-follow-icon><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></svg></span>
                                <span class="menu-item__label" data-follow-label>${handle ? `${handle}` : nickname} 님 팔로우하기</span>
                            </button>
                            <button type="button" class="menu-item menu-item--block" role="menuitem" data-more-action="block">
                                <span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></svg></span>
                                <span class="menu-item__label">${handle ? `${handle}` : nickname} 님 차단하기</span>
                            </button>
                            <button type="button" class="menu-item menu-item--report" role="menuitem" data-more-action="report">
                                <span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></svg></span>
                                <span class="menu-item__label">게시물 신고하기</span>
                            </button>
                        </div>
                    </div>
                </header>
                <p class="postText">${content}</p>
                ${hashtagHtml}
                ${mediaHtml}
                <footer class="bookmark-post-metrics">
                    <div class="bookmark-post-actions">
                        <button type="button" class="bookmark-post-action bookmark-post-action--reply tweet-action-btn" data-action="reply" aria-label="${replyCount} 답글">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></svg>
                            <span class="tweet-action-count">${replyCount}</span>
                        </button>
                        <button type="button" class="bookmark-post-action bookmark-post-action--like${isLiked ? " active" : ""}" data-action="like" data-base-count="${isLiked ? likeCount - 1 : likeCount}" aria-label="마음 ${likeCount}">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${isLiked ? "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" : "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"}" data-path-inactive="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" data-path-active="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></svg>
                            <span>${likeCount}</span>
                        </button>
                        <button type="button" class="bookmark-post-action" aria-label="조회수 ${bookmarkCount}">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></svg>
                            <span>${bookmarkCount}</span>
                        </button>
                        <div class="bookmark-post-action-right">
                            <button type="button" class="bookmark-post-action bookmark-post-action--bookmark active" data-action="bookmark" aria-label="북마크에 추가됨">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z" data-path-inactive="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" data-path-active="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"/></svg>
                            </button>
                            <button type="button" class="bookmark-post-action" data-action="share" aria-label="게시물 공유하기" aria-haspopup="menu" aria-expanded="false">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></svg>
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </article>`;
    }

    function renderPostList(container, bookmarks, emptyEl) {
        if (!container) return;
        if (!bookmarks || bookmarks.length === 0) {
            container.innerHTML = "";
            if (emptyEl) emptyEl.hidden = false;
            return;
        }
        if (emptyEl) emptyEl.hidden = true;
        container.innerHTML = bookmarks.map(renderPostCard).join("");
    }

    return {
        escapeHtml,
        renderFolderList,
        renderPostList,
        renderPostCard,
    };
})();