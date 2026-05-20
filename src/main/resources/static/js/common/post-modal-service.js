// 공용 모달 전용 service — 가입 커뮤니티 조회 + 커뮤니티 게시 endpoint 호출 + 토스트
const postModalService = (() => {

    const getMyCommunities = async (page = 1) => {
        const res = await fetch(`/api/communities/my/${page}`);
        return await res.json();
    };

    const writeCommunityPost = async (communityId, formData) => {
        await fetch(`/api/communities/${communityId}/posts`, { method: "POST", body: formData });
    };

    // 게시 후 자동 토스트 — main의 .notification-toast 클래스 재사용
    const showToast = (message) => {
        const existing = document.querySelector(".notification-toast");
        if (existing) existing.remove();
        const toast = document.createElement("div");
        toast.className = "notification-toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    return { getMyCommunities, writeCommunityPost, showToast };
})();
