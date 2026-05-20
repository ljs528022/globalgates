window.onload = () => {
    // 화면 로딩되면 가장 먼저 유저 정보 조회하기.
    // loginService 대신 advertisementService.memberInfo()로 직접 요청
    advertisementService.memberInfo((member) => {
        if (!member) return;
        document.querySelector('.AccountTriggerButton .Button-label')
            .textContent = member.memberName;
        document.querySelector('.User-profileImage')
            .src = member.filePath ? member.filePath : "/images/main/global-gates-logo.png";
        document.querySelector('.AdCreativePreviewAvatar')
            .src = member.filePath ? member.filePath : "/images/main/global-gates-logo.png";
        document.querySelector('.AdCreativePreviewNameRow strong')
            .textContent = member.memberName;
        document.querySelector('.AdCreativePreviewHandle')
            .textContent = `${member.memberHandle}`;
    });

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) =>
        Array.from(scope.querySelectorAll(selector));

    const DEFAULT_BUDGET = 300000;
    const IMPRESSIONS_PER_THOUSAND_WON = 5;

    const viewMeta = {
        apply: {
            title: "광고 신청",
            description: "커뮤니티 피드에 노출할 광고를 간단히 작성하고 결제 후 접수하세요.",
        },
        list: {
            title: "신청 광고 목록",
            description: "접수된 광고 제목, 헤드라인, URL, 첨부파일, 상태를 한 번에 확인할 수 있습니다.",
        },
        detail: {
            title: "광고 상세",
            description: "선택한 광고의 본문과 결제 접수 정보를 확인할 수 있습니다.",
        },
    };

    // ################# 무한 스크롤 #################
    let criteria = { hasMore: true };
    let page = 1;
    let isLoading = false;

    // sentinel 요소 생성 (광고 목록 테이블 바깥 하단에 붙임)
    const sentinel = document.createElement("div");
    sentinel.id = "adListSentinel";
    sentinel.style.height = "1px";

    // sentinel을 DOM에 붙이는 함수 (showAdList가 목록을 교체할 때마다 재호출)
    function attachSentinel() {
        const existing = document.getElementById("adListSentinel");
        if (existing) existing.remove();

        const listContainer = $(".MarketplaceAdView[data-view='list']");
        if (listContainer) {
            listContainer.appendChild(sentinel);
            observer.observe(sentinel);
        }
    }

    const observer = new IntersectionObserver(async (entries) => {
        const entry = entries[0];

        if (!entry.isIntersecting || isLoading || !criteria.hasMore) return;

        isLoading = true;

        try {
            criteria = await advertisementService.list(++page, {
                keyword:  root.listSearch?.value.trim() || "",
                filter:   state.listStatusFilter
            }, (data) => advertisementLayout.showAdList(data, true));
        } catch (e) {
            console.error("광고 목록 추가 로드 실패:", e);
            --page;
        } finally {
            isLoading = false;
        }
    }, { threshold: 0.1 });

    // 목록 초기화 + 첫 페이지 로드 함수
    async function resetAndLoadList(params) {
        page = 1;
        criteria = { hasMore: true };
        isLoading = false;

        criteria = await advertisementService.list(page, params, (data) => {
            advertisementLayout.showAdList(data, false);
            attachSentinel();
        });
    }

    const state = {
        currentView: "apply",
        currentModal: null,
        currentDropdown: null,
        listStatusFilter: "all",
        selectedAdId: "ad-2026-101",
        attachments: [],
        toastTimer: null,
        searchTimer: null,
        durationTimer: null,
        durationRequestId: 0,
    };

    const root = {
        title: $("[data-view-title]"),
        description: $("[data-view-description]"),
        views: $$(".MarketplaceAdView"),
        overlay: $("[data-modal-overlay]"),
        modals: $$("[data-modal]"),
        dropdowns: $$("[data-dropdown]"),
        accountTrigger: $(".AccountTriggerButton"),
        profileTrigger: $(".ProfileTriggerButton"),
        headerGuideButton: $('[data-header-action="guide"]'),
        headerPaymentButton: $('[data-header-action="payment"]'),
        listSearch: $("[data-list-search]"),
        listStatusFilter: $("[data-list-status-filter]"),
        uploadInput: $("[data-upload-input]"),
        uploadClearButton: $("[data-upload-clear]"),
        attachmentPreview: $("[data-attachment-preview]"),
        attachmentList: $("[data-attachment-list]"),
        previewAttachmentPlaceholder: $('[data-preview-field="attachmentPlaceholder"]'),
        previewAttachmentGallery: $('[data-preview-field="attachmentGallery"]'),
        previewAttachmentImage: $('[data-preview-field="attachmentImage"]'),
        previewAttachmentVideo: $('[data-preview-field="attachmentVideo"]'),
        toast: $("[data-toast]"),
        navApplyItem: $(".AdNavigationApplyItem"),
        navListItem: $(".AdNavigationListItem"),
        navDetailItem: $(".AdNavigationDetailItem"),
    };

    function parseNumber(value) {
        return Number(String(value || "").replace(/[^\d]/g, "")) || 0;
    }

    function formatCurrency(value) {
        return `₩${parseNumber(value).toLocaleString("ko-KR")}`;
    }

    function formatImpressions(value) {
        return `약 ${Math.max(0, Number(value) || 0).toLocaleString("ko-KR")}회`;
    }

    function getFormValue(fieldName) {
        return $(`[data-form-field="${fieldName}"]`)?.value?.trim() || "";
    }

    function getBudgetAmount() {
        return parseNumber(getFormValue("budget")) || 0;
    }

    function estimateImpressions(amount) {
        return Math.round((parseNumber(amount) / 1000) * IMPRESSIONS_PER_THOUSAND_WON);
    }

    function getLinkHost(url) {
        try {
            const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
            return new URL(normalized).hostname.replace(/^www\./i, "");
        } catch (error) {
            return "globalgates.com";
        }
    }

    function getAttachmentLabel() {
        if (!state.attachments.length) return "선택된 파일이 없습니다.";
        if (state.attachments.length === 1) return state.attachments[0].name;
        return `${state.attachments[0].name} 외 ${state.attachments.length - 1}개`;
    }

    function getFormState() {
        return {
            adTitle:    getFormValue("adTitle")   || "광고 제목을 입력해 주세요",
            headline:   getFormValue("headline")  || "헤드라인을 입력해 주세요",
            landingUrl: getFormValue("landingUrl")|| "https://globalgates.com",
            adBody:     getFormValue("adBody")    || "광고 내용을 입력하면 여기에 바로 반영됩니다.",
            budget:     getBudgetAmount(),
            startedAt:  getFormValue("startedAt"),
            attachment: getAttachmentLabel(),
        };
    }

    function setText(target, value) {
        if (target) target.textContent = value;
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener("load", (event) => {
                resolve(typeof event.target?.result === "string" ? event.target.result : "");
            });
            reader.addEventListener("error", () => resolve(""));
            reader.readAsDataURL(file);
        });
    }

    function syncUploadInputFiles() {
        if (!root.uploadInput || typeof DataTransfer === "undefined") return;
        const transfer = new DataTransfer();
        state.attachments.forEach((attachment) => {
            if (attachment.file) transfer.items.add(attachment.file);
        });
        root.uploadInput.files = transfer.files;
    }

    function releaseAttachmentResources(attachments) {
        attachments.forEach((attachment) => {
            if (attachment?.objectUrl) URL.revokeObjectURL(attachment.objectUrl);
        });
    }

    function handleAttachmentRemove(index) {
        const removed = state.attachments.filter((_, i) => i === index);
        releaseAttachmentResources(removed);
        state.attachments = state.attachments.filter((_, i) => i !== index);
        syncUploadInputFiles();
        syncApplySummary();
    }

    function createAttachmentCard(attachment, compact = false, index = 0) {
        const item = document.createElement("div");
        item.className = `MarketplaceAdAttachmentCard${compact ? " is-compact" : ""}`;

        const thumb = document.createElement("div");
        thumb.className = "MarketplaceAdAttachmentCardThumb";
        thumb.dataset.fileKind = attachment.kind;

        if (attachment.kind === "image" && attachment.previewUrl) {
            thumb.style.backgroundImage = `url("${attachment.previewUrl}")`;
        } else {
            thumb.textContent = attachment.kind === "video" ? "VIDEO" : "FILE";
        }

        const name = document.createElement("span");
        name.className = "MarketplaceAdAttachmentCardName";
        name.textContent = attachment.name;

        if (!compact) {
            const removeButton = document.createElement("button");
            removeButton.className = "MarketplaceAdAttachmentRemoveButton";
            removeButton.type = "button";
            removeButton.dataset.attachmentRemove = String(index);
            removeButton.setAttribute("aria-label", `${attachment.name} 제거`);
            removeButton.textContent = "×";
            item.append(removeButton);
        }

        item.append(thumb, name);
        return item;
    }

    function renderAttachmentGallery(container, compact = false) {
        if (!container) return;
        container.replaceChildren();
        state.attachments.forEach((attachment, index) => {
            container.appendChild(createAttachmentCard(attachment, compact, index));
        });
    }

    function renderPreviewGallery() {
        if (!root.previewAttachmentGallery) return;
        root.previewAttachmentGallery.replaceChildren();
        state.attachments
            .filter((a) => a.kind === "image" && a.previewUrl)
            .slice(0, 4)
            .forEach((attachment) => {
                const tile = document.createElement("div");
                tile.className = "AdCreativePreviewMediaTile";
                tile.style.backgroundImage = `url("${attachment.previewUrl}")`;
                root.previewAttachmentGallery.appendChild(tile);
            });
    }

    function syncAttachmentPreview() {
        const hasAttachments = state.attachments.length > 0;
        const primaryAttachment = state.attachments[0] || null;
        const isImage = primaryAttachment?.kind === "image" && Boolean(primaryAttachment.previewUrl);
        const isVideo = primaryAttachment?.kind === "video" && Boolean(primaryAttachment.objectUrl);
        const imageCount = state.attachments.filter((a) => a.kind === "image" && a.previewUrl).length;
        const useGallery = imageCount > 1;

        // ── 신청 폼의 첨부파일 목록 영역 ──
        if (root.uploadClearButton) root.uploadClearButton.hidden = !hasAttachments;
        if (root.attachmentPreview) root.attachmentPreview.hidden = !hasAttachments;
        if (root.attachmentList) renderAttachmentGallery(root.attachmentList);

        // ── 프리뷰 갤러리 (이미지 2장 이상) ──
        if (root.previewAttachmentGallery) {
            root.previewAttachmentGallery.hidden = !useGallery;
            if (useGallery) renderPreviewGallery();
        }

        // ── 프리뷰 단일 이미지 (이미지 1장) ──
        if (root.previewAttachmentImage) {
            const showSingleImage = isImage && !useGallery;
            root.previewAttachmentImage.hidden = !showSingleImage;
            root.previewAttachmentImage.src = showSingleImage ? primaryAttachment.previewUrl : "";
        }

        // ── 프리뷰 동영상 ──
        if (root.previewAttachmentVideo) {
            root.previewAttachmentVideo.hidden = !isVideo;
            if (isVideo) {
                root.previewAttachmentVideo.src = primaryAttachment.objectUrl;
                root.previewAttachmentVideo.load();
                root.previewAttachmentVideo.play().catch(() => {});
            } else {
                root.previewAttachmentVideo.pause();
                root.previewAttachmentVideo.src = "";
            }
        }

        // ── 프리뷰 플레이스홀더: 첨부가 없을 때만 표시 ──
        if (root.previewAttachmentPlaceholder) {
            const showPlaceholder = !isImage && !isVideo && !useGallery;
            root.previewAttachmentPlaceholder.hidden = !showPlaceholder;
            root.previewAttachmentPlaceholder.dataset.fileKind = primaryAttachment?.kind || "empty";
            root.previewAttachmentPlaceholder.textContent = "";
        }
    }

    function validateAttachments(files) {
        if (!files.length) return { valid: true };

        const hasUnsupported = files.some(
            (f) => !f.type.startsWith("image/") && !f.type.startsWith("video/")
        );
        if (hasUnsupported) return { valid: false, message: "이미지 또는 동영상 파일만 첨부할 수 있습니다." };

        const imageFiles = files.filter((f) => f.type.startsWith("image/"));
        const videoFiles = files.filter((f) => f.type.startsWith("video/"));

        if (imageFiles.length && videoFiles.length)
            return { valid: false, message: "이미지와 동영상은 함께 업로드할 수 없습니다." };
        if (videoFiles.length > 1 || (videoFiles.length === 1 && files.length > 1))
            return { valid: false, message: "동영상은 1개만 업로드할 수 있습니다." };
        if (!videoFiles.length && imageFiles.length > 4)
            return { valid: false, message: "이미지는 최대 4장까지 업로드할 수 있습니다." };

        return { valid: true };
    }

    async function buildAttachments(files) {
        return Promise.all(
            files.map(async (file) => {
                const kind = file.type.startsWith("image/") ? "image"
                    : file.type.startsWith("video/") ? "video" : "file";
                return {
                    name: file.name,
                    kind,
                    file,
                    previewUrl: kind === "image" ? await readFileAsDataUrl(file) : "",
                    objectUrl:  kind === "video" ? URL.createObjectURL(file) : "",
                };
            })
        );
    }

    function clearAttachments() {
        releaseAttachmentResources(state.attachments);
        state.attachments = [];
        if (root.uploadInput) root.uploadInput.value = "";
        syncApplySummary();
    }

    function syncViewMeta() {
        const meta = viewMeta[state.currentView];
        setText(root.title, meta.title);
        setText(root.description, meta.description);
    }

    function syncViewVisibility() {
        root.views.forEach((view) => {
            const isActive = view.dataset.view === state.currentView;
            view.hidden = !isActive;
            view.classList.toggle("is-active", isActive);
        });
    }

    function syncNavigationSelection() {
        root.navApplyItem?.classList.toggle("is-selected", state.currentView === "apply");
        root.navListItem?.classList.toggle("is-selected",  state.currentView === "list");
        root.navDetailItem?.classList.toggle("is-selected", state.currentView === "detail");
    }

    function syncHeaderActions() {
        if (root.headerGuideButton) root.headerGuideButton.hidden = false;
        if (root.headerPaymentButton) root.headerPaymentButton.hidden = state.currentView !== "apply";
    }

    function syncDropdowns() {
        root.dropdowns.forEach((dropdown) => {
            dropdown.hidden = dropdown.dataset.dropdown !== state.currentDropdown;
        });
        [root.accountTrigger, root.profileTrigger].forEach((button) => {
            if (!button) return;
            button.setAttribute("aria-expanded",
                String(button.dataset.dropdownTrigger === state.currentDropdown));
        });
    }

    function syncModals() {
        const isOpen = Boolean(state.currentModal);
        if (root.overlay) root.overlay.hidden = !isOpen;
        root.modals.forEach((modal) => {
            modal.hidden = modal.dataset.modal !== state.currentModal;
        });
    }

    function syncApplySummary() {
        const formState = getFormState();
        const amountLabel = formatCurrency(formState.budget);
        const impressionLabel = formatImpressions(estimateImpressions(formState.budget));
        const budgetInput = $('[data-form-field="budget"]');
        const previewBody = $('[data-preview-field="adBody"]');

        if (budgetInput && document.activeElement !== budgetInput) {
            budgetInput.value = formState.budget ? formState.budget.toLocaleString("ko-KR") : "";
        }

        setText($('[data-summary-field="amountLabel"]'),     amountLabel);
        setText($('[data-summary-field="impressionLabel"]'), impressionLabel);
        setText($('[data-summary-field="impressionHelper"]'), `예상 노출 ${impressionLabel.replace("약 ", "")}`);
        setText($('[data-summary-field="linkLabel"]'),       formState.landingUrl);
        setText($('[data-summary-field="attachmentLabel"]'), formState.attachment);
        setText($('[data-summary-field="attachmentSummary"]'), formState.attachment);
        setText($('[data-preview-field="headline"]'),        formState.headline);

        if (previewBody) {
            previewBody.textContent = formState.adBody;
            previewBody.classList.toggle("is-placeholder", !getFormValue("adBody"));
        }

        setText($('[data-preview-field="landingUrl"]'),      getLinkHost(formState.landingUrl));
        setText($('[data-payment-field="adTitle"]'),         formState.adTitle);
        setText($('[data-payment-field="headline"]'),        formState.headline);
        setText($('[data-payment-field="linkLabel"]'),       formState.landingUrl);
        setText($('[data-payment-field="attachmentLabel"]'), formState.attachment);
        setText($('[data-payment-field="amountLabel"]'),     amountLabel);
        setText($('[data-payment-field="impressionLabel"]'), impressionLabel);
        syncAttachmentPreview();

        scheduleDurationPrediction(formState.budget, formState.startedAt);
    }

    // budget + startedAt 입력에 따라 예상 노출 시간/종료 예정 시각을 비동기로 갱신.
    // 마지막 입력 후 300ms 디바운스, 응답이 늦게 오는 옛 요청은 requestId 로 무시.
    function scheduleDurationPrediction(budget, startedAt) {
        clearTimeout(state.durationTimer);
        if (!budget || !startedAt) {
            setDurationLabels("—", "—");
            return;
        }
        state.durationTimer = setTimeout(async () => {
            const requestId = ++state.durationRequestId;
            try {
                const result = await advertisementService.predictDuration(budget, startedAt);
                if (requestId !== state.durationRequestId) return; // 더 새 요청 있음
                if (!result) {
                    setDurationLabels("계산 실패", "—");
                    return;
                }
                setDurationLabels(
                    formatDurationMinutes(result.predictedElapsedMinutes),
                    formatDateTime(result.predictedEndAt),
                );
            } catch (_err) {
                if (requestId === state.durationRequestId) setDurationLabels("계산 실패", "—");
            }
        }, 300);
    }

    function setDurationLabels(durationText, endText) {
        setText($('[data-summary-field="estimatedDurationLabel"]'), durationText);
        setText($('[data-summary-field="estimatedEndLabel"]'),      endText);
        setText($('[data-payment-field="estimatedDurationLabel"]'), durationText);
        setText($('[data-payment-field="estimatedEndLabel"]'),      endText);
    }

    function formatDurationMinutes(minutes) {
        const n = Number(minutes);
        if (!Number.isFinite(n) || n < 0) return "—";
        if (n < 60) return `약 ${n.toFixed(1)}분`;
        const hours = Math.floor(n / 60);
        const remaining = Math.round(n % 60);
        return `약 ${hours}시간 ${remaining}분`;
    }

    function formatDateTime(isoString) {
        if (!isoString) return "—";
        const d = new Date(isoString);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleString("ko-KR", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
        });
    }

    function getRows() { return $$(".MarketplaceAdListRow"); }

    function getVisibleOperationalRows() {
        return getRows().filter((row) => !row.classList.contains("is-hidden-row"));
    }

    function getRowById(adId) {
        return $(`.MarketplaceAdListRow[data-ad-id="${adId}"]`);
    }

    function getActiveRow() {
        return getRowById(state.selectedAdId) || getVisibleOperationalRows()[0] || null;
    }

    function setStatusBadge(node, status, label) {
        if (!node) return;
        node.className = `MarketplaceAdStatusBadge is-${status}`;
        node.textContent = label;
    }

    function syncListFilters() {
        const query = root.listSearch?.value.trim().toLowerCase() || "";
        const status = state.listStatusFilter;
        let visibleCount = 0;

        getRows().forEach((row) => {
            if (row.classList.contains("is-hidden-row")) return;
            const rowText = row.textContent.toLowerCase();
            const matchQuery = !query || rowText.includes(query);
            const matchStatus = status === "all" || row.dataset.status === status;
            row.hidden = !(matchQuery && matchStatus);
            if (!row.hidden) visibleCount++;
        });

        const empty = $("[data-list-empty]");
        if (empty) empty.hidden = visibleCount > 0;
        if (root.listStatusFilter) root.listStatusFilter.value = state.listStatusFilter;
    }

    function syncDetailView() {
        const row = getActiveRow();
        if (!row) return;
        const data = row.dataset;

        setStatusBadge($('[data-detail-field="statusLabelBadge"]'), data.status, data.statusLabel);

        const mapping = {
            title:             data.title,
            headline:          data.headline,
            headlineSecondary: data.headline,
            link:              data.link,
            attachment:        data.attachment,
            copy:              data.copy,
            statusLabel:       data.statusLabel,
            createdAt:         data.createdAt,
        };

        Object.entries(mapping).forEach(([key, value]) => {
            $$(`[data-detail-field="${key}"]`).forEach((node) => { node.textContent = value; });
        });
    }

    function syncAll() {
        syncViewMeta();
        syncViewVisibility();
        syncNavigationSelection();
        syncHeaderActions();
        syncDropdowns();
        syncModals();
        syncApplySummary();
        syncListFilters();
        syncDetailView();
    }

    function showToast(message) {
        if (!root.toast) return;
        root.toast.textContent = message;
        root.toast.hidden = false;
        clearTimeout(state.toastTimer);
        state.toastTimer = window.setTimeout(() => { root.toast.hidden = true; }, 2200);
    }

    function setView(viewName) {
        state.currentView = viewName;
        syncAll();
    }

    function openModal(name) {
        state.currentModal = name;
        syncModals();
    }

    function closeModal() {
        state.currentModal = null;
        syncModals();
    }

    function positionDropdown(name, trigger) {
        const dropdown = $(`[data-dropdown="${name}"]`);
        if (!dropdown || !trigger) return;
        const rect = trigger.getBoundingClientRect();
        dropdown.style.top  = `${rect.bottom + 8}px`;
        dropdown.style.left = `${Math.max(16, rect.right - 180)}px`;
    }

    function toggleDropdown(name, trigger) {
        state.currentDropdown = state.currentDropdown === name ? null : name;
        if (state.currentDropdown) positionDropdown(name, trigger);
        syncDropdowns();
    }

    function closeDropdowns() {
        state.currentDropdown = null;
        syncDropdowns();
    }

    function updateDraftRowFromForm(paymentText, receiptId) {
        const row = getRowById("draft-slot");
        if (!row) return;

        const formState = getFormState();
        const createdAt = new Date();
        const createdText = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")} ${String(createdAt.getHours()).padStart(2, "0")}:${String(createdAt.getMinutes()).padStart(2, "0")}`;

        row.classList.remove("is-hidden-row");
        row.dataset.title       = formState.adTitle;
        row.dataset.headline    = formState.headline;
        row.dataset.link        = formState.landingUrl;
        row.dataset.attachment  = formState.attachment;
        row.dataset.copy        = formState.adBody;
        row.dataset.status      = "active";
        row.dataset.statusLabel = "게시중";
        row.dataset.payment     = paymentText;
        row.dataset.amount      = String(formState.budget);
        row.dataset.createdAt   = createdText;
        row.dataset.receiptId   = receiptId;

        setText($('[data-cell="title"]',      row), formState.adTitle);
        setText($('[data-cell="headline"]',   row), formState.headline);
        setText($('[data-cell="link"]',       row), formState.landingUrl);
        setText($('[data-cell="attachment"]', row), formState.attachment);
        setText($('[data-cell="createdAt"]',  row), createdText);
        setStatusBadge($('[data-cell="statusLabel"]', row), "active", "게시중");
    }

    async function submitPayment() {
        const formState = getFormState();
        const budgetAmount = parseNumber(formState.budget);
        const receiptId = `GG-${Date.now()}`;
        const paymentStatus = $("[data-payment-status]");

        if (budgetAmount <= 0) {
            setText(paymentStatus, "광고 예산을 입력한 뒤 결제를 진행해 주세요.");
            showToast("광고 예산을 입력해 주세요.");
            return;
        }

        setText(paymentStatus, "결제창을 준비 중입니다...");

        if (typeof Bootpay === "undefined") {
            updateDraftRowFromForm("데모 접수 완료", receiptId);

            const demoResult = {
                price:        budgetAmount,
                method:       "데모",
                receipt_id:   receiptId,
                purchased_at: new Date().toISOString(),
            };

            const adId = await advertisementService.write(formState, state.attachments, demoResult);
            await advertisementService.savePayment(demoResult, adId);

            setText(paymentStatus, "부트페이 SDK가 없어 데모 접수로 반영했습니다.");
            closeModal();
            state.selectedAdId = "draft-slot";
            setView("detail");
            showToast("광고 신청이 접수되었습니다.");
            return;
        }

        try {
            const response = await Bootpay.requestPayment({
                application_id: "69604bcaeaa52ce41d212a83",
                price: budgetAmount,
                order_name: `${formState.adTitle} 광고 신청`,
                order_id: `AD_${Date.now()}`,
                pg: "라이트페이",
                tax_free: 0,
                user: {
                    id:       "advertiser",
                    username: "광고주",
                    phone:    "01000000000",
                    email:    "advertiser@globalgates.com",
                },
                items: [
                    {
                        id:    "community-ad",
                        name:  `커뮤니티 피드 광고 - ${formState.adTitle}`,
                        qty:   1,
                        price: budgetAmount,
                    },
                ],
                extra: {
                    open_type:  "iframe",
                    card_quota: "0,2,3",
                    escrow:     false,
                },
            });

            if (response?.event === "confirm") {
                const confirmed = await Bootpay.confirm();

                if (confirmed?.event === "done") {
                    updateDraftRowFromForm("부트페이 결제 완료", confirmed.receipt_id || receiptId);
                    const adId = await advertisementService.write(formState, state.attachments, confirmed, 1);
                    await advertisementService.savePayment(confirmed, adId);

                } else if (confirmed?.event === "issued") {
                    updateDraftRowFromForm("가상계좌 입금 대기", confirmed.receipt_id || receiptId);
                    const issuedResult = { ...confirmed, method: confirmed.method || "가상계좌", purchased_at: null };
                    const adId = await advertisementService.write(formState, state.attachments, issuedResult, 1);
                    await advertisementService.savePayment(issuedResult, adId);
                }

            } else {
                updateDraftRowFromForm("부트페이 결제 완료", response?.receipt_id || receiptId);
                const adId = await advertisementService.write(formState, state.attachments, response, 1);
                await advertisementService.savePayment(response, adId);
            }

            setText(paymentStatus, "결제가 완료되어 광고가 접수되었습니다.");
            closeModal();
            state.selectedAdId = "draft-slot";
            setView("detail");
            showToast("광고 신청이 접수되었습니다.");

        } catch (error) {
            const message = error?.event === "cancel"
                ? "결제가 취소되었습니다."
                : "결제 중 오류가 발생했습니다.";

            console.error("결제 오류 전체:",  error);
            console.error("오류 event:",      error?.event);
            console.error("오류 message:",    error?.message);
            console.error("오류 detail:",     JSON.stringify(error));

            setText(paymentStatus, message);
            showToast(message);
        }
    }

    document.addEventListener("click", async (event) => {
        const dropdownTrigger = event.target.closest("[data-dropdown-trigger]");
        if (dropdownTrigger) {
            toggleDropdown(dropdownTrigger.dataset.dropdownTrigger, dropdownTrigger);
            return;
        }

        if (!event.target.closest(".MarketplaceAdDropdown")) closeDropdowns();

        const viewButton = event.target.closest("[data-view-target]");
        if (viewButton) {
            const target = viewButton.dataset.viewTarget;

            // 상세 눌리면 list가 눌리게 유도
            if (target === "detail" && viewButton.classList.contains("AdNavigationDetailButton")) {
                setView("list");
                await resetAndLoadList({
                    keyword: "",
                    filter: "all"
                });
                return;
            }

            setView(target);

            if (target === "list") {
                await resetAndLoadList({
                    keyword:  "",
                    filter:   "all"
                });
            }
            return;
        }

        const headerAction = event.target.closest("[data-header-action]");
        if (headerAction) {
            openModal(headerAction.dataset.headerAction === "guide" ? "guide" : "payment");
            return;
        }

        const modalButton = event.target.closest("[data-modal-target]");
        if (modalButton) {
            openModal(modalButton.dataset.modalTarget);
            return;
        }

        if (event.target.closest("[data-modal-close]") || event.target === root.overlay) {
            closeModal();
            return;
        }

        if (event.target.closest("[data-upload-trigger]")) {
            root.uploadInput?.click();
            return;
        }

        if (event.target.closest("[data-upload-clear]")) {
            clearAttachments();
            return;
        }

        const attachmentRemoveButton = event.target.closest("[data-attachment-remove]");
        if (attachmentRemoveButton) {
            handleAttachmentRemove(Number(attachmentRemoveButton.dataset.attachmentRemove));
            return;
        }

        const detailButton = event.target.closest(".AdListDetailButton");
        if (detailButton) {
            const row = detailButton.closest(".MarketplaceAdListRow");
            if (row) {
                state.selectedAdId = row.dataset.adId;
                setView("detail");
                await advertisementService.detail(state.selectedAdId, advertisementLayout.showAdDetail);
            }
            return;
        }

        if (event.target.closest("[data-payment-confirm]")) {
            submitPayment();
        }
    });

    document.addEventListener("input", async (event) => {
        if (event.target.matches("[data-form-field]")) {
            if (event.target.dataset.formField === "budget") {
                const numericValue = parseNumber(event.target.value);
                event.target.value = numericValue ? numericValue.toLocaleString("ko-KR") : "";
            }
            syncApplySummary();
            return;
        }

        if (event.target.matches("[data-list-search]")) {
            clearTimeout(state.searchTimer);
            state.searchTimer = window.setTimeout(async () => {
                await resetAndLoadList({
                    keyword:  event.target.value.trim(),
                    filter:   state.listStatusFilter
                });
            }, 1000);
            return;
        }
    });

    document.addEventListener("change", async (event) => {
        if (event.target.matches("[data-list-status-filter]")) {
            state.listStatusFilter = event.target.value || "all";
            await resetAndLoadList({
                keyword:  root.listSearch?.value.trim() || "",
                filter:   state.listStatusFilter
            });
            return;
        }

        if (event.target === root.uploadInput) {
            const files = Array.from(event.target.files || []);
            const validation = validateAttachments(files);

            if (!validation.valid) {
                event.target.value = "";
                showToast(validation.message);
                return;
            }

            releaseAttachmentResources(state.attachments);
            state.attachments = await buildAttachments(files);
            syncApplySummary();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeDropdowns();
            closeModal();
        }
    });

    syncAll();
};