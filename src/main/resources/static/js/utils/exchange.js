window.addEventListener("DOMContentLoaded", () => {
    const exchangeRateFeedContent = document.getElementById("exchangeRateFeedContent");
    const exchangeRateFeedSubtitle = document.getElementById("exchangeRateFeedSubtitle");

    if (exchangeRateFeedContent) {
        const currencyLabels = { KRW: "대한민국 원", EUR: "유로", JPY: "일본 엔", CNY: "중국 위안", GBP: "영국 파운드" };
        const codes = ["KRW", "EUR", "JPY", "CNY", "GBP"];

        function renderRates(rates, dateStr) {
            let html = "";
            for (let i = 0; i < codes.length; i++) {
                const code = codes[i]; const label = currencyLabels[code] || code; const value = rates[code];
                const digits = code === "JPY" ? 2 : 4;
                const formatted = value.toLocaleString("ko-KR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
                html += '<div class="exchangeRateRow"><div class="exchangeRateMain"><div class="exchangeRateCurrencyLine"><span class="exchangeRateCurrency">' + code + '</span><span class="exchangeRateCurrencyName">' + label + '</span></div><span class="exchangeRateMeta">1 USD</span></div><div class="exchangeRateValueWrap"><span class="exchangeRateValue">' + formatted + '</span></div></div>';
            }
            exchangeRateFeedContent.innerHTML = html;
            if (exchangeRateFeedSubtitle && dateStr) {
                const d = new Date(dateStr); const month = (d.getMonth() + 1); const day = d.getDate();
                exchangeRateFeedSubtitle.textContent = "USD 기준 주요 통화 · " + month + "월 " + day + "일 기준";
            }
        }

        fetch("https://open.er-api.com/v6/latest/USD")
            .then((res) => { return res.json(); })
            .then((data) => { renderRates(data.rates, data.time_last_update_utc); })
            .catch((err) => { exchangeRateFeedContent.innerHTML = '<p class="exchangeRateFeedState">환율 정보를 불러오지 못했습니다.</p>'; });
    }
})
