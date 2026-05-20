const emailPhone = document.getElementById("loginIdentity");
const loginId = document.getElementById("login-id");
const password = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const reactivationModal = document.getElementById("login-reactivation-modal");
const reactivationCodeModal = document.getElementById("login-reactivation-code-modal");
const reactivationTargetText = document.getElementById("reactivationTargetText");
const reactivationCodeDesc = document.getElementById("reactivationCodeDesc");
const reactivationSendBtn = document.getElementById("reactivationSendBtn");
const reactivationCancelBtn = document.getElementById("reactivationCancelBtn");
const reactivationCodeInput = document.getElementById("reactivationCodeInput");
const reactivationCodeBtn = document.getElementById("reactivationCodeBtn");

let pendingReactivation = null;

const openOverlay = (overlay) => {
    if (!overlay) {
        return;
    }

    overlay.style.display = "grid";
    overlay.setAttribute("aria-hidden", "false");
};

const closeOverlay = (overlay) => {
    if (!overlay) {
        return;
    }

    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
};

const resetReactivation = () => {
    pendingReactivation = null;

    if (reactivationCodeInput) {
        reactivationCodeInput.value = "";
    }

    if (reactivationCodeBtn) {
        reactivationCodeBtn.textContent = "돌아가기";
        reactivationCodeBtn.classList.remove("is-primary");
        reactivationCodeBtn.classList.add("is-secondary");
    }

    closeOverlay(reactivationModal);
    closeOverlay(reactivationCodeModal);
};

const syncReactivationCodeButton = () => {
    if (!reactivationCodeInput || !reactivationCodeBtn) {
        return;
    }

    const hasCode = reactivationCodeInput.value.trim().length > 0;
    reactivationCodeBtn.textContent = hasCode ? "다음" : "돌아가기";
    reactivationCodeBtn.classList.toggle("is-primary", hasCode);
    reactivationCodeBtn.classList.toggle("is-secondary", !hasCode);
};

emailPhone.addEventListener("input", (e) => {
    loginId.value = e.target.value;
});

loginBtn.addEventListener("click", async () => {
    const payload = {
        loginId: loginId.value.trim(),
        memberPassword: password.value,
    };

    try {
        const result = await loginService.login(payload);

        if (result.accessToken) {
            location.href = "/main/main";
        }
    } catch (error) {
        try {
            // 일반 로그인은 그대로 실패시키고, inactive 계정일 때만 별도 복구 흐름으로 보낸다.
            pendingReactivation = await loginService.prepareReactivation(payload);
            pendingReactivation.loginId = payload.loginId;
            pendingReactivation.memberPassword = payload.memberPassword;

            if (reactivationTargetText) {
                reactivationTargetText.textContent = pendingReactivation.maskedTarget || "가입된 연락처";
            }

            openOverlay(reactivationModal);
        } catch (prepareError) {
            alert(prepareError.message || "입력한 정보가 일치하지 않습니다.");
        }
    }
});

reactivationSendBtn?.addEventListener("click", async () => {
    if (!pendingReactivation) {
        return;
    }

    try {
        // 확인 버튼을 누르기 전에는 인증번호를 보내지 않는다.
        // 기존 mail/sms API를 그대로 재사용해서 새 전송 API를 만들지 않게 유지한다.
        const response = pendingReactivation.useEmail
            ? await fetch("/api/mail/send-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    memberEmail: pendingReactivation.loginId,
                }),
            })
            : await fetch("/api/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    memberPhone: pendingReactivation.loginId,
                }),
            });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "인증번호 전송 실패");
        }

        pendingReactivation.code = await response.text();

        if (reactivationCodeDesc) {
            reactivationCodeDesc.textContent =
                `${pendingReactivation.maskedTarget || "가입된 연락처"}로 전송된 코드를 입력하세요.`;
        }

        closeOverlay(reactivationModal);
        openOverlay(reactivationCodeModal);
        syncReactivationCodeButton();
        reactivationCodeInput?.focus();
    } catch (error) {
        alert(error.message || "인증번호 전송 실패");
    }
});

reactivationCancelBtn?.addEventListener("click", resetReactivation);
document.querySelector("[data-reactivation-close]")?.addEventListener("click", resetReactivation);
document.querySelector("[data-reactivation-code-close]")?.addEventListener("click", resetReactivation);

reactivationCodeInput?.addEventListener("input", syncReactivationCodeButton);

reactivationCodeBtn?.addEventListener("click", async () => {
    if (!pendingReactivation) {
        return;
    }

    const inputCode = reactivationCodeInput?.value.trim() || "";

    if (!inputCode) {
        closeOverlay(reactivationCodeModal);
        openOverlay(reactivationModal);
        return;
    }

    if (inputCode !== pendingReactivation.code) {
        alert("잘못된 인증번호입니다.");
        reactivationCodeInput?.focus();
        return;
    }

    try {
        // 코드 비교는 현재 프로젝트의 join/setting과 같은 방식으로 프런트에서 먼저 처리하고,
        // 서버에는 실제 계정 복구와 로그인 완료만 요청한다.
        const result = await loginService.completeReactivation({
            loginId: pendingReactivation.loginId,
            memberPassword: pendingReactivation.memberPassword,
        });

        if (result.accessToken) {
            location.href = "/main/main";
        }
    } catch (error) {
        alert(error.message || "계정 재활성화 실패");
    }
});

const kakaoLoginButtons = document.querySelectorAll(".kakao-login");
kakaoLoginButtons.forEach((button) => {
    button.addEventListener("click", () => {
        location.href = "/oauth2/authorization/kakao";
    });
});

const naverLoginButtons = document.querySelectorAll(".naver-login");
naverLoginButtons.forEach((button) => {
    button.addEventListener("click", () => {
        location.href = "/oauth2/authorization/naver";
    });
});

const facebookLoginButtons = document.querySelectorAll(".facebook-login");
facebookLoginButtons.forEach((button) => {
    button.addEventListener("click", () => {
        location.href = "/oauth2/authorization/facebook";
    });
});

const googleLoginButtons = document.querySelectorAll(".google-login");
googleLoginButtons.forEach((button) => {
    button.addEventListener("click", () => {
        location.href = "/oauth2/authorization/google";
    });
});
