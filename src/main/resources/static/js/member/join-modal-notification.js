document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".js-bounce-btn");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            button.classList.remove("is-bouncing");
            void button.offsetWidth;
            button.classList.add("is-bouncing");
        });
    });
});

// 공통 X(닫기) 버튼 동작
function bindJoinModalClose() {
    const closeButtons = document.querySelectorAll(".join-modal-header-close-button, .join-modal-close");
    if (!closeButtons.length) return;

    closeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const modal = document.querySelector(".join-modal");
            const root = modal?.closest(".join-modal-line1") || document.querySelector(".join-modal-line1");
            const overlay = document.querySelector(".join-modal-overlay") || document.querySelector(".join-modal-all");

            if (modal) modal.style.display = "none";
            if (root) root.style.display = "none";
            if (overlay) overlay.style.display = "none";
        });
    });
}

document.addEventListener("DOMContentLoaded", bindJoinModalClose);
