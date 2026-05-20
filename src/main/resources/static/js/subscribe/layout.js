const subscribeLayout = (() => {

    // 가격 데이터
    const priceData = {
        free: {
            monthly: "₩0",
            annual: "₩0",
            annualTotal: "₩0",
            billingMonthly: "",
            billingAnnual: "",
            displayName: "Free",
        },
        // pro: {
        //     monthly: "₩30,000",
        //     annual: "₩25,000",
        //     annualTotal: "₩300,000",
        //     billingMonthly: "월간 결제",
        //     billingAnnual: "연간 결제",
        //     displayName: "Pro",
        // },
        // proPlus: {
        //     monthly: "₩50,000",
        //     annual: "₩40,000",
        //     annualTotal: "₩480,000",
        //     billingMonthly: "월간 결제",
        //     billingAnnual: "연간 결제",
        //     displayName: "Pro+",
        // },
        // expert: {
        //     monthly: "₩80,000",
        //     annual: "₩80,000",
        //     annualTotal: "₩80,000",
        //     billingMonthly: "월간 결제",
        //     billingAnnual: "월간 결제",
        //     displayName: "Expert",
        // },
        pro: {
            monthly: "₩1,000",
            annual: "₩1,000",
            annualTotal: "₩4,000",
            billingMonthly: "월간 결제",
            billingAnnual: "연간 결제",
            displayName: "Pro",
        },
        proPlus: {
            monthly: "₩2,000",
            annual: "₩2,000",
            annualTotal: "₩5,000",
            billingMonthly: "월간 결제",
            billingAnnual: "연간 결제",
            displayName: "Pro+",
        },
        expert: {
            monthly: "₩3,000",
            annual: "₩3,000",
            annualTotal: "₩6,000",
            billingMonthly: "월간 결제",
            billingAnnual: "월간 결제",
            displayName: "Expert",
        },
    };

    // 팝업 데이터
    const learnMoreData = {
        analytics: {
            title: "고급 통계 분석",
            desc: "마이페이지에서 활동 성과와 네트워크 반응을 세부적으로 확인할 수 있습니다.",
        },
        "boosted-replies": {
            title: "답글 부스트",
            desc: "Pro 구독자의 답글이 대화에서 더 눈에 띄게 노출됩니다.",
        },
        xpro: {
            title: "플랫폼 운영 도구",
            desc: "여러 흐름을 한 화면에서 관리하며 운영 효율을 높일 수 있습니다.",
        },
        supergrok: {
            title: "화상 채팅 가능",
            desc: "실시간 화상 채팅 기능으로 거래처와 바로 소통할 수 있습니다.",
        },
        "handle-marketplace": {
            title: "거래처 등록 요청",
            desc: "원하는 거래처를 직접 내 거래처로 등록 요청할 수 있습니다.",
        },
        "highest-reply-boost": {
            title: "전문가에게 견적 요청",
            desc: "고객이 전문가에게 직접 연락하고 견적을 요청할 수 있도록 연결합니다.",
        },
        radar: {
            title: "거래처 활동 확인",
            desc: "내 고객의 관심사와 활동 흐름을 분석하는 데 도움을 줍니다.",
        },
        "write-articles": {
            title: "게시글 작성 확장",
            desc: "더 긴 형식의 게시글로 정보 공유와 홍보를 확장할 수 있습니다.",
        },
        "get-paid": {
            title: "거래처 커뮤니케이션 확대",
            desc: "거래처와의 커뮤니케이션 범위를 넓히고 네트워크를 강화할 수 있습니다.",
        },
        "xpro-compare": {
            title: "플랫폼 운영 도구",
            desc: "여러 흐름을 한 화면에서 관리하며 운영 효율을 높일 수 있습니다.",
        },
        "media-studio": {
            title: "실시간 커뮤니케이션",
            desc: "실시간 커뮤니케이션 기능으로 거래처 대응 속도를 높일 수 있습니다.",
        },
        "analytics-compare": {
            title: "통계 차트 확인",
            desc: "활동 및 거래 데이터를 차트로 확인하며 분석할 수 있습니다.",
        },
    };

    // 매핑
    const tierMap = { pro: "pro", proPlus: "pro_plus", expert: "expert" };

    // 역매핑
    const planMap = { pro: "pro", pro_plus: "proPlus", expert: "expert" };

    // 플랜 등급 순서 (높을수록 상위)
    const tierRank = { free: 0, pro: 1, proPlus: 2, expert: 3 };

    // 유틸리티
    function parsePrice(value) {
        return Number(String(value).replace(/[^\d]/g, "")) || 0;
    }

    return { priceData: priceData, learnMoreData: learnMoreData, tierMap: tierMap, planMap: planMap, tierRank: tierRank, parsePrice: parsePrice };
})();
