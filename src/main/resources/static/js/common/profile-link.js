// 모든 페이지에서 프로필 마크업 클릭 시 해당 사용자의 mypage로 이동시키는 전역 핸들러.
// 도메인별 layout/event.js 를 건드리지 않고, 마크업에 data-profile-id 속성만 박으면 동작한다.
//
// 마크업 규칙: 프로필을 표현하는 요소(아바타/이름/카드 등)에 data-profile-id="{회원 id}" 부여.
// 안쪽 또는 바깥쪽에 button/a/input 등 별도 액션 요소가 있으면 그 액션을 우선하고 mypage 이동은 건너뛴다.
// URL은 MypageController(id 기반)에 맞춰 /mypage/mypage?memberId={id}.
(() => {
    const MYPAGE_URL = "/mypage";

    document.addEventListener("click", (e) => {
        const target = e.target;
        if (!(target instanceof Element)) return;

        // 프로필 마크업이 아닌 일반 클릭은 무시한다.
        const profileEl = target.closest("[data-profile-id]");
        if (!profileEl) return;

        // 프로필 요소 자체가 곧 링크/버튼이면 그대로 mypage로 이동시킨다.
        // 프로필 안쪽에 있는 인터랙티브 요소(팔로우 버튼 등)는 그 액션을 우선한다.
        // 프로필을 감싸는 외부 a/button(예: post-detailed 댓글 카드 a 태그)은 통과시켜 mypage 이동을 우선한다.
        const inner = target.closest(
            "button, a, input, textarea, label, select, [data-stop-profile-link]"
        );
        if (inner && inner !== profileEl && profileEl.contains(inner)) return;

        // data-profile-id가 비어있거나 숫자가 아니면 noop. URL 주입 위험 차단.
        const memberId = profileEl.getAttribute("data-profile-id");
        if (!memberId || !/^\d+$/.test(memberId)) return;

        e.preventDefault();
        window.location.href = `${MYPAGE_URL}?memberId=${memberId}`;
    });
})();
