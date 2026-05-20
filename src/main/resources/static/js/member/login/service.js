const loginService = (() => {
    const login = async ({loginId ,memberPassword}) => {
        const response = await fetch("/api/member/login",{
            method: "POST",
            body: JSON.stringify({loginId,memberPassword}),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const result = await response.json();

        if(!response.ok){
            throw new Error(result.message || "입력한 정보가 일치하지 않습니다.");
        }

        return result;
    }

    // 일반 로그인 실패 후 inactive 계정인지와 비밀번호 일치 여부만 먼저 확인한다.
    // 여기서는 인증번호를 보내지 않고, 확인 모달에 필요한 최소 정보만 반환한다.
    const prepareReactivation = async ({ loginId, memberPassword }) => {
        const response = await fetch("/api/member/reactivation/prepare", {
            method: "POST",
            body: JSON.stringify({ loginId, memberPassword }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "재활성화 가능한 계정을 찾지 못했습니다.");
        }

        return result;
    };

    // 인증번호 확인이 끝난 뒤 inactive 계정을 active로 복구하고 로그인 토큰을 함께 발급한다.
    const completeReactivation = async ({ loginId, memberPassword }) => {
        const response = await fetch("/api/member/reactivation/complete", {
            method: "POST",
            body: JSON.stringify({ loginId, memberPassword }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "계정 재활성화 실패");
        }

        return result;
    }

    const info = async (callback) => {
        const response = await fetch(`/api/member/info`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const member = await response.json();

        if(callback) {
            callback(member);
        }

        return member;
    }



    return {
        login: login,
        prepareReactivation: prepareReactivation,
        completeReactivation: completeReactivation,
        info: info,
    }
})();
//
