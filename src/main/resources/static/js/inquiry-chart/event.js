window.onload = () => {
    // 공용 작성 모달 부트스트랩 — 사이드바 createPostButton 클릭 시 작성 모달 트리거 (답글 모달은 미적용)
    if (typeof postModalApi !== "undefined" && typeof service !== "undefined") {
        postModalApi.bootstrap({
            services: service,
            getMemberId: () => memberId,
            skipReply: true,
        });
    }

    const tabButtons = Array.from(
        document.querySelectorAll("[data-inquiry-tab]"),
    );
    const panels = Array.from(
        document.querySelectorAll("[data-inquiry-panel]"),
    );
    const periodChips = Array.from(
        document.querySelectorAll("[data-period-chip]"),
    );
    const filterTrigger = document.querySelector(
        "[data-activity-filter-trigger]",
    );
    const filterMenu = document.querySelector("[data-activity-filter-menu]");
    const filterLabel = document.querySelector("[data-activity-filter-label]");
    const filterItems = Array.from(
        document.querySelectorAll("[data-activity-filter-item]"),
    );

    const PREVIEW_DURATION_MS = 280;
    let expertDashboard = null;
    let chartsLoaded = false;

    // 공통 유틸리티
    const getTextContent = (element) =>
        element?.textContent?.replace(/\s+/g, " ").trim() ?? "";

    const escapeHtml = (value) =>
        String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

    const fetchJson = async (url) => {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
    };

    const renderChartsIfReady = () => {
        if (!chartsLoaded || !expertDashboard) return;
        initCharts();
    };

    const applyOverviewCards = () => {
        const cards = Array.from(document.querySelectorAll(".Expert-State-Card"));
        const overview = expertDashboard?.overview;
        if (!cards.length || !overview) return;

        const values = [
            overview.profileViewCount ?? 0,
            overview.dealCount ?? 0,
            overview.inquiryRequestCount ?? 0,
            overview.averageResponseSpeed ?? "-",
            overview.likeCount ?? 0,
            overview.bookmarkCount ?? 0,
        ];

        cards.forEach((card, index) => {
            const valueElement = card.querySelector(".Expert-State-Value");
            if (valueElement && values[index] !== undefined) {
                valueElement.textContent = String(values[index]);
            }
        });
    };

    const loadDashboard = async () => {
        try {
            expertDashboard = await fetchJson("/api/inquiry/chart/dashboard");
            applyOverviewCards();
            renderChartsIfReady();
        } catch (error) {
            console.error(error);
        }
    };

    // 탭과 패널 표시 제어
    const ensureActivityPanelVisible = () => {
        panels.forEach((panel) => {
            panel.hidden = panel.dataset.inquiryPanel !== "activity";
        });
    };

    const setActiveTabVisual = (tabName) => {
        tabButtons.forEach((tab) => {
            const isActive = tab.dataset.inquiryTab === tabName;
    // 드롭다운 닫기 유틸리티
            tab.setAttribute("aria-selected", String(isActive));
        });
    };

    const togglePreviewState = (tab) => {
        tab.classList.remove("inquiry-tab--preview");
        void tab.offsetWidth;
        tab.classList.add("inquiry-tab--preview");
        window.setTimeout(() => {
            tab.classList.remove("inquiry-tab--preview");
        }, PREVIEW_DURATION_MS);
    };

    // ===== 공통 UI 유틸 =====
    const closeFilterMenu = () => {
        if (!filterTrigger || !filterMenu) {
            return;
        }

        filterMenu.hidden = true;
        filterTrigger.setAttribute("aria-expanded", "false");
    };

    // ===== 초기 이벤트 바인딩 =====
    const initializeTabs = () => {
        ensureActivityPanelVisible();
        tabButtons.forEach((tab) => {
            tab.addEventListener("click", () => {
                setActiveTabVisual(tab.dataset.inquiryTab);
                togglePreviewState(tab);
                ensureActivityPanelVisible();
            });
        });
    };

    const initializePeriodChips = () => {
        periodChips.forEach((chip) => {
            chip.addEventListener("click", () => {
                periodChips.forEach((item) => {
                    item.classList.toggle("Period-Chip--Active", item === chip);
                });
            });
        });
    };

    const initializeFilterDropdown = () => {
        if (!filterTrigger || !filterMenu || !filterLabel) {
            return;
        }

        filterTrigger.addEventListener("click", (event) => {
            event.preventDefault();
            const willOpen = filterMenu.hidden;
            filterMenu.hidden = !willOpen;
            filterTrigger.setAttribute("aria-expanded", String(willOpen));
        });

        filterItems.forEach((item) => {
            item.addEventListener("click", () => {
                const label = item.querySelector(".Activity-Filter-Menu-Label");
                filterItems.forEach((entry) => {
                    const isSelected = entry === item;
                    entry.classList.toggle(
                        "Activity-Filter-Menu-Item--Selected",
                        isSelected,
                    );
                    entry.setAttribute("aria-checked", String(isSelected));
                });
                filterLabel.textContent = getTextContent(label);
                closeFilterMenu();
            });
        });
    };

    // 화면에 필요한 모든 상호작용을 한 번에 연결한다.
    initializeTabs();
    initializePeriodChips();
    initializeFilterDropdown();

    // =====================================================
    // 차트 파트
    // =====================================================
    google.charts.load("current", {
        packages: ["corechart", "geochart"],
        language: "ko",
    });
    google.charts.setOnLoadCallback(() => {
        chartsLoaded = true;
        renderChartsIfReady();
    });

    /** Google Charts 전반에 걸쳐 공유하는 기본 차트 옵션 */
    function baseOptions() {
        return {
            fontName: "DM Sans",
            backgroundColor: "transparent",
            chartArea: {
                left: 56,
                right: 24,
                top: 16,
                bottom: 40,
                width: "100%",
                height: "100%",
            },
            legend: {textStyle: {color: "#6B7280", fontSize: 12}},
            hAxis: {
                textStyle: {color: "#9CA3AF", fontSize: 11},
                gridlines: {color: "transparent"},
                baselineColor: "#E8ECF2",
            },
            vAxis: {
                textStyle: {color: "#9CA3AF", fontSize: 11},
                gridlines: {color: "#F0F3F8"},
                baselineColor: "#E8ECF2",
                minorGridlines: {color: "transparent"},
            },
            tooltip: {textStyle: {fontName: "DM Sans", fontSize: 13}},
            animation: {startup: true, duration: 500, easing: "out"},
        };
    }

    // =====================================================
    // 4. 차트 렌더링
    // =====================================================

    // 2층 왼쪽 라인 차트

    /** 현재 선택된 지표와 기간을 추적하는 상태 */
    const lineChartState = {
        metric: "profileViewCount", // 'profileViewCount' | 'inquiryRequestCount'
        period: "7d", // '7d' | '30d' | '6m'
    };

    let lineChartInstance = null;

    // 라인 차트 렌더링
    function drawLineChart() {
        const container = document.getElementById("chart-line");
        if (!container) return;

        // 로딩 표시
        container.classList.add("is-loading");

        // 지표에 맞는 데이터 선택
        const rawRows =
            lineChartState.metric === "profileViewCount"
                ? fetchProfileViewData(lineChartState.period)
                : fetchInquiryRequestData(lineChartState.period);

        const metricLabel =
            lineChartState.metric === "profileViewCount"
                ? "프로필 조회 수"
                : "견적 요청 수";

        // DataTable 구성
        const data = new google.visualization.DataTable();
        data.addColumn("string", "기간");
        data.addColumn("number", metricLabel);
        data.addRows(rawRows);

        const options = {
            ...baseOptions(),
            chartArea: {left: 56, right: 24, top: 20, bottom: 40},
            colors: ["#1A56FF"],
            lineWidth: 2.5,
            pointSize: 4,
            pointShape: "circle",
            areaOpacity: 0.08,
            legend: {position: "none"},
            vAxis: {
                ...baseOptions().vAxis,
                format:
                    lineChartState.metric === "profileViewCount"
                        ? "#,###"
                        : "#",
            },
        };

        if (!lineChartInstance) {
            lineChartInstance = new google.visualization.AreaChart(container);
        }

        google.visualization.events.addOneTimeListener(
            lineChartInstance,
            "ready",
            () => {
                container.classList.remove("is-loading");
            },
        );

        lineChartInstance.draw(data, options);
    }

    // 3층 왼쪽 막대 차트

    let barChartInstance = null;

    /**
     * 커넥트 변화 추이 막대 그래프를 렌더링한다.
     */
    function drawBarChart() {
        const container = document.getElementById("chart-bar");
        if (!container) return;

        container.classList.add("is-loading");

        const rawRows = fetchConnectChangeData();

        const data = new google.visualization.DataTable();
        data.addColumn("string", "기간");
        data.addColumn("number", "승인");
        data.addColumn("number", "반려");
        data.addRows(rawRows);

        const options = {
            ...baseOptions(),
            chartArea: {left: 48, right: 16, top: 24, bottom: 36},
            colors: ["#1A56FF", "#EF4444"],
            bar: {groupWidth: "55%"},
            isStacked: false,
            legend: {
                position: "top",
                alignment: "end",
                textStyle: {color: "#6B7280", fontSize: 11},
            },
            vAxis: {
                ...baseOptions().vAxis,
                baseline: 0,
                baselineColor: "#E8ECF2",
                format: "+#;-#",
            },
        };

        if (!barChartInstance) {
            barChartInstance = new google.visualization.ColumnChart(container);
        }

        google.visualization.events.addOneTimeListener(
            barChartInstance,
            "ready",
            () => {
                container.classList.remove("is-loading");
            },
        );

        barChartInstance.draw(data, options);
    }

    // 3층 오른쪽 도넛 차트

    let donutChartInstance = null;

    /**
     * 거래 카테고리 분포 도넛 차트를 렌더링한다.
     */
    function drawDonutChart() {
        const container = document.getElementById("chart-donut");
        if (!container) return;

        container.classList.add("is-loading");

        const rawData = fetchDealCategoryData();

        const data = google.visualization.arrayToDataTable(rawData);

        const options = {
            fontName: "DM Sans",
            backgroundColor: "transparent",
            pieHole: 0.52,
            colors: [
                "#1A56FF",
                "#3B82F6",
                "#60A5FA",
                "#93C5FD",
                "#BFDBFE",
                "#DBEAFE",
            ],
            chartArea: {
                left: 8,
                right: 8,
                top: 8,
                bottom: 8,
                width: "100%",
                height: "100%",
            },
            legend: {
                position: "right",
                alignment: "center",
                textStyle: {color: "#6B7280", fontSize: 11},
            },
            pieSliceText: "none",
            pieSliceBorderColor: "#FFFFFF",
            tooltip: {textStyle: {fontName: "DM Sans", fontSize: 13}},
            animation: {startup: true, duration: 600, easing: "out"},
        };

        if (!donutChartInstance) {
            donutChartInstance = new google.visualization.PieChart(container);
        }

        google.visualization.events.addOneTimeListener(
            donutChartInstance,
            "ready",
            () => {
                container.classList.remove("is-loading");
            },
        );

        donutChartInstance.draw(data, options);
    }

    // 4층 지오 차트

    let geoChartInstance = null;

    /**
     * 거래 국가 분포 지오 차트를 렌더링한다.
     */
    function drawGeoChart() {
        const container = document.getElementById("chart-geo");
        if (!container) return;

        container.classList.add("is-loading");

        const rawData = fetchDealCountryData();
        const data = google.visualization.arrayToDataTable(rawData);

        const options = {
            backgroundColor: "#F4F6FA",
            datalessRegionColor: "#E8ECF2",
            defaultColor: "#BFDBFE",
            colorAxis: {
                colors: ["#BFDBFE", "#3B82F6", "#1A56FF", "#1240CC"],
            },
            legend: {
                textStyle: {
                    fontName: "DM Sans",
                    fontSize: 12,
                    color: "#6B7280",
                },
            },
            tooltip: {
                textStyle: {fontName: "DM Sans", fontSize: 13},
            },
        };

        if (!geoChartInstance) {
            geoChartInstance = new google.visualization.GeoChart(container);
        }

        google.visualization.events.addOneTimeListener(
            geoChartInstance,
            "ready",
            () => {
                container.classList.remove("is-loading");
            },
        );

        geoChartInstance.draw(data, options);
    }

    // =====================================================
    // 5. 리사이즈 대응
    // =====================================================
    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            drawLineChart();
            drawBarChart();
            drawDonutChart();
            drawGeoChart();
        }, 200);
    });

    // =====================================================
    // 6. 모든 차트 초기 렌더
    // =====================================================
    function initCharts() {
        drawLineChart();
        drawBarChart();
        drawDonutChart();
        drawGeoChart();
    }

    // =====================================================
    // 7. UI 상호작용 초기화
    //    window.onload 안에서 직접 실행되도록 구성한다.
    // =====================================================

    // 2층 지표 드롭다운 영역
    const dropbox = document.querySelector("[data-dropbox]");
    const dropTrigger = document.querySelector("[data-dropbox-trigger]");
    const dropMenu = document.querySelector("[data-dropbox-menu]");
    const dropLabel = document.querySelector("[data-dropbox-label]");
    const dropOptions = Array.from(document.querySelectorAll(".Chart-Option"));

    const closeDropbox = () => {
        if (!dropMenu) return;
        dropMenu.hidden = true;
        dropTrigger?.setAttribute("aria-expanded", "false");
    };

    if (dropTrigger && dropMenu) {
        dropTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            const willOpen = dropMenu.hidden;
            dropMenu.hidden = !willOpen;
            dropTrigger.setAttribute("aria-expanded", String(willOpen));
        });
    }

    dropOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const newMetric = option.dataset.metric;
            if (!newMetric) return;

    // 선택 상태 업데이트
            dropOptions.forEach((o) => {
                const isSelected = o === option;
                o.setAttribute("aria-selected", String(isSelected));
            });

    // 라벨 업데이트
            if (dropLabel) dropLabel.textContent = option.textContent.trim();

    // 차트 상태 업데이트 및 리프레시
            lineChartState.metric = newMetric;
            closeDropbox();
            drawLineChart();
        });
    });

    // 2층 기간 필터 버튼
    const periodButtons = Array.from(
        document.querySelectorAll("[data-line-period]"),
    );

    periodButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const period = btn.dataset.linePeriod;
            if (!period) return;

            periodButtons.forEach((b) =>
                b.classList.toggle("Header-Filter-Button--Active", b === btn),
            );

            lineChartState.period = period;
            drawLineChart();
        });
    });

    // 문서 영역 클릭 시 드롭다운 닫기
    document.addEventListener("click", (e) => {
        if (dropbox && !dropbox.contains(e.target)) {
            closeDropbox();
        }
    });

    // ESC 키로 드롭다운 닫기
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDropbox();
    });

    function fetchProfileViewData(period) {
        return (expertDashboard?.profileViewCount?.[period] ?? []).map((point) => [
            point.label,
            point.value ?? 0,
        ]);
    }

    function fetchInquiryRequestData(period) {
        return (expertDashboard?.inquiryRequestCount?.[period] ?? []).map((point) => [
            point.label,
            point.value ?? 0,
        ]);
    }

    function fetchConnectChangeData() {
        return (expertDashboard?.connectChanges ?? []).map((point) => [
            point.label,
            point.value ?? 0,
            -(point.secondaryValue ?? 0),
        ]);
    }

    function fetchDealCategoryData() {
        return [["카테고리", "건수"]].concat(
            (expertDashboard?.dealCategories ?? []).map((point) => [
                point.label,
                point.value ?? 0,
            ]),
        );
    }

    function fetchDealCountryData() {
        return [["Country", "거래 건수"]].concat(
            (expertDashboard?.dealCountries ?? []).map((point) => [
                point.label,
                point.value ?? 0,
            ]),
        );
    }

    loadDashboard();
};

