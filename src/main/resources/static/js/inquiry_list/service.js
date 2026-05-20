const inquiryListService = (() => {

    // 누른 카테고리에 따른 회원 검색
    const getInquiryMembers = async (page, categoryName, callback) => {
        const response = await fetch(`/api/inqury/member-list/${page}`, {
            method: "POST",
            headers : {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ categoryName: categoryName })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        const inquiryMemberPagingDTO = await response.json();

        if(callback) callback(inquiryMemberPagingDTO);

        return inquiryMemberPagingDTO.criteria;
    }

    // 팔로우 체크
    const checkFollow = async (memberId) => {
        const response = await fetch(`/api/follows/follow?memberId=${memberId}`, {
            method: "GET",
            credentials: "include"
        });

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Fetch error");
        }

        return await response.text();
    }

    return {
        getInquiryMembers: getInquiryMembers,
        checkFollow: checkFollow
    };
})();