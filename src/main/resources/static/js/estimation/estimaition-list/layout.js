const estimationListLayout = (() => {
    const escapeHtml = (value = "") =>
        String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

    const normalizeStatus = (status) => String(status ?? "").trim().toLowerCase();

    const toFilterState = (status) => {
        const normalized = normalizeStatus(status);
        return normalized === "approve" || normalized === "reject" ? normalized : "requesting";
    };

    const formatStatusLabel = (status) => {
        switch (normalizeStatus(status)) {
            case "approve":
                return "승인됨";
            case "reject":
                return "거절됨";
            default:
                return "요청중";
        }
    };

    const formatTags = (tags = []) => {
        const items = Array.isArray(tags) ? tags : [];
        if (!items.length) {
            return '<span class="Category-Tag">#태그없음</span>';
        }

        return items
            .map((tag, index) => `<span class="Category-Tag" data-cate-id="cate${index + 1}">#${escapeHtml(tag.tagName)}</span>`)
            .join("");
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const normalizeDate = (value) => {
        const text = String(value ?? "").trim();
        if (!text) return "";

        const matched = text.match(/^(\d{4}-\d{2}-\d{2})/);
        if (matched) return matched[1];

        const parsed = new Date(text);
        return Number.isNaN(parsed.getTime()) ? "" : formatDate(parsed);
    };

    const formatLocation = (location) => {
        const text = String(location ?? "").trim();
        return text ? escapeHtml(text) : "위치 미등록";
    };

    const getTitle = (estimation) => estimation.title || "견적 요청";

    const renderCard = (estimation) => {
        const id = estimation.id;
        const detailId = `detail-${id}`;
        const title = getTitle(estimation);
        const requesterEmail = estimation.requesterEmail || "-";
        const receiverEmail = estimation.receiverEmail || "-";
        const statusLabel = formatStatusLabel(estimation.status);

        return `
            <div class="postCard estimation-preview-card"
                 data-estimation-card
                 data-filter-state="${escapeHtml(toFilterState(estimation.status))}"
                 data-created-date="${escapeHtml(normalizeDate(estimation.createdDateTime))}"
                 data-estimation-detail-target="${detailId}">
                <div class="postBody">
                    <header class="postHeader">
                        <div class="postIdentity">
                            <div class="postAvatar postAvatar--image">
                                <img src="/images/main/ad.png" alt="" class="postAvatarImage"/>
                            </div>
                            <strong class="postName">${escapeHtml(receiverEmail)}</strong>
                            <span class="postHandle">견적 요청</span>
                            <span class="postTime">${escapeHtml(estimation.createdDateTime || "")}</span>
                        </div>
                        <div class="estimation-preview-card__status-wrap">
                            <span class="estimation-preview-card__status">${escapeHtml(statusLabel)}</span>
                        </div>
                    </header>
                    <div class="estimation-preview-card__link">
                        <div class="estimation-preview-card__person">
                            <img src="/images/main/ad.png" alt="" class="estimation-preview-card__avatar"/>
                            <span class="estimation-preview-card__email">${escapeHtml(requesterEmail)}</span>
                        </div>
                        <span class="estimation-preview-card__icon" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M6.354 5.5H4a3 3 0 1 0 0 6h3a4 4 0 0 0 .82-1H4a2 2 0 1 1 0-4h2.646A4 4 0 0 1 6.354 5.5z"></path>
                                <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"></path>
                            </svg>
                        </span>
                        <div class="estimation-preview-card__person">
                            <img src="/images/main/lown1.jpg" alt="" class="estimation-preview-card__avatar"/>
                            <span class="estimation-preview-card__email">${escapeHtml(receiverEmail)}</span>
                        </div>
                    </div>
                    <button type="button"
                            class="estimation-preview-card__body"
                            data-estimation-detail-target="${detailId}"
                            aria-label="${escapeHtml(title)} 상세 보기">
                        <div class="Detail-Category-Tags">${formatTags(estimation.tags)}</div>
                        <strong class="estimation-preview-card__title">${escapeHtml(title)}</strong>
                        <p class="postText">${escapeHtml(estimation.content || "")}</p>
                        <div class="estimation-preview-card__location">
                            <span class="estimation-preview-card__location-label">위치</span>
                            <span class="estimation-preview-card__location-text">${formatLocation(estimation.location)}</span>
                        </div>
                    </button>
                </div>
            </div>
        `;
    };

    const renderDetailPanel = (estimation) => {
        const id = estimation.id;
        const detailId = `detail-${id}`;
        const status = normalizeStatus(estimation.status);
        const decided = ["approve", "reject"].includes(status);

        return `
            <div class="estimation-detail-panel" data-estimation-detail-panel="${detailId}" hidden>
                <div class="estimation-detail-panel__hero">
                    <h3 class="estimation-detail-panel__title">${escapeHtml(getTitle(estimation))}</h3>
                    <p class="estimation-detail-panel__description">${escapeHtml(estimation.content || "")}</p>
                </div>
                <div class="estimation-detail-panel__link">
                    <div class="estimation-preview-card__person">
                        <img src="/images/main/ad.png" alt="" class="estimation-preview-card__avatar"/>
                        <span class="estimation-preview-card__email">${escapeHtml(estimation.requesterEmail || "-")}</span>
                    </div>
                    <span class="estimation-preview-card__icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M6.354 5.5H4a3 3 0 1 0 0 6h3a4 4 0 0 0 .82-1H4a2 2 0 1 1 0-4h2.646A4 4 0 0 1 6.354 5.5z"></path>
                            <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"></path>
                        </svg>
                    </span>
                    <div class="estimation-preview-card__person">
                        <img src="/images/main/lown1.jpg" alt="" class="estimation-preview-card__avatar"/>
                        <span class="estimation-preview-card__email">${escapeHtml(estimation.receiverEmail || "-")}</span>
                    </div>
                </div>
                <section class="estimation-detail-panel__section">
                    <h4 class="estimation-detail-panel__section-title">태그</h4>
                    <div class="Detail-Category-Tags">${formatTags(estimation.tags)}</div>
                </section>
                <section class="estimation-detail-panel__section">
                    <h4 class="estimation-detail-panel__section-title">상태</h4>
                    <p class="estimation-detail-panel__list" data-estimation-status-text="${detailId}">
                        ${escapeHtml(formatStatusLabel(estimation.status))}
                    </p>
                </section>
                <section class="estimation-detail-panel__section">
                    <h4 class="estimation-detail-panel__section-title">위치</h4>
                    <p class="estimation-detail-panel__list">${formatLocation(estimation.location)}</p>
                </section>
                <div class="estimation-action-slot estimation-action-slot--modal">
                    <div class="estimation-action-group estimation-action-group--modal"
                         data-estimation-decision-group="${detailId}" ${decided ? "hidden" : ""}>
                        <button type="button"
                                class="estimation-action-btn estimation-action-btn--approve"
                                data-estimation-decision-id="${detailId}"
                                data-estimation-decision="approve"
                                aria-pressed="false">승인</button>
                        <button type="button"
                                class="estimation-action-btn estimation-action-btn--reject"
                                data-estimation-decision-id="${detailId}"
                                data-estimation-decision="reject"
                                aria-pressed="false">거절</button>
                    </div>
                    <div class="estimation-approved-state" data-estimation-approved-state="${detailId}" ${status === "approve" ? "" : "hidden"}>승인됨</div>
                    <div class="estimation-rejected-state" data-estimation-rejected-state="${detailId}" ${status === "reject" ? "" : "hidden"}>거절됨</div>
                </div>
            </div>
        `;
    };

    const renderEmpty = () => '<p class="estimation-empty">등록된 견적요청이 없습니다.</p>';

    const renderLoadError = () => '<p class="estimation-empty">견적 목록을 불러오지 못했습니다.</p>';

    return {
        escapeHtml,
        normalizeStatus,
        toFilterState,
        formatStatusLabel,
        formatDate,
        normalizeDate,
        renderCard,
        renderDetailPanel,
        renderEmpty,
        renderLoadError,
    };
})();
