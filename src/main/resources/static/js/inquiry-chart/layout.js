const inquiryChartLayout = (() => {
    const getTextContent = (element) =>
        element?.textContent?.replace(/\s+/g, " ").trim() ?? "";

    const escapeHtml = (value) =>
        String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

    return {
        getTextContent,
        escapeHtml,
    };
})();
