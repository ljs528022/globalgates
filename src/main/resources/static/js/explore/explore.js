window.onload = () => {
    // 사이드바 게시하기 모달 활성화. memberId는 explore.html inline top-level const.
    postModalApi.bootstrap({
        services: service,
        layout: layout,
        getMemberId: () => memberId,
    });

    // 1. 탭 요소
    const tabProducts = document.getElementById("tabProducts");
    const tabTrending = document.getElementById("tabTrending");
    const tabNews = document.getElementById("tabNews");

    // 2. 섹션 요소
    const productsSection = document.getElementById("productsSection");
    const trendingSection = document.getElementById("trendingSection");
    const newsSection = document.getElementById("newsSection");

    // 3. 무한 스크롤 상태 관리
    const scrollState = {
        page: 1,
        isLoading: false,
        hasMore: true,
    };

    // 4. 추가 로드 시 카드 append (첫 로드는 showPostList로 교체)
    function appendPostList(productsPagingDTO) {
        const posts = productsPagingDTO.posts;
        if (!posts || posts.length === 0) return;

        posts.forEach(post => {
            const firstImage = post.postFiles?.[0] ?? "/images/main/global-gates-logo.png";
            const hashtags = (post.hashtags ?? [])
                .map(tag => `<span class="Category-Tag">#${tag.hashtag ?? tag}</span>`)
                .join("");

            const card = document.createElement("div");
            card.className = "Post-Card";
            card.dataset.postId = post.id;
            card.innerHTML = `
                <div class="Post-Body">
                    <div class="Post-Header">
                        <div class="Post-Avatar-Wrapper">
                            <div class="Post-Avatar">판</div>
                        </div>
                        <div class="Post-Identity">
                            <strong class="Post-Name">판매자명</strong>
                            <div>
                                <span class="Post-Handle">@seller</span>
                                <span class="Post-Time">${post.createdDatetime}</span>
                            </div>
                        </div>
                    </div>
                    <strong class="Post-Title">${post.postTitle ?? ""}</strong>
                    <span class="Post-Category">상품번호: ${post.id ?? ""}</span>
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
                                class="Post-Action-Btn Like tweet-action-btn--like${post.liked ? ' active' : ''}"
                                aria-label="좋아요">
                                <svg viewBox="0 0 24 24" aria-hidden="true"
                                     class="Post-Action-Icon svg-like-inactive"
                                     ${post.liked ? 'hidden' : ''}>
                                    <g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g>
                                </svg>
                                <svg viewBox="0 0 24 24" aria-hidden="true"
                                     class="Post-Action-Icon svg-like-active"
                                     ${post.liked ? '' : 'hidden'}>
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
                                    class="Post-Action-Btn Bookmark tweet-action-btn--bookmark${post.bookmarked ? ' bookmarked' : ''}"
                                    data-post-id="${post.id}"
                                    aria-label="북마크">
                                    <svg viewBox="0 0 24 24" aria-hidden="true" class="Post-Action-Icon">
                                        <g><path
                                            d="${post.bookmarked
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
            productsSection.appendChild(card);
        });
    }

    // 5. 추천 상품 로드 함수
    async function loadProducts(isFirst = false) {
        if (scrollState.isLoading || !scrollState.hasMore) return;

        scrollState.isLoading = true;

        try {
            const criteria = await exploreService.getRecommends(scrollState.page, (data) => {
                if (isFirst) {
                    exploreLayout.showPostList(data);
                } else {
                    appendPostList(data);
                }
            });

            scrollState.hasMore = criteria.hasMore;
            scrollState.page++;

        } catch (e) {
            console.error("상품 로드 실패:", e);
        } finally {
            scrollState.isLoading = false;
        }
    }

    // 6. 무한 스크롤 Observer 등록
    function setupInfiniteScroll() {
        const sentinel = document.createElement("div");
        sentinel.id = "scrollSentinel";
        productsSection.appendChild(sentinel);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadProducts(false);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(sentinel);
    }

    // 7. 탭 전환 함수
    if (tabProducts && tabTrending && tabNews && productsSection && trendingSection && newsSection) {

        function showProductsTab() {
            tabProducts.classList.add("isActive");
            tabProducts.setAttribute("aria-current", "page");
            tabTrending.classList.remove("isActive");
            tabTrending.removeAttribute("aria-current");
            tabNews.classList.remove("isActive");
            tabNews.removeAttribute("aria-current");
            productsSection.hidden = false;
            trendingSection.hidden = true;
            newsSection.hidden = true;
        }

        function showTrendingTab() {
            tabTrending.classList.add("isActive");
            tabTrending.setAttribute("aria-current", "page");
            tabProducts.classList.remove("isActive");
            tabProducts.removeAttribute("aria-current");
            tabNews.classList.remove("isActive");
            tabNews.removeAttribute("aria-current");
            productsSection.hidden = true;
            trendingSection.hidden = false;
            newsSection.hidden = true;
        }

        function showNewsTab() {
            tabNews.classList.add("isActive");
            tabNews.setAttribute("aria-current", "page");
            tabProducts.classList.remove("isActive");
            tabProducts.removeAttribute("aria-current");
            tabTrending.classList.remove("isActive");
            tabTrending.removeAttribute("aria-current");
            productsSection.hidden = true;
            trendingSection.hidden = true;
            newsSection.hidden = false;
        }

        // 8. 탭 이벤트 바인딩
        tabProducts.addEventListener("click", async () => {
            scrollState.page = 1;
            scrollState.hasMore = true;
            scrollState.isLoading = false;
            await loadProducts(true);
            showProductsTab();
        });

        tabTrending.addEventListener("click", async () => {
            await exploreService.getTrends((data) => {
                exploreLayout.showTrends(data);
            });
            showTrendingTab();
        });

        tabNews.addEventListener("click", async () => {
            await exploreService.getNews((data) => {
                exploreLayout.showNewsList(data);
            });
            showNewsTab();
        });
    }

    // 9. 페이지 최초 진입 시 탭 파라미터 확인 후 로드
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    console.log("[explore] tab 파라미터:", tabParam);

    if (tabParam === "news" && tabNews) {
        console.log("[explore] 뉴스 탭 자동 활성화");
        (async () => {
            await exploreService.getNews((data) => {
                exploreLayout.showNewsList(data);
            });
            showNewsTab();
        })();
    } else {
        loadProducts(true);
    }
    setupInfiniteScroll();

    // 10. Trending 서브탭
    const trendingSubtabs = document.querySelectorAll("#trendingSubtabs .trending-subtab");
    if (trendingSubtabs.length > 0) {
        trendingSubtabs.forEach((tab) => {
            tab.addEventListener("click", (e) => {
                e.preventDefault();
                trendingSubtabs.forEach((t) => {
                    t.classList.remove("isActive");
                });
                tab.classList.add("isActive");
            });
        });
    }

    // 11. 트렌딩 아이템 클릭 시 검색 이동
    if (trendingSection) {
        trendingSection.addEventListener("click", (e) => {
            const trendingItem = e.target.closest(".trending-item");
            if (!trendingItem) return;

            const keyword = trendingItem.querySelector(".trending-title")?.textContent?.trim();
            if (!keyword) return;

            location.href = `/explore/search?keyword=${encodeURIComponent(keyword)}`;
        });
    }

    // 11-1. 뉴스 셀 클릭 시 상세 이동
    if (newsSection) {
        newsSection.addEventListener("click", (e) => {
            if (e.target.closest("a")) return;
            const trendItem = e.target.closest(".trend[data-news-id]");
            if (!trendItem) return;

            const newsId = trendItem.dataset.newsId;
            if (!newsId) return;

            location.href = `/news/detail/${encodeURIComponent(newsId)}`;
        });
    }

    // 12. Post-Card 인터랙션 (Like / Bookmark / 이미지 프리뷰)
    (function () {
        function showToast(message, extraClass) {
            const existing = document.querySelector(".toast");
            if (existing) existing.remove();
            const toast = document.createElement("div");
            toast.className = "toast";
            if (extraClass) toast.classList.add(extraClass);
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }

        function setBookmarkButtonState(button, isActive) {
            if (!button) return;
            const path = button.querySelector("path");
            if (!path) return;
            const activePath = path.getAttribute("data-path-active");
            const inactivePath = path.getAttribute("data-path-inactive");
            button.classList.toggle("bookmarked", isActive);
            path.setAttribute("d", isActive ? activePath : inactivePath);
        }

        const previewOverlay = document.getElementById("postMediaPreviewOverlay");
        const previewImg = document.getElementById("postMediaPreviewImage");
        const previewClose = document.getElementById("postMediaPreviewClose");

        function openPreview(src, alt) {
            if (!previewOverlay || !src) return;
            previewImg.src = src;
            previewImg.alt = alt || "";
            previewOverlay.classList.remove("off");
            document.body.style.overflow = "hidden";
        }

        function closePreview() {
            if (!previewOverlay) return;
            previewOverlay.classList.add("off");
            previewImg.src = "";
            document.body.style.overflow = "";
        }

        if (previewClose) previewClose.addEventListener("click", () => closePreview());
        if (previewOverlay) {
            previewOverlay.addEventListener("click", (e) => {
                if (e.target === previewOverlay) closePreview();
            });
        }
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && previewOverlay && !previewOverlay.classList.contains("off")) {
                closePreview();
            }
        });

        if (productsSection) {
            productsSection.addEventListener("click", async (e) => {
                const mediaImg = e.target.closest(".Post-Media-Img");
                if (mediaImg) { openPreview(mediaImg.src, mediaImg.alt); return; }

                // ── 좋아요 ───────────────────────────────────────
                const likeBtn = e.target.closest(".tweet-action-btn--like");
                if (likeBtn) {
                    const card = likeBtn.closest("[data-post-id]");
                    const postId = card?.dataset.postId;
                    if (!postId) return;

                    const isLiked = likeBtn.classList.contains("active");
                    const svgInactive = likeBtn.querySelector(".svg-like-inactive");
                    const svgActive   = likeBtn.querySelector(".svg-like-active");
                    const countEl     = likeBtn.querySelector(".Post-Action-Count");

                    // 낙관적 업데이트
                    likeBtn.classList.toggle("active", !isLiked);
                    if (svgInactive) svgInactive.hidden = !isLiked;
                    if (svgActive)   svgActive.hidden   = isLiked;
                    if (countEl) {
                        const cur = parseInt(countEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                        countEl.textContent = isLiked ? cur - 1 : cur + 1;
                    }

                    try {
                        const result = await exploreService.toggleLike(postId);
                        const serverLiked = result.includes("생성");

                        // 서버 응답 기준 동기화
                        likeBtn.classList.toggle("active", serverLiked);
                        if (svgInactive) svgInactive.hidden = serverLiked;
                        if (svgActive)   svgActive.hidden   = !serverLiked;

                        // 낙관적 업데이트와 불일치 시 카운트 보정
                        if (serverLiked !== !isLiked && countEl) {
                            const cur = parseInt(countEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                            countEl.textContent = serverLiked ? cur + 1 : cur - 1;
                        }

                        showToast(serverLiked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.", "toast--like");
                    } catch (err) {
                        // 롤백
                        likeBtn.classList.toggle("active", isLiked);
                        if (svgInactive) svgInactive.hidden = isLiked;
                        if (svgActive)   svgActive.hidden   = !isLiked;
                        if (countEl) {
                            const cur = parseInt(countEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                            countEl.textContent = isLiked ? cur + 1 : cur - 1;
                        }
                        showToast("오류가 발생했습니다. 다시 시도해주세요.");
                        console.error("좋아요 요청 실패:", err);
                    }
                    return;
                }

                // ── 북마크 ───────────────────────────────────────
                const bookmarkBtn = e.target.closest(".Post-Action-Btn.Bookmark");
                if (bookmarkBtn) {
                    const card = bookmarkBtn.closest("[data-post-id]");
                    const postId = card?.dataset.postId ?? bookmarkBtn.dataset.postId;
                    if (!postId) return;

                    try {
                        const result = await exploreService.checkBookmark(Number(postId));
                        const isBookmarked = result.includes("등록");
                        const path = bookmarkBtn.querySelector("path");
                        bookmarkBtn.classList.toggle("bookmarked", isBookmarked);
                        if (path) {
                            path.setAttribute("d", isBookmarked
                                ? path.getAttribute("data-path-active")
                                : path.getAttribute("data-path-inactive"));
                        }
                        showToast(isBookmarked ? "북마크에 저장되었습니다." : "북마크가 해제되었습니다.");
                    } catch (err) {
                        console.error("북마크 요청 실패:", err);
                        showToast("오류가 발생했습니다. 다시 시도해주세요.");
                    }
                    return;
                }
            });
        }
    })();

    // 13. 검색창 포커스 드롭다운 + 최근검색 + 연관검색어 + 검색 이동
    const searchForm     = document.getElementById("searchForm");
    const searchInput    = document.getElementById("searchInput");
    const searchClearBtn = document.getElementById("searchClearBtn");
    const searchPanel    = document.getElementById("searchPanel");
    const searchPanelEmpty  = document.getElementById("searchPanelEmpty");
    const searchRecentSec   = document.getElementById("searchRecentSection");
    const searchResultsEl   = document.getElementById("searchResults");
    const searchResultTopic = document.getElementById("searchResultTopic");
    const searchResultLabel = document.getElementById("searchResultLabel");
    const searchResultList  = document.getElementById("searchResultList");

    let suggestionTimer = null;

    if (searchForm && searchInput && searchPanel) {

        function hasRecentItems() {
            return searchRecentSec &&
                searchRecentSec.querySelectorAll(".searchResultItem--recent").length > 0;
        }

        function showEmpty() {
            if (searchPanelEmpty) searchPanelEmpty.hidden = false;
            if (searchRecentSec)  searchRecentSec.hidden  = true;
            if (searchResultsEl)  searchResultsEl.hidden  = true;
        }

        function showRecent() {
            if (searchPanelEmpty) searchPanelEmpty.hidden = true;
            if (searchRecentSec)  searchRecentSec.hidden  = false;
            if (searchResultsEl)  searchResultsEl.hidden  = true;
        }

        function showResults(val) {
            if (searchResultLabel) searchResultLabel.textContent = `"${val}" 검색`;
            if (searchPanelEmpty)  searchPanelEmpty.hidden = true;
            if (searchRecentSec)   searchRecentSec.hidden  = true;
            if (searchResultsEl)   searchResultsEl.hidden  = false;
        }

        function goToSearch(keyword) {
            if (!keyword.trim()) return;
            searchForm.classList.remove("isFocused");
            searchPanel.hidden = true;
            location.href = `/explore/search?keyword=${encodeURIComponent(keyword.trim())}`;
        }

        function loadRecentKeywords() {
            exploreService.getRecentKeywords((keywords) => {
                exploreLayout.showRecentKeywords(
                    keywords,
                    (keyword) => goToSearch(keyword),
                    (id) => exploreService.deleteKeyword(id)
                );
                updatePanel();
            });
        }

        function loadSuggestions(keyword) {
            exploreService.getSuggestions(keyword, (suggestions) => {
                exploreLayout.showSuggestions(suggestions, (suggestion) => {
                    goToSearch(suggestion);
                });
            });
        }

        function updateSearchClearButton() {
            if (searchClearBtn) {
                searchClearBtn.hidden = searchInput.value.length === 0;
            }
        }

        function updatePanel() {
            const val = searchInput.value.trim();
            updateSearchClearButton();
            if (val.length > 0) {
                showResults(val);
                clearTimeout(suggestionTimer);
                suggestionTimer = setTimeout(() => {
                    loadSuggestions(val);
                }, 300);
            } else if (hasRecentItems()) {
                showRecent();
            } else {
                showEmpty();
            }
        }

        searchPanel.addEventListener("mousedown", (e) => {
            e.preventDefault();
        });

        searchInput.addEventListener("focus", () => {
            searchForm.classList.add("isFocused");
            searchPanel.hidden = false;
            loadRecentKeywords();
            updatePanel();
        });

        searchInput.addEventListener("input", () => {
            updatePanel();
        });

        if (searchClearBtn) {
            searchClearBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                searchInput.value = "";
                updatePanel();
                searchInput.focus();
            });
        }

        searchInput.addEventListener("blur", () => {
            if (!document.hasFocus()) return;
            searchForm.classList.remove("isFocused");
            searchPanel.hidden = true;
        });

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                goToSearch(searchInput.value);
            }
            if (e.key === "Escape") {
                searchForm.classList.remove("isFocused");
                searchPanel.hidden = true;
                searchInput.blur();
            }
        });

        if (searchResultTopic) {
            searchResultTopic.addEventListener("click", () => {
                goToSearch(searchInput.value);
            });
        }

        if (searchRecentSec) {
            const clearAllBtn = searchRecentSec.querySelector(".searchRecentClearAll");
            if (clearAllBtn) {
                clearAllBtn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    await exploreService.deleteAllKeywords();
                    searchRecentSec
                        .querySelectorAll(".searchResultItem--recent")
                        .forEach(el => el.remove());
                    const header = searchRecentSec.querySelector(".searchRecentHeader");
                    if (header) header.hidden = true;
                    showEmpty();
                });
            }
        }

        updateSearchClearButton();
    }
};
