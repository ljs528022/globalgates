document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-username");
    const wraps = modal?.querySelectorAll(".name-placeholder-wrap, .phone-number-placeholder") || [];
    const userIdInput = modal?.querySelector(".handle-input");
    let handleAvailable = null;

    if (!modal || !userIdInput) {
        return;
    }

    const getErrorNode = () => {
        let node = modal.querySelector(".phone-number-placeholder .field-error-message");

        if (!node) {
            node = document.createElement("div");
            node.className = "field-error-message";
            modal.querySelector(".phone-number-placeholder")?.appendChild(node);
        }

        return node;
    };

    const renderHandleMessage = (message = "", type = "error") => {
        const node = getErrorNode();

        node.textContent = message;
        node.classList.toggle("show", !!message);
        node.style.color = type === "success" ? "rgb(29, 155, 240)" : "rgb(217, 119, 6)";
    };

    const getHandleError = (value) => {
        const normalized = value.trim();

        if (!normalized) {
            return "아이디를 입력하세요.";
        }

        if (normalized.includes("@")) {
            return "@ 없이 아이디만 입력하세요.";
        }

        if (!/^[a-z0-9_]{4,15}$/.test(normalized)) {
            return "영문 소문자, 숫자, 밑줄(_) 4~15자만 사용할 수 있습니다.";
        }

        return "";
    };

    const runHandleDuplicateCheck = async () => {
        const value = userIdInput.value.trim();
        const error = getHandleError(value);

        // 형식이 틀리면 서버 요청을 보내지 않고 즉시 막는다.
        if (error) {
            handleAvailable = null;
            renderHandleMessage(error);
            updateNextButtonState(modal, userIdInput, handleAvailable);
            return false;
        }

        try {
            const isAvailable = await joinService.checkHandle(value);
            handleAvailable = isAvailable;

            if (!isAvailable) {
                renderHandleMessage("이미 사용 중인 아이디입니다.");
                updateNextButtonState(modal, userIdInput, handleAvailable);
                return false;
            }

            renderHandleMessage("사용 가능한 아이디입니다.", "success");
            updateNextButtonState(modal, userIdInput, handleAvailable);
            return true;
        } catch (error) {
            handleAvailable = null;
            renderHandleMessage("중복 확인 중 오류가 발생했습니다.");
            updateNextButtonState(modal, userIdInput, handleAvailable);
            return false;
        }
    };

    wraps.forEach((wrap) => {
        const input = wrap.querySelector("input");
        const label = wrap.querySelector(".name-placeholder, .phone-placeholder");
        const labelText = wrap.querySelector(".name-text, .phone-text");

        if (!input || !label || !labelText) {
            return;
        }

        if (input.value.trim() !== "") {
            shrink(labelText);
        }

        input.addEventListener("focus", () => {
            label.style.borderColor = "rgb(29, 155, 240)";
            label.style.borderWidth = "2px";
            shrink(labelText);
        });

        input.addEventListener("input", () => {
            // 공백과 대문자를 바로 정리해 형식 오류를 줄인다.
            input.value = input.value.replace(/\s/g, "").toLowerCase();
            handleAvailable = null;
            renderHandleMessage("");
            shrink(labelText);
            updateNextButtonState(modal, userIdInput, handleAvailable);
        });

        input.addEventListener("blur", async () => {
            label.style.borderColor = "rgb(207, 217, 222)";
            label.style.borderWidth = "1px";

            if (input.value.trim() === "" && !input.readOnly) {
                expand(labelText);
            }

            await runHandleDuplicateCheck();
        });
    });

    // event.js는 다음 이동만 맡고, handle 검증 결과는 이 파일에서만 관리한다.
    window.joinHandleValidation = {
        canProceed: () => getHandleError(userIdInput.value) === "" && handleAvailable === true,
        ensureValid: () => runHandleDuplicateCheck()
    };

    updateNextButtonState(modal, userIdInput, handleAvailable);
});

function shrink(labelText) {
    labelText.style.fontSize = "12px";
    labelText.style.paddingTop = "8px";
    labelText.style.color = "rgb(29, 155, 240)";
}

function expand(labelText) {
    labelText.style.fontSize = "17px";
    labelText.style.paddingTop = "16px";
    labelText.style.color = "rgb(83, 100, 113)";
}

function updateNextButtonState(modal, input, handleAvailable = null) {
    const nextButton = modal?.querySelector(".next-button");
    const nextText = modal?.querySelector(".next-button-wrap-in-text-next");

    if (!input || !nextButton || !nextText) {
        return;
    }

    // 아이디 모달은 "입력됨"이 아니라 "형식 통과 + 중복 통과"일 때만 다음으로 보낸다.
    const canProceed = /^[a-z0-9_]{4,15}$/.test(input.value.trim()) && handleAvailable === true;
    nextText.textContent = "다음";
    nextButton.disabled = !canProceed;
    nextButton.style.backgroundColor = "rgb(15, 20, 25)";
    nextButton.style.opacity = canProceed ? "1" : "0.5";
    nextButton.style.cursor = canProceed ? "pointer" : "default";
}

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
