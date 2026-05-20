document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".login-overlay");
    const closeBtn = document.querySelector(".login-close");
    const inputWrap = document.querySelector(".input-wrap");
    const input = document.getElementById("loginIdentity");
    const errorText = document.querySelector(".field-error-message");
    const nextBtn = document.getElementById("nextBtn");

    if (!input || !inputWrap || !nextBtn || !errorText) return;

    let hadTyped = input.value.trim().length > 0;

    const syncButton = () => {
        nextBtn.disabled = input.value.trim().length === 0;
    };

    const clearError = () => {
        inputWrap.classList.remove("is-error");
        errorText.classList.remove("show");
    };

    const showError = () => {
        inputWrap.classList.add("is-error");
        errorText.classList.add("show");
    };

    input.addEventListener("focus", () => {
        inputWrap.classList.add("is-focus");
        clearError();
    });

    input.addEventListener("input", () => {
        const hasValue = input.value.trim().length > 0;

        if (hasValue) {
            hadTyped = true;
            clearError();
        } else if (document.activeElement === input && hadTyped) {
            showError();
        }

        syncButton();
    });

    input.addEventListener("blur", () => {
        inputWrap.classList.remove("is-focus");
        clearError();
        syncButton();
    });

    syncButton();

    if (closeBtn && overlay) {
        closeBtn.addEventListener("click", () => {
            overlay.style.display = "none";
        });
    }
});
