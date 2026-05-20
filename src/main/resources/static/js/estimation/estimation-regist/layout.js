const estimationLayout = (() => {

    // 상품 카드의 가격/재고 텍스트를 만든다.
    const formatProductMeta = (product) => {
        const parts = [];
        if (typeof product.productPrice === "number") {
            parts.push(`₩${product.productPrice.toLocaleString()}`);
        }
        if (typeof product.productStock === "number") {
            parts.push(`${product.productStock}개`);
        }
        return parts.join(" · ");
    };

    // 상품 카드의 해시태그 텍스트를 만든다.
    const formatProductTags = (product) => {
        return (product.hashtags ?? [])
            .map((hashtag) => hashtag?.tagName?.trim())
            .filter(Boolean)
            .map((tagName) => `#${tagName}`)
            .join(" ");
    };

    // 견적요청 모달의 상품 선택 카드 1개를 만든다.
    const createProductItem = (product) => {
        const productName = (product.postTitle ?? "상품").trim();
        const productMeta = formatProductMeta(product);
        const productTags = formatProductTags(product);
        const productImage = product.postFiles?.[0] ?? "/images/main/global-gates-logo.png";

        return `
            <button type="button"
                    class="productSelectModal__item"
                    data-product-id="${product.id ?? ""}"
                    data-product-name="${productName}"
                    data-product-meta="${productMeta}"
                    data-product-image="${productImage}"
                    aria-pressed="false">
                <span class="productSelectModal__checkbox" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><g><path d="M9 20c-.264 0-.518-.104-.707-.293l-4.785-4.785 1.414-1.414L9 17.586 19.072 7.5l1.42 1.416L9.708 19.7c-.188.19-.442.3-.708.3z"></path></g></svg>
                </span>
                <img class="productSelectModal__thumb" src="${productImage}" alt="${productName}">
                <span class="productSelectModal__item-body">
                    <strong class="productSelectModal__item-title">${productName}</strong>
                    <span class="productSelectModal__item-tags">${productTags}</span>
                    <span class="productSelectModal__item-meta">${productMeta}</span>
                </span>
            </button>
        `;
    };

    // 견적요청 모달의 상품 목록을 통째로 렌더한다.
    // 빈 목록이면 별도 empty 요소(#productSelectEmpty)만 보이도록 토글한다.
    const showProductList = (products) => {
        const list = document.getElementById("productSelectList");
        const empty = document.getElementById("productSelectEmpty");
        if (!list) return;

        const items = Array.isArray(products) ? products : [];

        if (empty) {
            empty.hidden = items.length > 0;
        }

        list.innerHTML = items.map(createProductItem).join("");
    };

    const createProductOwnerItem = (owner) => {
        const displayName = owner.memberNickname ?? owner.memberName ?? "회원";
        const avatar = owner.memberProfileFileName ?? "/images/profile/default_image.png";
        const email = owner.memberEmail ?? "";
        const handle = owner.memberHandle ? `@${owner.memberHandle}` : email;

        return `
            <button type="button"
                    class="productSelectModal__owner-item"
                    data-product-owner-id="${owner.id ?? ""}"
                    data-product-owner-email="${email}"
                    data-product-owner-name="${displayName}"
                    data-product-owner-avatar="${avatar}">
                <span class="productSelectModal__owner-avatar">
                    <img src="${avatar}" alt="${displayName}" />
                </span>
                <span class="productSelectModal__owner-body">
                    <span class="productSelectModal__owner-name">${displayName}</span>
                    <span class="productSelectModal__owner-handle">${handle}</span>
                </span>
            </button>
        `;
    };

    const showProductOwnerList = (owners) => {
        const list = document.getElementById("productOwnerList");
        if (!list) return;

        const items = Array.isArray(owners) ? owners : [];
        list.innerHTML = items.map(createProductOwnerItem).join("");
    };

    // 전문가 검색 시트의 결과 카드 1개를 만든다.
    // 클릭하면 event.js의 selectLinkedProfile이 data-share-user-* 속성을 읽어
    // 정적 요소(#composerLinkedProfileAvatar, #composerLinkedProfileEmail)를 갱신한다.
    const createExpertItem = (expert) => {
        const displayName = expert.memberNickname ?? expert.memberName ?? "전문가";
        const avatar = expert.memberProfileFileName ?? "/images/profile/default_image.png";
        const email = expert.memberEmail ?? "";
        const handle = expert.memberHandle ? `@${expert.memberHandle}` : email;

        return `
            <button type="button"
                    class="share-sheet__user"
                    data-share-user-id="${expert.id ?? ""}"
                    data-share-user-email="${email}"
                    data-share-user-name="${displayName}"
                    data-share-user-avatar="${avatar}">
                <span class="share-sheet__user-avatar">
                    <img src="${avatar}" alt="${displayName}" />
                </span>
                <span class="share-sheet__user-body">
                    <span class="share-sheet__user-name">${displayName}</span>
                    <span class="share-sheet__user-handle">${handle}</span>
                </span>
            </button>
        `;
    };

    // 전문가 검색 시트의 결과 목록을 렌더한다.
    // page === 1: 전체 교체 + empty 토글. page > 1: 뒤에 이어 붙임 (무한 스크롤).
    const showExpertList = (experts, page = 1) => {
        const list = document.getElementById("estimationShareChatUserList");
        const empty = document.getElementById("estimationShareChatEmpty");
        if (!list) return;

        const items = Array.isArray(experts) ? experts : [];
        const html = items.map(createExpertItem).join("");

        if (page === 1) {
            if (empty) empty.hidden = items.length > 0;
            list.innerHTML = html;
        } else {
            list.insertAdjacentHTML("beforeend", html);
        }
    };

    return {
        showProductList: showProductList,
        showProductOwnerList: showProductOwnerList,
        showExpertList: showExpertList
    };
})();
