(() => {
    const qs = new URLSearchParams(window.location.search);
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => Array.from(document.querySelectorAll(selector));

    const oauth = {
        provider: qs.get("provider") || "",
        providerId: qs.get("providerId") || "",
        memberName: qs.get("memberName") || "",
        memberEmail: qs.get("memberEmail") || "",
        memberPhone: qs.get("memberPhone") || "",
        profileUrl: qs.get("profileUrl") || ""
    };

    const steps = $$(".social-step");
    const indicators = $$("[data-step-indicator]");
    const progressText = $("#progressText");
    const progressValue = $("#progressValue");
    const form = $("#socialJoinForm");

    const avatarPreview = $("#avatarPreview");
    const oauthProfilePreview = $("#oauthProfilePreview");
    const avatarUpload = $("#avatarUpload");
    const avatarReset = $("#avatarReset");
    const profileMetaText = $("#profileMetaText");

    const categoryField = $("#categoryNameField");
    const pushEnabledField = $("#pushEnabledField");
    const categoryStatus = $("#categoryStatus");
    const notificationStatus = $("#notificationStatus");

    const reviewMap = {
        reviewName: () => oauth.memberName || "-",
        reviewContact: () => oauth.memberEmail || oauth.memberPhone || "-",
        reviewHandle: () => formatHandle($("#handleInput").value),
        reviewCompany: () => $("#companyNameInput").value.trim() || "-",
        reviewRegion: () => buildRegion() || "-",
        reviewLanguage: () => ($("#languageSelect").selectedOptions[0]?.textContent || "-"),
        reviewCategory: () => categoryField.value || "-",
        reviewPush: () => pushEnabledField.value === "true" ? "알림 허용" : "지금은 넘어가기"
    };

    const requiredByStep = {
        0: ["#companyNameInput", "#businessNumberInput", "#ceoNameInput", "#countryInput", "#addressMainInput", "#businessTypeInput"],
        2: ["#handleInput"],
        3: ["#languageSelect"],
        4: [() => categoryField.value],
        5: [() => pushEnabledField.value === "true" || pushEnabledField.value === "false"]
    };

    let currentStep = 0;
    let defaultProfileUrl = oauth.profileUrl;

    function setText(id, value) {
        const node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function buildRegion() {
        return [
            $("#countryInput").value.trim(),
            $("#addressMainInput").value.trim(),
            $("#addressDetailInput").value.trim()
        ].filter(Boolean).join(" ");
    }

    function formatHandle(raw) {
        const cleaned = raw.trim().replace(/^@+/, "");
        return cleaned ? `@${cleaned}` : "-";
    }

    function syncOAuthFields() {
        $("#providerField").value = oauth.provider;
        $("#providerIdField").value = oauth.providerId;
        $("#memberNameField").value = oauth.memberName;
        $("#memberEmailField").value = oauth.memberEmail;
        $("#memberPhoneField").value = oauth.memberPhone;
        $("#profileURLField").value = oauth.profileUrl;

        setText("oauthMemberName", oauth.memberName || "이름 정보 없음");
        setText("oauthMemberContact", oauth.memberEmail || oauth.memberPhone || "이메일 또는 휴대폰 정보 없음");

        const fallback = "/images/main/global-gates-logo.png";
        oauthProfilePreview.src = defaultProfileUrl || fallback;
        avatarPreview.src = defaultProfileUrl || fallback;
    }

    function syncReview() {
        $("#memberRegionField").value = buildRegion();
        Object.entries(reviewMap).forEach(([id, getter]) => setText(id, getter()));
    }

    function validateStep(stepIndex) {
        const rules = requiredByStep[stepIndex];
        if (!rules) {
            return true;
        }

        return rules.every((rule) => {
            if (typeof rule === "function") {
                return Boolean(rule());
            }

            const node = $(rule);
            if (!node) {
                return false;
            }

            if (node instanceof HTMLSelectElement) {
                return node.value.trim() !== "";
            }

            return node.value.trim() !== "";
        });
    }

    function goToStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= steps.length) {
            return;
        }

        currentStep = stepIndex;
        steps.forEach((step, index) => step.classList.toggle("is-active", index === currentStep));
        indicators.forEach((item, index) => item.classList.toggle("is-active", index === currentStep));

        progressText.textContent = `${currentStep + 1} / ${steps.length}`;
        progressValue.style.width = `${((currentStep + 1) / steps.length) * 100}%`;

        if (currentStep === steps.length - 1) {
            syncReview();
        }
    }

    function nextStep() {
        if (!validateStep(currentStep)) {
            window.alert("현재 단계의 필수 입력값을 먼저 채워주세요.");
            return;
        }
        goToStep(currentStep + 1);
    }

    function prevStep() {
        goToStep(currentStep - 1);
    }

    function selectCategory(button) {
        $$(".category-item").forEach((item) => item.classList.toggle("is-selected", item === button));
        categoryField.value = button?.dataset.category || "";
        categoryStatus.textContent = categoryField.value ? `1개 선택됨: ${categoryField.value}` : "0개 선택됨";
    }

    function selectPush(button) {
        const value = button?.dataset.push;
        $$(".notification-choice").forEach((item) => item.classList.toggle("is-selected", item === button));
        pushEnabledField.value = value ?? "false";
        notificationStatus.textContent = value === "true" ? "알림 허용을 선택했습니다." : "지금은 넘어가기를 선택했습니다.";
    }

    function resetAvatarPreview() {
        avatarUpload.value = "";
        avatarPreview.src = defaultProfileUrl || "/images/main/global-gates-logo.png";
        profileMetaText.textContent = defaultProfileUrl ? "SNS 기본 사진 사용" : "기본 이미지 사용";
    }

    function bindEvents() {
        $$(".js-next").forEach((button) => button.addEventListener("click", nextStep));
        $$(".js-prev").forEach((button) => button.addEventListener("click", prevStep));

        $$(".category-item").forEach((button) => {
            button.addEventListener("click", () => selectCategory(button));
        });

        $$(".notification-choice").forEach((button) => {
            button.addEventListener("click", () => selectPush(button));
        });

        avatarUpload.addEventListener("change", () => {
            const [file] = avatarUpload.files || [];
            if (!file || !file.type.startsWith("image/")) {
                resetAvatarPreview();
                return;
            }

            avatarPreview.src = URL.createObjectURL(file);
            profileMetaText.textContent = `업로드한 파일 사용: ${file.name}`;
        });

        avatarReset.addEventListener("click", resetAvatarPreview);

        form.addEventListener("submit", (event) => {
            if (!validateStep(0) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5)) {
                event.preventDefault();
                window.alert("필수 입력값을 모두 채운 뒤 제출해주세요.");
                return;
            }

            $("#memberRegionField").value = buildRegion();
            $("#handleInput").value = formatHandle($("#handleInput").value).replace(/^@/, "");
        });
    }

    syncOAuthFields();
    bindEvents();
    selectPush(null);
    goToStep(0);
})();
