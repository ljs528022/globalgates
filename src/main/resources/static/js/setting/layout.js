const SettingLayout = (() => {

    const createBlockedCard = (blocked) => {
        const blockedList = document.querySelector(".privacy-blocked-accounts-editor__list");
        const blockedIntro = document.querySelector(".privacy-blocked-accounts-editor__intro");
        let text = "";
        const blocks = Array.isArray(blocked) ? blocked : [];

        if (!(blockedList instanceof HTMLElement)) {
            return;
        }

        if (blocks.length > 0) {
            if (blockedIntro instanceof HTMLElement) {
                blockedIntro.hidden = true;
            }

            blocks.forEach((block) => {
                const profileImageUrl = block.profileImageUrl || "/images/main/global-gates-logo.png";
                const memberName = block.memberName || "알 수 없는 사용자";
                const memberHandle = block.memberHandle || "";
                const memberBio = block.memberBio || "";

                text += `
                    <article class="blocked-user-card" data-profile-id="${block.blockedId ?? ""}">
                        <img
                                class="blocked-user-card__avatar"
                                src="${profileImageUrl}"
                                alt="${memberName} 프로필 이미지"
                        />
                        <div class="blocked-user-card__body">
                            <div class="blocked-user-card__identity">
                                <strong class="blocked-user-card__name">${memberName}</strong>
                                <span class="blocked-user-card__username">${memberHandle}</span>
                            </div>
                            <p class="blocked-user-card__bio">${memberBio}</p>
                        </div>
                        <button
                                type="button"
                                class="blocked-user-card__status blocked-user-card__status--active"
                                data-blocked-unblock-open
                                data-blocked-id="${block.blockedId ?? ""}"
                                data-blocked-handle="${memberHandle}"
                        >
                            차단됨
                        </button>
                    </article>
                `;
            });
        }

        blockedList.innerHTML = text;
    };

    return {
        createBlockedCard: createBlockedCard
    };
})();
