// 채팅 레이아웃 관련 유틸리티
const ChatLayout = {
    escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    },

    formatRoomTime(dateStr) {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const todayKey = this.getDateKey(now);
        const dateKey = this.getDateKey(date);

        if (todayKey === dateKey) {
            return this.formatMessageTime(dateStr);
        }

        if (date.getFullYear() === now.getFullYear()) {
            return `${date.getMonth() + 1}월 ${date.getDate()}일`;
        }

        return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
    },

    // 채팅 시간 표시 (메시지 옆)
    formatMessageTime(dateStr) {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "오후" : "오전";
        hours = hours % 12 || 12;
        return `${ampm} ${hours}:${minutes}`;
    },

    formatDateDivider(dateStr) {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
        return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdays[date.getDay()]})`;
    },

    getDateKey(dateInput) {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    },

    // 텍스트 자르기
    truncate(text, maxLen) {
        if (!text) return "";
        return text.length > maxLen ? text.substring(0, maxLen) + "..." : text;
    },

    formatUnreadCount(value) {
        const count = Number(value || 0);
        if (!Number.isFinite(count) || count <= 0) {
            return "";
        }

        return count > 99 ? "99+" : String(count);
    },

    getSearchConversationFallback(name) {
        const text = String(name ?? "").trim();
        return text ? text.charAt(0).toUpperCase() : "?";
    },

    filterSearchConversationRooms(rooms, keyword) {
        const needle = String(keyword ?? "").trim().toLowerCase();
        if (!needle) {
            return Array.isArray(rooms) ? rooms : [];
        }

        return (Array.isArray(rooms) ? rooms : []).filter((room) =>
            [room.displayName, room.partnerName, room.partnerHandle].some((value) =>
                String(value ?? "").toLowerCase().includes(needle),
            ),
        );
    },

    renderSearchConversationGridMarkup(rooms) {
        return (Array.isArray(rooms) ? rooms : [])
            .map((room) => {
                const displayName = this.escapeHtml(room.displayName || room.partnerName || "");
                const handle = this.escapeHtml(room.partnerHandle || "");
                const fallback = this.escapeHtml(
                    this.getSearchConversationFallback(room.displayName || room.partnerName),
                );
                const conversationId = this.escapeHtml(room.conversationId || "");

                const profileImage = this.escapeHtml(room.partnerProfileFileName || "");

                return `
                    <div class="Search-Conv-Item" data-conversation-id="${conversationId}">
                        ${profileImage
                            ? `<div class="Search-Conv-Avatar"><img src="${profileImage}" alt="" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='/images/profile/default_image.png';"></div>`
                            : `<div class="Search-Conv-Avatar-Fallback">${fallback}</div>`
                        }
                        <div class="Search-Conv-Name">${displayName}</div>
                        <div class="Search-Conv-Handle">${handle.startsWith("@") ? handle : "@" + handle}</div>
                    </div>
                `;
            })
            .join("");
    },

    renderSearchConversationListMarkup(rooms) {
        return (Array.isArray(rooms) ? rooms : [])
            .map((room) => {
                const displayName = this.escapeHtml(room.displayName || room.partnerName || "");
                const handle = this.escapeHtml(room.partnerHandle || "");
                const fallback = this.escapeHtml(
                    this.getSearchConversationFallback(room.displayName || room.partnerName),
                );
                const preview = this.escapeHtml(room.lastMessage || "");
                const time = this.escapeHtml(room.lastMessageTime || "");
                const conversationId = this.escapeHtml(room.conversationId || "");

                const profileImage = this.escapeHtml(room.partnerProfileFileName || "");

                return `
                    <li class="Search-Conv-Row" data-conversation-id="${conversationId}">
                        ${profileImage
                            ? `<div class="Search-Conv-Avatar"><img src="${profileImage}" alt="" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='/images/profile/default_image.png';"></div>`
                            : `<div class="Search-Conv-Avatar-Fallback">${fallback}</div>`
                        }
                        <div class="Search-Conv-Row-Info">
                            <div class="Search-Conv-Row-Upper">
                                <span class="Search-Conv-Name">${displayName}</span>
                                <span class="Search-Conv-Time">${time}</span>
                            </div>
                            <div class="Search-Conv-Row-Preview">
                                <span class="Search-Conv-Preview-You">${handle.startsWith("@") ? handle : "@" + handle}</span>${preview}
                            </div>
                        </div>
                    </li>
                `;
            })
            .join("");
    },

    renderRoomListEmptyMarkup() {
        return `
            <li class="UserList-Empty">
                <div class="UserList-Empty-Icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                         data-icon="icon-messages-stroke" viewBox="0 0 24 24" width="1em"
                         height="1em" display="flex" role="img" class="text-primary">
                        <path d="M20.7 11.7c0-4.48-3.844-8.2-8.699-8.2-4.854 0-8.698 3.72-8.698 8.2v.015l-.001.014c-.02.667.09 1.225.25 1.767.083.28.176.545.276.839.098.285.202.595.288.918.177.663.284 1.401.156 2.271-.086.582-.274 1.191-.582 1.855 1.264.375 2.55.053 4.013-.599l.455-.203.437.242c1.07.594 1.917 1.08 3.406 1.08 4.855 0 8.7-3.72 8.7-8.199zm2 0c0 5.683-4.84 10.2-10.699 10.2-1.784 0-2.96-.555-3.95-1.095-1.876.768-4.02 1.2-6.245-.075l-.885-.505.524-.875c.54-.904.77-1.581.848-2.118.078-.526.02-.98-.11-1.463-.066-.25-.15-.502-.247-.788-.095-.277-.204-.59-.301-.92-.199-.674-.36-1.449-.332-2.39C1.322 6.002 6.154 1.5 12.002 1.5c5.859 0 10.7 4.518 10.7 10.2z"></path>
                    </svg>
                </div>
                <div class="UserList-Empty-Title">아직 진행 중인 채팅이 없어요</div>
                <div class="UserList-Empty-Subtitle">전문가를 찾아 새로운 채팅을 시작해보세요.</div>
            </li>
        `;
    },

    renderRoomListMarkup(rooms) {
        const safeRooms = Array.isArray(rooms) ? rooms : [];
        if (safeRooms.length === 0) {
            return this.renderRoomListEmptyMarkup();
        }
        return safeRooms
            .map((room) => {
                const conversationId = this.escapeHtml(room.conversationId || room.id || "");
                const partnerId = this.escapeHtml(room.partnerId || room.invitedId || "");
                const partnerName = this.escapeHtml(room.partnerName || room.invitedName || "");
                const partnerHandle = this.escapeHtml(room.partnerHandle || room.invitedHandle || "");
                const displayName = this.escapeHtml(
                    room.displayName || room.title || room.partnerName || room.invitedName || "",
                );
                const partnerProfileImage = this.escapeHtml(room.partnerProfileFileName || "/images/profile/default_image.png");
                const lastMessage = this.escapeHtml(room.lastMessage || "");
                const lastMessageTime = this.escapeHtml(room.lastMessageTime || "");
                const unreadLabel = this.escapeHtml(this.formatUnreadCount(room.unreadCount));
                const unreadMarkup = unreadLabel
                    ? `
                        <div class="Room-UnreadCount">
                            <span class="UnreadCount-Badge">${unreadLabel}</span>
                        </div>
                    `
                    : "";

                return `
                    <li class="UserList-EachUser"
                        data-conversation-id="${conversationId}"
                        data-partner-id="${partnerId}"
                        data-partner-name="${partnerName}"
                        data-partner-handle="${partnerHandle}"
                        data-display-name="${displayName}">
                        <div class="EachUser-Wrapper" style="opacity: 1;">
                            <div class="EachUser-UserInfo">
                                <div class="UserInfo-Avatar">
                                    <a class="Avatar-Image">
                                        <img alt="user-avatar" src="${partnerProfileImage}" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='/images/profile/default_image.png';">
                                    </a>
                                </div>
                                <div class="UserInfo-Info">
                                    <div class="Info-Upper">
                                        <div class="Info-UserName">
                                            <a href="javascript:void(0)" style="text-decoration: none;">
                                                <div class="UserName-Container">
                                                    <div class="UserName-Text">${displayName}</div>
                                                    <div class="UserName-Badge">
                                                        <div class="Badge-Wrapper">
                                                            <div class="Badge-Svg">
                                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                                     fill="currentColor"
                                                                     data-icon="icon-verified"
                                                                     viewBox="0 0 22 22" width="1em"
                                                                     height="1em" display="flex"
                                                                     role="img" class="text-primary fill-badge">
                                                                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="Lastest-ChatTime">
                                            <div class="Lastest-ChatTime-Text">${lastMessageTime}</div>
                                        </div>
                                    </div>
                                    <div class="Info-Bottom">
                                        <div class="Talk-Wrapper">
                                            <div class="Talk-Container">
                                                <span class="Talk-Content">${lastMessage}</span>
                                            </div>
                                        </div>
                                        ${unreadMarkup}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                `;
            })
            .join("");
    },

    renderInviteExpertListMarkup(experts) {
        const items = Array.isArray(experts) ? experts : [];
        if (items.length === 0) {
            return `
                <li class="Each-Expert Empty">
                    <div class="Each-Expert-Wrapper">
                        <div class="Expert-Info">
                            <div class="Expert-Info-Wrapper">
                                <div class="Expert-Name-Wrapper">
                                    <div class="Expert-Name">연결된 전문가가 없습니다.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            `;
        }

        return items
            .map((expert) => {
                const expertId = this.escapeHtml(expert.id || "");
                const memberName = this.escapeHtml(expert.displayName || expert.memberNickname || expert.memberName || "");
                const memberHandle = this.escapeHtml(expert.memberHandle || "");
                const fallback = this.escapeHtml(
                    this.getSearchConversationFallback(expert.memberName || expert.memberNickname),
                );

                const profileImage = this.escapeHtml(expert.memberProfileFileName || "");

                return `
                    <li class="Each-Expert" data-expert-id="${expertId}">
                        <div class="Each-Expert-Wrapper">
                            <div class="Expert-Image-Wrapper">
                                <div class="Expert-Image">
                                    ${profileImage
                                        ? `<img src="${profileImage}" alt="" loading="lazy" draggable="false" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.src='/images/profile/default_image.png';">`
                                        : `<div class="Expert-Image-Fallback">${fallback}</div>`
                                    }
                                </div>
                            </div>
                            <div class="Expert-Info">
                                <div class="Expert-Info-Wrapper">
                                    <div class="Expert-Name-Wrapper">
                                        <div class="Expert-Name">${memberName}</div>
                                        <div class="Expert-Badge-Wrapper">
                                            <div class="Expert-Badge">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                                     data-icon="icon-verified" viewBox="0 0 22 22" width="1em" height="1em"
                                                     display="flex" role="img" class="text-primary fill-badge">
                                                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="Expert-Id-Wrapper">
                                        <div class="Expert-Id">${memberHandle.startsWith("@") ? memberHandle : "@" + memberHandle}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                `;
            })
            .join("");
    },
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = ChatLayout;
}
