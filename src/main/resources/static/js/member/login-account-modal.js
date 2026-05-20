document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".account-overlay");
    const closeBtn = document.querySelector(".account-close");
    const wrap = document.querySelector(".account-input-wrap");
    const input = document.getElementById("accountIdentity");
    const nextBtn = document.getElementById("accountNextBtn");

    if (!wrap || !input || !nextBtn) return;

    const sync = () => {
        const hasValue = input.value.trim().length > 0;
        wrap.classList.toggle("has-value", hasValue);
        nextBtn.disabled = !hasValue;
    };

    input.addEventListener("focus", () => wrap.classList.add("is-focus"));
    input.addEventListener("blur", () => wrap.classList.remove("is-focus"));
    input.addEventListener("input", sync);

    if (closeBtn && overlay) {
        closeBtn.addEventListener("click", () => {
            overlay.style.display = "none";
        });
    }

    sync();
});
