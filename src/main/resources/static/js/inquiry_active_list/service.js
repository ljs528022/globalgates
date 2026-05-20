const inquiryActivityService = (() => {
    const getTextContent = (element) =>
        element?.textContent?.replace(/\s+/g, " ").trim() ?? "";

    const escapeHtml = (value) =>
        String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

    const buildAvatarDataUrl = (label) => {
        const safeLabel = escapeHtml(String(label || "나").slice(0, 2));
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><rect width="72" height="72" rx="36" fill="#1d9bf0"></rect><text x="36" y="43" text-anchor="middle" font-size="28" font-family="Arial, sans-serif" fill="#ffffff">${safeLabel}</text></svg>`;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    };

    const getPostCard = (element) => element?.closest(".postCard") ?? null;

    const getPostAvatarSrc = (postCard) => {
        const avatarImage = postCard?.querySelector(".postAvatarImage");
        return avatarImage?.getAttribute("src") || "/images/profile/default_image.png";
    };

    return {
        getTextContent,
        escapeHtml,
        buildAvatarDataUrl,
        getPostCard,
        getPostAvatarSrc,
    };
})();
