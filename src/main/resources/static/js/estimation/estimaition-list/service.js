const estimationListService = (() => {
    const requestJson = async (url, options = {}) => {
        const response = await fetch(url, {
            credentials: "include",
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.headers || {}),
            },
        });

        if (!response.ok) {
            throw new Error(`요청 처리에 실패했습니다. (${response.status})`);
        }

        return response.json();
    };

    const getEstimations = async (page = 1) => {
        return requestJson(`/api/estimations/list/${page}`);
    };

    const updateStatus = async (estimationId, status) => {
        return requestJson(`/api/estimations/${estimationId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        });
    };

    return {
        getEstimations,
        updateStatus,
    };
})();
