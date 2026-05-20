const subscribeService = (() => {

    // 구독 등록 (subscriptionId 반환)
    // 월간 정기결제: billingKey + amount 함께 전달 → 백엔드가 첫 결제까지 처리
    // 연간/free: billingKey 생략 (또는 null)
    const subscribe = async (tier, billingCycle, expiresAt, billingKey, amount) => {
        const response = await fetch("/api/subscriptions/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tier, billingCycle, expiresAt, billingKey, amount }),
        });
        return await response.json();
    };

    // 결제 정보 저장
    const savePayment = async (subscriptionId, amount, bootpayData) => {
        await fetch("/api/payment/subscribe/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subscriptionId: subscriptionId,
                amount: amount,
                paymentMethod: bootpayData.method_origin || bootpayData.method || "",
                receiptId: bootpayData.receipt_id || "",
                paidAt: bootpayData.purchased_at || null,
                paymentStatus: bootpayData.status === 5 ? "pending" : "completed",
            }),
        });
    };

    // 현재 구독 조회
    const getMy = async () => {
        const response = await fetch("/api/subscriptions/my");
        if (!response.ok) return null;
        return await response.json();
    };

    // 구독 해지
    const cancel = async (id) => {
        await fetch("/api/subscriptions/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
    };

    return { subscribe: subscribe, savePayment: savePayment, getMy: getMy, cancel: cancel };
})();
