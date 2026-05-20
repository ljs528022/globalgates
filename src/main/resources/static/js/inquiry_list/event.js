window.onload = function () {
    // 공용 작성 모달 부트스트랩 — 사이드바 createPostButton 클릭 시 작성 모달 트리거 (답글 모달은 미적용)
    if (typeof postModalApi !== "undefined" && typeof service !== "undefined") {
        postModalApi.bootstrap({
            services: service,
            getMemberId: () => memberId,
            skipReply: true,
        });
    }

    const scrollEl = document.getElementById("categoryScroll");
    const btnLeft = document.getElementById("scrollLeft");
    const btnRight = document.getElementById("scrollRight");
    const modal = document.getElementById("disconnectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalConfirm = document.getElementById("modalConfirm");
    const modalCancel = document.getElementById("modalCancel");
    const headerBack = document.getElementById("headerBack");
    const inquiryTabs = Array.from(document.querySelectorAll("[data-inquiry-tab]"));
    const tabLinks = document.querySelectorAll(".tab-link");
    const bottombarSlide = document.querySelector(".bottombar-slide");
    const INQUIRY_TAB_PREVIEW_DURATION_MS = 280;
    const originalChipsHTML = scrollEl ? scrollEl.innerHTML : "";
    let pendingBtn = null;
    let lastScrollY = 0;

    let scrollState = { page: 1, isLoading: false, hasMore: true };
    let currentCategory = "전체";

    function checkScroll() {
        if (!scrollEl || !btnLeft || !btnRight) return;

        btnLeft.style.display = scrollEl.scrollLeft > 0 ? "flex" : "none";
        btnRight.style.display =
            scrollEl.scrollLeft <
            scrollEl.scrollWidth - scrollEl.clientWidth - 1
                ? "flex"
                : "none";
    }

    function closeModal() {
        if (!modal) return;

        modal.classList.remove("active");
        pendingBtn = null;
    }

    function openModal(btn) {
        if (!modal || !modalTitle) return;

        pendingBtn = btn;
        console.log("openModal pendingBtn:", pendingBtn);
        console.log("openModal memberId:", btn.dataset.memberId);

        const requestCard = btn.closest("[data-handle]");
        const sidebarHandle = btn
            .closest(".trend-item")
            ?.querySelector(".sidebar-user-handle");
        const requestLabel =
            requestCard?.dataset.handle || sidebarHandle?.textContent?.trim() || "";

        modalTitle.textContent = requestLabel
            ? `${requestLabel} 거래처를 disapproved 처리하시겠습니까?`
            : "이 거래처를 disapproved 처리하시겠습니까?";

        modal.classList.add("active");
    }

    async function loadInquiryMembers(isFirst = false) {
        if (scrollState.isLoading || !scrollState.hasMore) return;
        scrollState.isLoading = true;

        try {
            console.log(currentCategory);
            const criteria = await inquiryListService.getInquiryMembers(
                scrollState.page,
                currentCategory,
                (data) => {
                    inquiryListLayout.showInquiryMembers(data, !isFirst);
                }
            );
            scrollState.hasMore = criteria?.hasMore ?? false;
            scrollState.page++;
        } catch (e) {
            console.error("거래처 목록 로드 실패:", e);
        } finally {
            scrollState.isLoading = false;
        }
    }

    function setActiveTab(tabName) {
        tabLinks.forEach((link) => {
            const path = link.querySelector("path");
            if (!path) return;

            const active = link.dataset.tab === tabName;
            path.setAttribute(
                "d",
                active ? path.dataset.active : path.dataset.inactive,
            );
            link.classList.toggle("tab-link--active", active);
        });
    }

    function setActiveInquiryTab(tabName) {
        inquiryTabs.forEach((tab) => {
            const active = tab.dataset.inquiryTab === tabName;
            tab.classList.toggle("inquiry-tab--active", active);
            tab.setAttribute("aria-selected", String(active));
        });
    }

    function previewInquiryTab(tab) {
        tab.classList.remove("inquiry-tab--preview");
        void tab.offsetWidth;
        tab.classList.add("inquiry-tab--preview");
        window.setTimeout(() => {
            tab.classList.remove("inquiry-tab--preview");
        }, INQUIRY_TAB_PREVIEW_DURATION_MS);
    }

    if (scrollEl) {
        scrollEl.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);
        checkScroll();

        scrollEl.addEventListener("click", (event) => {
            const chip = event.target.closest(".cat-chip");
            const backBtn = event.target.closest(".cat-back-btn");

            if (backBtn) {
                scrollEl.innerHTML = originalChipsHTML;
                scrollEl.scrollLeft = 0;
                setTimeout(checkScroll, 50);
                return;
            }

            if (!chip) return;

            if (chip.classList.contains("has-subs")) {
                const category = chip.dataset.cat;
                const subs = chip.dataset.subs.split(",");

                let html =
                    '<button class="cat-back-btn" title="이전 카테고리" type="button"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"/></svg></button>';
                html += `<button class="cat-chip parent-highlight active" data-cat="${category}">${category}</button>`;
                subs.forEach((sub) => {
                    html += `<button class="cat-chip" data-cat="${sub}" data-is-sub="true">${sub}</button>`;
                });

                scrollEl.innerHTML = html;
                scrollEl.scrollLeft = 0;
                setTimeout(checkScroll, 50);

                if (currentCategory !== category) {
                    currentCategory = category;
                    scrollState = { page: 1, isLoading: false, hasMore: true };
                    document.getElementById("friendsList").innerHTML = "";
                    loadInquiryMembers(true);
                }
                return;
            }

            scrollEl
                .querySelectorAll(".cat-chip:not(.parent-highlight)")
                .forEach((button) => {
                    button.classList.remove("active", "sub-active");
                });

            chip.classList.add(chip.dataset.isSub ? "sub-active" : "active");

            const selectedCategory = chip.dataset.cat ?? "전체";
            if (currentCategory !== selectedCategory) {
                currentCategory = selectedCategory;
                scrollState = { page: 1, isLoading: false, hasMore: true };
                document.getElementById("friendsList").innerHTML = "";
                loadInquiryMembers(true);
            }
        });
    }

    if (btnLeft) {
        btnLeft.addEventListener("click", () => {
            scrollEl?.scrollBy({left: -200, behavior: "smooth"});
        });
    }

    if (btnRight) {
        btnRight.addEventListener("click", () => {
            scrollEl?.scrollBy({left: 200, behavior: "smooth"});
        });
    }

    if (modalConfirm) {
        modalConfirm.addEventListener("click", async () => {
            if (pendingBtn) {
                const memberId = pendingBtn.dataset.memberId;
                try {
                    if (memberId) {
                        const result = await inquiryListService.checkFollow(memberId);
                        console.log("팔로우 결과:", result);
                        // 언팔로우 성공 시에만 버튼 상태 변경
                        if (result.includes("언팔로우")) {
                            pendingBtn.classList.remove("disconnect");
                            pendingBtn.classList.add("default");
                            pendingBtn.textContent = "Approve";
                            showToast("Disapproved. 거래처가 거절되었습니다.", "toast--disapprove");
                        }
                    }
                } catch (err) {
                    console.error("언팔로우 요청 실패:", err);
                }
            }
            closeModal();
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener("click", closeModal);
    }

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    document.addEventListener("click", async (event) => {
        const button = event.target.closest(".connect-btn, .connect-btn-sm");
        if (!button) return;

        const memberId = button.dataset.memberId;

        if (button.classList.contains("default")) {
            try {
                await inquiryListService.checkFollow(memberId);
                button.classList.remove("default");
                button.classList.add("disconnect");
                button.textContent = "Disapproved";
                showToast("Approved. 거래처가 승인되었습니다.", "toast--approve");
            } catch (err) {
                console.error("팔로우 요청 실패:", err);
            }
            return;
        }

        if (button.classList.contains("disconnect")) {
            openModal(button);
        }
    });

    setActiveTab("notifications");
    setActiveInquiryTab("partners");

    tabLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            setActiveTab(link.dataset.tab);
        });
    });

    inquiryTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            previewInquiryTab(tab);
            setActiveInquiryTab(tab.dataset.inquiryTab);
        });
    });

    // 토스트 출력
    function showToast(message, extraClass) {
        const existing = document.querySelector(".toast");
        if (existing) existing.remove();
        const toast = document.createElement("div");
        toast.className = "toast";
        if (extraClass) toast.classList.add(extraClass);
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    window.addEventListener(
        "scroll",
        () => {
            if (!bottombarSlide) return;

            const currentY = window.scrollY;
            bottombarSlide.style.transform =
                currentY > lastScrollY && currentY > 100
                    ? "translateY(100%)"
                    : "translateY(0)";
            lastScrollY = currentY;
        },
        {passive: true},
    );

    if (headerBack) {
        headerBack.addEventListener("click", () => {
            history.back();
        });
    }

    loadInquiryMembers(true);

    // 무한 스크롤
    const sentinel = document.createElement("div");
    sentinel.id = "scrollSentinel";
    document.getElementById("friendsList").after(sentinel);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) loadInquiryMembers(false);
        });
    }, { threshold: 0.1 });
    observer.observe(sentinel);

    console.log("[Inquiry] 페이지 로드 완료.");
};
