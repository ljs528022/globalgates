const joinService = (() => {

        const memberRegister = async (formData) => {
            console.log(formData);
            const response = await fetch("/api/member/join", {
                method: "POST",
                body : formData
            })
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Fetch error");
            }

            return await response.text();

        }

        const checkEmail = async (memberEmail, callback) => {
            const response = await fetch(`/api/member/check-email?memberEmail=${memberEmail}`);
            // 본문은 한 번만 읽는다
            const text = await response.text();

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Fetch error");
            }
            const isAvaliable = text === "true";
            if (callback) callback(isAvaliable);
            return isAvaliable;
        }

        const checkPhone = async (memberPhone, callback) => {
            const response = await fetch(`/api/member/check-phone?memberPhone=${memberPhone}`);
            // 본문은 한 번만 읽는다
            const text = await response.text();

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Fetch error");
            }
            const isAvaliable = text === "true";
            if (callback) callback(isAvaliable);
            return isAvaliable;
        }

        const checkHandle = async (memberHandle, callback) => {
            // 아이디 모달은 @ 없이 입력받고, 사용 가능 여부만 boolean으로 받는다.
            const response = await fetch(`/api/member/check-handle?memberHandle=${memberHandle}`);
            const text = await response.text();

            if (!response.ok) {
                throw new Error(text || "Fetch error");
            }

            const isAvailable = text === "true";
            if (callback) callback(isAvailable);
            return isAvailable;
        }

        const checkCompanyName = async (companyName) => {
            const response = await fetch(`/api/member/check-company-name?companyName=${encodeURIComponent(companyName)}`);
            const text = await response.text();
            if (!response.ok) throw new Error(text || "Fetch error");
            return text === "true";
        }

        const checkBusinessNumber = async (businessNumber) => {
            const response = await fetch(`/api/member/check-business-number?businessNumber=${encodeURIComponent(businessNumber)}`);
            const text = await response.text();
            if (!response.ok) throw new Error(text || "Fetch error");
            return text === "true";
        }

        const sendSms = async (phone) => {
            // 휴대폰 번호를 보내고, 서버가 생성한 인증번호 문자열을 그대로 받는다.
            const response = await fetch("/api/messages/send", {
                method: "POST",
                body: JSON.stringify({ memberPhone: phone }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "SMS send failed");
            }

            // 현재 인증코드 비교는 프론트에서 한다.
            return await response.text();
        }

        const sendEmailCode = async (email) => {
            // 이메일을 보내고, 서버가 생성한 인증번호 문자열을 그대로 받는다.
            const response = await fetch("/api/mail/send-code", {
                method: "POST",
                body: JSON.stringify({ memberEmail: email }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Mail send failed");
            }

            // 현재 인증코드 비교는 프론트에서 한다.
            return await response.text();
        }

        const oauthMemberRegister = async (formData) => {
            const response = await fetch("/api/auth/oauth/join", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "OAuth join failed");
            }

            return await response.json();
        };


    return {
            memberRegister: memberRegister,
            checkEmail : checkEmail,
            checkPhone : checkPhone,
            checkHandle : checkHandle,
            checkCompanyName : checkCompanyName,
            checkBusinessNumber : checkBusinessNumber,
            sendSms : sendSms,
            sendEmailCode : sendEmailCode,
            oauthMemberRegister : oauthMemberRegister
        }
    })();
