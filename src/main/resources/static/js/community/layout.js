const CommunityLayout = {

    escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    },

    // ─── 홈 탭: 내 커뮤니티 가로 카드 슬라이드 ───
    renderCommunityCard(community) {
        const name = this.escapeHtml(community.communityName);
        const cover = community.coverFilePath
            ? `<img src="${community.coverFilePath}" alt="${name}" onerror="this.style.display='none'">`
            : '';
        return `
        <article class="communityCard" data-community-id="${community.id}">
            <div class="communityCard__cover">${cover}</div>
            <strong class="communityCard__name">${name}</strong>
        </article>`;
    },

    // ─── 탐색 탭: 커뮤니티 리스트 아이템 ───
    renderCommunityListItem(community) {
        const name = this.escapeHtml(community.communityName);
        const desc = this.escapeHtml(community.description ?? "");
        const category = this.escapeHtml(community.categoryName ?? "");
        const cover = community.coverFilePath
            ? `<img src="${community.coverFilePath}" alt="${name}" class="communityListItem__img" onerror="this.style.display='none'">`
            : `<div class="communityListItem__imgPlaceholder"></div>`;
        return `
        <article class="communityListItem" data-community-id="${community.id}">
            <div class="communityListItem__cover">${cover}</div>
            <div class="communityListItem__info">
                <strong class="communityListItem__name">${name}</strong>
                <span class="communityListItem__meta">멤버 ${community.memberCount}명 · 게시글 ${community.postCount}개</span>
                ${category ? `<span class="communityListItem__category">${category}</span>` : ''}
                ${desc ? `<p class="communityListItem__desc">${desc}</p>` : ''}
            </div>
        </article>`;
    },

    // ─── 홈/탐색 피드: 커뮤니티 게시글 카드 (커뮤니티명 라벨 + tweet-action-bar) ───
    renderCommunityPostCard(post) {
        const communityName = this.escapeHtml(post.communityName ?? "");
        const nickname = this.escapeHtml(post.memberNickname);
        const rawHandle = this.escapeHtml(post.memberHandle);
        const handle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
        const title = this.escapeHtml(post.postTitle);
        const content = this.escapeHtml(post.postContent);
        // Java boolean isLiked/isBookmarked → Jackson 직렬화 시 liked/bookmarked 로 떨어짐
        const isLiked = post.liked === true || post.isLiked === true;
        const isBookmarked = post.bookmarked === true || post.isBookmarked === true;
        const isFollowed = post.followed === true || post.isFollowed === true;

        let mediaHtml = "";
        if (post.postFiles && post.postFiles.length > 0) {
            const count = post.postFiles.length;
            const gridClass = count >= 4 ? "postMediaGrid--4" : count === 3 ? "postMediaGrid--3" : count === 2 ? "postMediaGrid--2" : "";
            const items = post.postFiles.map(pf => `<img class="postMediaImage" src="${pf.filePath}" onerror="this.style.display='none'">`).join("");
            mediaHtml = `<div class="postMedia"><div class="postMediaGrid ${gridClass}">${items}</div></div>`;
        }

        return `
        <article class="postCard communityPostCard" data-post-id="${post.id}" data-member-id="${post.memberId}" data-community-id="${post.communityId}" data-is-followed="${isFollowed ? 'true' : 'false'}">
            <div class="postBody">
                <header class="postHeader">
                    <div class="postIdentity">
                        <div class="postAvatar" data-profile-id="${post.memberId}">
                            <img class="postAvatarImage" src="${post.memberProfileFileName || '/images/profile/default_image.png'}" alt="" onerror="this.src='/images/profile/default_image.png'">
                        </div>
                        <div class="postIdentity__copy">
                            <div class="communityPostMeta">
                                <a class="communityPostMeta__text" href="/community/${post.communityId}">${communityName}</a>
                                ${post.categoryName ? `<span class="communityPostMeta__category">${this.escapeHtml(post.categoryName)}</span>` : ''}
                            </div>
                            <div class="postIdentity__nameRow">
                                <strong class="postName">${nickname}</strong>
                            </div>
                            <div class="postIdentity__metaRow">
                                <span class="postHandle">${handle}</span>
                                <span class="postIdentity__sep">·</span>
                                <span class="postTime">${post.createdDatetime}</span>
                            </div>
                        </div>
                    </div>
                    <button class="postMoreButton" type="button" aria-label="게시물 더 보기">
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="postMoreIcon"><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
                    </button>
                </header>
                ${title ? `<p class="postTitle">${title}</p>` : ''}
                <p class="postText">${content}</p>
                ${mediaHtml}
                <footer class="postMetrics">
                    <div class="tweet-action-bar">
                        <button class="tweet-action-btn" data-testid="reply" data-action="reply" data-post-id="${post.id}">
                            <svg class="tweet-action-icon" viewBox="0 0 24 24"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                            <span class="tweet-action-count">${post.replyCount ?? 0}</span>
                        </button>
                        <button class="tweet-action-btn tweet-action-btn--like ${isLiked ? 'active' : ''}" data-post-id="${post.id}">
                            <svg class="tweet-action-icon" viewBox="0 0 24 24"><g><path d="${isLiked
                                ? 'M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z'
                                : 'M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z'}"></path></g></svg>
                            <span class="tweet-action-count">${post.likeCount ?? 0}</span>
                        </button>
                        <button class="tweet-action-btn tweet-action-btn--views" aria-label="조회수 ${post.postReadCount ?? 0}">
                            <svg class="tweet-action-icon" viewBox="0 0 24 24"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
                            <span class="tweet-action-count">${post.postReadCount ?? 0}</span>
                        </button>
                        <div class="tweet-action-right">
                            <button class="tweet-action-btn tweet-action-btn--bookmark ${isBookmarked ? 'active' : ''}" data-post-id="${post.id}">
                                <svg class="tweet-action-icon" viewBox="0 0 24 24"><g><path d="${isBookmarked
                                    ? 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z'
                                    : 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z'}"></path></g></svg>
                            </button>
                            <button class="tweet-action-btn tweet-action-btn--share">
                                <svg class="tweet-action-icon" viewBox="0 0 24 24"><g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></g></svg>
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </article>`;
    },

    // ─── 빈 상태 ───
    renderEmptyState(message) {
        return `<div class="communityEmpty"><p>${this.escapeHtml(message)}</p></div>`;
    },

    // 공용 답글 모달의 source avatar fallback (카드에 avatar 없을 때).
    buildAvatarDataUri(label) {
        const safe = String(label || "?").slice(0, 1).replace(/[&<>"']/g, "");
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#cfe8fc"></rect><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#1d9bf0">' + safe + '</text></svg>';
        return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
    },

    // 공용 모달의 @ mention 드롭다운.
    buildMentionDropdown(members) {
        return members.map((m, i) => {
            const profileImg = m.profileFileName ? m.profileFileName : "/images/profile/default_image.png";
            return `<button type="button" class="mention-item${i === 0 ? " active" : ""}" data-handle="${m.memberHandle}" data-member-id="${m.id}">
                <img class="mention-item-avatar" src="${profileImg}" alt="" onerror="this.src='/images/profile/default_image.png'">
                <div class="mention-item-info">
                    <span class="mention-item-name">${m.memberName || m.memberHandle}</span>
                    <span class="mention-item-handle">${m.memberHandle}</span>
                </div>
            </button>`;
        }).join("");
    },
};
