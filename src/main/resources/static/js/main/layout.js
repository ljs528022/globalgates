 layout = (() => {

    let loginMemberId = null;
    let adInterval = 3;

    const setLoginMemberId = (id) => {
        loginMemberId = id;
    };

    const setAdInterval = (tier) => {
        if (tier === "pro") adInterval = 5;
        else if (tier === "pro_plus" || tier === "expert") adInterval = 0;
        else adInterval = 3;
    };

    function buildAvatarDataUri(label) {
        const safe = String(label || "?").slice(0, 1).replace(/[&<>"']/g, "");
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#cfe8fc"></rect><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#1d9bf0">' + safe + '</text></svg>';
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    const SVG_LIKE_OFF = "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
    const SVG_LIKE_ON = "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
    const SVG_BOOKMARK_OFF = "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z";
    const SVG_BOOKMARK_ON = "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z";

    const createNewsCard = (post) => {
        return `
            <div class="postCard" data-post-id="${post.id}">
                <div class="postBody postCard--news">
                    <div class="newsHeaderWrap">
                        <h3 class="postNewsTitle">${post.newsTitle || ""}</h3>
                        <span class="postTime">${post.createdDatetime || ""}</span>
                    </div>
                    <p class="postText">${post.newsContent || ""}</p>
                    <footer class="postMetrics postCard--news">
                        <div class="tweet-action-bar">
                            <button class="tweet-action-btn" data-action="reply">
                                <svg class="tweet-action-icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                                <span class="tweet-action-count">${post.replyCount || 0}</span>
                            </button>
                            <button class="tweet-action-btn tweet-action-btn--like ${post.liked ? 'active' : ''}" data-post-id="${post.id}">
                                <svg class="tweet-action-icon" viewBox="0 0 24 24" aria-hidden="true"><g><path data-path-inactive="${SVG_LIKE_OFF}" data-path-active="${SVG_LIKE_ON}" d="${post.liked ? SVG_LIKE_ON : SVG_LIKE_OFF}"></path></g></svg>
                                <span class="tweet-action-count">${post.likeCount || 0}</span>
                            </button>
                            <button class="tweet-action-btn tweet-action-btn--views">
                                <svg class="tweet-action-icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
                                <span class="tweet-action-count">${post.postReadCount || 0}</span>
                            </button>
                            <div class="tweet-action-right">
                                <button class="tweet-action-btn tweet-action-btn--bookmark ${post.bookmarked ? 'active' : ''}" data-post-id="${post.id}">
                                    <svg class="tweet-action-icon" viewBox="0 0 24 24" aria-hidden="true"><g><path data-path-inactive="${SVG_BOOKMARK_OFF}" data-path-active="${SVG_BOOKMARK_ON}" d="${post.bookmarked ? SVG_BOOKMARK_ON : SVG_BOOKMARK_OFF}"></path></g></svg>
                                </button>
                                <button class="tweet-action-btn tweet-action-btn--share">
                                    <svg class="tweet-action-icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></g></svg>
                                </button>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>`;
    };

    const createPostCard = (post) => {
        const avatarHtml = post.memberProfileFileName
            ? `<div class="postAvatar postAvatar--image" data-profile-id="${post.memberId}"><img class="postAvatarImage" src="${post.memberProfileFileName}"></div>`
            : `<div class="postAvatar postAvatar--image" data-profile-id="${post.memberId}"><img class="postAvatarImage" src="/images/profile/default_image.png"></div>`;

        const handle = post.memberHandle ? post.memberHandle : "";
        const nickname = post.memberNickname || post.memberHandle || "";

        const badgeSvg = {
            pro: `<svg class="postBadge" fill="#1d9bf0" viewBox="0 0 22 22" aria-label="Pro" role="img"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>`,
            pro_plus: `<svg class="postBadge" fill="#cac670" viewBox="0 0 22 22" aria-label="Pro+" role="img"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>`,
            expert: `<svg class="postBadge" fill="purple" viewBox="0 0 22 22" aria-label="Expert" role="img"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>`
        };
        const badgeHtml = post.badgeType && badgeSvg[post.badgeType] ? badgeSvg[post.badgeType] : "";

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
                    `<img class="postMediaImage" src="${pf.filePath}">`
                ).join("");
                mediaHtml = `<div class="postMedia"><div class="postMediaGrid ${gridClass}">${items}</div></div>`;
            }
        }

        let hashtagHtml = "";
        if (post.hashtags && post.hashtags.length > 0) {
            hashtagHtml = post.hashtags.map(tag =>
                `<a class="postHashtag" href="/explore/search?keyword=${encodeURIComponent(tag.tagName)}">#${tag.tagName}</a>`
            ).join(" ");
            hashtagHtml = `<div class="postHashtags">${hashtagHtml}</div>`;
        }

        let productHtml = "";
        if (post.productId) {
            const productImg = post.productImage || '/images/main/global-gates-logo.png';
            const productPrice = post.productPrice != null ? post.productPrice.toLocaleString() : "0";
            const productStock = post.productStock != null ? post.productStock : 0;
            const productTitle = post.productTitle || "";
            const productHashtags = post.productHashtags || "";
            const tagsHtml = productHashtags
                ? productHashtags.split(",").map(t => `<span class="Category-Tag">#${t}</span>`).join("")
                : "";
            productHtml = `      
                <div class="Post-Product-Info">  
                    <div class="Post-Product-Image">
                        <img src="${productImg}">
                    </div>
                    <div class="Post-Product-Detail">
                        <strong class="Post-Title">${productTitle}</strong>
                        <span name="stock" class="Detail-Value">수량 ${productStock}</span>
                        <span name="price" class="Detail-Value">개당 ${productPrice}원</span>
                    </div>
                </div>
                    `;
        }

        // 커뮤니티 게시글: 커뮤니티명 → 사용자명 → @handle · 작성일자 순으로 사용자명 라인에 맞춰 표시한다.
        const isCommunityPost = !!post.communityId;
        const communityMetaHtml = isCommunityPost ? `
                                <div class="communityPostMeta">
                                    <a class="communityPostMeta__text" href="/community/${post.communityId}">${post.communityName || ""}</a>
                                    ${post.categoryName ? `<span class="communityPostMeta__category">${post.categoryName}</span>` : ""}
                                </div>` : "";

        return `
            <div class="postCard${isCommunityPost ? ' communityPostCard' : ''}" data-post-id="${post.id}" data-member-id="${post.memberId}"${isCommunityPost ? ` data-community-id="${post.communityId}"` : ''}>
                <div class="postBody">
                    <header class="postHeader">
                        <div class="postIdentity">
                            ${avatarHtml}
                            <div class="postIdentity__copy">
                                ${communityMetaHtml}
                                <div class="postIdentity__nameRow">
                                    <strong class="postName">${nickname}</strong>${badgeHtml}
                                </div>
                                <div class="postIdentity__metaRow">
                                    <span class="postHandle">${handle}</span>
                                    <span class="postIdentity__sep">·</span>
                                    <span class="postTime">${post.createdDatetime || ""}</span>
                                </div>
                            </div>
                        </div>
                        <button class="postMoreButton">
                            <svg class="postMoreIcon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></g></svg>
                        </button>
                        <div class="post-more-menu off">
                            ${post.memberId === loginMemberId ? `
                            <button class="post-more-menu__item" data-action="edit">
                                <svg class="post-more-menu__icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g></svg>
                                <span>게시물 수정하기</span>
                            </button>
                            <button class="post-more-menu__item" data-action="delete">
                                <svg class="post-more-menu__icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"></path></g></svg>
                                <span>게시물 삭제하기</span>
                            </button>
                            ` : `
                            <button class="post-more-menu__item" data-action="follow">
                                <svg class="post-more-menu__icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm13 4v3h2v-3h3V8h-3V5h-2v3h-3v2h3zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>
                                <span>${handle} 님 팔로우하기</span>
                            </button>
                            <button class="post-more-menu__item" data-action="block">
                                <svg class="post-more-menu__icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></g></svg>
                                <span>${handle} 님 차단하기</span>
                            </button>
                            <button class="post-more-menu__item" data-action="report">
                                <svg class="post-more-menu__icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg>
                                <span>게시물 신고하기</span>
                            </button>
                            `}
                        </div>
                    </header>
                    <p class="postText">${post.postContent || ""}</p>
                    ${post.location ? `
                    <div class="postLocation">
                        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" class="postLocation__icon"><g><path d="M12 2c-4.687 0-8.5 3.813-8.5 8.5 0 5.967 7.621 11.116 7.945 11.332l.555.37.555-.37c.324-.216 7.945-5.365 7.945-11.332C20.5 5.813 16.687 2 12 2zm0 11.5c-1.65 0-3-1.34-3-3s1.35-3 3-3c1.66 0 3 1.34 3 3s-1.34 3-3 3z"></path></g></svg>
                        <span class="postLocation__text">${post.location}</span>
                    </div>` : ''}
                    ${hashtagHtml}
                    ${productHtml}
                    ${mediaHtml}
                    <footer class="postMetrics">
                        <div class="tweet-action-bar">
                            <button class="tweet-action-btn" data-action="reply">
                                <svg class="tweet-action-icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                                <span class="tweet-action-count">${post.replyCount || 0}</span>
                            </button>
                            <button class="tweet-action-btn tweet-action-btn--like ${post.liked ? 'active' : ''}" data-post-id="${post.id}">
                                <svg class="tweet-action-icon" viewBox="0 0 24 24" aria-hidden="true"><g><path data-path-inactive="${SVG_LIKE_OFF}" data-path-active="${SVG_LIKE_ON}" d="${post.liked ? SVG_LIKE_ON : SVG_LIKE_OFF}"></path></g></svg>
                                <span class="tweet-action-count">${post.likeCount || 0}</span>
                            </button>
                            <button class="tweet-action-btn tweet-action-btn--views">
                                <svg class="tweet-action-icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
                                <span class="tweet-action-count">${post.postReadCount || 0}</span>
                            </button>
                            <div class="tweet-action-right">
                                <button class="tweet-action-btn tweet-action-btn--bookmark ${post.bookmarked ? 'active' : ''}" data-post-id="${post.id}">
                                    <svg class="tweet-action-icon" viewBox="0 0 24 24" aria-hidden="true"><g><path data-path-inactive="${SVG_BOOKMARK_OFF}" data-path-active="${SVG_BOOKMARK_ON}" d="${post.bookmarked ? SVG_BOOKMARK_ON : SVG_BOOKMARK_OFF}"></path></g></svg>
                                </button>
                                <button class="tweet-action-btn tweet-action-btn--share">
                                    <svg class="tweet-action-icon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></g></svg>
                                </button>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>`;
    };

    const createExpertCard = (expert) => {
        const avatarHtml = expert.memberProfileFileName
            ? `<div class="user-avatar user-avatar--image"><img class="user-avatar-img" src="${expert.memberProfileFileName}"></div>`
            : `<div class="user-avatar user-avatar--image"><img class="user-avatar-img" src="/images/profile/default_image.png"></div>`;

        const handle = expert.memberHandle ? expert.memberHandle : "";
        const nickname = expert.memberName || expert.memberHandle || "";
        const bio = expert.memberBio || "";
        const followerIntro = expert.followerIntro
            ? `<div class="user-followed-by">${expert.followerIntro}</div>`
            : "";

        const badgeSvg = {
            pro: `<svg class="postBadge" fill="#1d9bf0" viewBox="0 0 22 22" aria-label="Pro" role="img"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>`,
            pro_plus: `<svg class="postBadge" fill="#cac670" viewBox="0 0 22 22" aria-label="Pro+" role="img"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>`,
            expert: `<svg class="postBadge" fill="purple" viewBox="0 0 22 22" aria-label="Expert" role="img"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>`
        };
        const badgeHtml = expert.badgeType && badgeSvg[expert.badgeType] ? badgeSvg[expert.badgeType] : "";

        return `
            <div class="user-card" data-expert-id="${expert.id}">
                ${avatarHtml}
                <div class="user-info">
                    <div class="user-top">
                        <div class="user-name-group">
                            <div class="user-name">${nickname}${badgeHtml}</div>
                            <div class="user-handle">${handle}</div>
                            ${followerIntro}
                        </div>
                        <button class="connect-btn default" data-member-id="${expert.id}">Follow</button>
                    </div>
                    <div class="user-bio">${bio}</div>
                </div>
            </div>`;
    };

    const createAdCard = (ad) => {
        const profileImg = ad.advertiserProfileFileName || '/images/profile/default_image.png';
        const advertiserName = ad.advertiserName || "";
        const advertiserHandle = ad.advertiserHandle || "";
        const landingUrl = ad.landingUrl || "#";
        let source = "";
        try { source = new URL(landingUrl).hostname; } catch(e) { source = landingUrl; }

        let mediaHtml = "";
        if (ad.imgUrls && ad.imgUrls.length > 0) {
            const images = ad.imgUrls.map(url =>
                `<img class="postMediaImage" src="${url}">`
            ).join("");
            mediaHtml = `
                <div class="postMedia">
                    ${images}
                    <div class="adHeadlineWrap">
                        <span class="adHeadline">${ad.headline || ""}</span>
                    </div>
                    <div class="AdCreativePreviewSourceRow">
                        <button class="AdCreativePreviewSourceButton AdCreativePreviewSource" type="button">출처:
                            <span data-preview-field="landingUrl">${source}</span>
                        </button>
                    </div>
                </div>`;
        }

        return `
            <div class="postCard postCard--ad" data-post-id="${ad.id}" data-member-id="${ad.advertiserId}">
                <div class="postBody">
                    <header class="postHeader">
                        <div class="postIdentity">
                            <div class="postAvatar postAvatar--image">
                                <img class="postAvatarImage" src="${profileImg}" onerror="this.src='/images/profile/default_image.png'">
                            </div>
                            <strong class="postName">${advertiserName}</strong>
                            <span class="postHandle">${advertiserHandle}</span>
                            <span class="postTime">${ad.createdDatetime || ""}</span>
                        </div>
                        <span class="postAdBadge">광고</span>
                        ${ad.advertiserId !== loginMemberId ? `
                        <button class="postMoreButton">
                            <svg class="postMoreIcon" viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></g></svg>
                        </button>
                        ` : ''}
                    </header>
                    <a href="${landingUrl}" target="_blank" style="text-decoration:none;color:inherit;">
                        <p class="postText" style="color:#71767b;">${ad.description || ""}</p>
                        ${mediaHtml}
                    </a>
                </div>
            </div>`;
    };

    const showPostList = (posts, ads, page) => {
        const feedSection = document.getElementById("feedSection");
        const adList = ads || [];
        let html = "";
        let adIdx = 0;
        posts.forEach((post, i) => {
            html += post.newsType === 'emergency' ? createNewsCard(post) : createPostCard(post);
            if (adInterval > 0 && (i + 1) % adInterval === 0 && adIdx < adList.length) {
                html += createAdCard(adList[adIdx++]);
            }
        });
        if (page === 1) {
            feedSection.innerHTML = html;
        } else {
            feedSection.innerHTML += html;
        }
        return posts;
    };

    const showExpertList = (experts, page) => {
        const friendsList = document.getElementById("friendsList");
        const html = experts.map(createExpertCard).join("");
        if (page === 1) {
            friendsList.innerHTML = html;
        } else {
            friendsList.innerHTML += html;
        }
    };

    // ── 멘션 드롭다운 아이템 HTML ──
    const badgeSvgMention = {
        pro: `<svg class="postBadge" fill="#1d9bf0" viewBox="0 0 22 22"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>`,
        pro_plus: `<svg class="postBadge" fill="#cac670" viewBox="0 0 22 22"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>`,
        expert: `<svg class="postBadge" fill="purple" viewBox="0 0 22 22"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>`
    };

    const buildMentionDropdown = (members) => {
        console.log("멘션드롭다운 들어옴1 members:", members.length);
        return members.map((m, i) => {
            const profileImg = m.profileFileName
                ? m.profileFileName
                : '/images/profile/default_image.png';
            const badge = m.badgeType && badgeSvgMention[m.badgeType] ? badgeSvgMention[m.badgeType] : '';
            return `<button type="button" class="mention-item${i === 0 ? ' active' : ''}" data-handle="${m.memberHandle}" data-member-id="${m.id}">
                <img class="mention-item-avatar" src="${profileImg}" alt="" onerror="this.src='/images/profile/default_image.png'">
                <div class="mention-item-info">
                    <span class="mention-item-name">${m.memberName || m.memberHandle}${badge}</span>
                    <span class="mention-item-handle">${m.memberHandle}</span>
                </div>
            </button>`;
        }).join('');
    };

    return { showPostList: showPostList, showExpertList: showExpertList, setAdInterval: setAdInterval, setLoginMemberId: setLoginMemberId, buildAvatarDataUri: buildAvatarDataUri, buildMentionDropdown: buildMentionDropdown };
})();
