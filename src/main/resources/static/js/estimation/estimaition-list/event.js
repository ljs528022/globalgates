window.addEventListener("load", async () => {
    // 공용 작성 모달 부트스트랩 — 사이드바 createPostButton 클릭 시 작성 모달 트리거 (답글 모달은 미적용)
    if (typeof postModalApi !== "undefined" && typeof service !== "undefined") {
        postModalApi.bootstrap({
            services: service,
            getMemberId: () => memberId,
            skipReply: true,
        });
    }

    const q = (selector, scope = document) => scope.querySelector(selector);
    const qAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const filterTrigger = q("[data-activity-filter-trigger]");
    const filterMenu = q("[data-activity-filter-menu]");
    const filterLabel = q("[data-activity-filter-label]");
    const filterItems = qAll("[data-activity-filter-item]");
    const periodChips = qAll("[data-period-chip]");
    const startInput = q("[data-activity-date-start]");
    const endInput = q("[data-activity-date-end]");
    const detailModal = q("[data-estimation-detail-modal]");
    const detailBody = q(".estimation-detail-modal__body");
    const detailCloseButtons = qAll("[data-estimation-detail-close]");
    const confirmModal = q("[data-estimation-confirm-modal]");
    const confirmCloseButtons = qAll("[data-estimation-confirm-close]");
    const confirmSubmitButton = q("[data-estimation-confirm-submit]");
    const confirmTitle = q("[data-estimation-confirm-title]");
    const listRoot = q("[data-estimation-list]");

    const PERIOD_DAYS = { "7D": 7, "2W": 14, "4W": 28, "3M": 90 };

    let activeDetailTrigger = null;
    let pendingDecision = null;
    let activeFilterState = "all";
    let estimationStore = [];
    let filteredEmptyMessage = null;

    const closeFilterMenu = () => {
        if (!filterTrigger || !filterMenu) return;
        filterMenu.hidden = true;
        filterTrigger.setAttribute("aria-expanded", "false");
    };

    const isWithinDateRange = (cardDateText) => {
        const cardDate = estimationListLayout.normalizeDate(cardDateText);
        if (!cardDate) return true;

        const startDate = estimationListLayout.normalizeDate(startInput?.value);
        const endDate = estimationListLayout.normalizeDate(endInput?.value);

        if (!startDate && !endDate) return true;
        if (startDate && cardDate < startDate) return false;
        return !(endDate && cardDate > endDate);
    };

    const applyFilters = () => {
        let visibleCount = 0;

        qAll("[data-estimation-card]").forEach((card) => {
            const statusMatched =
                activeFilterState === "all" || card.dataset.filterState === activeFilterState;
            const dateMatched = isWithinDateRange(card.dataset.createdDate);
            const visible = statusMatched && dateMatched;
            card.hidden = !visible;
            if (visible) {
                visibleCount += 1;
            }
        });

        if (!listRoot || !estimationStore.length) return;

        if (!filteredEmptyMessage) {
            filteredEmptyMessage = document.createElement("p");
            filteredEmptyMessage.className = "estimation-empty";
            filteredEmptyMessage.textContent = "조건에 맞는 견적요청이 없습니다.";
            listRoot.append(filteredEmptyMessage);
        }

        filteredEmptyMessage.hidden = visibleCount > 0;
    };

    const setFilter = (item) => {
        const value = item.dataset.activityFilterItem || "all";
        const label = item.querySelector(".activity-filter-menu__label");

        filterItems.forEach((button) => {
            const isSelected = button === item;
            button.classList.toggle("activity-filter-menu__item--selected", isSelected);
            button.setAttribute("aria-checked", String(isSelected));
        });

        if (filterLabel && label) {
            filterLabel.textContent = label.textContent.trim();
        }

        activeFilterState = value;
        applyFilters();
        closeFilterMenu();
    };

    const syncPeriod = (chip) => {
        const days = PERIOD_DAYS[chip.dataset.periodChip];
        if (!days || !startInput || !endInput) return;

        const today = new Date();
        const end = endInput.value ? new Date(endInput.value) : today;
        if (Number.isNaN(end.getTime())) {
            end.setTime(today.getTime());
        }

        const start = new Date(end);
        start.setDate(end.getDate() - (days - 1));
        startInput.value = estimationListLayout.formatDate(start);
        endInput.value = estimationListLayout.formatDate(end);
        applyFilters();
    };

    const initializeDateRange = () => {
        if (!startInput || !endInput) return;

        const activeChip =
            periodChips.find((button) => button.classList.contains("period-chip--active")) || periodChips[0];

        if (activeChip) {
            endInput.value = estimationListLayout.formatDate(new Date());
            syncPeriod(activeChip);
            return;
        }

        const today = estimationListLayout.formatDate(new Date());
        startInput.value = today;
        endInput.value = today;
        applyFilters();
    };

    const hideDetailPanels = () => {
        qAll("[data-estimation-detail-panel]").forEach((panel) => {
            panel.hidden = true;
        });
    };

    const closeDetailModal = () => {
        if (!detailModal) return;
        detailModal.hidden = true;
        document.body.classList.remove("modal-open");
        hideDetailPanels();
        activeDetailTrigger?.focus();
        activeDetailTrigger = null;
    };

    const closeConfirmModal = () => {
        if (!confirmModal) return;
        confirmModal.hidden = true;
        pendingDecision = null;
    };

    const openConfirmModal = (slot, type) => {
        if (!confirmModal || !(slot instanceof HTMLElement) || !type) return;
        pendingDecision = { slot, type };
        if (confirmTitle) {
            confirmTitle.textContent = type === "approve" ? "정말 승인하시겠습니까?" : "정말 거절하시겠습니까?";
        }
        confirmSubmitButton?.classList.toggle("is-reject", type === "reject");
        confirmModal.hidden = false;
    };

    const applyDecisionState = (slot, type) => {
        q("[data-estimation-decision-group]", slot)?.setAttribute("hidden", "");
        q("[data-estimation-approved-state]", slot)?.setAttribute("hidden", "");
        q("[data-estimation-rejected-state]", slot)?.setAttribute("hidden", "");

        if (type === "approve") {
            q("[data-estimation-approved-state]", slot)?.removeAttribute("hidden");
            return;
        }

        q("[data-estimation-rejected-state]", slot)?.removeAttribute("hidden");
    };

    const updateCardStatus = (estimationId, type) => {
        const card = q(`[data-estimation-card][data-estimation-detail-target="detail-${estimationId}"]`);
        if (!card) return;

        card.dataset.filterState = type;
        const statusText = card.querySelector(".estimation-preview-card__status");
        if (statusText) {
            statusText.textContent = estimationListLayout.formatStatusLabel(type);
        }
    };

    const updateDetailStatus = (estimationId, type) => {
        const panel = q(`[data-estimation-detail-panel="detail-${estimationId}"]`);
        if (!panel) return;

        const statusText = q(`[data-estimation-status-text="detail-${estimationId}"]`, panel);
        if (statusText) {
            statusText.textContent = estimationListLayout.formatStatusLabel(type);
        }
    };

    const syncDecisionButtons = (decisionId, selectedDecision) => {
        qAll("[data-estimation-decision]")
            .filter((button) => button.dataset.estimationDecisionId === decisionId)
            .forEach((button) => {
                const isActive = button.dataset.estimationDecision === selectedDecision;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });
    };

    const openDetailModal = (target, trigger) => {
        if (!target || !detailModal) return;

        hideDetailPanels();
        const panel = q(`[data-estimation-detail-panel="${target}"]`);
        if (!panel) return;

        activeDetailTrigger = trigger;
        panel.hidden = false;
        detailModal.hidden = false;
        document.body.classList.add("modal-open");
    };

    const handleDetailTrigger = (button) => {
        const target =
            button.dataset.estimationDetailTarget ||
            button.closest("[data-estimation-card]")?.dataset.estimationDetailTarget;
        openDetailModal(target, button);
    };

    const bindDynamicEvents = () => {
        qAll(".estimation-preview-card__body[data-estimation-detail-target]").forEach((button) => {
            button.addEventListener("click", () => handleDetailTrigger(button));
        });

        qAll("[data-estimation-decision]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                syncDecisionButtons(button.dataset.estimationDecisionId, button.dataset.estimationDecision);
                openConfirmModal(button.closest(".estimation-action-slot"), button.dataset.estimationDecision);
            });
        });
    };

    const renderEstimations = (estimations) => {
        if (!listRoot || !detailBody) return;
        estimationStore = Array.isArray(estimations) ? estimations : [];
        filteredEmptyMessage = null;

        if (!estimationStore.length) {
            listRoot.innerHTML = estimationListLayout.renderEmpty();
            detailBody.innerHTML = "";
            return;
        }

        listRoot.innerHTML = estimationStore.map(estimationListLayout.renderCard).join("");
        detailBody.innerHTML = estimationStore.map(estimationListLayout.renderDetailPanel).join("");
        bindDynamicEvents();
        activeFilterState = "all";
        applyFilters();
    };

    const extractEstimations = (data) => data?.estimations || data?.content || data?.list || (Array.isArray(data) ? data : []);

    const loadEstimations = async () => {
        try {
            const data = await estimationListService.getEstimations(1);
            renderEstimations(extractEstimations(data));
        } catch (error) {
            console.error(error);
            if (listRoot) {
                listRoot.innerHTML = estimationListLayout.renderLoadError();
            }
        }
    };

    filterTrigger?.addEventListener("click", () => {
        const isExpanded = filterTrigger.getAttribute("aria-expanded") === "true";
        filterTrigger.setAttribute("aria-expanded", String(!isExpanded));
        if (filterMenu) {
            filterMenu.hidden = isExpanded;
        }
    });

    filterItems.forEach((item) => item.addEventListener("click", () => setFilter(item)));

    periodChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            periodChips.forEach((button) => {
                button.classList.toggle("period-chip--active", button === chip);
            });
            syncPeriod(chip);
        });
    });

    startInput?.addEventListener("change", applyFilters);
    endInput?.addEventListener("change", applyFilters);
    detailCloseButtons.forEach((button) => button.addEventListener("click", closeDetailModal));
    confirmCloseButtons.forEach((button) => button.addEventListener("click", closeConfirmModal));

    confirmSubmitButton?.addEventListener("click", async () => {
        if (!pendingDecision) return;

        const slot = pendingDecision.slot;
        const type = pendingDecision.type;
        const panel = slot?.closest("[data-estimation-detail-panel]");
        const detailId = panel?.dataset.estimationDetailPanel || "";
        const estimationId = Number(detailId.replace("detail-", ""));

        try {
            confirmSubmitButton.disabled = true;
            const updated = await estimationListService.updateStatus(estimationId, type);
            if (!updated) {
                throw new Error("견적 요청 상태가 반영되지 않았습니다.");
            }

            applyDecisionState(slot, type);
            updateCardStatus(estimationId, type);
            updateDetailStatus(estimationId, type);

            const target = estimationStore.find((estimation) => estimation.id === estimationId);
            if (target) {
                target.status = type;
            }

            applyFilters();
            closeConfirmModal();
        } catch (error) {
            console.error(error);
            window.alert("견적 요청 상태 반영 중 오류가 발생했습니다.");
        } finally {
            confirmSubmitButton.disabled = false;
        }
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        if (filterMenu && !filterMenu.hidden && !target.closest("[data-activity-filter-menu]") && !target.closest("[data-activity-filter-trigger]")) {
            closeFilterMenu();
        }
    });

    initializeDateRange();
    await loadEstimations();
});
