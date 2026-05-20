const CommunityService = (() => {

    // ─── 커뮤니티 CRUD ───
    const create = async (formData) => {
        const response = await fetch("/api/communities", {
            method: "POST",
            body: formData   // multipart (이름, 설명, 카테고리, 커버이미지)
        });
        if (!response.ok) throw new Error("커뮤니티 생성 실패");
        return await response.json();
    };

    const update = async (id, formData) => {
        const response = await fetch(`/api/communities/${id}`, {
            method: "PUT",
            body: formData
        });
        if (!response.ok) throw new Error("커뮤니티 수정 실패");
        return await response.json();
    };

    const remove = async (id) => {
        const response = await fetch(`/api/communities/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("커뮤니티 삭제 실패");
        return await response.json();
    };

    const getDetail = async (id) => {
        const response = await fetch(`/api/communities/${id}`);
        if (!response.ok) throw new Error("커뮤니티 상세 조회 실패");
        return await response.json();
    };

    // ─── 커뮤니티 목록 (무한 스크롤) ───
    const getList = async (page) => {
        const response = await fetch(`/api/communities/list/${page}`);
        if (!response.ok) throw new Error("커뮤니티 목록 조회 실패");
        return await response.json();
    };

    const getMyList = async (page) => {
        const response = await fetch(`/api/communities/my/${page}`);
        if (!response.ok) throw new Error("내 커뮤니티 목록 조회 실패");
        return await response.json();
    };

    const getByCategory = async (categoryId, page) => {
        const response = await fetch(`/api/communities/category/${categoryId}/${page}`);
        if (!response.ok) throw new Error("카테고리별 조회 실패");
        return await response.json();
    };

    // ─── 커뮤니티 검색 ───
    const search = async (keyword, page) => {
        const response = await fetch(`/api/communities/search/${page}?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) throw new Error("커뮤니티 검색 실패");
        return await response.json();
    };

    // ─── 멤버십 ───
    const join = async (communityId) => {
        const response = await fetch(`/api/communities/${communityId}/join`, { method: "POST" });
        if (!response.ok) throw new Error("커뮤니티 가입 실패");
        return await response.json();
    };

    const leave = async (communityId) => {
        const response = await fetch(`/api/communities/${communityId}/leave`, { method: "DELETE" });
        if (!response.ok) throw new Error("커뮤니티 탈퇴 실패");
        return await response.json();
    };

    // AI 추천 — 가입 직후 호출되어 유사 커뮤니티 Top-N 을 받아온다.
    // 서버가 다운/타임아웃이면 빈 items 로 graceful degrade (BE controller 가 fallback 처리).
    const getRecommendations = async (communityId, topN = 5, method = "tfidf") => {
        const url = `/api/communities/${communityId}/recommendations?topN=${topN}&method=${method}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("추천 조회 실패");
        return await response.json();
    };

    const getMembers = async (communityId, page) => {
        const response = await fetch(`/api/communities/${communityId}/members/${page}`);
        if (!response.ok) throw new Error("멤버 목록 조회 실패");
        return await response.json();
    };

    const kickMember = async (communityId, memberId) => {
        const response = await fetch(`/api/communities/${communityId}/members/${memberId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("멤버 추방 실패");
        return await response.json();
    };

    const changeRole = async (communityId, memberId, role) => {
        const response = await fetch(`/api/communities/${communityId}/members/${memberId}/role`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role })
        });
        if (!response.ok) throw new Error("역할 변경 실패");
        return await response.json();
    };

    // ─── 피드 (게시글) ───
    const getHomeFeed = async (page) => {
        const response = await fetch(`/api/communities/feed/home/${page}`);
        if (!response.ok) throw new Error("홈 피드 조회 실패");
        return await response.json();
    };

    const getExploreFeed = async (page, categoryId) => {
        const params = categoryId ? `?categoryId=${categoryId}` : '';
        const response = await fetch(`/api/communities/feed/explore/${page}${params}`);
        if (!response.ok) throw new Error("탐색 피드 조회 실패");
        return await response.json();
    };

    // ─── 공용 모달 (post-modal.js) 호환 — main API 그대로 사용 (일반 게시물 처리) ───
    const writeReply = async (postId, formData) => {
        await fetch(`/api/main/posts/${postId}/replies`, { method: "POST", body: formData });
    };
    const writePost = async (formData) => {
        await fetch("/api/main/posts/write", { method: "POST", body: formData });
    };
    const updatePost = async (postId, formData) => {
        await fetch(`/api/main/posts/update/${postId}`, { method: "POST", body: formData });
    };
    const getPost = async (postId, memberId) => {
        const response = await fetch(`/api/main/posts/${postId}?memberId=${memberId}`);
        return await response.json();
    };
    const getMyProducts = async (memberId, callback) => {
        const response = await fetch(`/api/main/products/members/${memberId}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };
    const getPostTemps = async (memberId, callback) => {
        const response = await fetch(`/api/main/post-temps/${memberId}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };
    const savePostTemp = async (memberId, postTempContent, location, tags) => {
        await fetch("/api/main/post-temps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId, postTempContent, postTempLocation: location, postTempTags: tags })
        });
    };
    const loadPostTemp = async (id) => {
        const response = await fetch(`/api/main/post-temps/${id}/load`, { method: "POST" });
        return await response.json();
    };
    const deletePostTemps = async (ids) => {
        await fetch("/api/main/post-temps/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ids)
        });
    };
    const searchMentionMembers = async (keyword, memberId) => {
        const response = await fetch(`/api/main/mentions/search?keyword=${encodeURIComponent(keyword)}&memberId=${memberId}`);
        return await response.json();
    };

    return {
        create, update, remove, getDetail,
        getList, getMyList, getByCategory, search,
        getHomeFeed, getExploreFeed,
        join, leave, getMembers, kickMember, changeRole, getRecommendations,
        writeReply, writePost, updatePost, getPost,
        getMyProducts, getPostTemps, savePostTemp, loadPostTemp, deletePostTemps,
        searchMentionMembers
    };
})();
