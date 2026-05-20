const inquiryListLayout = (() => {
    const showInquiryMembers = (inquiryMemberPagingDTO, append = false) => {
        const friendsList = document.getElementById("friendsList");
        if (!friendsList) return;

        const members = inquiryMemberPagingDTO?.members ?? [];

        if (!append) {
            friendsList.innerHTML = "";
        }

        if (members.length === 0 && !append) {
            friendsList.innerHTML = `
                <p class="feedEmpty" style="padding: 20px; text-align: center; color: #536471;">
                    해당 카테고리의 거래처가 없습니다.
                </p>`;
            return;
        }

        members.forEach(member => {
            const handle   = member.memberHandle   ?? "";
            const name     = member.memberNickname ?? "";
            const bio      = member.memberBio      ?? "";
            const avatar   = member.filePath       ?? "";
            const category = member.categoryName   ?? "";
            const expert   = member.expertHandle   ?? "아직 없음";
            const initial  = name ? name[0].toUpperCase() : "?";

            // ── 아바타 ────────────────────────────────────────
            const avatarHtml = avatar
                ? `<img src="${avatar}" alt="${name}" class="postAvatarImage"
                   style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
                : `<img src="/images/profile/default_image.png" alt="${name}" class="postAvatarImage"
                   style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;

            // ── 연계 전문가 / 관심 품목 표시 ─────────────────
            const metaItems = [];
            if (expert)   metaItems.push(`연계 전문가: ${expert}`);
            if (category) metaItems.push(`관심 품목: ${category}`);
            const metaHtml = metaItems.length > 0
                ? `<div class="user-followed-by">${metaItems.join(" · ")}</div>`
                : "";

            // ── 팔로우 여부에 따른 버튼 상태 ─────────────────
            const isFollowed   = member.followed ?? false;
            const btnClass     = isFollowed ? "connect-btn disconnect" : "connect-btn default";
            const btnText      = isFollowed ? "Disapproved" : "Approve";

            const card = document.createElement("div");
            card.className = "user-card";
            card.dataset.handle = handle;
            card.dataset.memberId = member.id;

            card.innerHTML = `
                <div class="user-avatar">${avatarHtml}</div>
                <div class="user-info">
                    <div class="user-top">
                        <div class="user-name-group">
                            <div class="user-name">${name}</div>
                            <div class="user-handle">${handle}</div>
                            ${metaHtml}
                        </div>
                        <button class="${btnClass}" type="button" data-member-id="${member.id}">
                            ${btnText}
                        </button>
                    </div>
                    ${bio ? `<div class="user-bio">${bio}</div>` : ""}
                </div>
            `;

            friendsList.appendChild(card);
        });
    };

    return {showInquiryMembers: showInquiryMembers};
})();