const service = (() => {

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

    const getReplies = async (postId, memberId, callback) => {
        const response = await fetch(`/api/main/posts/${postId}/replies?memberId=${memberId}`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const deletePost = async (postId) => {
        await fetch(`/api/main/posts/delete/${postId}`, { method: 'POST' });
    };

    const getFollowings = async (memberId, callback) => {
        const response = await fetch(`/api/main/follows/${memberId}/followings`);
        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    return {
        addLike, deleteLike,
        addBookmark, deleteBookmark,
        follow, unfollow,
        block, report,
        writeReply, getReplies,
        deletePost,
        getFollowings
    };
})();
