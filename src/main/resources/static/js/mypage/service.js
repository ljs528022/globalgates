const myPageService = (() => {
    const writeProduct = async (formData) => {
        const response = await fetch("/api/mypage/products", {
            method: "POST",
            body: formData
        });

        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || "Fetch error");
        }

        return text ? JSON.parse(text) : {};
    };

    // 내 상품 목록은 기존 프로젝트의 다른 목록 조회와 같은 방식으로
    // page 파라미터를 받고, 필요하면 callback에 결과를 넘겨준다.
    const getMyProducts = async (page, callback) => {
        const response = await fetch(`/api/mypage/products?page=${page}`);
        const data = await response.json();

        if (callback) return callback(data);
        return data;
    };

    // 상대 프로필의 상품 탭은 owner 전용 API를 재사용하지 않고
    // page 주인 memberId를 명시적으로 받는 profile 전용 API로 분리한다.
    const getProfileProducts = async (memberId, page, callback) => {
        const response = await fetch(`/api/mypage/profile/products?memberId=${memberId}&page=${page}`);
        const data = await response.json();

        if (callback) return callback(data);
        return data;
    };
    // 내 게시글 목록은 기존 프로젝트의 다른 목록 조회와 같은 방식으로
    // page 파라미터를 받고, 필요하면 callback에 결과를 넘겨준다.
    const getMyPosts = async (page, callback) => {
        const response = await fetch(`/api/mypage/posts?page=${page}`);
        const data = await response.json();

        if (callback) return callback(data);
        return data;
    };

    // 상대 프로필의 게시물 탭도 동일한 PostWithPagingDTO를 쓰되,
    // 조회 기준만 현재 로그인 사용자가 아니라 페이지 주인으로 바꾼다.
    const getProfilePosts = async (memberId, page, callback) => {
        const response = await fetch(`/api/mypage/profile/posts?memberId=${memberId}&page=${page}`);
        const data = await response.json();

        if (callback) return callback(data);
        return data;
    };

    // Replies 탭도 Posts / Likes와 같은 페이징 계약을 사용한다.
    const getMyReplies = async (page, callback) => {
        const response = await fetch(`/api/mypage/replies?page=${page}`);
        const data = await response.json();

        if (callback) return callback(data);
        return data;
    };

    // 상대 프로필의 답글 탭도 페이지 주인 기준으로만 분리해 읽어온다.
    const getProfileReplies = async (memberId, page, callback) => {
        const response = await fetch(`/api/mypage/profile/replies?memberId=${memberId}&page=${page}`);
        const data = await response.json();

        if (callback) return callback(data);
        return data;
    };

    const getPost = async (postId, memberId) => {
        const response = await fetch(`/api/main/posts/${postId}?memberId=${memberId}`);

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Fetch error");
        }

        return await response.json();
    };

    const updatePost = async (postId, formData) => {
        const response = await fetch(`/api/main/posts/update/${postId}`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Fetch error");
        }
    };

    // Likes 탭도 Posts 탭과 같은 PostWithPagingDTO 구조를 사용한다.
    // 따라서 프런트 서비스 계층에서는 엔드포인트만 다르고, 소비 방식은 동일하게 유지한다.
    const getMyLikedPosts = async (page, callback) => {
        const response = await fetch(`/api/mypage/likes?page=${page}`);
        const data = await response.json();

        if (callback) return callback(data);
        return data;
    };

    // 상품 삭제
    const deleteProduct = async (productId) => {
        // 현재 프로젝트의 다른 저장/수정 요청과 같은 방식으로
        // FormData에 필요한 최소 값만 담아서 전송한다.
        const formData = new FormData();
        formData.append("productId", productId);

        const response = await fetch("/api/mypage/products/delete", {
            method: "POST",
            body: formData
        });

        const text = await response.text();

        // 서버가 실패 응답을 주면 event.js의 catch 블록에서 동일한 방식으로 처리한다.
        if (!response.ok) {
            throw new Error(text || "Fetch error");
        }

        return text ? JSON.parse(text) : {};
    };

    const deletePost = async (postId) => {
        const response = await fetch(`/api/main/posts/delete/${postId}`, {
            method: "POST"
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Fetch error");
        }
    };

    // 프로필 수정은 텍스트와 이미지 파일을 한 번에 보내야 하므로
    // 기존 상품 등록과 같은 방식으로 FormData를 그대로 전송한다.
    const updateProfile = async (formData) => {
        const response = await fetch("/api/member/profile/update", {
            method: "POST",
            body: formData
        });

        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || "Fetch error");
        }

        return text ? JSON.parse(text) : {};
    };

    // 마이페이지 팔로잉 요약 카드는 main과 같은 follow API를 재사용한다.
    // 언팔로우는 서버에서 followerId/followingId 조합으로 처리되므로,
    // 카드에서 읽은 두 식별자만 넘기면 별도 전용 API를 만들 필요가 없다.
    const follow = async (followerId, followingId) => {
        const response = await fetch("/api/main/follows", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                followerId: followerId,
                followingId: followingId
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Fetch error");
        }
    };

    // 마이페이지 팔로잉 요약 카드는 main과 같은 follow API를 재사용한다.
    // 언팔로우는 서버에서 followerId/followingId 조합으로 처리되므로,
    // 카드에서 읽은 두 식별자만 넘기면 별도 전용 API를 만들 필요가 없다.
    const unfollow = async (followerId, followingId) => {
        const response = await fetch(`/api/main/follows/${followerId}/${followingId}/delete`, {
            method: "POST"
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Fetch error");
        }
    };

    // 상단 프로필 더보기의 차단은 현재 backend controller 경로 기준으로 /api/v1/blocks 를 사용한다.
    const block = async (blockerId, blockedId) => {
        const response = await fetch("/api/v1/blocks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ blockerId, blockedId })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Fetch error");
        }
    };

    // 신고는 기존 화면들이 이미 쓰고 있는 /api/main/reports 계약을 그대로 따른다.
    const report = async (reporterId, targetId, targetType, reason) => {
        const response = await fetch("/api/main/reports", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ reporterId, targetId, targetType, reason })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Fetch error");
        }
    };

    // 마이페이지 사이드바 견적 요약은 role 기준으로 서버가 분기해서 내려준다.
    const getMyEstimationsSummary = async (callback) => {
        const response = await fetch("/api/mypage/estimations/summary");
        const data = await response.json();

        if (callback) return callback(data);
        return data;
    };

    // non-expert 더보기는 마이페이지 내부에서 requester 기준 목록을 이어 붙인다.
    const getMyRequestedEstimations = async (page, callback) => {
        const response = await fetch(`/api/mypage/estimations/requested?page=${page}`);
        const data = await response.json();

        if (callback) return callback(data);
        return data;
    };

    // ============================================================
    // 좋아요 / 북마크 토글용 API
    // 백엔드 엔드포인트는 main/service.js 와 동일한 /api/main/* 를 재사용.
    // 서버에서 인증 사용자 기준으로 동작하므로 클라가 보내는 memberId 는 무시되지만,
    // main 과 시그니처를 맞춰 두 화면이 같은 인터페이스로 호출되게 한다.
    // ============================================================
    const addLike = async (memberId, postId) => {
        await fetch('/api/main/likes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId: memberId, postId: postId })
        });
    };

    const deleteLike = async (memberId, postId) => {
        await fetch(`/api/main/likes/posts/${postId}/delete`, { method: 'POST' });
    };

    const addBookmark = async (memberId, postId) => {
        await fetch('/api/main/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId: memberId, postId: postId })
        });
    };

    const deleteBookmark = async (memberId, postId) => {
        await fetch(`/api/main/bookmarks/members/${memberId}/posts/${postId}/delete`, { method: 'POST' });
    };

    return {
        writeProduct: writeProduct,
        getMyProducts: getMyProducts,
        getProfileProducts: getProfileProducts,
        getMyPosts: getMyPosts,
        getProfilePosts: getProfilePosts,
        getMyReplies: getMyReplies,
        getProfileReplies: getProfileReplies,
        getPost: getPost,
        updatePost: updatePost,
        getMyLikedPosts: getMyLikedPosts,
        deleteProduct: deleteProduct,
        deletePost: deletePost,
        updateProfile: updateProfile,
        follow: follow,
        unfollow: unfollow,
        block: block,
        report: report,
        getMyEstimationsSummary: getMyEstimationsSummary,
        getMyRequestedEstimations: getMyRequestedEstimations,
        addLike: addLike,
        deleteLike: deleteLike,
        addBookmark: addBookmark,
        deleteBookmark: deleteBookmark
    };
})();
