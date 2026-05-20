const adminLayout = (() => {
    const memberRoleBadgeMap = {
        business: { className: "badge-normal", text: "비즈니스" },
        expert: { className: "badge-expert", text: "전문가" },
        admin: { className: "badge-proplus", text: "관리자" },
    };

    const memberStatusBadgeMap = {
        active: { className: "badge-active", text: "활성" },
        inactive: { className: "badge-reject", text: "비활성" },
        banned: { className: "badge-pending", text: "정지" },
    };

    const postTypeBadgeMap = {
        product: { className: "badge-sale", text: "상품글" },
        general: { className: "badge-qna", text: "일반글" },
    };

    const reportStatusBadgeMap = {
        pending: { className: "badge-pending", text: "대기" },
        applied: { className: "badge-done", text: "승인" },
        rejected: { className: "badge-reject", text: "반려" },
    };

    const escapeHtml = (value) =>
        String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const getBadgeMarkup = (value, map, fallbackClass = "badge-normal") => {
        const badgeInfo = map[value] || { className: fallbackClass, text: value || "-" };
        return `<span class="badge ${badgeInfo.className}">${escapeHtml(badgeInfo.text)}</span>`;
    };

    const renderEmptyRow = (tbody, colSpan, message) => {
        tbody.innerHTML = `
            <div class="div-tr empty-row">
                <div class="div-td" style="grid-column: span ${colSpan}; text-align: center;">${escapeHtml(message)}</div>
            </div>
        `;
    };

    const setOptions = (select, options) => {
        if (!select) return;
        select.innerHTML = options.map((option) => `<option value="${option.value}">${option.label}</option>`).join("");
    };

    return {
        memberRoleBadgeMap,
        memberStatusBadgeMap,
        postTypeBadgeMap,
        reportStatusBadgeMap,
        escapeHtml,
        getBadgeMarkup,
        renderEmptyRow,
        setOptions,
    };
})();
