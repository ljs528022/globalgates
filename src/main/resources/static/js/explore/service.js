const exploreService = (() => {
    // 추천 상품 요청
    const getRecommends = async (page, callback) => {
        const response = await fetch(`/api/explore/products/${page}`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const productWithPagingDTO = await response.json();
        if (callback) callback(productWithPagingDTO);

        return productWithPagingDTO.criteria;
    }

    // 뉴스 요청
    const getNews = async (callback) => {
        const response = await fetch(`/api/explore/news`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const news = await response.json();
        if (callback) callback(news);
    }

    // 실시간 검색어 요청
    const getTrends = async (callback) => {
        const response = await fetch(`/api/explore/trends`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const trends = await response.json();
        if (callback) callback(trends);
    }

    // 게시물 검색 조회 Search : memberId, keyword, type('popular', 'latest')
    const searchPosts = async (page, {keyword, type}, callback) => {
        const params = new URLSearchParams()
        if(keyword) params.append('keyword', keyword);
        if(type) params.append('type', type);

        const response = await fetch(`/api/explore/search/${page}?${params.toString()}`, {
            method: "POST",
            credentials: "include",
        });

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const postWithPagingDTO = await response.json();
        if (callback) callback(postWithPagingDTO);

        return postWithPagingDTO.criteria;
    }

    // 검색 값에 따른 회원 조회
    const searchUsers = async (page, keyword, callback) => {
        const response = await fetch(`/api/explore/search/member/${page}?keyword=${keyword}`, {
            method: "POST",
            credentials: 'include',
        });

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const users = await response.json();
        if (callback) callback(users);

        return users.criteria;
    }

    // 연관 검색어 조회
    const getSuggestions = async (keyword, callback) => {
        const response = await fetch(`/api/search-history/suggestions?keyword=${encodeURIComponent(keyword)}`);

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const suggestions = await response.json();

        // 검색어만 추출해서 callback으로 보냄
        if(callback) callback(suggestions.map(s => s.searchKeyword));
    }

    // 최근 검색어 조회
    const getRecentKeywords = async (callback) => {
        const response = await fetch(`/api/search-history/recent-keywords`, { credentials: "include" });

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const keywords = await response.json();
        console.log("받아옴 최신순");
        if(callback) callback(keywords.map(k => ({
            id: k.id,
            keyword: k.searchKeyword
        })));
    }

    // 검색어 하나 삭제
    const deleteKeyword = async (id) => {
        const response = await fetch(`/api/search-history/recent-keywords?id=${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }
    };

    // 모든 검색어 비우기
    const deleteAllKeywords = async () => {
        const response = await fetch(`/api/search-history/recent-keywords/all`, {
            method: "DELETE",
            credentials: "include"
        });

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }
    };

    // 팔로우 체크
    const checkFollow = async (memberId) => {
        const response = await fetch(`/api/follows/follow?memberId=${memberId}`, {
            method: "GET",
            credentials: "include"
        });

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        return await response.text();
    }

    // 좋아요 체크
    const toggleLike = async (postId) => {
        const response = await fetch(`/api/explore/likes/${postId}`, {
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        return await response.text(); // "좋아요를 생성했습니다." or "좋아요를 삭제했습니다."
    };

    // 북마크 체크
    const checkBookmark = async (postId, folderId = null) => {
        const response = await fetch(`/api/explore/bookmarks/${postId}`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        return await response.text();
    };




    return {
        getRecommends: getRecommends,
        getNews: getNews,
        getTrends: getTrends,
        searchPosts: searchPosts,
        searchUsers: searchUsers,
        getSuggestions: getSuggestions,
        getRecentKeywords: getRecentKeywords,
        deleteKeyword: deleteKeyword,
        deleteAllKeywords: deleteAllKeywords,
        checkFollow: checkFollow,
        toggleLike: toggleLike,
        checkBookmark: checkBookmark,
    };
})();
