document.addEventListener("DOMContentLoaded", () => {
    const submitModal = document.getElementById("modal-submit");
    const submitForm = document.getElementById("join-submit-form");
    const notificationButtons = document.querySelectorAll("#modal-notification .notification-btn");

    if (!submitModal || !submitForm || !notificationButtons.length) {
        return;
    }

    const setHiddenValue = (name, value) => {
        const input = submitForm.querySelector(`input[name="${name}"]`);
        if (!input) {
            return;
        }

        input.value = value ?? "";
    };

    const getValue = (selector) => {
        const input = document.querySelector(selector);
        if (!(input instanceof HTMLInputElement)) {
            return "";
        }

        return input.value.trim();
    };

    const syncHiddenValues = (pushEnabled) => {
        const contactLabel = document.querySelector("#modal-create .phone-text-in")?.textContent.trim();
        const contactValue = getValue("#modal-create .phone-input");
        const addrMain = getValue("#modal-business #addr-main");
        const addrDetail = getValue("#modal-business #addr-detail");

        setHiddenValue("memberName", getValue("#modal-create input[name='name']"));
        setHiddenValue("memberEmail", contactLabel === "이메일" ? contactValue : "");
        setHiddenValue("memberPhone", contactLabel === "이메일" ? "" : contactValue);
        setHiddenValue("birthDate", getValue("#modal-create .birth-date-input"));
        setHiddenValue("verificationCode", getValue("#modal-code input[name='code']"));
        setHiddenValue("memberPassword", getValue("#modal-password input[name='password']"));
        setHiddenValue("memberHandle", getValue("#modal-username input[name='username']"));
        setHiddenValue("companyName", getValue("#modal-business input[name='bizName']"));
        setHiddenValue("businessNumber", getValue("#modal-business input[name='bizRegNo']"));
        setHiddenValue("ceoName", getValue("#modal-business input[name='bizOwner']"));
        setHiddenValue("postcode", getValue("#modal-business #postcode"));
        setHiddenValue("addrMain", addrMain);
        setHiddenValue("addrDetail", addrDetail);
        setHiddenValue("businessType", getValue("#modal-business input[name='bizType']"));
        setHiddenValue("memberRegion", [addrMain, addrDetail].filter(Boolean).join(" "));
        setHiddenValue("pushEnabled", String(Boolean(pushEnabled)));
    };

    notificationButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const pushEnabled = button.classList.contains("notification-btn-primary");
            submitModal.dataset.pushEnabled = String(pushEnabled);
            syncHiddenValues(pushEnabled);
        });
    });

    submitForm.addEventListener("submit", () => {
        const pushEnabled = submitModal.dataset.pushEnabled === "true";
        syncHiddenValues(pushEnabled);
    });
});
