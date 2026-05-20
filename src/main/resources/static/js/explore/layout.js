const exploreLayout = (() => {
    const escapeHtml = (value) => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

    // 추천 제품 렌더링 (ProductsPagingDTO)
    const showPostList = (productsPagingDTO) => {
        const section = document.getElementById("productsSection");
        if (!section) return;

        section.innerHTML = "";

        const posts = productsPagingDTO.posts;

        if (!posts || posts.length === 0) {
            section.innerHTML = `<p class="emptyMessage">표시할 상품이 없습니다.</p>`;
            return;
        }

        posts.forEach(post => {
            const firstImage = post.postFiles?.[0] ?? "/images/main/global-gates-logo.png";
            const hashtags = (post.hashtags ?? [])
                .map(tag => `<span class="Category-Tag">#${tag.hashtag ?? tag}</span>`)
                .join("");

            const isLiked      = post.liked ?? false;
            const isBookmarked = post.bookmarked ?? false;

            const card = document.createElement("div");
            card.className = "Post-Card";
            card.dataset.type = "image-1";
            card.dataset.postId = post.id;

            card.innerHTML = `
            <div class="Post-Body">
                <div class="Post-Header">
                    <div class="Post-Avatar-Wrapper">
                        <div class="Post-Avatar">
                            <img src="${post.memberProfile ? post.memberProfile : "/images/profile/default_image.png"}" alt="member-profile" />
                        </div>
                    </div>
                    <div class="Post-Identity">
                        <strong class="Post-Name">${post.memberNickname}</strong>
                        <div>
                            <span class="Post-Handle">${post.memberHandle}</span>
                            <span class="Post-Time">${post.createdDatetime}</span>
                        </div>
                    </div>
                </div>
                <strong class="Post-Title">${post.postTitle ?? ""}</strong>
                <span class="Post-Category">${post.id ?? ""}</span>
                <div class="Post-Product-Info">
                    <div class="Post-Product-Image">
                        <img class="Post-Media-Img" src="${firstImage}" alt="${post.postTitle ?? "상품 이미지"}">
                    </div>
                    <div class="Post-Product-Detail">
                        <div class="Detail-Category-Tags">${hashtags}</div>
                        <span name="stock" class="Detail-Value">수량: ${post.productStock ?? 0}</span>
                        <span name="price" class="Detail-Value">가격: ${Number(post.productPrice ?? 0).toLocaleString()}원</span>
                    </div>
                </div>
                <p class="Post-Text">${post.postContent ?? ""}</p>
                <div class="Post-Metrics">
                    <div class="Post-Action-Bar">
                        <button type="button"
                            class="Post-Action-Btn Like tweet-action-btn--like${isLiked ? ' active' : ''}"
                            aria-label="좋아요">
                            <svg viewBox="0 0 24 24" aria-hidden="true"
                                 class="Post-Action-Icon svg-like-inactive"
                                 ${isLiked ? 'hidden' : ''}>
                                <g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g>
                            </svg>
                            <svg viewBox="0 0 24 24" aria-hidden="true"
                                 class="Post-Action-Icon svg-like-active"
                                 ${isLiked ? '' : 'hidden'}>
                                <g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g>
                            </svg>
                            <span class="Post-Action-Count">${post.likeCount ?? 0}</span>
                        </button>
                        <button class="Post-Action-Btn" aria-label="조회수">
                            <svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true">
                                <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                            </svg>
                            <span class="Post-Action-Count">0</span>
                        </button>
                        <div class="Post-Action-Right">
                            <button type="button"
                                class="Post-Action-Btn Bookmark tweet-action-btn--bookmark${isBookmarked ? ' bookmarked' : ''}"
                                data-post-id="${post.id}"
                                aria-label="북마크">
                                <svg viewBox="0 0 24 24" aria-hidden="true" class="Post-Action-Icon">
                                    <g><path
                                        d="${isBookmarked
                                        ? 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z'
                                        : 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z'}"
                                        data-path-inactive="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
                                        data-path-active="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"
                                    ></path></g>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
            section.appendChild(card);
        });
    };

    // ─── 뉴스 렌더링 (List<NewsDTO>) ─────────────────────────
    const showNewsList = (newsList) => {
        const section = document.getElementById("newsSection");
        if (!section) return;

        section.innerHTML = "";

        if (!newsList || newsList.length === 0) {
            section.innerHTML = `<p class="emptyMessage">표시할 뉴스가 없습니다.</p>`;
            return;
        }

        const trendList = document.createElement("div");
        trendList.className = "trend-list";

        newsList.forEach(news => {
            const cell = document.createElement("div");
            cell.className = "cell-inner-div";
            const content = String(news.newsContent ?? "");
            const summary = content.length > 120 ? `${content.slice(0, 120)}...` : content;
            const category = news.newsCategory?.label ?? news.newsCategory ?? "뉴스";
            const type = news.newsType?.label ?? news.newsType ?? "general";
            const sourceUrl = news.newsSourceUrl ?? "";
            const newsTypeValue = news.newsType?.value ?? news.newsType ?? "";
            const isEmergency = newsTypeValue === "emergency";
            cell.innerHTML = `
                <div class="trend" role="link" tabindex="0" data-news-id="${news.id}">
                    <div class="trend-inner">
                        <div class="trend-title-row">
                            <div class="trend-title-wrap">
                                <span class="trend-title">${escapeHtml(news.newsTitle)}</span>
                            </div>
                        </div>
                        <div class="trend-meta-row">
                            <span class="trend-meta-text">${escapeHtml(category)}</span>
                            <span class="trend-meta-text">${escapeHtml(type)}</span>
                            <span class="trend-meta-text">${escapeHtml(news.createdDatetime)}</span>
                        </div>
                        <p class="trend-summary">${escapeHtml(summary)}</p>
                        ${sourceUrl && !isEmergency ? `<a class="trend-source-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">원문 보기</a>` : ""}
                    </div>
                </div>
            `;
            trendList.appendChild(cell);
        });

        section.appendChild(trendList);
    };

    // ─── 실시간 검색어 렌더링 (List<RankedSearchHistoryDTO>) ──
    const showTrends = (trends) => {
        const section = document.getElementById("trendingSection");
        if (!section) return;

        section.innerHTML = "";

        if (!trends || trends.length === 0) {
            section.innerHTML = `<p class="emptyMessage">표시할 트렌드가 없습니다.</p>`;
            return;
        }

        const trendingList = document.createElement("div");
        trendingList.className = "trending-list";

        trends.forEach(trend => {
            const item = document.createElement("div");
            item.className = "trending-item";
            item.setAttribute("role", "link");
            item.setAttribute("tabindex", "0");
            item.innerHTML = `
                <div class="trending-body">
                    <div class="trending-meta">
                        <span>${trend.ranking}</span>
                        <span class="trending-dot">·</span>
                        <span>Trending in South Korea</span>
                    </div>
                    <div class="trending-title">${trend.searchKeyword}</div>
                </div>
            `;
            trendingList.appendChild(item);
        });

        section.appendChild(trendingList);
    };

    // 검색한 게시글 목록 뿌리기
    const showSearchPosts = (postWithPagingDTO, append = false, sectionId = "popularSection") => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const posts = postWithPagingDTO?.posts ?? [];

        if (!append) {
            section.innerHTML = "";
        }

        if (posts.length === 0 && !append) {
            section.innerHTML = `<p class="feedEmpty" style="padding: 20px; text-align: center; color: #536471;">검색 결과가 없습니다.</p>`;
            return;
        }

        posts.forEach(post => {
            const files = post.postFiles ?? [];

            // ── 미디어 영역 ───────────────────────────────────
            let mediaHtml = "";
            if (files.length === 1) {
                mediaHtml = `
                <div class="postMedia">
                    <img src="${files[0]}" alt="게시물 이미지" class="postMediaImage" />
                </div>`;
            } else if (files.length >= 2) {
                const count = Math.min(files.length, 4);
                mediaHtml = `
                <div class="postMediaGrid postMediaGrid--${count}">
                    ${files.slice(0, 4).map(f =>
                    `<img src="${f}" alt="게시물 이미지" class="postMediaImage" />`
                ).join("")}
                </div>`;
            }

            // ── 아바타 영역 ───────────────────────────────────
            const initial = (post.memberNickname ?? "?")[0].toUpperCase();
            const avatarHtml = post.memberProfileFileName
                ? `<div class="postAvatar postAvatar--image">
                       <img src="${post.memberProfileFileName}" alt="프로필 이미지" class="postAvatarImage" />
                   </div>`
                : `<div class="postAvatar postAvatar--image">
                       <img src="/images/profile/default_image.png" alt="프로필 이미지" class="postAvatarImage" />
                   </div>`;

            // ── postCard 생성 ─────────────────────────────────
            const card = document.createElement("div");
            card.className = "postCard";
            card.dataset.postId = post.id;
            card.innerHTML = `
            <div class="postBody">
                <header class="postHeader">
                    <div class="postIdentity">
                        ${avatarHtml}
                        <div class="postIdentity__copy">
                            <div class="postIdentity__nameRow">
                                <strong class="postName">${post.memberNickname ?? ""}</strong>
                            </div>
                            <div class="postIdentity__metaRow">
                                <span class="postHandle">${post.memberHandle ?? ""}</span>
                                <span class="postIdentity__sep">·</span>
                                <span class="postTime">${post.createdDatetime}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        class="postMoreButton"
                        type="button"
                        aria-label="게시물 더 보기"
                        aria-haspopup="menu"
                        aria-expanded="false"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="postMoreIcon">
                            <g><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></g>
                        </svg>
                    </button>
                </header>
                <p class="postText">${post.postContent ?? ""}</p>
                ${mediaHtml}
                <footer class="postMetrics">
                    <div class="tweet-action-bar">
                        <button type="button" class="tweet-action-btn" data-testid="reply" aria-label="답글 ${post.replyCount ?? 0}">
                            <svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-action-icon">
                                <g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g>
                            </svg>
                            <span class="tweet-action-count">${post.replyCount ?? 0}</span>
                        </button>
                        <button type="button"
                            class="tweet-action-btn tweet-action-btn--like${post.liked ? ' active' : ''}"
                            data-testid="like"
                            aria-label="마음 ${post.likeCount ?? 0}">
                            <svg viewBox="0 0 24 24" aria-hidden="true"
                                 class="tweet-action-icon svg-like-inactive"
                                 ${post.liked ? 'hidden' : ''}>
                                <g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g>
                            </svg>
                            <svg viewBox="0 0 24 24" aria-hidden="true"
                                 class="tweet-action-icon svg-like-active"
                                 ${post.liked ? '' : 'hidden'}>
                                <g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g>
                            </svg>
                            <span class="tweet-action-count">${post.likeCount ?? 0}</span>
                        </button>
                        <div class="tweet-action-right">
                            <button type="button" class="tweet-action-btn tweet-action-btn--bookmark" data-testid="bookmark" data-post-id="${post.id}" aria-label="북마크">
                                <svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-action-icon">
                                    <g><path
                                        d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
                                        data-path-inactive="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
                                        data-path-active="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"
                                    ></path></g>
                                </svg>
                            </button>
                            <button type="button" class="tweet-action-btn tweet-action-btn--share" aria-label="게시물 공유하기" aria-haspopup="menu" aria-expanded="false">
                                <svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-action-icon">
                                    <g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></g>
                                </svg>
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        `;
            section.appendChild(card);
        });
    };

    // 검색한 유저 목록 뿌리기
    const showSearchMembers = (users, append = false) => {
        const friendsList = document.getElementById("friendsList");
        if (!friendsList) return;

        const members = users?.members ?? [];

        if (!append) {
            friendsList.innerHTML = "";
        }

        if (members.length === 0 && !append) {
            friendsList.innerHTML = `<p class="feedEmpty" style="padding: 20px; text-align: center; color: #536471;">검색된 회원이 없습니다.</p>`;
            return;
        }

        members.forEach(member => {
            const handle   = member.memberHandle ?? "";
            const name     = member.memberNickname ?? "";
            const bio      = member.memberBio      ?? "";
            const avatar   = member.filePath ?? "";
            const initial  = name ? name[0].toUpperCase() : "?";

            // ── 아바타 ────────────────────────────────────────
            const avatarHtml = avatar
                ? `<img src="${avatar}" alt="${name}" class="postAvatarImage"
                   style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
                : `<img src="/images/profile/default_image.png" alt="${name}" class="postAvatarImage"
                   style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;

            // 팔로우 여부
            const isFollowed = member.followed ?? false;
            const btnClass   = isFollowed ? "connected" : "default";
            const btnText    = isFollowed ? "Connected" : "Connect";

            const card = document.createElement("div");
            card.className = "user-card";
            card.dataset.handle = `${handle}`;
            card.dataset.profileId = member.id;
            card.innerHTML = `
            <div class="user-avatar">${avatarHtml}</div>
            <div class="user-info">
                <div class="user-top">
                    <div class="user-name-group">
                        <div class="user-name">${name}</div>
                        <div class="user-handle">${handle}</div>
                    </div>
                    <button class="connect-btn ${btnClass}" data-member-id="${member.id}">${btnText}</button>
                </div>
                ${bio ? `<div class="user-bio">${bio}</div>` : ""}
            </div>
            `;
            friendsList.appendChild(card);
        });
    };

    // 최근 검색어 렌더링
    const showRecentKeywords = (keywords, onClickCallback, onDeleteCallback) => {
        const searchRecentSec = document.getElementById("searchRecentSection");
        if (!searchRecentSec) return;

        searchRecentSec
            .querySelectorAll(".searchResultItem--recent")
            .forEach(el => el.remove());

        const header = searchRecentSec.querySelector(".searchRecentHeader");

        if (!keywords || keywords.length === 0) {
            if (header) header.hidden = true;
            return;
        }

        if (header) header.hidden = false;

        const clearAllBtn = searchRecentSec.querySelector(".searchRecentClearAll");

        keywords.forEach(({ id, keyword }) => {
            const item = document.createElement("div");
            item.className = "searchResultItem searchResultItem--recent";
            item.dataset.id = id;  // ✅ data-id에 id 저장
            item.innerHTML = `
            <svg viewBox="0 0 21 21" aria-hidden="true" class="searchRecentIcon">
                <g><path d="M9.094 3.095c-3.314 0-6 2.686-6 6s2.686 6 6 6c1.657 0 3.155-.67 4.243-1.757 1.087-1.088 1.757-2.586 1.757-4.243 0-3.314-2.686-6-6-6zm-9 6c0-4.971 4.029-9 9-9s9 4.029 9 9c0 1.943-.617 3.744-1.664 5.215l4.475 4.474-2.122 2.122-4.474-4.475c-1.471 1.047-3.272 1.664-5.215 1.664-4.97-.001-8.999-4.03-9-9z"></path></g>
            </svg>
            <div class="searchResultProfile">
                <span class="searchResultName">${keyword}</span>
            </div>
            <button class="searchRecentDeleteBtn" type="button" aria-label="삭제" data-id="${id}">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/>
                </svg>
            </button>
        `;

            item.querySelector(".searchResultName").addEventListener("click", () => {
                if (onClickCallback) onClickCallback(keyword);
            });

            item.querySelector(".searchRecentDeleteBtn").addEventListener("click", async (e) => {
                e.stopPropagation();
                if (onDeleteCallback) await onDeleteCallback(id);  // ✅ id로 삭제
                item.remove();

                const remaining = searchRecentSec.querySelectorAll(".searchResultItem--recent");
                if (remaining.length === 0 && header) header.hidden = true;
            });

            if (clearAllBtn) {
                searchRecentSec.insertBefore(item, clearAllBtn.closest(".searchRecentHeader").nextSibling ?? clearAllBtn);
            } else {
                searchRecentSec.appendChild(item);
            }
        });
    };

    // ── 연관 검색어를 서버에서 받아 렌더링 ───────────────
    const showSuggestions = (suggestions, onClickCallback) => {
        const searchResultList = document.getElementById("searchResultList");
        if (!searchResultList) return;

        // 기존 연관 검색어 항목만 제거
        searchResultList
            .querySelectorAll(".searchResultItem--suggestion")
            .forEach(el => el.remove());

        if (!suggestions || suggestions.length === 0) return;

        suggestions.forEach(suggestion => {
            const item = document.createElement("div");
            item.className = "searchResultItem searchResultItem--suggestion";
            item.innerHTML = `
            <svg viewBox="0 0 21 21" aria-hidden="true" class="searchRecentIcon">
                <g><path d="M9.094 3.095c-3.314 0-6 2.686-6 6s2.686 6 6 6c1.657 0 3.155-.67 4.243-1.757 1.087-1.088 1.757-2.586 1.757-4.243 0-3.314-2.686-6-6-6zm-9 6c0-4.971 4.029-9 9-9s9 4.029 9 9c0 1.943-.617 3.744-1.664 5.215l4.475 4.474-2.122 2.122-4.474-4.475c-1.471 1.047-3.272 1.664-5.215 1.664-4.97-.001-8.999-4.03-9-9z"></path></g>
            </svg>
            <div class="searchResultProfile">
                <span class="searchResultName">${suggestion}</span>
            </div>
        `;

            item.addEventListener("click", () => {
                if (onClickCallback) onClickCallback(suggestion);
            });

            searchResultList.appendChild(item);
        });
    };

    return {
        showPostList: showPostList,
        showNewsList: showNewsList,
        showTrends: showTrends,
        showRecentKeywords: showRecentKeywords,
        showSuggestions: showSuggestions,
        showSearchPosts: showSearchPosts,
        showSearchMembers: showSearchMembers,
    };
})();
