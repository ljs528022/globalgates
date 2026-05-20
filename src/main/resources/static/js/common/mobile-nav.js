// 공용 모바일 하단 nav: 더보기 아코디언 토글 + 로그아웃
(() => {
    function init() {
        const moreBtn = document.getElementById("mobNavMore");
        const sheet = document.getElementById("mobNavMoreSheet");
        const backdrop = document.getElementById("mobMoreBackdrop");
        const logoutBtn = document.getElementById("mobMoreLogout");
        if (!moreBtn || !sheet || !backdrop) return;

        const setOpen = (open) => {
            sheet.classList.toggle("off", !open);
            backdrop.classList.toggle("off", !open);
            moreBtn.setAttribute("aria-expanded", String(open));
            sheet.setAttribute("aria-hidden", String(!open));
            if (open) {
                document.body.style.setProperty("--mob-more-sheet-h", `${sheet.offsetHeight}px`);
            }
            document.body.classList.toggle("mob-more-open", open);
        };

        moreBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            setOpen(moreBtn.getAttribute("aria-expanded") !== "true");
        });
        backdrop.addEventListener("click", () => setOpen(false));

        if (logoutBtn) {
            logoutBtn.addEventListener("click", async () => {
                try {
                    const r = await fetch("/api/auth/logout", { method: "POST" });
                    if (!r.ok) throw new Error("logout failed");
                } catch (err) {
                    console.error("로그아웃 실패", err);
                }
                window.location.href = "/member/login";
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
