document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".login-overlay");
    const closeBtn = document.querySelector(".login-close");
    const passwordWrap = document.querySelector(".password-wrap");
    const passwordInput = document.getElementById("passwordInput");
    const eyeBtn = document.querySelector(".eye-btn");
    const eyeOpen = document.querySelector(".eye-open");
    const eyeOff = document.querySelector(".eye-off");
    const loginBtn = document.getElementById("loginBtn");

    if (!passwordWrap || !passwordInput || !loginBtn) return;

    const syncButton = () => {
        const hasValue = passwordInput.value.trim().length > 0;
        loginBtn.disabled = !hasValue;
        loginBtn.classList.toggle("enabled", hasValue);
        passwordWrap.classList.toggle("has-value", hasValue);
    };

    passwordInput.addEventListener("focus", () => {
        passwordWrap.classList.add("is-focus");
    });

    passwordInput.addEventListener("blur", () => {
        passwordWrap.classList.remove("is-focus");
    });

    passwordInput.addEventListener("input", syncButton);

    if (eyeBtn) {
        eyeBtn.addEventListener("click", () => {
            const showing = passwordInput.type === "text";
            passwordInput.type = showing ? "password" : "text";

            if (eyeOpen && eyeOff) {
                eyeOpen.classList.toggle("is-hidden", !showing);
                eyeOff.classList.toggle("is-hidden", showing);
            }

            eyeBtn.setAttribute("aria-label", showing ? "비밀번호 보기" : "비밀번호 숨기기");
            passwordInput.focus();
        });
    }

    if (closeBtn && overlay) {
        closeBtn.addEventListener("click", () => {
            overlay.style.display = "none";
        });
    }

    syncButton();
});
