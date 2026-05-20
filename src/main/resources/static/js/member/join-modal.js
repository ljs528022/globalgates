document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-create");
    if (!modal) return;

    const changeButton = modal.querySelector(".change");
    const replaceEmailText = modal.querySelector(".replace-email");
    const phoneLabelText = modal.querySelector(".phone-text-in");
    const phoneInput = modal.querySelector(".phone-input");
    const birthInput = modal.querySelector(".birth-date-input");
    const nameInput = modal.querySelector(".name-input");

    const fields = [
        {
            input: nameInput,
            label: modal.querySelector(".name-text"),
            shrink: (label) => {
                if (!label) return;
                label.style.fontSize = "12px";
                label.style.paddingTop = "8px";
                label.style.color = "rgb(29, 155, 240)";
            },
            expand: (label) => {
                if (!label) return;
                label.style.fontSize = "17px";
                label.style.paddingTop = "16px";
                label.style.color = "rgb(83, 100, 113)";
            },
        },
        {
            input: phoneInput,
            label: modal.querySelector(".phone-text"),
            shrink: (label) => {
                if (!label) return;
                label.style.fontSize = "12px";
                label.style.paddingTop = "8px";
                label.style.color = "rgb(29, 155, 240)";
                phoneInput?.classList.add("show-placeholder");
            },
            expand: (label) => {
                if (!label) return;
                label.style.fontSize = "17px";
                label.style.paddingTop = "16px";
                label.style.color = "rgb(83, 100, 113)";
                phoneInput?.classList.remove("show-placeholder");
            },
        },
        {
            input: birthInput,
            label: modal.querySelector(".birth-date-text-input"),
            shrink: (_, input) => {
                if (!input) return;
                input.classList.add("birth-focus-placeholder");
            },
            expand: (_, input) => {
                if (!input) return;
                input.classList.remove("birth-focus-placeholder");
            },
        },
    ].filter((field) => field.input);

    fields.forEach((field) => {
        if (field.input.value.trim().length > 0) {
            field.shrink(field.label, field.input);
        } else {
            field.expand(field.label, field.input);
        }

        field.input.addEventListener("focus", () => {
            field.shrink(field.label, field.input);
        });

        field.input.addEventListener("input", () => {
            if (field.input.value.trim().length > 0) {
                field.shrink(field.label, field.input);
            } else {
                field.expand(field.label, field.input);
            }
        });

        field.input.addEventListener("blur", () => {
            if (field.input.value.trim().length === 0) {
                field.expand(field.label, field.input);
            }
        });
    });

    let useEmail = false;
    let syncPhoneEmailMode = () => {};

    if (changeButton && replaceEmailText && phoneLabelText && phoneInput) {
        syncPhoneEmailMode = () => {
            if (useEmail) {
                phoneLabelText.textContent = "이메일";
                replaceEmailText.textContent = "휴대폰 사용하기";
                phoneInput.setAttribute("name", "email");
                phoneInput.setAttribute("autocomplete", "email");
                phoneInput.setAttribute("inputmode", "email");
                phoneInput.setAttribute("placeholder", "name@example.com");
            } else {
                phoneLabelText.textContent = "휴대폰 번호";
                replaceEmailText.textContent = "이메일 사용하기";
                phoneInput.setAttribute("name", "phone");
                phoneInput.setAttribute("autocomplete", "tel");
                phoneInput.setAttribute("inputmode", "tel");
                phoneInput.setAttribute("placeholder", "01012345678");
            }

            if (phoneInput.value.trim().length === 0) {
                phoneInput.classList.remove("show-placeholder");
            }
        };

        syncPhoneEmailMode();

        changeButton.addEventListener("click", () => {
            useEmail = !useEmail;
            phoneInput.value = "";
            syncPhoneEmailMode();
        });
    }

    if (birthInput) {
        birthInput.addEventListener("input", () => {
            birthInput.value = birthInput.value.replace(/\D/g, "").slice(0, 8);
        });
    }

    window.joinCreateModalReset = () => {
        useEmail = false;
        nameInput && (nameInput.value = "");
        phoneInput && (phoneInput.value = "");
        birthInput && (birthInput.value = "");

        syncPhoneEmailMode();

        fields.forEach((field) => {
            field.expand(field.label, field.input);
        });

        phoneInput?.classList.remove("show-placeholder");
        birthInput?.classList.remove("birth-focus-placeholder");
        window.joinCreateValidation?.resetCreateFormState?.();
    };
});
