const friendsLayout = (() => {

    const resolveIsFollowing = (friend, mode) => {
        // 추천 탭: SQL이 isFollowing을 안 내려줌 → false 고정
        // 커넥터/커넥팅 탭: SQL의 is_following 신뢰
        if (mode === "recommend") return false;
        return friend.isFollowing;
    };

    const isExpertRole = (role) => {
        if (!role) return false;
        return String(role).toLowerCase() === "expert";
    };

    const createFriendCard = (friend, mode) => {
        console.log("들어옴1 createFriendCard, memberProfileFileName:", friend.memberProfileFileName);
        const avatarHtml = friend.memberProfileFileName
            ? `<div class="user-avatar user-avatar--image"><img class="user-avatar-img" src="${friend.memberProfileFileName}" alt="" onerror="this.src='/images/profile/default_image.png'"></div>`
            : `<div class="user-avatar user-avatar--image"><img class="user-avatar-img" src="/images/profile/default_image.png" alt=""></div>`;

        const handle = friend.memberHandle ? friend.memberHandle : "";
        const name = friend.memberName || friend.memberNickname || "";
        const bio = friend.memberBio || "";
        const followerIntro = friend.followerIntro
            ? `<div class="user-followed-by">${friend.followerIntro}</div>`
            : "";

        const isFollowing = resolveIsFollowing(friend, mode);
        const expert = isExpertRole(friend.memberRole);
        const btnClass = isFollowing ? "connected" : "default";
        const btnText = isFollowing
            ? (expert ? "Following" : "Connected")
            : (expert ? "Follow" : "Connect");
        const expertAttr = expert ? ' data-expert="true"' : "";

        return `
            <div class="user-card" data-handle="${handle}" data-member-id="${friend.id}" data-profile-id="${friend.id}">
                ${avatarHtml}
                <div class="user-info">
                    <div class="user-top">
                        <div class="user-name-group">
                            <div class="user-name">${name}</div>
                            <div class="user-handle">${handle}</div>
                            ${followerIntro}
                        </div>
                        <button class="connect-btn ${btnClass}"${expertAttr} data-member-id="${friend.id}">${btnText}</button>
                    </div>
                    <div class="user-bio">${bio}</div>
                </div>
            </div>`;
    };

    const showFriendsList = (friends, page, mode) => {
        const friendsList = document.getElementById("friendsList");
        const html = friends.map(friend => createFriendCard(friend, mode)).join("");
        if (page === 1) {
            friendsList.innerHTML = html;
        } else {
            friendsList.innerHTML += html;
        }
    };

    const showEmptyState = (titleMessage) => {
        const friendsList = document.getElementById("friendsList");
        friendsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-title">${titleMessage}</div>
                <div>다른 사람들과 연결해 보세요.</div>
            </div>`;
    };

    return { showFriendsList: showFriendsList, showEmptyState: showEmptyState };
})();
