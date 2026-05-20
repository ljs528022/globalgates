document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-password");
    if (!modal) return;

    const wraps = modal.querySelectorAll(".name-placeholder-wrap, .phone-number-placeholder");
    const passwordInput = modal.querySelector(".password-input");
    const passwordWrap = modal.querySelector(".phone-number-placeholder");
    const passwordBox = modal.querySelector(".phone-placeholder");
    const nextButton = modal.querySelector(".next-button");
    const lengthErrorNode = ensureLengthErrorNode(passwordWrap);

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
            shrink(labelText);

            if (input === passwordInput && lengthErrorNode && input.value.trim().length >= 8) {
                lengthErrorNode.classList.remove("show");
            }

            updateJoinButtonState(passwordInput, nextButton);
        });

        input.addEventListener("blur", () => {
            label.style.borderColor = "rgb(207, 217, 222)";
            label.style.borderWidth = "1px";

            if (input.value.trim() === "" && !input.readOnly) {
                expand(labelText);
            }

            updateJoinButtonState(passwordInput, nextButton);
        });
    });

    if (nextButton && passwordInput) {
        nextButton.addEventListener(
            "click",
            (event) => {
                const password = passwordInput.value.trim();
                if (password.length < 8) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    if (lengthErrorNode) {
                        lengthErrorNode.textContent = "8자 이상으로 입력하세요";
                        lengthErrorNode.classList.add("show");
                    }
                    setErrorBorder(passwordBox);
                    passwordInput.focus();
                    return;
                }

                if (lengthErrorNode) {
                    lengthErrorNode.classList.remove("show");
                }
            },
            true
        );
    }

    bindPasswordToggle(modal);

    window.joinPasswordModalReset = () => {
        if (passwordInput) {
            passwordInput.value = "";
            passwordInput.type = "password";
        }

        if (lengthErrorNode) {
            lengthErrorNode.textContent = "";
            lengthErrorNode.classList.remove("show");
        }

        if (passwordBox) {
            passwordBox.style.borderColor = "rgb(207, 217, 222)";
            passwordBox.style.borderWidth = "1px";
            passwordBox.style.boxShadow = "none";
        }

        const labelText = modal.querySelector(".phone-text");
        if (labelText) {
            expand(labelText);
        }

        const eyeOpen = modal.querySelector(".eye-open");
        const eyeOff = modal.querySelector(".eye-off");
        eyeOpen?.classList.remove("is-hidden");
        eyeOff?.classList.add("is-hidden");

        const toggleBtn = modal.querySelector(".eye-btn-wrap");
        toggleBtn?.setAttribute("aria-label", "비밀번호 보기");

        updateJoinButtonState(passwordInput, nextButton);
    };

    updateJoinButtonState(passwordInput, nextButton);
});

function updateJoinButtonState(input, button) {
    if (!input || !button) return;

    const hasValue = input.value.trim().length > 0;
    button.disabled = !hasValue;
    button.style.backgroundColor = "rgb(15, 20, 25)";
    button.style.opacity = hasValue ? "1" : "0.5";
    button.style.cursor = hasValue ? "pointer" : "default";
}

function ensureLengthErrorNode(host) {
    if (!host) return null;
    let node = host.querySelector(".field-error-message");
    if (!node) {
        node = document.createElement("div");
        node.className = "field-error-message";
        host.appendChild(node);
    }
    return node;
}

function setErrorBorder(box) {
    if (!box) return;
    box.style.borderColor = "rgb(217, 119, 6)";
    box.style.borderWidth = "2px";
    box.style.boxShadow = "0 0 0 2px rgba(217, 119, 6, 0.16)";
}

function bindPasswordToggle(modal) {
    const input = modal.querySelector(".password-input");
    const toggleBtn = modal.querySelector(".eye-btn-wrap");
    const eyeOpen = modal.querySelector(".eye-open");
    const eyeOff = modal.querySelector(".eye-off");

    if (!input || !toggleBtn || !eyeOpen || !eyeOff) {
        return;
    }

    toggleBtn.addEventListener("click", () => {
        const showing = input.type === "text";
        input.type = showing ? "password" : "text";

        eyeOpen.classList.toggle("is-hidden", !showing);
        eyeOff.classList.toggle("is-hidden", showing);
        toggleBtn.setAttribute("aria-label", showing ? "비밀번호 보기" : "비밀번호 숨기기");
        input.focus();
    });
}

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
