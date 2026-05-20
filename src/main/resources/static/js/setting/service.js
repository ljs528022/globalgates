const settingService = (() => {
    // 설정 화면의 비밀번호 확인은 현재 로그인한 사용자 기준으로만 검사한다.
    // join의 중복검사 서비스와 같은 형태를 유지해서, event.js는 boolean 결과만 보고 흐름을 결정한다.
    // 비밀번호를 URL 쿼리에 노출하지 않도록 POST + body로 보낸다.
    // 서버 응답은 그대로 boolean 텍스트 — 기존 'text === "true"' 비교 흐름은 유지한다.
    const checkPassword = async (password, callback) => {
        const response = await fetch("/api/settings/check-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                memberPassword: password,
            }),
        });
        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || "Fetch error");
        }

        const isMatched = text === "true";
        if (callback) callback(isMatched);
        return isMatched;
    };

    // 비밀번호 변경은 현재 비밀번호와 새 비밀번호만 서버에 전달한다.
    // 확인 비밀번호는 화면 UX용 비교값이므로 프런트에서만 검사하고 서버에는 보내지 않는다.
    const updatePassword = async (currentPassword, nextPassword) => {
        const response = await fetch("/api/settings/password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                nextPassword: nextPassword,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "비밀번호 변경 실패");
        }

        return result;
    };

    // 비밀번호 변경 직후에는 기존 세션을 바로 정리하고 재로그인을 요구한다.
    // 이 프로젝트는 /api/auth/logout이 access/refresh 쿠키를 함께 정리하므로 추가 쿠키 처리는 필요 없다.
    const logout = async () => {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error("로그아웃 실패");
        }
    };

    // 사용자 아이디 중복검사는 join의 기존 handle 검사 API를 그대로 재사용한다.
    // setting 화면은 "현재 입력값이 사용 가능한지"만 알면 되므로 boolean 하나만 반환받아 처리한다.
    const checkHandle = async (memberHandle) => {
        const response = await fetch(`/api/member/check-handle?memberHandle=${encodeURIComponent(memberHandle)}`);
        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || "사용자 아이디 중복검사 실패");
        }

        return text === "true";
    };

    // handle 저장 대상은 항상 현재 로그인 사용자다.
    // 프런트는 raw handle만 보내고, 저장 포맷(@ 포함 여부)은 서버에서 최종 정리한다.
    const updateHandle = async (memberHandle) => {
        const response = await fetch("/api/settings/handle", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                memberHandle: memberHandle,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "사용자 아이디 변경 실패");
        }

        return result;
    };

    // 전화번호 중복검사는 join에서 이미 쓰는 member API를 그대로 재사용한다.
    // 설정 화면은 사용 가능 여부만 필요하므로 boolean 하나만 반환하면 충분하다.
    const checkPhone = async (memberPhone) => {
        const response = await fetch(`/api/member/check-phone?memberPhone=${encodeURIComponent(memberPhone)}`);
        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || "휴대폰 번호 중복검사 실패");
        }

        return text === "true";
    };

    // SMS 인증은 join과 같은 흐름을 유지한다.
    // 서버가 생성한 인증번호 문자열을 그대로 받아서 사용자가 입력한 값과 비교한다.
    const sendSms = async (memberPhone) => {
        const response = await fetch("/api/messages/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                memberPhone: memberPhone,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "인증번호 전송 실패");
        }

        return await response.text();
    };

    // 전화번호 저장 대상도 현재 로그인 사용자로 고정한다.
    // 프런트는 값만 보내고 어떤 계정을 수정할지는 서버가 인증 객체로 판단한다.
    const updatePhone = async (memberPhone) => {
        const response = await fetch("/api/settings/phone", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                memberPhone: memberPhone,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "휴대폰 번호 저장 실패");
        }

        return result;
    };

    // 이메일 중복검사도 join에서 이미 쓰는 member API를 그대로 재사용한다.
    const checkEmail = async (memberEmail) => {
        const response = await fetch(`/api/member/check-email?memberEmail=${encodeURIComponent(memberEmail)}`);
        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || "이메일 중복검사 실패");
        }

        return text === "true";
    };

    // 이메일 인증코드 발송은 join과 동일한 mail API를 사용한다.
    const sendEmailCode = async (memberEmail) => {
        const response = await fetch("/api/mail/send-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                memberEmail: memberEmail,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "인증번호 전송 실패");
        }

        return await response.text();
    };

    // 이메일 저장도 현재 로그인 사용자 기준으로만 처리한다.
    const updateEmail = async (memberEmail) => {
        const response = await fetch("/api/settings/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                memberEmail: memberEmail,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "이메일 저장 실패");
        }

        return result;
    };

    // setting의 언어 변경은 현재 로그인 사용자의 member_language만 갱신하면 된다.
    // 저장값은 현재 모달에 표시되는 단일 라벨 문자열로 맞춘다.
    const updateLanguage = async (memberLanguage) => {
        const response = await fetch("/api/settings/language", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                memberLanguage: memberLanguage,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "언어 저장 실패");
        }

        return result;
    };

    // 계정 비활성화는 현재 로그인 사용자 기준으로만 처리한다.
    // 비밀번호 확인과 soft delete를 같은 요청 안에서 처리해 흐름을 단순하게 유지한다.
    const deactivateAccount = async (memberPassword) => {
        const response = await fetch("/api/settings/deactivate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                memberPassword: memberPassword,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "계정 비활성화 실패");
        }

        return result;
    };

    // 푸시 알림 master on/off는 회원 본체의 push_enabled만 갱신한다.
    const updateNotificationPushEnabled = async (pushEnabled) => {
        const response = await fetch("/api/settings/notifications/push-enabled", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                pushEnabled: pushEnabled,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "푸시 알림 저장 실패");
        }

        return result;
    };

    // 개별 푸시 종류 체크 상태는 master on/off와 분리해 별도 저장한다.
    const updateNotificationPushPreference = async (payload) => {
        const response = await fetch("/api/settings/notifications/push-preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "푸시 알림 설정 저장 실패");
        }

        return result;
    };

    // 국가는 설정 화면의 단일 선택값만 저장하면 되므로 라벨 문자열 하나만 전달한다.
    const updateCountry = async (memberCountry) => {
        const response = await fetch("/api/settings/country", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                memberCountry: memberCountry,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "국가 저장 실패");
        }

        return result;
    };

    const getBlockedAccounts = async (page = 1) => {
        const response = await fetch(`/api/settings/blocks/list/${page}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "차단한 계정 목록 조회 실패");
        }

        return result;
    };

    // blockerId는 서버가 인증 객체에서만 추출하므로 클라이언트는 보내지 않는다.
    // 보냈더라도 서버가 무시했지만, "클라가 누구를 차단 푸는지 결정한다"는 잘못된 신호를
    // 코드에 남겨두면 향후 백엔드를 그 모양에 맞춰 잘못 리팩토링할 위험이 있다.
    const unblockMember = async (blockedId) => {
        const response = await fetch(
            `/api/v1/blocks?blockedId=${blockedId}`,
            {
                method: "DELETE",
            },
        );

        if (!response.ok) {
            throw new Error("차단 해제 실패");
        }
    };

    // setting의 구독 관리는 기존 subscription API를 그대로 재사용한다.
    const getSubscription = async () => {
        const response = await fetch("/api/subscriptions/my");

        if (!response.ok) {
            throw new Error("구독 정보 조회 실패");
        }

        const text = await response.text();

        if (!text || !text.trim()) {
            return null;
        }

        return JSON.parse(text);
    };

    // 월간 구독 해지는 subscription 도메인의 기존 cancel API에 위임한다.
    const cancelSubscription = async (id) => {
        const response = await fetch("/api/subscriptions/cancel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "구독 해지 실패");
        }
    };

    return {
        checkPassword: checkPassword,
        updatePassword: updatePassword,
        logout: logout,
        checkHandle: checkHandle,
        updateHandle: updateHandle,
        checkPhone: checkPhone,
        sendSms: sendSms,
        updatePhone: updatePhone,
        checkEmail: checkEmail,
        sendEmailCode: sendEmailCode,
        updateEmail: updateEmail,
        updateLanguage: updateLanguage,
        deactivateAccount: deactivateAccount,
        updateNotificationPushEnabled: updateNotificationPushEnabled,
        updateNotificationPushPreference: updateNotificationPushPreference,
        updateCountry: updateCountry,
        getBlockedAccounts: getBlockedAccounts,
        unblockMember: unblockMember,
        getSubscription: getSubscription,
        cancelSubscription: cancelSubscription,
    };
})();
