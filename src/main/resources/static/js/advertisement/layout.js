const advertisementLayout = (() => {
    const showAdList = (adWithPagingDTO, append = false) => {
        const tbody = document.querySelector('.MarketplaceAdTable tbody');
        const emptyState = document.querySelector('[data-list-empty]');
        const adList = adWithPagingDTO.advertisements;

        if (!adList || adList.length === 0) {
            if (!append) {
                tbody.replaceChildren();
                emptyState.hidden = false;
            }
            return;
        }

        emptyState.hidden = true;

        const rows = adList.map((ad) => {
            const statusClass = ad.status === 'active' ? 'active' : ad.status === 'expired' ? 'expired' : 'reported';
            const statusLabel = ad.status === 'active' ? '게시중' : ad.status === 'expired' ? '만료됨' : '신고됨';

            const attachmentLabel = (() => {
                if (!ad.adImageList || ad.adImageList.length === 0) return '선택된 파일이 없습니다.';
                if (ad.adImageList.length === 1) return ad.adImageList[0].originalName;
                return `${ad.adImageList[0].originalName} 외 ${ad.adImageList.length - 1}개`;
            })();

            const tr = document.createElement('tr');
            tr.className = 'MarketplaceAdListRow';
            tr.dataset.adId        = ad.id;
            tr.dataset.title       = ad.title;
            tr.dataset.headline    = ad.headline;
            tr.dataset.link        = ad.landingUrl;
            tr.dataset.attachment  = attachmentLabel;
            tr.dataset.copy        = ad.description;
            tr.dataset.amount      = ad.budget;
            tr.dataset.status      = ad.status;
            tr.dataset.statusLabel = statusLabel;
            tr.dataset.createdAt   = ad.createdDatetime;
            tr.dataset.receiptId   = ad.receiptId ?? '-';

            tr.innerHTML = `
            <td data-cell="title">${ad.title}</td>
            <td data-cell="headline">${ad.headline}</td>
            <td data-cell="link">${ad.landingUrl}</td>
            <td data-cell="attachment">${attachmentLabel}</td>
            <td>
                <span class="MarketplaceAdStatusBadge ${statusClass}" data-cell="statusLabel">
                    ${statusLabel}
                </span>
            </td>
            <td data-cell="createdAt">${ad.createdDatetime}</td>
            <td>
                <div class="MarketplaceAdTableActions">
                    <button class="MarketplaceAdTextButton AdListDetailButton" type="button">상세</button>
                </div>
            </td>
        `;

            return tr;
        });

        if (append) {
            // ✅ 무한 스크롤 — 기존 행에 추가
            rows.forEach(row => tbody.appendChild(row));
        } else {
            // ✅ 새 검색/필터 — 전체 교체
            tbody.replaceChildren(...rows);
        }
    };
    
    const showDetail = (ad) => {
        // 상태값 → CSS 클래스 / 라벨 변환
        const statusClass = ad.status === 'active' ? 'active' : ad.status === 'expired' ? 'expired' : 'reported';
        const statusLabel = ad.status === 'active' ? '게시중' : ad.status === 'expired' ? '만료됨' : '신고됨';

        // 첨부파일 표시 텍스트
        const attachmentLabel = (() => {
            if (!ad.adImageList || ad.adImageList.length === 0) return '선택된 파일이 없습니다.';
            if (ad.adImageList.length === 1) return ad.adImageList[0].originalName;
            return `${ad.adImageList[0].originalName} 외 ${ad.adImageList.length - 1}개`;
        })();

        // 상태 뱃지 — 헤더 / 운영 정보 패널 공통 처리
        document.querySelectorAll('[data-detail-field="statusLabelBadge"]')
            .forEach((node) => {
                node.className = `MarketplaceAdStatusBadge ${statusClass}`;
                node.textContent = statusLabel;
            });

        // 광고 제목 — 헤더 h2 + 광고 정보 패널 strong 동시 반영
        document.querySelectorAll('[data-detail-field="title"]')
            .forEach((node) => { node.textContent = ad.title; });

        // 헤드라인 — 헤더 p
        document.querySelectorAll('[data-detail-field="headline"]')
            .forEach((node) => { node.textContent = ad.headline; });

        // 헤드라인 — 광고 정보 패널 strong
        document.querySelectorAll('[data-detail-field="headlineSecondary"]')
            .forEach((node) => { node.textContent = ad.headline; });

        // URL
        document.querySelectorAll('[data-detail-field="link"]')
            .forEach((node) => { node.textContent = ad.landingUrl; });

        // 첨부파일
        document.querySelectorAll('[data-detail-field="attachment"]')
            .forEach((node) => { node.textContent = attachmentLabel; });

        // 상태 텍스트 — 운영 정보 패널
        document.querySelectorAll('[data-detail-field="statusLabel"]')
            .forEach((node) => { node.textContent = statusLabel; });

        // 접수일
        document.querySelectorAll('[data-detail-field="createdAt"]')
            .forEach((node) => { node.textContent = ad.createdDatetime; });

        // 광고 본문
        document.querySelectorAll('[data-detail-field="copy"]')
            .forEach((node) => { node.textContent = ad.description; });
    }

    return {showAdList: showAdList, showDetail: showDetail};
})();