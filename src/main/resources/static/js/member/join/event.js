
// - SNS 신규가입인지 한 번만 판단
// - 소셜 기본 정보는 이 객체에 보관
// - hidden input 중복 저장 안 함
const params = new URLSearchParams(window.location.search);
// 휴대폰 인증 흐름에서만 사용하는 임시 상태값
let certCode = null;
let phoneVerified = false;
// 이메일 인증 흐름에서만 사용하는 임시 상태값
let emailCertCode = null;
let emailVerified = false;

window.oauthJoinData = {
    enabled: params.get("oauth") === "1",
    provider: params.get("provider") || "",
    providerId: params.get("providerId") || "",
    memberName: params.get("memberName") || "",
    memberEmail: params.get("memberEmail") || "",
    memberPhone: params.get("memberPhone") || "",
    profileUrl: params.get("profileUrl") || ""
};

const codeInput = document.querySelector('#modal-code input[name="code"]');
const MODALS = [
    'modal-create', 'overlay-phone', 'overlay-email',
    'modal-code', 'modal-password', 'modal-oauth-birth', 'modal-business',
    'modal-profile', 'modal-username', 'modal-notification',
    'modal-language', 'modal-category', 'modal-submit'
];
// 모바일에서 슬라이드업된 .join-panel은 모달 뒤에 가려도 입력을 방해하므로,
// 가입 플로우 모달이 하나라도 열려 있는 동안 body.flow-modal-open 으로 표시해
// CSS에서 패널을 임시로 내려둔다. 모든 모달이 닫히면 자동으로 패널이 복귀한다.
const syncFlowModalOpen = () => {
    const anyOpen = MODALS.some(mid => {
        const el = document.getElementById(mid);
        return el && el.style.display && el.style.display !== 'none';
    });
    document.body.classList.toggle('flow-modal-open', anyOpen);
};
const show = id => {
    document.getElementById(id).style.display = 'flex';
    syncFlowModalOpen();
};
const hide = id => {
    document.getElementById(id).style.display = 'none';
    syncFlowModalOpen();
};
const hideAll = () => MODALS.forEach(hide);
const resetSmsState = () => {
    // 모달을 닫거나 처음부터 다시 시작할 때 인증 상태도 함께 비운다.
    certCode = null;
    phoneVerified = false;

    if (codeInput) {
        codeInput.value = "";
    }
};
const resetEmailState = () => {
    // 모달을 닫거나 처음부터 다시 시작할 때 이메일 인증 상태도 함께 비운다.
    emailCertCode = null;
    emailVerified = false;

    if (codeInput) {
        codeInput.value = "";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // 신규 SNS 회원이면 join 진입 직후 생년월일 모달부터 연다.
    if (window.oauthJoinData.enabled && window.location.hash === "#modal-oauth-birth") {
        hideAll();
        show("modal-oauth-birth");
    }
// SNS 프로필 사진을 프로필 모달 기본 미리보기로 사용
    if (window.oauthJoinData.enabled && window.oauthJoinData.profileUrl) {
        const preview = document.querySelector(".avatar-preview");
        if (preview) {
            preview.src = window.oauthJoinData.profileUrl;
            // has-image가 없으면 avatar-preview는 opacity:0이라 SNS 사진이 가려진다.
            preview.closest(".avatar-frame")?.classList.add("has-image");
        }
    }
});

// 메인 버튼
document.getElementById('btn-create').addEventListener('click', () => {
    hideAll();
    // SNS 신규가입이면 앞단계(계정생성/인증/비밀번호)를 건너뛰고 생년월일부터 시작
    if (window.oauthJoinData.enabled) {
        show('modal-oauth-birth');
        return;
    }
    show('modal-create');
});

// 닫기 버튼 (X) - 확인 후 닫기
document.querySelectorAll('.join-modal-header-close-button, .icon-button--close').forEach(btn => {
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (!confirm('정말 나가시겠습니까?')) {
            return;
        }

        window.joinCreateModalReset?.();
        window.joinPasswordModalReset?.();
        resetSmsState();
        resetEmailState();
        hideAll();
    });
});

// overlay-phone
document.querySelector('#overlay-phone .btn-confirm').addEventListener('click', async () => {
    try {
        // 서버가 내려준 인증번호를 받아 두고, code 모달에서 사용자가 입력한 값과 비교한다.
        certCode = await joinService.sendSms(identityInput.value.trim());
        phoneVerified = false;
        hide('overlay-phone');
        show('modal-code');
    } catch (error) {
        alert(error.message || '인증번호 전송에 실패했습니다.');
    }
});
document.querySelector('#overlay-phone .btn-edit').addEventListener('click', () => {
    resetSmsState();
    hide('overlay-phone');
    show('modal-create');
});

// overlay-email
document.querySelector('#overlay-email .btn-confirm').addEventListener('click', async () => {
    try {
        // 서버가 내려준 인증번호를 받아 두고, code 모달에서 사용자가 입력한 값과 비교한다.
        emailCertCode = await joinService.sendEmailCode(identityInput.value.trim());
        emailVerified = false;
        hide('overlay-email');
        show('modal-code');
    } catch (error) {
        alert(error.message || '인증번호 전송에 실패했습니다.');
    }
});
document.querySelector('#overlay-email .btn-edit').addEventListener('click', () => {
    resetEmailState();
    hide('overlay-email');
    show('modal-create');
});

// 코드 재전송: "코드를 받지 못했나요?" 클릭 시 현재 모드(휴대폰/이메일)에 맞춰 다시 전송한다.
const resendCodeButton = document.querySelector('#modal-code .change');
let resendInFlight = false;
resendCodeButton?.addEventListener('click', async () => {
    if (resendInFlight) return;

    const label = identityLabel?.textContent.trim();
    const target = identityInput?.value.trim() || "";

    if (!target) {
        alert('먼저 연락처를 입력해주세요.');
        return;
    }

    resendInFlight = true;
    const originalText = resendCodeButton.querySelector('.replace-email')?.textContent;
    const setLabel = (text) => {
        const span = resendCodeButton.querySelector('.replace-email');
        if (span) span.textContent = text;
    };
    setLabel('전송 중...');

    try {
        if (label === '이메일') {
            emailCertCode = await joinService.sendEmailCode(target);
            emailVerified = false;
        } else {
            certCode = await joinService.sendSms(target);
            phoneVerified = false;
        }

        if (codeInput) codeInput.value = "";
        codeInput?.dispatchEvent(new Event('input'));

        setLabel('새 코드를 보냈습니다');
        setTimeout(() => setLabel(originalText || '코드를 받지 못했나요?'), 2000);
    } catch (error) {
        setLabel(originalText || '코드를 받지 못했나요?');
        alert(error.message || '인증번호 재전송에 실패했습니다.');
    } finally {
        resendInFlight = false;
    }
});

// 코드 → 비밀번호
document.querySelector('#modal-code .next-button').addEventListener('click', () => {
    const label = identityLabel?.textContent.trim();
    const inputCode = codeInput?.value.trim() || "";

    if (!inputCode) {
        alert('인증번호를 입력하세요.');
        return;
    }

    if (label === '휴대폰 번호') {
        if (certCode !== inputCode) {
            phoneVerified = false;
            alert('잘못된 인증번호입니다.');
            return;
        }

        // 일반 회원가입 최종 submit 전에 휴대폰 인증 완료 여부를 다시 확인한다.
        phoneVerified = true;
    }

    if (label === '이메일') {
        if (emailCertCode !== inputCode) {
            emailVerified = false;
            alert('잘못된 인증번호입니다.');
            return;
        }

        // 일반 회원가입 최종 submit 전에 이메일 인증 완료 여부를 다시 확인한다.
        emailVerified = true;
    }

    hide('modal-code');
    show('modal-password');
});

// 비밀번호 → 사업자
document.querySelector('#modal-password .next-button').addEventListener('click', () => { hide('modal-password'); show('modal-business'); });

// SNS 생년월일 → 사업자
const oauthBirthInput = document.querySelector('#modal-oauth-birth .oauth-birth-date-input');
const oauthBirthError = document.querySelector('#modal-oauth-birth .field-error-message');
if (oauthBirthInput) {
    oauthBirthInput.addEventListener('input', () => {
        oauthBirthInput.value = oauthBirthInput.value.replace(/\D/g, "").slice(0, 8);
        oauthBirthError?.classList.remove('show');
    });
}
document.querySelector('#modal-oauth-birth .next-button').addEventListener('click', () => {
    const birthDateValue = oauthBirthInput?.value.trim() || "";
    if (birthDateValue.length !== 8) {
        oauthBirthError?.classList.add('show');
        oauthBirthInput?.focus();
        return;
    }

    oauthBirthError?.classList.remove('show');
    hide('modal-oauth-birth');
    show('modal-business');
});

// 사업자 → 프로필
document.querySelector('#modal-business .next-button').addEventListener('click', () => { hide('modal-business'); show('modal-profile'); });

// 프로필 → 아이디
document.querySelector('#modal-profile .ghost-button').addEventListener('click', () => { hide('modal-profile'); show('modal-username'); });

// 아이디 → 언어
document.querySelector('#modal-username .next-button').addEventListener('click', async (event) => {
    // handle 검증은 join-modal-user-name.js가 담당하고, 여기서는 통과 여부만 확인한다.
    const isValid = await window.joinHandleValidation?.ensureValid?.();

    if (!isValid || !window.joinHandleValidation?.canProceed?.()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
    }

    hide('modal-username');
    show('modal-language');
});

// 언어 → 카테고리
document.querySelector('#modal-language .next-button').addEventListener('click', () => { hide('modal-language'); show('modal-category'); });

// 카테고리 → 알림
document.querySelector('#modal-category .js-next-button').addEventListener('click', () => { hide('modal-category'); show('modal-notification'); });

// 알림 → 회원가입 확인
document.querySelectorAll('#modal-notification .notification-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const submitModal = document.getElementById('modal-submit');
        if (submitModal) {
            submitModal.dataset.pushEnabled = String(btn.classList.contains('notification-btn-primary'));
        }

        hide('modal-notification');
        show('modal-submit');
    });
});

const createNextButton = document.querySelector('#modal-create .next-button');
const identityInput = document.getElementById('identity-input');
const identityLabel = document.querySelector('#modal-create .phone-text-in');
const changeIdentityButton = document.querySelector('#modal-create .change');

let identityDuplicateState = null; // null: 미검사, true: 사용가능, false: 중복
let identityChecking = false;
let identityRequestToken = 0;

const isEmailMode = () => identityLabel?.textContent.trim() === '이메일';

const resetIdentityDuplicateState = ({ clearVisual = false } = {}) => {
    identityDuplicateState = null;
    identityChecking = false;
    identityRequestToken += 1;

    if (clearVisual) {
        window.joinCreateValidation?.clearIdentityDuplicateFeedback?.();
    }
};

const runIdentityDuplicateCheck = async () => {
    const value = identityInput?.value.trim() || '';
    const formatError = window.joinCreateValidation?.getIdentityFormatError?.() || '';

    if (formatError) {
        return false;
    }

    const requestToken = ++identityRequestToken;
    const emailMode = isEmailMode();
    identityChecking = true;

    try {
        const isAvailable = emailMode
            ? await joinService.checkEmail(value)
            : await joinService.checkPhone(value);

        if (requestToken !== identityRequestToken) {
            return false;
        }

        if ((identityInput?.value.trim() || '') !== value || isEmailMode() !== emailMode) {
            return false;
        }

        identityChecking = false;
        identityDuplicateState = isAvailable;

        if (!isAvailable) {
            window.joinCreateValidation?.setIdentityDuplicateError?.(
                emailMode ? '이미 사용 중인 이메일입니다.' : '이미 사용 중인 휴대폰 번호입니다.'
            );
            return false;
        }

        window.joinCreateValidation?.setIdentityDuplicateSuccess?.(
            emailMode ? '사용 가능한 이메일입니다.' : '사용 가능한 휴대폰 번호입니다.'
        );
        return true;
    } catch (error) {
        if (requestToken !== identityRequestToken) {
            return false;
        }

        identityChecking = false;
        identityDuplicateState = null;
        window.joinCreateValidation?.setIdentityDuplicateError?.('중복 확인 중 오류가 발생했습니다.');
        return false;
    }
};

identityInput?.addEventListener('input', () => {
    resetIdentityDuplicateState({ clearVisual: true });
});

identityInput?.addEventListener('blur', async () => {
    if (!identityInput.value.trim()) {
        resetIdentityDuplicateState({ clearVisual: true });
        return;
    }

    if (!window.joinCreateValidation?.isIdentityFormatValid?.()) {
        return;
    }

    await runIdentityDuplicateCheck();
});

changeIdentityButton?.addEventListener('click', () => {
    resetIdentityDuplicateState({ clearVisual: true });
    resetSmsState();
    resetEmailState();
});

createNextButton?.addEventListener('click', async (event) => {
    if (!window.joinCreateValidation?.isCreateFormValid?.()) {
        window.joinCreateValidation?.showIdentityFormatError?.();
        return;
    }

    const isAvailable = await runIdentityDuplicateCheck();

    if (!isAvailable || identityChecking || identityDuplicateState !== true) {
        event.preventDefault();
        event.stopImmediatePropagation();
        identityInput?.focus();
        return;
    }

    const label = identityLabel.textContent.trim();
    hide('modal-create');
    show(label === '이메일' ? 'overlay-email' : 'overlay-phone');
});


//     회원 정보 입력 후 formData로 서버에 전송
const joinBtn = document.querySelector('.join-submit-button');
const notificationBtn = document.querySelector('.notification-yes');
let pushEnabled = false;
const getInputValue = (selector) => {
    const element = document.querySelector(selector);
    return element && "value" in element ? String(element.value).trim() : "";
};

if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        pushEnabled = true;
    });
}

joinBtn.addEventListener('click', async () => {
    console.log("joinBtn");
    const memberName = document.querySelector('.name-input');
    const memberEmail = document.querySelector('input[name="email"]');
    const memberPhone = document.querySelector('input[name="phone"]');
    const birthDate = document.querySelector('.birth-date-input');
    const oauthBirthDate = document.querySelector('.oauth-birth-date-input');
    const memberPassword = document.querySelector('.password-input');
    const memberHandle = document.querySelector('.handle-input');
    const businessNumber = document.querySelector('.business-number-input');
    const companyName = document.querySelector('.company-name-input');
    const ceoName = document.querySelector('.ceo-name-input');
    const postNumber = document.querySelector('.post-input');
    const address = document.getElementById('addr-main');
    const addressDetail = document.getElementById('addr-detail');
    const businessType = document.getElementById('business-type');
    const profile = document.querySelector('.avatar-upload');
    const selectedLanguage = window.selectedLanguage;
    const selectedCategory = window.selectedCategory;

    const file = profile?.files?.[0];
    const maxSize = 10 * 1024 * 1024;

    if (file && file.size > maxSize) {
        alert('파일이 너무 큽니다. (최대 10MB)');
        return;
    }

    const memberRegion = `${postNumber.value} ${address.value} ${addressDetail.value}`.trim();

    console.log('memberName', memberName.value)
    console.log('emailValue', memberEmail?.value)
    console.log('phoneValue', memberPhone?.value)
    console.log('birthDate.value', birthDate.value)
    console.log('memberPassword.value', memberPassword.value)
    console.log('memberHandle.value', memberHandle.value)
    console.log('memberRegion', memberRegion)
    console.log('pushEnabled', pushEnabled)
    console.log('businessNumber.value', businessNumber.value)
    console.log('companyName.value', companyName.value)
    console.log('ceoName.value', ceoName.value)
    console.log('file', file)
    console.log('businessType.value', businessType.value)

    const subMemberEmail = memberEmail?.value?.trim() ? memberEmail.value.trim() : null;
    const subMemberPhone = memberPhone?.value?.trim() ? memberPhone.value.trim() : null;
    const submemberHandle = "@" + memberHandle.value;

    // 최종 제출 직전에도 한 번 더 검사해서 중간 단계 우회를 막는다.
    const handleReady = await window.joinHandleValidation?.ensureValid?.();
    if (!handleReady || !window.joinHandleValidation?.canProceed?.()) {
        alert('아이디 형식을 확인하고 중복검사를 완료해주세요.');
        return;
    }

    if (subMemberPhone !== null && !phoneVerified) {
        alert('휴대폰 인증을 완료해주세요.');
        return;
    }

    if (subMemberEmail !== null && !emailVerified) {
        alert('이메일 인증을 완료해주세요.');
        return;
    }

    const formData = new FormData();
    // SNS 신규 가입 분기
    if (window.oauthJoinData.enabled) {
        const oauthBirthDateValue = oauthBirthDate?.value?.trim() || "";
        if (oauthBirthDateValue.length !== 8) {
            alert('생년월일을 8자리로 입력하세요.');
            return;
        }

        formData.append('provider', window.oauthJoinData.provider);
        formData.append('providerId', window.oauthJoinData.providerId);
        formData.append('memberName', window.oauthJoinData.memberName);
        formData.append('memberEmail', window.oauthJoinData.memberEmail);
        formData.append('memberPhone', window.oauthJoinData.memberPhone);
        formData.append('profileURL', window.oauthJoinData.profileUrl);

        formData.append('birthDate', oauthBirthDateValue);
        formData.append('memberHandle', submemberHandle);
        formData.append('memberRegion', memberRegion);
        formData.append('memberLanguage', selectedLanguage);
        formData.append('categoryName', selectedCategory);
        formData.append('pushEnabled', String(pushEnabled));
        formData.append('businessNumber', getInputValue('.business-number-input'));
        formData.append('companyName', getInputValue('.company-name-input'));
        formData.append('ceoName', getInputValue('.ceo-name-input'));
        formData.append('businessType', getInputValue('#business-type'));

        if (file) {
            formData.append('file', file);
        }
        await joinService.oauthMemberRegister(formData);
        location.href = "/main/main";
        return;
    }
    // 일반 회원가입 분기
    formData.append('memberName', memberName.value);
    formData.append('birthDate', birthDate.value);
    formData.append('memberPassword', memberPassword.value);
    formData.append('memberHandle', submemberHandle);
    formData.append('memberRegion', memberRegion);
    formData.append('memberLanguage', selectedLanguage);
    formData.append('categoryName', selectedCategory);
    formData.append('pushEnabled', pushEnabled);
    formData.append('businessNumber', businessNumber.value);
    formData.append('companyName', companyName.value);
    formData.append('ceoName', ceoName.value);
    formData.append('businessType', businessType.value);

    if (subMemberEmail !== null) {
        formData.append('memberEmail', subMemberEmail);
    }
    if (subMemberPhone !== null) {
        formData.append('memberPhone', subMemberPhone);
    }

    if (file) {
        formData.append('file', file);
    }

    await joinService.memberRegister(formData);

    // 가입 직후 페이지 이동 없이 로그인 모달을 띄워 바로 로그인 진행할 수 있게 한다.
    hideAll();
    window.joinCreateModalReset?.();
    window.joinPasswordModalReset?.();
    resetSmsState();
    resetEmailState();
    document.getElementById('btn-login')?.click();
})


