document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".auth-overlay");
    const closeBtn = document.querySelector(".auth-close");
    const cancelBtn = document.getElementById("authCancelBtn");
    const methodBtn = document.getElementById("emailMethod");
    const methodText = methodBtn?.querySelector(".method-text");
    const nextBtn = document.getElementById("authNextBtn");

    const mode = window.parent?.sessionStorage?.getItem("loginIdentityMode") || window.sessionStorage.getItem("loginIdentityMode");
    if (methodText) {
        methodText.textContent = mode === "phone" ? "010-3***-***로 문자 보내기" : "dh******@g******로 이메일 보내기";
    }

    const closeModal = () => {
        if (overlay) overlay.style.display = "none";
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    if (methodBtn && nextBtn) {
        methodBtn.addEventListener("click", () => {
            methodBtn.classList.toggle("selected");
        });

        nextBtn.addEventListener("click", () => {
            // 다음 단계 연결 위치
        });
    }
});
