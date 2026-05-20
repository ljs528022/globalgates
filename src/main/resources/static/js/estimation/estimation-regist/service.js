const estimationService = (() => {

    // 선택한 상품 주인 회원의 등록 상품 목록 조회
    const getProducts = async (memberId, callback) => {
        const response = await fetch(`/api/estimations/products?memberId=${memberId}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    // 회원 검색 (공유 시트) — 무한 스크롤 페이징.
    const getExperts = async (keyword, page, callback) => {
        const params = new URLSearchParams();
        if (keyword) params.append("keyword", keyword);
        if (page) params.append("page", page);
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await fetch(`/api/estimations/experts${query}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    const getProductOwners = async (keyword, page, callback) => {
        const params = new URLSearchParams();
        if (keyword) params.append("keyword", keyword);
        if (page) params.append("page", page);
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await fetch(`/api/estimations/product-owners${query}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const data = await response.json();
        if (callback) return callback(data);
        return data;
    };

    // 견적 요청 작성
    const writeEstimation = async (payload) => {
        const response = await fetch("/api/estimations/write", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const text = await response.text();
        return text ? JSON.parse(text) : true;
    };

    return {
        getProducts: getProducts,
        getExperts: getExperts,
        getProductOwners: getProductOwners,
        writeEstimation: writeEstimation
    };
})();
