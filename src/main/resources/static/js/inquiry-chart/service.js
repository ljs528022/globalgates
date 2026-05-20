const inquiryChartService = (() => {
    const fetchJson = async (url) => {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
    };

    const getDashboard = () => fetchJson("/api/inquiry/chart/dashboard");

    return {
        fetchJson,
        getDashboard,
    };
})();
