const friendsService = (() => {

    const getMyInfo = async () => {
        const response = await fetch('/api/auth/info');
        return await response.json();
    };

    const getFriendsList = async (page, memberId, categoryId, callback) => {
        let url = `/api/friends/list/${page}?memberId=${memberId}`;
        if (categoryId) url += `&categoryId=${categoryId}`;
        const response = await fetch(url);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const getFollowersList = async (page, profileId, viewerId, callback) => {
        const response = await fetch(`/api/friends/followers/${page}?profileId=${profileId}&viewerId=${viewerId}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const getFollowingsList = async (page, profileId, viewerId, callback) => {
        const response = await fetch(`/api/friends/followings/${page}?profileId=${profileId}&viewerId=${viewerId}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const getCategories = async (callback) => {
        const response = await fetch('/api/friends/categories');
        const data = await response.json();
        if (callback) return callback(data);
        return data;
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

    return { getMyInfo: getMyInfo, getFriendsList: getFriendsList, getFollowersList: getFollowersList, getFollowingsList: getFollowingsList, getCategories: getCategories, follow: follow, unfollow: unfollow };
})();
