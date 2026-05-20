const advertisementService = (() => {
    const estimateImpressions = (amount) => {
        return Math.round((Number(String(amount || "").replace(/[^\d]/g, "")) / 1000) * 5);
    };

    const memberInfo = async (callback) => {
        try {
            const response = await fetch("/api/member/info", {
                credentials: "include",
            });

            if (!response.ok) {
                console.warn("유저 정보 조회 실패:", response.status);
                if (callback) callback(null);
                return null;
            }

            const member = await response.json();
            if (callback) callback(member);
            return member;
        } catch (error) {
            console.error("유저 정보 조회 오류:", error);
            if (callback) callback(null);
            return null;
        }
    };

    const write = async (formState, attachments, bootpayResult) => {
        const data = bootpayResult.data ?? bootpayResult;

        const formData = new FormData();
        // AdvertisementDTO
        formData.append("title",              formState.adTitle);
        formData.append("headline",           formState.headline);
        formData.append("description",        formState.adBody);
        formData.append("landingUrl",         formState.landingUrl);
        formData.append("budget",             formState.budget);
        formData.append("impressionEstimate", estimateImpressions(formState.budget));
        if (formState.startedAt) {
            formData.append("startedAt",      formState.startedAt);
        }

        // ArrayList<MultipartFile> → images
        attachments.forEach((attachment) => {
            if (attachment.file) {
                formData.append("images", attachment.file);
            }
        });

        // PaymentAdvertisementDTO
        formData.append("payment.amount",        data.price);
        formData.append("payment.paymentMethod", data.method);
        formData.append("payment.receiptId",     data.receipt_id);
        formData.append("payment.paidAt",        data.requested_at ?? "");
        formData.append("payment.paymentStatus", data.status === 5 ? "pending" : "completed");

        const response = await fetch("/api/ad/write", {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        const text = await response.text();

        if (!response.ok) throw new Error("결제 정보 저장 실패");

        console.log("받아온 광고 id : " + JSON.parse(text).id);
        return JSON.parse(text).id;
    };

    const savePayment = async (bootpayResult, adId) => {
        const data = bootpayResult.data ?? bootpayResult;

        const response = await fetch("/api/payment/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                adId:          adId,
                amount:        data.price,
                paymentMethod: data.method,
                receiptId:     data.receipt_id,
                paidAt:        data.requested_at ?? null,
                paymentStatus: data.status === 5 ? "pending" : "completed"
            })
        });

        if (!response.ok) {
            throw new Error("결제 정보 저장 실패");
        }

        const message = await response.text();
        console.log(message);

        document.querySelector(".AdNavigationListButton").click();
    };

    const list = async (page, search, callback) => {
        if (typeof search === "function") {
            callback = search;
            search = null;
        }

        // URLSearchParams로 파라미터 조립
        const params = new URLSearchParams();
        if (search?.keyword)  params.append("keyword",  search.keyword);
        if (search?.filter && search.filter !== "all") params.append("filter", search.filter);

        const url = `/api/ad/list/${page}?${params.toString()}`;

        const response = await fetch(url, { credentials: "include" });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const adWithPagingDTO = await response.json();

        if (callback) callback(adWithPagingDTO);

        // criteria 반환 (무한 스크롤 hasMore 확인용)
        return adWithPagingDTO.criteria;
    };

    const detail = async (id, callback) => {
        const response = await fetch(`/api/ad/detail?id=${id}`, {
            credentials: "include",
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const advertisementDTO = await response.json();

        if (callback) {
            callback(advertisementDTO);
        }
    };

    // 광고 노출 시간 예측
    const predictDuration = async (budget, startedAt) => {
        const amount = Number(String(budget || "").replace(/[^\d]/g, ""));
        if (!amount || !startedAt) return null;

        // body data-ad-regression-api-url 에서 주입 (서버에서 ${EC2_HOST}:${FASTAPI_PORT}/api/ad-regression/predict 조립)
        const endpoint = document.body?.dataset?.adRegressionApiUrl || "";
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                payment_amount: amount,
                started_at: startedAt,
            }),
        });
        if (!response.ok) return null;
        return response.json();
    };

    return {
        memberInfo: memberInfo,
        write: write,
        savePayment: savePayment,
        list: list,
        detail: detail,
        predictDuration: predictDuration,
    };
})();