const CommunityDetailLayout = {

    escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    },

    // handle에서 @ 중복 방지
    formatHandle(handle) {
        const h = this.escapeHtml(handle);
        return h.startsWith("@") ? h : `@${h}`;
    },

    // ─── 상세 헤더 (배너 + 커뮤니티 정보, 원본 구조) ───
    renderHeader(community, myRole) {
        const name = this.escapeHtml(community.communityName);
        const desc = this.escapeHtml(community.description ?? "");
        const category = this.escapeHtml(community.categoryName ?? "");
        const isAdmin = myRole === "creator";
        const isJoined = community.isJoined ?? community.joined ?? false;

        const joinBtnHtml = (isJoined || isAdmin)
            ? `<button class="join-btn joined" data-action="leave"><span>나가기</span></button>`
            : `<button class="join-btn" data-action="join"><span>참여하기</span></button>`;

        return `
        <div class="community-banner">
            ${community.coverFilePath
                ? `<img src="${community.coverFilePath}" alt="${name}" id="bannerImg">`
                : ''}
            ${isAdmin ? `
            <label class="banner-camera-btn" aria-label="배너 이미지 변경">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M9.697 3H14.303l1.414 1.414h3.283A2 2 0 0 1 21 6.414v11.172A2 2 0 0 1 19 19.586H5a2 2 0 0 1-2-2V6.414a2 2 0 0 1 2-2h3.283L9.697 3ZM12 17.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"></path></svg>
                <input type="file" id="bannerFileInput" accept="image/*" hidden>
            </label>` : ''}
        </div>
        <div class="community-info">
            <h1 class="community-name">${name}</h1>
            ${category ? `<div class="community-category"><button class="category-tag">${category}</button></div>` : ''}
            <p class="community-desc">${desc}</p>
            <div class="community-actions">
                <span class="member-count"><strong>${community.memberCount}</strong> 멤버 · <strong>${community.postCount}</strong> 게시글</span>
                <div class="action-buttons">${joinBtnHtml}</div>
            </div>
        </div>`;
    },

    // ─── 게시글 카드 (메인 postCard 구조 동일) ───
    renderPostCard(post) {
        const nickname = this.escapeHtml(post.memberNickname);
        const handle = this.formatHandle(post.memberHandle);
        const title = this.escapeHtml(post.postTitle);
        const content = this.escapeHtml(post.postContent);
        // Java boolean isLiked/isBookmarked → Jackson 직렬화 시 liked/bookmarked 로 떨어짐
        const isLiked = post.liked === true || post.isLiked === true;
        const isBookmarked = post.bookmarked === true || post.isBookmarked === true;
        const isFollowed = post.followed === true || post.isFollowed === true;

        let mediaHtml = "";
        if (post.postFiles && post.postFiles.length > 0) {
            const isVideo = (path) => /\.(mp4|mov|webm|avi)(\?|$)/i.test(path);
            const count = post.postFiles.length;

            if (count === 1 && isVideo(post.postFiles[0].filePath)) {
                mediaHtml = `<div class="postMedia"><video class="postMediaVideo" controls><source src="${post.postFiles[0].filePath}"></video></div>`;
            } else {
                const gridClass = count >= 4 ? "postMediaGrid--4"
                    : count === 3 ? "postMediaGrid--3"
                    : count === 2 ? "postMediaGrid--2" : "";
                const items = post.postFiles.map(pf =>
                    `<img class="postMediaImage Post-Media-Img" src="${pf.filePath}" onerror="this.style.display='none'">`
                ).join("");
                mediaHtml = `<div class="postMedia"><div class="postMediaGrid ${gridClass}">${items}</div></div>`;
            }
        }

        const communityName = this.escapeHtml(post.communityName || '');
        const categoryName = this.escapeHtml(post.categoryName || '');
        const communityMetaHtml = communityName ? `
                            <div class="communityPostMeta">
                                <a class="communityPostMeta__text" href="/community/${post.communityId}">${communityName}</a>
                                ${categoryName ? `<span class="communityPostMeta__category">${categoryName}</span>` : ''}
                            </div>` : '';

        return `
        <article class="postCard communityPostCard" data-post-id="${post.id}" data-member-id="${post.memberId}" data-is-followed="${isFollowed ? 'true' : 'false'}">
            <div class="postBody">
                <header class="postHeader">
                    <div class="postIdentity">
                        <div class="postAvatar">
                            <img class="postAvatarImage" src="${post.memberProfileFileName || '/images/profile/default_image.png'}" alt="" onerror="this.src='/images/profile/default_image.png'">
                        </div>
                        <div class="postIdentity__copy">
                            ${communityMetaHtml}
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

    // ─── 미디어 그리드 (미디어 탭용) ───
    renderMediaItem(file) {
        return `
        <div class="communityMediaCell" data-file-id="${file.id}" data-post-id="${file.postId}">
            <img class="communityMediaCell__img Post-Media-Img" src="${file.filePath}" alt="${this.escapeHtml(file.originalName)}">
        </div>`;
    },

    // ─── 소개 탭 (커뮤니티 정보 + 관리자/멤버 목록 with Connect 버튼) ───
    renderAbout(community, members, loginMemberId) {
        const desc = this.escapeHtml(community.description ?? "");
        const creatorId = community.creatorId;
        const admins = (members || []).filter(m => m.memberId == creatorId);
        const regularMembers = (members || []).filter(m => m.memberId != creatorId);

        const renderMemberRow = (member) => {
            const nick = this.escapeHtml(member.memberNickname);
            const handle = this.formatHandle(member.memberHandle);
            return `
            <article class="about-member-row" data-member-id="${member.memberId}" data-profile-id="${member.memberId}">
                <div class="about-member-avatar">
                    <img src="${member.memberProfileFilePath || '/images/profile/default_image.png'}" alt="" onerror="this.src='/images/profile/default_image.png'">
                </div>
                <div class="about-member-info">
                    <strong class="about-member-name">${nick}</strong>
                    <span class="about-member-handle">${handle}</span>
                </div>
                ${member.memberId != loginMemberId ? `<button class="connect-btn default" data-member-id="${member.memberId}">Connect</button>` : ''}
            </article>`;
        };

        return `
        <div class="about-section about-section--info">
            <h2>커뮤니티 정보</h2>
            <p>${desc}</p>
            <div class="about-info-row">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#536471"><g><path d="M7.471 21H.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977.963 0 1.95.212 2.87.672-1.608 1.732-2.762 4.389-2.869 8.248l-.03 1.083zM9.616 9.27C10.452 8.63 11 7.632 11 6.5 11 4.57 9.433 3 7.5 3S4 4.57 4 6.5c0 1.132.548 2.13 1.384 2.77.589.451 1.317.73 2.116.73s1.527-.279 2.116-.73zm6.884 1.726c-3.264 0-6.816 2.358-7 8.977L9.471 21h14.057l-.029-1.027c-.184-6.618-3.736-8.977-7-8.977zm2.116-1.726C19.452 8.63 20 7.632 20 6.5 20 4.57 18.433 3 16.5 3S13 4.57 13 6.5c0 1.132.548 2.13 1.384 2.77.589.451 1.317.73 2.116.73s1.527-.279 2.116-.73z"></path></g></svg>
                <span>멤버만 게시물을 작성할 수 있습니다.</span>
            </div>
            <div class="about-info-row">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#536471"><g><path d="M12 1.75C6.34 1.75 1.75 6.34 1.75 12S6.34 22.25 12 22.25 22.25 17.66 22.25 12 17.66 1.75 12 1.75zm-.25 10.48L10.5 17.5l-2-1.5v-3.5L7.5 9 5.03 7.59c1.42-2.24 3.89-3.75 6.72-3.84L11 6l-2 .5L8.5 9l5 1.5-1.75 1.73zM17 14v-3l-1.5-3 2.88-1.23c1.17 1.42 1.87 3.24 1.87 5.23 0 1.3-.3 2.52-.83 3.61L17 14z"></path></g></svg>
                <div>
                    <strong>모든 커뮤니티는 전체 공개됩니다.</strong>
                    <p style="margin:2px 0 0;color:#536471;font-size:14px;">누구나 이 커뮤니티에 가입할 수 있습니다.</p>
                </div>
            </div>
        </div>
        ${admins.length > 0 ? `
        <div class="about-section about-section--members">
            <h2 class="about-role-title">관리자</h2>
            ${admins.map(renderMemberRow).join("")}
        </div>` : ''}
        ${regularMembers.length > 0 ? `
        <div class="about-section about-section--members">
            <h2 class="about-role-title">멤버</h2>
            ${regularMembers.map(renderMemberRow).join("")}
        </div>` : ''}`;
    },

    // ─── 멤버 아이템 (Members 탭 무한스크롤용) ───
    renderMemberItem(member, myRole) {
        const nick = this.escapeHtml(member.memberNickname);
        const handle = this.formatHandle(member.memberHandle);
        const role = member.memberRole || "member";
        const roleLabel = role === "admin" ? "관리자" : role === "moderator" ? "중재자" : "";
        const canManage = (myRole === "admin" || myRole === "creator") && role !== "admin" && role !== "creator";
        return `
        <div class="member-item" data-member-id="${member.memberId}" data-profile-id="${member.memberId}">
            <div class="member-info">
                <span class="member-nickname">${nick}</span>
                <span class="member-handle">${handle}</span>
                ${roleLabel ? `<span class="member-role-badge">${roleLabel}</span>` : ''}
            </div>
            ${canManage ? `<button class="member-manage-btn" data-action="manage-member" data-target-id="${member.memberId}">관리</button>` : ''}
        </div>`;
    },

    // ─── 커뮤니티 삭제 버튼 (관리자 전용) ───
    renderDeleteButton() {
        return `
        <div class="about-section about-section--danger">
            <button class="community-delete-btn" data-action="delete-community">커뮤니티 삭제</button>
        </div>`;
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
