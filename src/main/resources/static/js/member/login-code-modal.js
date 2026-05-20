document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".code-overlay");
    const closeBtn = document.querySelector(".code-close");
    const inputWrap = document.querySelector(".code-input-wrap");
    const input = document.getElementById("authCodeInput");
    const actionBtn = document.getElementById("codeActionBtn");

    if (!inputWrap || !input || !actionBtn) return;

    const syncButton = () => {
        const hasCode = input.value.trim().length > 0;
        inputWrap.classList.toggle("has-value", hasCode);
        actionBtn.classList.toggle("is-primary", hasCode);
        actionBtn.classList.toggle("is-secondary", !hasCode);
        actionBtn.textContent = hasCode ? "다음" : "돌아가기";
    };

    input.addEventListener("focus", () => {
        inputWrap.classList.add("is-focus");
    });

    input.addEventListener("blur", () => {
        inputWrap.classList.remove("is-focus");
    });

    input.addEventListener("input", syncButton);

    if (closeBtn && overlay) {
        closeBtn.addEventListener("click", () => {
            overlay.style.display = "none";
        });
    }

    syncButton();
});

