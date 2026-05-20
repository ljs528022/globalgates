document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-language");
    const list = modal?.querySelector(".language-list");
    const nextButton = modal?.querySelector(".next-button");
    if (!list || !nextButton) {
        return;
    }

    const syncNextButton = () => {
        const hasLanguage = Boolean(window.selectedLanguage);
        nextButton.disabled = !hasLanguage;
        nextButton.style.opacity = hasLanguage ? "1" : "0.5";
        nextButton.style.cursor = hasLanguage ? "pointer" : "default";
    };

    function getLanguageSaveLabel(item) {
        if (!(item instanceof HTMLButtonElement)) {
            return "";
        }

        const rawLabel =
            item.querySelector(".language-item__label")?.textContent?.trim() || "";

        // setting과 같은 저장 규칙을 사용한다.
        // "영어 - English"처럼 보이는 항목도 실제 저장값은 앞쪽 짧은 문자열만 사용한다.
        return rawLabel.split(" - ")[0].trim() || rawLabel;
    }

    list.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const item = target.closest(".js-lang-item");
        if (!(item instanceof HTMLButtonElement)) {
            return;
        }

        const willCheck = !item.classList.contains("is-checked");

        list.querySelectorAll(".js-lang-item").forEach((langItem) => {
            langItem.classList.remove("is-checked");
            langItem.setAttribute("aria-selected", "false");
        });

        if (willCheck) {
            item.classList.add("is-checked");
            item.setAttribute("aria-selected", "true");
            window.selectedLanguage = getLanguageSaveLabel(item);
        } else {
            window.selectedLanguage = null;
        }

        syncNextButton();
    });

    window.selectedLanguage = null;
    syncNextButton();
});
