const service = (() => {

    const getPostList = async (page, memberId, callback) => {
        const response = await fetch(`/api/main/posts/list/${page}?memberId=${memberId}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const getExpertList = async (page, memberId, callback) => {
        const response = await fetch(`/api/main/experts/list/${page}?memberId=${memberId}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const getPost = async (postId, memberId) => {
        const response = await fetch(`/api/main/posts/${postId}?memberId=${memberId}`);
        return await response.json();
    };

    const writePost = async (formData) => {
        await fetch('/api/main/posts/write', { method: 'POST', body: formData });
    };

    const updatePost = async (postId, formData) => {
        await fetch(`/api/main/posts/update/${postId}`, { method: 'POST', body: formData });
    };

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

    const follow = async (followerId, followingId) => {
        await fetch('/api/main/follows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ followerId: followerId, followingId: followingId })
        });
    };

    const unfollow = async (followerId, followingId) => {
        await fetch(`/api/main/follows/${followerId}/${followingId}/delete`, { method: 'POST' });
    };

    const block = async (blockerId, blockedId) => {
        await fetch('/api/main/blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blockerId: blockerId, blockedId: blockedId })
        });
    };

    const report = async (reporterId, targetId, targetType, reason) => {
        await fetch('/api/main/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reporterId: reporterId,
                targetId: targetId,
                targetType: targetType,
                reason: reason
            })
        });
    };

    const writeReply = async (postId, formData) => {
        await fetch(`/api/main/posts/${postId}/replies`, {
            method: 'POST',
            body: formData
        });
    };

    const getLatestNews = async (callback) => {
        const response = await fetch('/api/main/news/latest');
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const searchMembers = async (keyword, callback) => {
        const response = await fetch(`/api/main/search/members?keyword=${keyword}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const getSearchHistories = async (memberId, callback) => {
        const response = await fetch(`/api/main/search/histories/${memberId}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const saveSearchHistory = async (memberId, searchKeyword) => {
        await fetch('/api/main/search/histories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId: memberId, searchKeyword: searchKeyword })
        });
    };

    const deleteSearchHistory = async (id) => {
        await fetch(`/api/main/search/histories/${id}/delete`, { method: 'POST' });
    };

    const deleteAllSearchHistories = async (memberId) => {
        await fetch(`/api/main/search/histories/members/${memberId}/delete-all`, { method: 'POST' });
    };

    const getMyProducts = async (memberId, callback) => {
        const response = await fetch(`/api/main/products/members/${memberId}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const getFollowings = async (memberId, callback) => {
        const response = await fetch(`/api/main/follows/${memberId}/followings`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const getAds = async (page, count, callback) => {
        const response = await fetch(`/api/main/ads/list/${page}?count=${count}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const getSuggestions = async (memberId, callback) => {
        const response = await fetch(`/api/main/follows/${memberId}/suggestions`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const deletePost = async (postId) => {
        await fetch(`/api/main/posts/delete/${postId}`, { method: 'POST' });
    };

    const savePostTemp = async (memberId, postTempContent, location, tags) => {
        await fetch('/api/main/post-temps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId: memberId, postTempContent: postTempContent, postTempLocation: location, postTempTags: tags })
        });
    };

    const getPostTemps = async (memberId, callback) => {
        const response = await fetch(`/api/main/post-temps/${memberId}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const loadPostTemp = async (id) => {
        const response = await fetch(`/api/main/post-temps/${id}/load`, { method: 'POST' });
        return await response.json();
    };

    const deletePostTemp = async (id) => {
        await fetch(`/api/main/post-temps/${id}/delete`, { method: 'POST' });
    };

    const deletePostTemps = async (ids) => {
        await fetch('/api/main/post-temps/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ids)
        });
    };

    const logout = async () => {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error("로그아웃 실패");
        }
    };

    const searchMentionMembers = async (keyword, memberId) => {
        console.log("멘션검색 들어옴1 keyword:", keyword);
        const response = await fetch(`/api/main/mentions/search?keyword=${encodeURIComponent(keyword)}&memberId=${memberId}`);
        const data = await response.json();
        console.log("멘션검색 들어옴2 결과수:", data.length);
        return data;
    };

    return {
        getPostList: getPostList, getExpertList: getExpertList, getPost: getPost, writePost: writePost, updatePost: updatePost, deletePost: deletePost,
        addLike: addLike, deleteLike: deleteLike,
        addBookmark: addBookmark, deleteBookmark: deleteBookmark,
        follow: follow, unfollow: unfollow, getFollowings: getFollowings,
        block: block, report: report,
        writeReply: writeReply,
        getLatestNews: getLatestNews,
        searchMembers: searchMembers, getSearchHistories: getSearchHistories, saveSearchHistory: saveSearchHistory, deleteSearchHistory: deleteSearchHistory, deleteAllSearchHistories: deleteAllSearchHistories,
        getMyProducts: getMyProducts,
        getSuggestions: getSuggestions,
        getAds: getAds,
        logout: logout,
        savePostTemp: savePostTemp, getPostTemps: getPostTemps, loadPostTemp: loadPostTemp, deletePostTemp: deletePostTemp, deletePostTemps: deletePostTemps,
        searchMentionMembers: searchMentionMembers
    };
})();
