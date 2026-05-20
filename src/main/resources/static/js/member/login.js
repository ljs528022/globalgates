document.addEventListener("DOMContentLoaded", () => {
    const loginTrigger = document.getElementById("btn-login");
    const joinTrigger = document.getElementById("btn-create");
    const loginModal = document.getElementById("login-modal");
    const passwordModal = document.getElementById("login-password-modal");

    if (!loginTrigger || !loginModal || !passwordModal) {
        return;
    }

    const loginInputWrap = loginModal.querySelector(".input-wrap");
    const loginInput = loginModal.querySelector("#loginIdentity");
    const loginErrorText = loginModal.querySelector(".field-error-message");
    const loginNextButton = loginModal.querySelector("#nextBtn");
    const loginCloseButton = loginModal.querySelector(".login-close");
    const originalFacebookButton = document.getElementById("facebook-login");
    const originalGoogleButton = document.getElementById("google-login");
    const loginFacebookButton = document.getElementById("login-facebook-login");
    const loginGoogleButton = document.getElementById("login-google-login");

    const passwordWrap = passwordModal.querySelector(".password-wrap");
    const passwordInput = passwordModal.querySelector("#passwordInput");
    const passwordLoginButton = passwordModal.querySelector("#loginBtn");
    const passwordCloseButton = passwordModal.querySelector(".login-close");
    const passwordEyeButton = passwordModal.querySelector(".eye-btn");
    const eyeOpen = passwordModal.querySelector(".eye-open");
    const eyeOff = passwordModal.querySelector(".eye-off");
    const identityLabel = passwordModal.querySelector(".mail-label");
    const identityValue = passwordModal.querySelector(".mail-value");
    const findPasswordLink = passwordModal.querySelector(".find-password");
    const signupLinks = [
        ...loginModal.querySelectorAll(".signup-text a"),
        ...passwordModal.querySelectorAll(".signup-text a"),
    ];

    let hadTypedIdentity = false;

    const moveChildren = (from, to) => {
        if (!from || !to) {
            return;
        }

        while (from.firstChild) {
            to.appendChild(from.firstChild);
        }
    };

    const mountOauthButtons = () => {
        moveChildren(originalFacebookButton, loginFacebookButton);
        moveChildren(originalGoogleButton, loginGoogleButton);
    };

    const restoreOauthButtons = () => {
        moveChildren(loginFacebookButton, originalFacebookButton);
        moveChildren(loginGoogleButton, originalGoogleButton);
    };

    // 모바일에서 슬라이드업된 .join-panel을 모달이 열려 있는 동안 내려두기 위해
    // body.flow-modal-open 클래스를 토글한다. 모든 로그인 모달이 닫히면 해제한다.
    const syncFlowModalOpen = () => {
        const anyOpen = loginModal.style.display === "grid"
                     || passwordModal.style.display === "grid";
        document.body.classList.toggle("flow-modal-open", anyOpen);
    };

    const showModal = (modal) => {
        modal.style.display = "grid";
        modal.setAttribute("aria-hidden", "false");
        syncFlowModalOpen();
    };

    const hideModal = (modal) => {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        syncFlowModalOpen();
    };

    const closeAllModals = () => {
        restoreOauthButtons();
        resetLoginState();
        resetPasswordState();
        hideModal(loginModal);
        hideModal(passwordModal);
    };

    const resetLoginState = () => {
        hadTypedIdentity = false;

        if (loginInput) {
            loginInput.value = "";
        }

        loginInputWrap?.classList.remove("is-focus");
        clearLoginError();
        syncLoginButton();
    };

    const resetPasswordState = () => {
        if (passwordInput) {
            passwordInput.value = "";
            passwordInput.type = "password";
        }

        passwordWrap?.classList.remove("is-focus", "has-value");
        eyeOpen?.classList.remove("is-hidden");
        eyeOff?.classList.add("is-hidden");
        passwordEyeButton?.setAttribute("aria-label", "비밀번호 보기");
        syncPasswordButton();
    };

    const clearLoginError = () => {
        loginInputWrap?.classList.remove("is-error");
        loginErrorText?.classList.remove("show");
    };

    const showLoginError = () => {
        loginInputWrap?.classList.add("is-error");
        loginErrorText?.classList.add("show");
    };

    const syncLoginButton = () => {
        if (!loginNextButton || !loginInput) {
            return;
        }

        loginNextButton.disabled = loginInput.value.trim().length === 0;
    };

    const syncPasswordButton = () => {
        if (!passwordWrap || !passwordInput || !passwordLoginButton) {
            return;
        }

        const hasValue = passwordInput.value.trim().length > 0;
        passwordWrap.classList.toggle("has-value", hasValue);
        passwordLoginButton.disabled = !hasValue;
        passwordLoginButton.classList.toggle("enabled", hasValue);
    };

    const openLoginModal = () => {
        mountOauthButtons();
        hideModal(passwordModal);
        showModal(loginModal);
        clearLoginError();
        syncLoginButton();
        loginInput?.focus();
    };

    const openPasswordModal = () => {
        const rawValue = loginInput?.value.trim() || "";
        const isEmail = rawValue.includes("@");

        if (identityLabel) {
            identityLabel.textContent = isEmail ? "이메일" : "휴대폰 번호";
        }

        if (identityValue) {
            identityValue.textContent = rawValue;
        }

        hideModal(loginModal);
        showModal(passwordModal);
        if (passwordInput) {
            passwordInput.value = "";
        }
        syncPasswordButton();
        passwordInput?.focus();
    };

    const openJoinModal = () => {
        closeAllModals();
        joinTrigger?.click();
    };

    loginTrigger.addEventListener("click", (event) => {
        event.preventDefault();
        openLoginModal();
    });

    loginCloseButton?.addEventListener("click", closeAllModals);
    passwordCloseButton?.addEventListener("click", closeAllModals);

    loginModal.addEventListener("click", (event) => {
        if (event.target === loginModal) {
            closeAllModals();
        }
    });

    passwordModal.addEventListener("click", (event) => {
        if (event.target === passwordModal) {
            closeAllModals();
        }
    });

    loginInput?.addEventListener("focus", () => {
        loginInputWrap?.classList.add("is-focus");
        clearLoginError();
    });

    loginInput?.addEventListener("input", () => {
        const hasValue = loginInput.value.trim().length > 0;

        if (hasValue) {
            hadTypedIdentity = true;
            clearLoginError();
        } else if (document.activeElement === loginInput && hadTypedIdentity) {
            showLoginError();
        }

        syncLoginButton();
    });

    loginInput?.addEventListener("blur", () => {
        loginInputWrap?.classList.remove("is-focus");
        clearLoginError();
        syncLoginButton();
    });

    loginNextButton?.addEventListener("click", () => {
        if (!loginInput || loginInput.value.trim().length === 0) {
            showLoginError();
            return;
        }

        openPasswordModal();
    });

    passwordInput?.addEventListener("focus", () => {
        passwordWrap?.classList.add("is-focus");
    });

    passwordInput?.addEventListener("blur", () => {
        passwordWrap?.classList.remove("is-focus");
    });

    passwordInput?.addEventListener("input", syncPasswordButton);

    passwordEyeButton?.addEventListener("click", () => {
        if (!passwordInput) {
            return;
        }

        const showing = passwordInput.type === "text";
        passwordInput.type = showing ? "password" : "text";

        if (eyeOpen && eyeOff) {
            eyeOpen.classList.toggle("is-hidden", !showing);
            eyeOff.classList.toggle("is-hidden", showing);
        }

        passwordEyeButton.setAttribute("aria-label", showing ? "비밀번호 보기" : "비밀번호 숨기기");
        passwordInput.focus();
    });

    passwordLoginButton?.addEventListener("click", (event) => {
        event.preventDefault();
    });

    findPasswordLink?.addEventListener("click", (event) => {
        event.preventDefault();
    });

    signupLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            openJoinModal();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        if (passwordModal.style.display === "grid") {
            hideModal(passwordModal);
            showModal(loginModal);
            loginInput?.focus();
            return;
        }

        if (loginModal.style.display === "grid") {
            closeAllModals();
        }
    });

    syncLoginButton();
    syncPasswordButton();
});
