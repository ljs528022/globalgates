const adminService = (() => {
    const requestJson = async (url, options = {}) => {
        const requestOptions = {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            credentials: "include",
            ...options,
        };

        if (requestOptions.body !== undefined && requestOptions.body !== null) {
            requestOptions.headers = {
                ...requestOptions.headers,
                "Content-Type": "application/json",
            };
            requestOptions.body = JSON.stringify(requestOptions.body);
        }

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            return null;
        }

        return response.json();
    };

    const fetchJson = (url) => requestJson(url);

    const buildQuery = (params) => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "" && value !== "all") {
                searchParams.append(key, value);
            }
        });

        const queryString = searchParams.toString();
        return queryString ? `?${queryString}` : "";
    };

    return {
        requestJson,
        fetchJson,
        buildQuery,
    };
})();
