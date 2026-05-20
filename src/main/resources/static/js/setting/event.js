document.addEventListener("DOMContentLoaded", () => {
    // 사이드바 게시하기 모달 활성화. memberId는 setting.html inline의 window.settingMember.id 사용.
    postModalApi.bootstrap({
        services: service,
        layout: layout,
        getMemberId: () => window.settingMember?.id,
    });

    /*
     * 이 파일은 setting.html 안의 설정 페이지 전체 상호작용을 담당한다.
     * 사용 위치:
     * - 좌측 설정 메뉴(`#settingsNavigationList`)
     * - 우측 상세 패널(`#settingsDetailTitle`, `#settingsDetailSummary`, `#settingsDetailList`)
     * - 표시 모달(`#appearanceModal`)
     * - 키보드 단축키 모달(`#shortcutModal`)
     *
     * 동작 구조:
     * 1. 문서에서 필요한 DOM을 한 번에 찾는다.
     * 2. 분석 문서 기준의 설정 데이터와 SVG path를 JS 데이터로 선언한다.
     * 3. 좌측 메뉴와 우측 상세 항목을 이 데이터로 렌더링한다.
     * 4. 검색, 섹션 선택, 모달 열기/닫기, 표시 테마 변경을 이벤트로 연결한다.
     */

    const settingsShell = document.querySelector(".settings-shell");
    const navigationList = document.getElementById("settingsNavigationList");
    const searchInput = document.getElementById("settingsSearchInput");
    const detailBackButton = document.getElementById(
        "settingsDetailBackButton",
    );
    const detailTitle = document.getElementById("settingsDetailTitle");
    const detailActionButton = document.getElementById(
        "settingsDetailActionButton",
    );
    const detailContent = document.getElementById("settingsDetailContent");
    const detailRoutes = document.getElementById("settingsDetailRoutes");
    const modalLayer = document.getElementById("settingsModalLayer");
    const appearanceModal = document.getElementById("appearanceModal");
    const shortcutModal = document.getElementById("shortcutModal");
    const languageSelectionModal = document.getElementById(
        "languageSelectionModal",
    );
    const languageSelectionList = document.getElementById(
        "languageSelectionList",
    );
    const languageSelectionNextButton = document.getElementById(
        "languageSelectionNextButton",
    );
    const phoneAddModal = document.getElementById("phoneAddModal");
    const phoneVerifyModal = document.getElementById("phoneVerifyModal");
    const phoneAddInput = document.getElementById("phoneAddInput");
    const phoneAddCloseButton = document.getElementById("phoneAddCloseButton");
    const phoneAddActionButton = document.getElementById(
        "phoneAddActionButton",
    );
    const phoneAddStep = document.getElementById("phoneAddStep");
    const phoneCodeStep = document.getElementById("phoneCodeStep");
    const phoneCodeNumber = document.getElementById("phoneCodeNumber");
    const phoneCodeInput = document.getElementById("phoneCodeInput");
    const phoneCodeResendButton = document.getElementById(
        "phoneCodeResendButton",
    );
    const phoneCodeActionButton = document.getElementById(
        "phoneCodeActionButton",
    );
    const phoneVerifyNumber = document.getElementById("phoneVerifyNumber");
    const phoneVerifyConfirmButton = document.getElementById(
        "phoneVerifyConfirmButton",
    );
    const phoneVerifyEditButton = document.getElementById(
        "phoneVerifyEditButton",
    );
    const emailAddModal = document.getElementById("emailAddModal");
    const emailVerifyModal = document.getElementById("emailVerifyModal");
    const emailAddInput = document.getElementById("emailAddInput");
    const emailAddCloseButton = document.getElementById("emailAddCloseButton");
    const emailAddActionButton = document.getElementById(
        "emailAddActionButton",
    );
    const emailAddStep = document.getElementById("emailAddStep");
    const emailCodeStep = document.getElementById("emailCodeStep");
    const emailCodeAddress = document.getElementById("emailCodeAddress");
    const emailCodeInput = document.getElementById("emailCodeInput");
    const emailCodeResendButton = document.getElementById(
        "emailCodeResendButton",
    );
    const emailCodeActionButton = document.getElementById(
        "emailCodeActionButton",
    );
    const emailVerifyAddress = document.getElementById("emailVerifyAddress");
    const emailVerifyConfirmButton = document.getElementById(
        "emailVerifyConfirmButton",
    );
    const emailVerifyEditButton = document.getElementById(
        "emailVerifyEditButton",
    );
    const blockedUnblockModal = document.getElementById("blockedUnblockModal");
    const blockedUnblockHandle = document.querySelector(
        "[data-blocked-unblock-handle]",
    );
    const blockedUnblockConfirmButton = document.getElementById(
        "blockedUnblockConfirmButton",
    );
    const blockedUnblockCancelButton = document.getElementById(
        "blockedUnblockCancelButton",
    );
    const appearanceFontRange = document.getElementById("appearanceFontRange");
    const appearanceAccentList = document.getElementById(
        "appearanceAccentList",
    );
    const appearanceSurfaceList = document.getElementById(
        "appearanceSurfaceList",
    );
    const appearanceCompleteButton = document.getElementById(
        "appearanceCompleteButton",
    );

    if (
        !settingsShell ||
        !navigationList ||
        !searchInput ||
        !detailBackButton ||
        !detailTitle ||
        !detailActionButton ||
        !detailContent ||
        !detailRoutes ||
        !modalLayer ||
        !appearanceModal ||
        !shortcutModal ||
        !languageSelectionModal ||
        !languageSelectionList ||
        !languageSelectionNextButton ||
        !phoneAddModal ||
        !phoneVerifyModal ||
        !phoneAddInput ||
        !phoneAddCloseButton ||
        !phoneAddActionButton ||
        !phoneAddStep ||
        !phoneCodeStep ||
        !phoneCodeNumber ||
        !phoneCodeInput ||
        !phoneCodeResendButton ||
        !phoneCodeActionButton ||
        !phoneVerifyNumber ||
        !phoneVerifyConfirmButton ||
        !phoneVerifyEditButton ||
        !emailAddModal ||
        !emailVerifyModal ||
        !emailAddInput ||
        !emailAddCloseButton ||
        !emailAddActionButton ||
        !emailAddStep ||
        !emailCodeStep ||
        !emailCodeAddress ||
        !emailCodeInput ||
        !emailCodeResendButton ||
        !emailCodeActionButton ||
        !emailVerifyAddress ||
        !emailVerifyConfirmButton ||
        !emailVerifyEditButton ||
        !blockedUnblockModal ||
        !blockedUnblockHandle ||
        !blockedUnblockConfirmButton ||
        !blockedUnblockCancelButton ||
        !appearanceFontRange ||
        !appearanceAccentList ||
        !appearanceSurfaceList ||
        !appearanceCompleteButton
    ) {
        return;
    }

    /*
     * SVG path 데이터는 분석 문서에 정리된 아이콘을 그대로 사용한다.
     * 오른쪽 상세 패널의 각 항목은 왼쪽 아이콘 + 텍스트 + 오른쪽 화살표 구조를 공통으로 공유한다.
     */
    const icons = {
        arrow: "M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z",
        external: "M8 6h10v10h-2V9.41L5.957 19.46l-1.414-1.42L14.586 8H8V6z",
        account:
            "M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z",
        key: "M13 9.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm9.14 1.77l-5.83 5.84-4-1L6.41 22H2v-4.41l5.89-5.9-1-4 5.84-5.83 7.06 2.35 2.35 7.06zm-12.03 1.04L4 18.41V20h1.59l6.1-6.11 4 1 4.17-4.16-1.65-4.94-4.94-1.65-4.16 4.17 1 4z",
        download:
            "M2.01 17.5l-.11-1.1c-.26-2.66-1.16-4.89-2.63-6.46l-.01-.01C.64 8.35 2.65 7.5 5.01 7.5s4.37.85 5.86 2.44c1.48 1.58 2.37 3.8 2.63 6.46l.11 1.1h-11.6zM5.01 1c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm17 6.72L17.59 9.3l-4.42 4.42L17.59 18.14l4.42-4.42zM17.59 7.89l5.13 5.13-5.13 5.13-5.13-5.13 5.13-5.13z",
        deactivate:
            "M8.28 21.634l.496.278a.15.15 0 00.187-.026l1.043-1.09c.052-.055.04-.143-.023-.184l-1.782-1.15c-.064-.042-.153-.012-.178.061l-.42 1.219c-.026.075.01.152.083.186l.594.306zM21.078 3.48c-1.583-1.58-4.03-1.88-5.933-.9l-.32.165-2.723 7.53L3.72 18.66l3.72 2.4L21.08 7.42c.977-1.9.677-4.36-.903-5.94zM3.44 19.466l-.402-.26a.318.318 0 01-.1-.434l1.166-1.94 1.572 1.015-1.805 1.698a.315.315 0 01-.43-.079z",
        filter: "M14 6V3h2v8h-2V8H3V6h11zm7 2h-3.5V6H21v2zM8 16v-3h2v8H8v-3H3v-2h5zm13 2h-9.5v-2H21v2z",
        preferences:
            "M7 17h6v2H7v-2zm7.5-15C15.88 2 17 3.12 17 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-9C4.12 22 3 20.88 3 19.5v-15C3 3.12 4.12 2 5.5 2h9zM5 19.5c0 .28.22.5.5.5h9c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-9c-.28 0-.5.22-.5.5v15zm15.74-3.49l1.64 1.15C23.4 15.7 24 13.92 24 12s-.6-3.7-1.62-5.16l-1.64 1.15C21.53 9.13 22 10.51 22 12s-.47 2.87-1.26 4.01zm-.82-7.45l-1.64 1.15c.45.65.72 1.43.72 2.29 0 .85-.27 1.64-.72 2.29l1.64 1.15C20.6 14.47 21 13.28 21 12s-.4-2.47-1.08-3.44z",
        accessibility:
            "M14.828 9.172c-1.315-1.315-3.326-1.522-4.86-.618L3.707 2.293 2.293 3.707l2.428 2.429c-2.478 2.421-3.606 5.376-3.658 5.513L.932 12l.131.351C1.196 12.704 4.394 21 12 21c2.063 0 3.989-.622 5.737-1.849l2.556 2.556 1.414-1.414-6.261-6.261c.904-1.534.698-3.545-.618-4.86zm-1.414 1.414c.522.522.695 1.264.518 1.932l-2.449-2.449c.669-.177 1.409-.005 1.931.517zM3.085 11.999c.107-.24.272-.588.497-1.002l7.993 7.992c-5.14-.279-7.85-5.563-8.489-6.989zm13.21 5.71c-.695.448-1.422.781-2.175.996L4.672 9.258c.412-.57.899-1.158 1.464-1.708l10.16 10.16h-.001zm6.772-5.71l-.131.352c-.062.164-.801 2.055-2.33 4.027l-1.438-1.438c.917-1.217 1.494-2.378 1.746-2.941-.658-1.467-3.5-7-8.915-7-.712 0-1.376.1-2 .27V3.223c.633-.131 1.291-.223 2-.223 7.605 0 10.804 8.296 10.937 8.648l.131.352z",
        display:
            "M18.36 2.62c-.14-.14-.32-.21-.5-.21h-.01c-.19 0-.37.08-.51.22l-1.76 1.82-3.18-1.49L6 9.36l3.66 3.66-6.36 6.36 1.42 1.42 6.36-6.36 3.66 3.66 6.4-6.4-1.49-3.18 1.82-1.76c.14-.14.22-.32.22-.51v-.01c0-.19-.07-.37-.21-.5l-3.12-3.12zM17 14.25L9.75 7l4.19-4.19 2.53 1.19-2.11 2.18 3.47 3.47 2.18-2.11 1.19 2.53L17 14.25z",
        language:
            "M11.999 22.25c-5.652 0-10.25-4.598-10.25-10.25S6.347 1.75 11.999 1.75 22.249 6.348 22.249 12s-4.598 10.25-10.25 10.25zm0-18.5c-4.549 0-8.25 3.701-8.25 8.25s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25-3.701-8.25-8.25-8.25zM13.21 6.134c.57 1.242.928 2.726 1.027 4.366H9.762c.1-1.64.457-3.124 1.027-4.366.526-1.148 1.134-1.822 1.71-1.884.058-.006.166-.006.224 0 .577.062 1.185.736 1.711 1.884h-.224zm-4.451 4.366c.103-1.775.497-3.39 1.13-4.674C7.573 6.636 5.877 8.711 5.38 10.5h3.38zm5.481 0H17.62c-.497-1.789-2.193-3.864-4.508-4.674.633 1.284 1.027 2.899 1.13 4.674h-.002zm-4.478 2c.103 1.775.497 3.39 1.13 4.674-2.316-.81-4.012-2.885-4.508-4.674h3.38-.002zm1.027 4.366c-.57-1.242-.928-2.726-1.027-4.366h4.476c-.1 1.64-.457 3.124-1.027 4.366-.526 1.148-1.134 1.822-1.71 1.884-.058.006-.166.006-.224 0-.577-.062-1.185-.736-1.711-1.884h.224-.001zm4.451-4.366c-.103 1.775-.497 3.39-1.13 4.674 2.316-.81 4.012-2.885 4.508-4.674h-3.38.002z",
        add: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z",
        mute: "M18 6.59V1.2L8.71 7H5.5C4.12 7 3 8.12 3 9.5v5C3 15.88 4.12 17 5.5 17h2.09l-2.3 2.29 1.42 1.42 15.5-15.5-1.42-1.42L18 6.59zm-8 8V8.55l6-3.75v3.79l-6 6zM5 9.5c0-.28.22-.5.5-.5H8v6H5.5c-.28 0-.5-.22-.5-.5v-5zm6.5 9.24l1.45-1.45L16 19.2V14l2 .02v8.78l-6.5-4.06z",
        data: "M2 3v18h20v-2H4V3H2zm5 14h2V9H7v8zm4 0h2V6h-2v11zm4 0h2v-5h-2v5z",
        shortcuts:
            "M11.999 22.25c-5.652 0-10.25-4.598-10.25-10.25S6.347 1.75 11.999 1.75 22.249 6.348 22.249 12s-4.598 10.25-10.25 10.25zm0-18.5c-4.549 0-8.25 3.701-8.25 8.25s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25-3.701-8.25-8.25-8.25zm.445 6.992c1.747-.096 3.748-.689 3.768-.695l.575 1.916c-.077.022-1.616.48-3.288.689v.498c.287 1.227 1.687 2.866 2.214 3.405l-1.428 1.4c-.188-.191-1.518-1.576-2.286-3.144-.769 1.568-2.098 2.952-2.286 3.144l-1.428-1.4c.527-.54 1.927-2.178 2.214-3.405v-.498c-1.672-.209-3.211-.667-3.288-.689l.575-1.916c.02.006 2.021.6 3.768.695m0 0c.301.017.59.017.891 0M12 6.25c-.967 0-1.75.78-1.75 1.75s.783 1.75 1.75 1.75 1.75-.78 1.75-1.75-.784-1.75-1.75-1.75z",
    };


    const accentOptions = [
        {id: "blue", label: "기본", color: "#1d9bf0"},
        {id: "yellow", label: "노랑", color: "#ffd400"},
        {id: "pink", label: "핑크", color: "#f91880"},
        {id: "purple", label: "보라", color: "#7856ff"},
        {id: "orange", label: "주황", color: "#ff7a00"},
        {id: "green", label: "초록", color: "#00ba7c"},
    ];

    const surfaceOptions = [
        {id: "light", label: "기본", color: "#ffffff"},
        {id: "dim", label: "어두운", color: "#15202b"},
        {id: "lights-out", label: "완전 어두운", color: "#000000"},
    ];
    const countryOptionMarkup = `
        <option value="gh">가나</option><option value="ga">가봉</option><option value="gy">가이아나</option><option value="gm">감비아</option><option value="gg">건지</option><option value="gp">과들루프</option><option value="gt">과테말라</option><option value="gu">괌</option><option value="gd">그레나다</option><option value="gr">그리스</option><option value="gl">그린란드</option><option value="gn">기니</option><option value="gw">기니비사우</option><option value="na">나미비아</option><option value="nr">나우루</option><option value="ng">나이지리아</option><option value="za">남아프리카</option><option value="nl">네덜란드</option><option value="bq">네덜란드령 카리브</option><option value="np">네팔</option><option value="no">노르웨이</option><option value="nf">노퍽섬</option><option value="nz">뉴질랜드</option><option value="nc">뉴칼레도니아</option><option value="nu">니우에</option><option value="ne">니제르</option><option value="ni">니카라과</option><option value="tw">대만</option><option value="kr">대한민국</option><option value="dk">덴마크</option><option value="dm">도미니카</option><option value="do">도미니카 공화국</option><option value="de">독일</option><option value="tl">동티모르</option><option value="la">라오스</option><option value="lr">라이베리아</option><option value="lv">라트비아</option><option value="ru">러시아</option><option value="lb">레바논</option><option value="ls">레소토</option><option value="ro">루마니아</option><option value="lu">룩셈부르크</option><option value="rw">르완다</option><option value="ly">리비아</option><option value="re">리유니온</option><option value="lt">리투아니아</option><option value="li">리히텐슈타인</option><option value="mg">마다가스카르</option><option value="mq">마르티니크</option><option value="mh">마셜 제도</option><option value="yt">마요트</option><option value="mo">마카오(중국 특별행정구)</option><option value="mk">마케도니아</option><option value="mw">말라위</option><option value="my">말레이시아</option><option value="ml">말리</option><option value="im">맨 섬</option><option value="mx">멕시코</option><option value="mc">모나코</option><option value="ma">모로코</option><option value="mu">모리셔스</option><option value="mr">모리타니</option><option value="mz">모잠비크</option><option value="me">몬테네그로</option><option value="ms">몬트세라트</option><option value="md">몰도바</option><option value="mv">몰디브</option><option value="mt">몰타</option><option value="mn">몽골</option><option value="us">미국</option><option value="vi">미국령 버진아일랜드</option><option value="fm">미크로네시아</option><option value="vu">바누아투</option><option value="bh">바레인</option><option value="bb">바베이도스</option><option value="va">바티칸 시국</option><option value="bs">바하마</option><option value="bd">방글라데시</option><option value="bm">버뮤다</option><option value="bj">베냉</option><option value="ve">베네수엘라</option><option value="vn">베트남</option><option value="be">벨기에</option><option value="by">벨라루스</option><option value="bz">벨리즈</option><option value="ba">보스니아 헤르체고비나</option><option value="bw">보츠와나</option><option value="bo">볼리비아</option><option value="bi">부룬디</option><option value="bf">부르키나파소</option><option value="bv">부베섬</option><option value="bt">부탄</option><option value="mp">북마리아나제도</option><option value="bg">불가리아</option><option value="br">브라질</option><option value="bn">브루나이</option><option value="ws">사모아</option><option value="sa">사우디아라비아</option><option value="gs">사우스조지아 사우스샌드위치 제도</option><option value="sm">산마리노</option><option value="st">상투메 프린시페</option><option value="mf">생마르탱</option><option value="bl">생바르텔레미</option><option value="pm">생피에르 미클롱</option><option value="sn">세네갈</option><option value="rs">세르비아</option><option value="sc">세이셸</option><option value="lc">세인트루시아</option><option value="vc">세인트빈센트그레나딘</option><option value="kn">세인트키츠 네비스</option><option value="sh">세인트헬레나</option><option value="so">소말리아</option><option value="sb">솔로몬 제도</option><option value="sr">수리남</option><option value="lk">스리랑카</option><option value="sz">스와질란드</option><option value="se">스웨덴</option><option value="ch">스위스</option><option value="es">스페인</option><option value="sk">슬로바키아</option><option value="si">슬로베니아</option><option value="sl">시에라리온</option><option value="sx">신트마르턴</option><option value="sg">싱가포르</option><option value="ae">아랍에미리트</option><option value="aw">아루바</option><option value="am">아르메니아</option><option value="ar">아르헨티나</option><option value="as">아메리칸 사모아</option><option value="is">아이슬란드</option><option value="ht">아이티</option><option value="ie">아일랜드</option><option value="az">아제르바이잔</option><option value="af">아프가니스탄</option><option value="ad">안도라</option><option value="al">알바니아</option><option value="dz">알제리</option><option value="ao">앙골라</option><option value="ag">앤티가 바부다</option><option value="ai">앵귈라</option><option value="er">에리트리아</option><option value="ee">에스토니아</option><option value="ec">에콰도르</option><option value="et">에티오피아</option><option value="sv">엘살바도르</option><option value="gb">영국</option><option value="io">영국령 인도양 식민지</option><option value="ye">예멘</option><option value="om">오만</option><option value="au">오스트레일리아</option><option value="at">오스트리아</option><option value="hn">온두라스</option><option value="ax">올란드 제도</option><option value="wf">왈리스-푸투나 제도</option><option value="jo">요르단</option><option value="ug">우간다</option><option value="uy">우루과이</option><option value="uz">우즈베키스탄</option><option value="ua">우크라이나</option><option value="iq">이라크</option><option value="ir">이란</option><option value="il">이스라엘</option><option value="eg">이집트</option><option value="it">이탈리아</option><option value="in">인도</option><option value="id">인도네시아</option><option value="jp">일본</option><option value="jm">자메이카</option><option value="zm">잠비아</option><option value="je">저지</option><option value="gq">적도 기니</option><option value="ge">조지아</option><option value="cf">중앙 아프리카 공화국</option><option value="dj">지부티</option><option value="gi">지브롤터</option><option value="zw">짐바브웨</option><option value="td">차드</option><option value="cz">체코</option><option value="cl">칠레</option><option value="cm">카메룬</option><option value="cv">카보베르데</option><option value="kz">카자흐스탄</option><option value="qa">카타르</option><option value="kh">캄보디아</option><option value="ca">캐나다</option><option value="ke">케냐</option><option value="ky">케이맨 제도</option><option value="km">코모로</option><option value="xk">코소보</option><option value="cr">코스타리카</option><option value="cc">코코스 제도</option><option value="ci">코트디부아르</option><option value="co">콜롬비아</option><option value="cg">콩고-브라자빌</option><option value="cd">콩고-킨샤사</option><option value="cu">쿠바</option><option value="kw">쿠웨이트</option><option value="ck">쿡 제도</option><option value="cw">퀴라소</option><option value="hr">크로아티아</option><option value="cx">크리스마스섬</option><option value="kg">키르기스스탄</option><option value="ki">키리바시</option><option value="cy">키프로스</option><option value="tj">타지키스탄</option><option value="tz">탄자니아</option><option value="th">태국</option><option value="tc">터크스 케이커스 제도</option><option value="tr">터키</option><option value="tg">토고</option><option value="tk">토켈라우</option><option value="to">통가</option><option value="tm">투르크메니스탄</option><option value="tv">투발루</option><option value="tn">튀니지</option><option value="tt">트리니다드 토바고</option><option value="pa">파나마</option><option value="py">파라과이</option><option value="pk">파키스탄</option><option value="pg">파푸아뉴기니</option><option value="pw">팔라우</option><option value="ps">팔레스타인 지구</option><option value="fo">페로 제도</option><option value="pe">페루</option><option value="pt">포르투갈</option><option value="fk">포클랜드 제도</option><option value="pl">폴란드</option><option value="pr">푸에르토리코</option><option value="fr">프랑스</option><option value="tf">프랑스 남부 지방</option><option value="gf">프랑스령 기아나</option><option value="pf">프랑스령 폴리네시아</option><option value="fj">피지</option><option value="fi">핀란드</option><option value="ph">필리핀</option><option value="pn">핏케언 섬</option><option value="hu">헝가리</option><option value="hk">홍콩(중국 특별행정구)</option>
    `;

    /*
     * 화면 전역 UI 상태.
     * - activeSectionId: 좌측 1차 메뉴 선택 상태
     * - activeDetailRoute: 우측 상세 패널에 어떤 세부 화면을 보여줄지 결정
     * - activeModal: 현재 열린 모달 종류
     *
     * Spring 연동 시:
     * - 첫 진입 경로에 맞춰 서버에서 초기 섹션/라우트를 정해 내려줄 수 있다.
     */
    let activeSectionId = "account";
    let activeDetailRoute = "";
    let activeModal = "";
    // 표시 설정은 서버 저장 전까지 프론트 임시 상태로 유지한다.
    const appearanceState = {
        fontScale: "2",
        accent: "blue",
        surface: "light",
    };
    // 사용자 아이디 변경 화면은 현재 저장값만 상태로 들고 간다.
    // 실제 입력값은 input에서 직접 읽어 비교하면 중복 상태를 만들지 않아도 된다.
    const usernameState = {
        current: (window.settingMember?.memberHandle || "").replace(/^@+/, ""),
    };
    // 비밀번호 변경 폼 입력 상태. 서버 검증 전 프론트 입력값만 담는다.
    const passwordChangeState = {
        currentPassword: "",
        nextPassword: "",
        confirmPassword: "",
    };
    // 계정 정보 인증 화면과 비밀번호 변경 화면은 renderDetail로 숨김/표시만 바뀌고 DOM 자체는 유지된다.
    // 그래서 join 모달들처럼 필요한 요소를 한 번만 잡아두고, 이후에는 각 버튼/입력에 직접 이벤트를 연결한다.
    // 이 방식이 setting/event.js의 다른 화면들보다도 join 계열 스크립트의 사용 패턴과 더 가깝다.
    const accountInfoAuthRoute = detailRoutes.querySelector('[data-detail-route-view="account-info-auth"]');
    const accountInfoAuthInput = accountInfoAuthRoute?.querySelector("[data-account-auth-input]");
    const accountInfoAuthButton = accountInfoAuthRoute?.querySelector("[data-account-auth-submit]");
    const passwordEditRoute = detailRoutes.querySelector('[data-detail-route-view="password-edit"]');
    const currentPasswordInput = passwordEditRoute?.querySelector('[data-password-editor-input="currentPassword"]');
    const nextPasswordInput = passwordEditRoute?.querySelector('[data-password-editor-input="nextPassword"]');
    const confirmPasswordInput = passwordEditRoute?.querySelector('[data-password-editor-input="confirmPassword"]');
    const passwordSaveButton = passwordEditRoute?.querySelector("[data-password-editor-save]");
    /*
     * 서버가 setting.html에서 주입한 현재 회원 정보와 알림 설정 초기값이다.
     * 이 값들은 최초 렌더 기준의 신뢰 가능한 소스이며, 이후 화면 상태의 시작점으로만 사용한다.
     */
    const settingMember = window.settingMember || {};
    const settingNotificationPreference = window.settingNotificationPreference || {};
    // OAuth 계정 중 비밀번호가 아직 없는 회원은 setting에서 재인증 단계를 강제하지 않는다.
    // 서버도 같은 기준으로 분기하므로 프런트는 화면/동선만 맞춰 주면 된다.
    const isPasswordlessAccount = Boolean(settingMember.isPasswordlessAccount);

    /*
     * 푸시 알림 환경설정 상태.
     * Spring 연동 시 예시:
     * notificationPreferenceState = {
     *   isPushEnabled: dto.isPushEnabled,
     *   pushAlerts: dto.pushAlerts
     * }
     *
     * pushAlerts의 key는 HTML의 data-notification-push-check 값과 반드시 같아야 한다.
     */
    const notificationPreferenceState = {
        isPushEnabled: Boolean(settingMember.pushEnabled),
        pushAlerts: {
            connect: settingNotificationPreference.pushConnect ?? Boolean(settingMember.pushEnabled),
            expert: settingNotificationPreference.pushExpert ?? Boolean(settingMember.pushEnabled),
            likes: settingNotificationPreference.pushLikes ?? Boolean(settingMember.pushEnabled),
            posts: settingNotificationPreference.pushPosts ?? Boolean(settingMember.pushEnabled),
            comments: settingNotificationPreference.pushComments ?? Boolean(settingMember.pushEnabled),
            chatMessages: settingNotificationPreference.pushChatMessages ?? Boolean(settingMember.pushEnabled),
            quotes: settingNotificationPreference.pushQuotes ?? Boolean(settingMember.pushEnabled),
            system: settingNotificationPreference.pushSystem ?? Boolean(settingMember.pushEnabled),
            mentions: settingNotificationPreference.pushMentions ?? Boolean(settingMember.pushEnabled),
        },
    };
    // 현재 로그인 계정 요약 정보. 비활성화 화면/헤더 등 공통 영역에서 사용한다.
    const currentAccountState = {
        // 표시 이름/핸들은 서버가 심어준 값을 우선 사용하고,
        // 값이 비어 있을 때만 기존 더미/기본값으로 안전하게 떨어뜨린다.
        displayName: settingMember.memberName || "이름 정보 없음",
        handle: settingMember.memberHandle || "@handle",
        avatarUrl:
            "https://pbs.twimg.com/profile_images/1886326200253202432/j2j1wUY3_x96.jpg",
        phone: settingMember.memberPhone || "",
        email: settingMember.memberEmail || "",
        country: settingMember.memberCountry || "설정되지 않음",
        language: settingMember.memberLanguage || "설정되지 않음",
        createdAt: settingMember.createdDatetime || "생성일 정보 없음",
        memberProvider: settingMember.memberProvider
    };
    let blockedAccountsLoaded = false;
    let blockedAccountsLoading = false;
    let blockedAccountsPage = 1;
    let pendingBlockedId = null;
    // 구독 화면은 setting 안에서 조회/해지만 처리하므로 현재 구독값과 최초 로드 여부만 상태로 둔다.
    let subscriptionLoaded = false;
    let subscriptionLoading = false;
    let subscriptionState = null;

    async function loadBlockedAccounts(page = 1) {
        if (blockedAccountsLoading) {
            return;
        }

        blockedAccountsLoading = true;

        try {
            const result = await settingService.getBlockedAccounts(page);
            SettingLayout.createBlockedCard(result.blocks || []);
            blockedAccountsLoaded = true;
        } catch (error) {
            SettingLayout.createBlockedCard([]);
            alert(error.message || "차단한 계정 목록을 불러오지 못했습니다.");
        } finally {
            blockedAccountsLoading = false;
        }
    }

    function buildNotificationPushPreferencePayload() {
        return {
            pushConnect: notificationPreferenceState.pushAlerts.connect,
            pushExpert: notificationPreferenceState.pushAlerts.expert,
            pushLikes: notificationPreferenceState.pushAlerts.likes,
            pushPosts: notificationPreferenceState.pushAlerts.posts,
            pushComments: notificationPreferenceState.pushAlerts.comments,
            pushChatMessages: notificationPreferenceState.pushAlerts.chatMessages,
            pushQuotes: notificationPreferenceState.pushAlerts.quotes,
            pushSystem: notificationPreferenceState.pushAlerts.system,
            pushMentions: notificationPreferenceState.pushAlerts.mentions,
        };
    }

    // master toggle은 전체 preset 역할을 한다.
    // 사용자가 master를 켜면 상세 push는 전부 true,
    // master를 끄면 상세 push는 전부 false로 맞춘다.
    // 이후 세부 조정은 저장 버튼에서만 따로 저장한다.
    function setAllPushAlerts(nextValue) {
        Object.keys(notificationPreferenceState.pushAlerts).forEach((key) => {
            notificationPreferenceState.pushAlerts[key] = nextValue;
        });
    }

    // 상세 push 항목 중 하나라도 true가 있으면 true를 반환한다.
    // 상세 저장 이후 master 스위치를 어떤 값으로 보일지 계산할 때 사용한다.
    function hasEnabledPushAlert() {
        return Object.values(notificationPreferenceState.pushAlerts).some(Boolean);
    }

    // 푸시 master toggle은 상단 스위치와 empty 상태의 "켜기" 버튼이 같은 저장 경로를 공유한다.
    // 저장 실패 시 화면 상태를 이전 값으로 돌려 사용자가 실제 저장 결과를 오해하지 않게 만든다.
    async function persistPushEnabled(nextValue) {
        const previousValue = notificationPreferenceState.isPushEnabled;
        const previousPushAlerts = { ...notificationPreferenceState.pushAlerts };

        // master는 전체 preset이므로 스위치 값에 맞춰 상세 push 상태도 즉시 전부 맞춘다.
        notificationPreferenceState.isPushEnabled = nextValue;
        setAllPushAlerts(nextValue);
        renderDetail();

        try {
            // server도 같은 정책을 따르도록 master API 한 번으로 member.push_enabled와
            // notification_preference의 push 상세값을 함께 맞춘다.
            await settingService.updateNotificationPushEnabled(nextValue);

            window.settingMember.pushEnabled = nextValue;
        } catch (error) {
            notificationPreferenceState.isPushEnabled = previousValue;
            notificationPreferenceState.pushAlerts = previousPushAlerts;
            renderDetail();
            alert(error.message || "푸시 알림 저장 실패");
        }
    }

    async function saveNotificationPushPreference() {
        const previousValue = notificationPreferenceState.isPushEnabled;
        const nextMasterValue = hasEnabledPushAlert();

        // 세부 저장에서는 개별 체크 상태를 그대로 존중한다.
        // 단, 최종적으로 모두 false면 master도 false, 하나라도 true면 master는 true로 맞춘다.
        notificationPreferenceState.isPushEnabled = nextMasterValue;
        renderDetail();

        try {
            await settingService.updateNotificationPushPreference(
                buildNotificationPushPreferencePayload(),
            );
            window.settingMember.pushEnabled = nextMasterValue;
            alert("푸시 알림 설정이 저장되었습니다.");
        } catch (error) {
            notificationPreferenceState.isPushEnabled = previousValue;
            renderDetail();
            alert(error.message || "푸시 알림 설정 저장 실패");
        }
    }

    function resetPhoneModal() {
        pendingPhoneNumber = "";
        phoneCertCode = "";
        phoneAddInput.value = "";
        phoneCodeInput.value = "";
        phoneAddStep.hidden = false;
        phoneCodeStep.hidden = true;
        phoneCodeActionButton.disabled = true;
        phoneCodeActionButton.classList.remove("phone-modal__action--primary");
        phoneCodeActionButton.classList.add("phone-modal__action--disabled");
        phoneAddActionButton.textContent = "취소";
        phoneAddActionButton.classList.remove("phone-modal__action--primary");
    }

    // 전화번호 추가는 입력값을 DOM에서 바로 읽고,
    // 단계 사이에만 필요한 대상 번호와 인증코드만 임시로 보관한다.
    let pendingPhoneNumber = "";
    let phoneCertCode = "";
    let pendingEmailAddress = "";
    let emailCertCode = "";

    function resetEmailModal() {
        pendingEmailAddress = "";
        emailCertCode = "";
        emailAddInput.value = "";
        emailCodeInput.value = "";
        emailAddStep.hidden = false;
        emailCodeStep.hidden = true;
        emailCodeActionButton.disabled = true;
        emailCodeActionButton.classList.remove("phone-modal__action--primary");
        emailCodeActionButton.classList.remove("email-modal__action--primary");
        emailCodeActionButton.classList.add("phone-modal__action--disabled");
        emailCodeActionButton.classList.add("email-modal__action--disabled");
        emailAddActionButton.textContent = "취소";
        emailAddActionButton.classList.remove("phone-modal__action--primary");
        emailAddActionButton.classList.remove("email-modal__action--primary");
    }
    // 언어 선택 모달 상태. 서버 저장 전 선택값을 임시로 들고 있는다.
    const languageSelectionState = {
        selectedLanguageId: "ko",
    };

    function buildIcon(path, extraClass = "") {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true" class="${extraClass}">
                <g><path d="${path}"></path></g>
            </svg>
        `;
    }

    function getUsernameValidationMessage(value) {
        const normalized = value.trim();

        if (!normalized) {
            return "아이디를 입력하세요.";
        }

        if (normalized.includes("@")) {
            return "@ 없이 아이디만 입력하세요.";
        }

        if (!/^[a-z0-9_]{4,15}$/.test(normalized)) {
            return "영문 소문자, 숫자, 밑줄(_) 4~15자만 사용할 수 있습니다.";
        }

        return "";
    }

    function buildUsernameSuggestions(value) {
        const suffixes = ["zxsc", "ph", "aby"];
        const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
        const fallbackBase = usernameState.current
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "");
        let base = sanitizedValue || fallbackBase || "user";

        if (base.length < 3) {
            base = `${base}${fallbackBase}`.slice(0, 8) || "user";
        }

        base = base.slice(0, 11);

        return suffixes.map((suffix) => `${base}${suffix}`.slice(0, 15));
    }

    function getCurrentLanguageSelectionId() {
        const currentLanguage = (currentAccountState.language || "").trim();
        const languageItems = languageSelectionList.querySelectorAll(
            "[data-setting-language-id]",
        );

        for (const item of languageItems) {
            if (!(item instanceof HTMLButtonElement)) {
                continue;
            }

            const itemId = item.dataset.settingLanguageId || "";
            const itemLabel =
                item.querySelector(".setting-language-selection__item-label")
                    ?.textContent?.trim() || "";
            const shortLabel = itemLabel.split(" - ")[0].trim();

            if (
                currentLanguage === itemId ||
                currentLanguage === itemLabel ||
                currentLanguage === shortLabel
            ) {
                return itemId;
            }
        }

        return "ko";
    }

    function getSelectedLanguageLabel() {
        const languageItems = languageSelectionList.querySelectorAll(
            "[data-setting-language-id]",
        );

        for (const item of languageItems) {
            if (!(item instanceof HTMLButtonElement)) {
                continue;
            }

            if (
                item.dataset.settingLanguageId !==
                languageSelectionState.selectedLanguageId
            ) {
                continue;
            }

            const itemLabel =
                item.querySelector(".setting-language-selection__item-label")
                    ?.textContent?.trim() || "";

            return itemLabel.split(" - ")[0].trim() || itemLabel;
        }

        return "설정되지 않음";
    }

    function syncLanguageSelectionItems() {
        const languageItems = languageSelectionList.querySelectorAll(
            "[data-setting-language-id]",
        );

        for (const item of languageItems) {
            if (!(item instanceof HTMLButtonElement)) {
                continue;
            }

            const isSelected =
                item.dataset.settingLanguageId ===
                languageSelectionState.selectedLanguageId;

            item.setAttribute("aria-selected", String(isSelected));
            item.classList.toggle(
                "setting-language-selection__item--selected",
                isSelected,
            );
        }
    }

    function resetDetailHeaderAction() {
        detailActionButton.hidden = true;
        detailActionButton.textContent = "";
        detailActionButton.innerHTML = "";
        detailActionButton.removeAttribute("data-detail-action");
        detailActionButton.removeAttribute("aria-label");
    }

    function setDetailHeaderAction({
                                       label = "",
                                       iconPath = "",
                                       ariaLabel,
                                       action,
                                   }) {
        detailActionButton.hidden = false;
        detailActionButton.textContent = label;
        detailActionButton.innerHTML = iconPath
            ? buildIcon(iconPath, "panel-header__action-icon")
            : label;
        detailActionButton.dataset.detailAction = action;
        detailActionButton.setAttribute("aria-label", ariaLabel);
    }

    /*
     * 우측 상세 패널에는 "섹션 기본 목록" 외에 하위 라우트 화면이 들어올 수 있다.
     * 현재는 사용자가 요청한 `계정 > 계정 정보` 비밀번호 확인 화면만 구현한다.
     */
    function hideDetailRouteViews() {
        detailRoutes?.querySelectorAll("[data-detail-route-view]").forEach((routeView) => {
            if (!(routeView instanceof HTMLElement)) {
                return;
            }

            routeView.hidden = true;
            routeView.setAttribute("aria-hidden", "true");
        });
    }

    function showDetailRouteView(routeName) {
        const nextRouteView = detailRoutes?.querySelector(
            `[data-detail-route-view="${routeName}"]`,
        );

        detailRoutes?.querySelectorAll("[data-detail-route-view]").forEach((routeView) => {
            if (!(routeView instanceof HTMLElement)) {
                return;
            }

            routeView.hidden = routeView !== nextRouteView;
            routeView.setAttribute("aria-hidden", String(routeView !== nextRouteView));
        });

        return nextRouteView instanceof HTMLElement ? nextRouteView : null;
    }

    function bindRouteOnce(routeRoot, datasetKey, setup) {
        if (!(routeRoot instanceof HTMLElement)) {
            return;
        }

        if (routeRoot.dataset[datasetKey] === "true") {
            return;
        }

        setup(routeRoot);
        routeRoot.dataset[datasetKey] = "true";
    }

    // buildAccountInfoListMarkup은 HTML에 정적으로 삽입되어 삭제됨

    function buildUsernameSuggestionMarkup(value) {
        return buildUsernameSuggestions(value)
            .map(
                (suggestion) => `
                    <button
                        type="button"
                        class="username-suggestion__item"
                        data-username-suggestion="${suggestion}"
                    >
                        ${suggestion}
                    </button>
                `,
            )
            .join("");
    }

    function applyAccountInfoAuthState(routeRoot) {
        const passwordField = routeRoot.querySelector("[data-password-field]");
        const passwordInput = routeRoot.querySelector("[data-account-auth-input]");
        const authSubmitButton = routeRoot.querySelector("[data-account-auth-submit]");

        if (
            !(passwordField instanceof HTMLElement) ||
            !(passwordInput instanceof HTMLInputElement) ||
            !(authSubmitButton instanceof HTMLButtonElement)
        ) {
            return;
        }

        const isActive =
            document.activeElement === passwordInput || passwordInput.value.length > 0;
        const hasPasswordValue = passwordInput.value.trim().length > 0;
        passwordField.classList.toggle("detail-form__field--active", isActive);
        authSubmitButton.disabled = !hasPasswordValue;
        authSubmitButton.classList.toggle(
            "detail-form__button--enabled",
            hasPasswordValue,
        );
    }

    function syncAccountInfoAuthRoute(routeRoot) {
        const passwordInput = routeRoot.querySelector("[data-account-auth-input]");
        if (passwordInput instanceof HTMLInputElement) {
            passwordInput.value = "";
        }
        applyAccountInfoAuthState(routeRoot);
    }

    function applyUsernameEditorState(routeRoot) {
        const usernameField = routeRoot.querySelector("[data-username-field]");
        const usernameInput = routeRoot.querySelector("[data-username-input]");
        const usernameSuggestionList = routeRoot.querySelector(
            "[data-username-suggestion-list]",
        );
        const usernameSaveButton = routeRoot.querySelector("[data-username-save]");

        if (
            !(usernameField instanceof HTMLElement) ||
            !(usernameInput instanceof HTMLInputElement) ||
            !(usernameSuggestionList instanceof HTMLElement) ||
            !(usernameSaveButton instanceof HTMLButtonElement)
        ) {
            return;
        }

        const draft = usernameInput.value.trim();
        const validationMessage = getUsernameValidationMessage(draft);
        const canSave =
            !validationMessage &&
            draft.length > 0 &&
            draft !== usernameState.current;
        const usernameLabel = usernameField.querySelector(".username-field__label");

        usernameField.classList.toggle(
            "username-field--active",
            document.activeElement === usernameInput,
        );
        usernameField.classList.toggle(
            "username-field--error",
            Boolean(validationMessage),
        );
        if (usernameLabel instanceof HTMLElement) {
            usernameLabel.classList.toggle(
                "username-field__label--filled",
                usernameInput.value.length > 0,
            );
        }

        usernameSuggestionList.innerHTML = buildUsernameSuggestionMarkup(
            draft,
        );
        usernameSaveButton.disabled = !canSave;
        usernameSaveButton.classList.toggle(
            "username-action__button--enabled",
            canSave,
        );
    }

    function syncUsernameRoute(routeRoot) {
        const usernameInput = routeRoot.querySelector("[data-username-input]");
        const usernameMessage = routeRoot.querySelector("[data-username-message]");
        if (usernameInput instanceof HTMLInputElement) {
            usernameInput.value = usernameState.current;
        }
        if (usernameMessage instanceof HTMLElement) {
            usernameMessage.hidden = true;
            usernameMessage.textContent = "";
            usernameMessage.style.color = "rgb(217, 119, 6)";
        }
        applyUsernameEditorState(routeRoot);
    }

    function bindUsernameRoute(routeRoot) {
        const usernameForm = routeRoot.querySelector("[data-username-form]");
        const usernameField = routeRoot.querySelector("[data-username-field]");
        const usernameInput = routeRoot.querySelector("[data-username-input]");
        const usernameMessage = routeRoot.querySelector("[data-username-message]");
        const usernameSuggestionList = routeRoot.querySelector("[data-username-suggestion-list]");

        if (
            !(usernameForm instanceof HTMLFormElement) ||
            !(usernameField instanceof HTMLElement) ||
            !(usernameInput instanceof HTMLInputElement) ||
            !(usernameMessage instanceof HTMLElement)
        ) {
            return;
        }

        usernameInput.addEventListener("focus", () => {
            applyUsernameEditorState(routeRoot);
        });

        usernameInput.addEventListener("input", () => {
            // join의 handle 검사처럼 공백과 대문자를 입력 단계에서 정리해 비교 비용과 예외 케이스를 줄인다.
            usernameInput.value = usernameInput.value.replace(/\s/g, "").toLowerCase();

            usernameMessage.hidden = true;
            usernameMessage.textContent = "";
            usernameMessage.style.color = "rgb(217, 119, 6)";
            usernameField.classList.remove("username-field--error");
            usernameField.style.borderColor = "";
            usernameField.style.borderWidth = "";

            applyUsernameEditorState(routeRoot);
        });

        usernameInput.addEventListener("blur", async () => {
            const draft = usernameInput.value.trim();
            const validationMessage = getUsernameValidationMessage(draft);

            if (validationMessage) {
                usernameMessage.hidden = false;
                usernameMessage.textContent = validationMessage;
                usernameMessage.style.color = "rgb(217, 119, 6)";
                usernameField.classList.add("username-field--error");
                usernameField.style.borderColor = "rgb(217, 119, 6)";
                usernameField.style.borderWidth = "2px";
                return;
            }

            if (!draft || draft === usernameState.current) {
                usernameMessage.hidden = true;
                usernameMessage.textContent = "";
                usernameField.classList.remove("username-field--error");
                usernameField.style.borderColor = "";
                usernameField.style.borderWidth = "";
                return;
            }

            try {
                const isAvailable = await settingService.checkHandle(draft);

                usernameMessage.hidden = false;

                if (!isAvailable) {
                    usernameMessage.textContent = "이미 사용 중인 아이디입니다.";
                    usernameMessage.style.color = "rgb(217, 119, 6)";
                    usernameField.classList.add("username-field--error");
                    usernameField.style.borderColor = "rgb(217, 119, 6)";
                    usernameField.style.borderWidth = "2px";
                    return;
                }

                usernameMessage.textContent = "사용 가능한 아이디입니다.";
                usernameMessage.style.color = "rgb(29, 155, 240)";
                usernameField.classList.remove("username-field--error");
                usernameField.style.borderColor = "rgb(29, 155, 240)";
                usernameField.style.borderWidth = "2px";
            } catch (error) {
                usernameMessage.hidden = false;
                usernameMessage.textContent = "중복 확인 중 오류가 발생했습니다.";
                usernameMessage.style.color = "rgb(217, 119, 6)";
                usernameField.classList.add("username-field--error");
                usernameField.style.borderColor = "rgb(217, 119, 6)";
                usernameField.style.borderWidth = "2px";
            }
        });

        if (usernameSuggestionList instanceof HTMLElement) {
            usernameSuggestionList.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof Element)) {
                    return;
                }

                const suggestionButton = target.closest("[data-username-suggestion]");
                if (!(suggestionButton instanceof HTMLButtonElement)) {
                    return;
                }

                usernameInput.value = suggestionButton.dataset.usernameSuggestion || "";
                usernameMessage.hidden = true;
                usernameMessage.textContent = "";
                usernameMessage.style.color = "rgb(217, 119, 6)";
                usernameField.classList.remove("username-field--error");
                usernameField.style.borderColor = "";
                usernameField.style.borderWidth = "";
                applyUsernameEditorState(routeRoot);
                usernameInput.focus();
            });
        }

        usernameForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const draft = usernameInput.value.trim();
            const validationMessage = getUsernameValidationMessage(draft);

            if (validationMessage) {
                usernameMessage.hidden = false;
                usernameMessage.textContent = validationMessage;
                usernameMessage.style.color = "rgb(217, 119, 6)";
                usernameField.classList.add("username-field--error");
                usernameField.style.borderColor = "rgb(217, 119, 6)";
                usernameField.style.borderWidth = "2px";
                return;
            }

            if (!draft || draft === usernameState.current) {
                return;
            }

            try {
                const isAvailable = await settingService.checkHandle(draft);

                if (!isAvailable) {
                    usernameMessage.hidden = false;
                    usernameMessage.textContent = "이미 사용 중인 아이디입니다.";
                    usernameMessage.style.color = "rgb(217, 119, 6)";
                    usernameField.classList.add("username-field--error");
                    usernameField.style.borderColor = "rgb(217, 119, 6)";
                    usernameField.style.borderWidth = "2px";
                    usernameInput.focus();
                    return;
                }

                await settingService.updateHandle(draft);

                // 저장 성공 후에는 현재값과 계정 정보 화면 표시값만 갱신하고 상세 목록으로 복귀한다.
                usernameState.current = draft;
                currentAccountState.handle = `@${draft}`;
                window.settingMember.memberHandle = `@${draft}`;

                usernameMessage.hidden = true;
                usernameMessage.textContent = "";
                usernameField.classList.remove("username-field--error");
                usernameField.style.borderColor = "";
                usernameField.style.borderWidth = "";

                activeDetailRoute = "account-info-list";
                renderDetail();
            } catch (error) {
                alert(error.message || "사용자 아이디 변경 중 오류가 발생했습니다.");
            }
        });
    }

    function applyPasswordEditorState(routeRoot) {
        const passwordEditorFields = Array.from(
            routeRoot.querySelectorAll("[data-password-editor-field]"),
        );
        const passwordEditorInputs = Array.from(
            routeRoot.querySelectorAll("[data-password-editor-input]"),
        );
        const passwordEditorSaveButton = routeRoot.querySelector(
            "[data-password-editor-save]",
        );

        passwordEditorInputs.forEach((input) => {
            if (!(input instanceof HTMLInputElement)) {
                return;
            }

            const stateKey = input.dataset.passwordEditorInput;
            if (!stateKey) {
                return;
            }

            passwordChangeState[stateKey] = input.value;
        });

        passwordEditorFields.forEach((field) => {
            if (!(field instanceof HTMLElement)) {
                return;
            }

            const input = field.querySelector("[data-password-editor-input]");
            if (!(input instanceof HTMLInputElement)) {
                return;
            }

            field.classList.toggle(
                "password-editor__field--active",
                document.activeElement === input,
            );
        });

        if (!(passwordEditorSaveButton instanceof HTMLButtonElement)) {
            return;
        }

        const canSave =
            passwordChangeState.nextPassword.length > 0 &&
            passwordChangeState.confirmPassword.length > 0 &&
            (isPasswordlessAccount || passwordChangeState.currentPassword.length > 0) &&
            passwordChangeState.nextPassword === passwordChangeState.confirmPassword;

        passwordEditorSaveButton.disabled = !canSave;
        passwordEditorSaveButton.classList.toggle(
            "password-editor__save--enabled",
            canSave,
        );
    }

    function syncPasswordEditorRoute(routeRoot) {
        const currentPasswordGroup = routeRoot.querySelector(".password-editor__group");
        const forgotLink = routeRoot.querySelector(".password-editor__link");
        const labels = routeRoot.querySelectorAll(".password-editor__label");

        // provider 계정이 아직 로컬 비밀번호를 만들지 않은 상태라면
        // "현재 비밀번호 확인" 단계는 존재하지 않으므로 입력칸과 보조 링크를 숨긴다.
        if (currentPasswordGroup instanceof HTMLElement) {
            currentPasswordGroup.hidden = isPasswordlessAccount;
            currentPasswordGroup.setAttribute("aria-hidden", String(isPasswordlessAccount));
        }

        if (forgotLink instanceof HTMLElement) {
            forgotLink.hidden = isPasswordlessAccount;
            forgotLink.setAttribute("aria-hidden", String(isPasswordlessAccount));
        }

        if (labels.length >= 2) {
            labels[1].textContent = isPasswordlessAccount ? "비밀번호" : "새 비밀번호";
        }

        routeRoot.querySelectorAll("[data-password-editor-input]").forEach((input) => {
            if (!(input instanceof HTMLInputElement)) {
                return;
            }

            const stateKey = input.dataset.passwordEditorInput;
            if (stateKey) {
                input.value = passwordChangeState[stateKey];
            }
        });

        if (isPasswordlessAccount && currentPasswordInput instanceof HTMLInputElement) {
            currentPasswordInput.value = "";
            passwordChangeState.currentPassword = "";
        }

        applyPasswordEditorState(routeRoot);
    }

    function syncDeactivateRoute(routeRoot) {
        const avatar = routeRoot.querySelector("[data-deactivate-avatar]");
        const name = routeRoot.querySelector("[data-deactivate-name]");
        const handle = routeRoot.querySelector("[data-deactivate-handle]");
        const summary = routeRoot.querySelector("[data-deactivate-summary]");

        if (avatar instanceof HTMLElement) {
            avatar.style.backgroundImage = `url("${currentAccountState.avatarUrl}")`;
        }
        if (name instanceof HTMLElement) {
            name.textContent = currentAccountState.displayName;
        }
        if (handle instanceof HTMLElement) {
            handle.textContent = currentAccountState.handle;
        }
        if (summary instanceof HTMLElement) {
            summary.textContent = `GlobalGates 계정 비활성화 과정을 시작합니다. 내 표시 이름, ${currentAccountState.handle}, 공개 프로필이 GlobalGates, iOS용 GlobalGates, Android용 GlobalGates에 더 이상 표시되지 않습니다.`;
        }
    }

    function syncDeactivateConfirmRoute(routeRoot) {
        const passwordField = routeRoot.querySelector("[data-deactivate-password-field]");
        const passwordInput = routeRoot.querySelector("[data-deactivate-password-input]");
        const passwordMessage = routeRoot.querySelector("[data-deactivate-password-message]");
        const submitButton = routeRoot.querySelector("[data-deactivate-submit]");
        const summary = routeRoot.querySelector(".deactivate-confirm-editor__summary");
        const forgotLink = routeRoot.querySelector(".deactivate-confirm-editor__forgot");

        // 비밀번호가 없는 provider 계정은 확인 문구와 버튼 상태도 같이 바꿔
        // "입력할 비밀번호가 없는데 막히는" UX를 피한다.
        if (passwordField instanceof HTMLElement) {
            passwordField.classList.remove("deactivate-confirm-editor__field--active");
            passwordField.hidden = isPasswordlessAccount;
            passwordField.setAttribute("aria-hidden", String(isPasswordlessAccount));
        }
        if (passwordInput instanceof HTMLInputElement) {
            passwordInput.value = "";
        }
        if (passwordMessage instanceof HTMLElement) {
            passwordMessage.hidden = true;
            passwordMessage.textContent = "";
        }
        if (summary instanceof HTMLElement) {
            summary.textContent = isPasswordlessAccount
                ? "비밀번호 없이 계정 비활성화 요청을 완료할 수 있습니다."
                : "계정에 연결된 비밀번호를 입력하여 비활성화 요청을 완료하세요.";
        }
        if (forgotLink instanceof HTMLElement) {
            forgotLink.hidden = isPasswordlessAccount;
            forgotLink.setAttribute("aria-hidden", String(isPasswordlessAccount));
        }
        if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = !isPasswordlessAccount;
        }
    }

    function bindDeactivateConfirmRoute(routeRoot) {
        const passwordField = routeRoot.querySelector("[data-deactivate-password-field]");
        const passwordInput = routeRoot.querySelector("[data-deactivate-password-input]");
        const passwordMessage = routeRoot.querySelector("[data-deactivate-password-message]");
        const submitButton = routeRoot.querySelector("[data-deactivate-submit]");

        if (
            !(passwordField instanceof HTMLElement) ||
            !(passwordInput instanceof HTMLInputElement) ||
            !(passwordMessage instanceof HTMLElement) ||
            !(submitButton instanceof HTMLButtonElement)
        ) {
            return;
        }

        passwordInput.addEventListener("focus", () => {
            passwordField.classList.add("deactivate-confirm-editor__field--active");
        });

        passwordInput.addEventListener("blur", () => {
            passwordField.classList.toggle(
                "deactivate-confirm-editor__field--active",
                passwordInput.value.trim().length > 0,
            );
        });

        passwordInput.addEventListener("input", () => {
            const hasPassword = passwordInput.value.trim().length > 0;

            passwordMessage.hidden = true;
            passwordMessage.textContent = "";
            submitButton.disabled = !hasPassword;
            passwordField.classList.toggle(
                "deactivate-confirm-editor__field--active",
                hasPassword || document.activeElement === passwordInput,
            );
        });

        submitButton.addEventListener("click", async () => {
            const password = passwordInput.value.trim();

            if (!isPasswordlessAccount && !password) {
                return;
            }

            try {
                await settingService.deactivateAccount(password);
                await settingService.logout();
                window.location.href = "/member/join";
            } catch (error) {
                passwordMessage.hidden = false;
                passwordMessage.textContent =
                    error.message || "계정 비활성화 중 오류가 발생했습니다.";
                passwordInput.focus();
            }
        });
    }

    /*
     * routeRoot 하나에 서버/프론트 상태를 다시 주입하는 계열 함수들.
     * Spring으로 바꿀 때는 각 함수가 "DTO -> DOM 반영" 책임만 갖도록 유지하면 된다.
     */
    /*
     * 푸시 알림 상세 화면 동기화.
     * - 상단 master on/off
     * - 비활성 empty 섹션 / 활성 content 섹션 전환
     * - 개별 체크박스 상태 반영
     *
     * Spring 연동 포인트:
     * - 최초 렌더 직전에 notificationPreferenceState만 서버 값으로 채우면 된다.
     */
    function syncNotificationPushRoute(routeRoot) {
        const toggle = routeRoot.querySelector("[data-notification-push-toggle]");
        if (toggle instanceof HTMLInputElement) {
            toggle.checked = notificationPreferenceState.isPushEnabled;
        }
        const emptySection = routeRoot.querySelector(".notification-push-editor__empty");
        const contentSection = routeRoot.querySelector(".notification-push-editor__content");
        if (emptySection) emptySection.hidden = notificationPreferenceState.isPushEnabled;
        if (contentSection) contentSection.hidden = !notificationPreferenceState.isPushEnabled;
        routeRoot.querySelectorAll("[data-notification-push-check]").forEach((input) => {
            if (!(input instanceof HTMLInputElement)) {
                return;
            }

            const toggleKey = input.dataset.notificationPushCheck;
            input.checked = toggleKey
                ? Boolean(notificationPreferenceState.pushAlerts[toggleKey])
                : false;
        });
    }

    /*
     * 현재 회원 상태(currentAccountState)를 상세 화면별 DOM에 주입한다.
     * 서버에서 값이 바뀌면 이 sync 함수만 다시 호출해도 화면이 맞춰지게 설계되어 있다.
     */
    function syncPhoneRoute(routeRoot) {
        const phoneValue = currentAccountState.phone || "";
        const phoneValueNode = routeRoot.querySelector("[data-phone-current-value]");
        const verifiedScreen = routeRoot.querySelector("[data-phone-verified-screen]");
        const addButton = routeRoot.querySelector(".phone-editor__action");
        const hasPhone = Boolean(phoneValue);

        if (phoneValueNode instanceof HTMLElement) {
            phoneValueNode.textContent = phoneValue;
        }
        if (verifiedScreen instanceof HTMLElement) {
            verifiedScreen.hidden = !hasPhone;
            verifiedScreen.setAttribute("aria-hidden", String(!hasPhone));
        }
        if (addButton instanceof HTMLElement) {
            addButton.hidden = hasPhone;
        }
    }

    function syncCountryRoute(routeRoot) {
        const currentCountry = currentAccountState.country || "설정되지 않음";
        const countrySelect = routeRoot.querySelector("[data-country-select]");

        if (!(countrySelect instanceof HTMLSelectElement)) {
            return;
        }

        const matchedOption = Array.from(countrySelect.options).find(
            (option) => option.textContent?.trim() === currentCountry,
        );
        if (matchedOption) {
            countrySelect.value = matchedOption.value;
        }
    }

    function bindCountryRoute(routeRoot) {
        const countrySelect = routeRoot.querySelector("[data-country-select]");
        const saveButton = routeRoot.querySelector("[data-country-save]");

        if (!(countrySelect instanceof HTMLSelectElement)) {
            return;
        }

        if (!(saveButton instanceof HTMLButtonElement)) {
            return;
        }

        // 국가 화면은 언어 모달과 달리 별도 상세 route다.
        // 그래서 선택 즉시 전역 상태를 바꾸지 않고, 저장 버튼에서만 서버/화면 상태를 함께 확정한다.
        saveButton.addEventListener("click", async () => {
            const nextCountry =
                countrySelect.selectedOptions[0]?.textContent?.trim() || "설정되지 않음";

            if (!nextCountry || nextCountry === "설정되지 않음") {
                alert("국가를 선택하세요.");
                return;
            }

            // 이미 저장된 값과 같으면 서버를 다시 호출하지 않는다.
            if (nextCountry === (currentAccountState.country || "설정되지 않음")) {
                return;
            }

            saveButton.disabled = true;

            try {
                await settingService.updateCountry(nextCountry);

                currentAccountState.country = nextCountry;
                window.settingMember.memberCountry = nextCountry;
                renderDetail();
                alert("국가가 저장되었습니다.");
            } catch (error) {
                // 저장 실패 시에는 마지막 저장 성공값을 기준으로 select를 원복해
                // 사용자가 저장된 값과 화면 값을 혼동하지 않게 한다.
                syncCountryRoute(routeRoot);
                alert(error.message || "국가 저장 중 오류가 발생했습니다.");
            } finally {
                saveButton.disabled = false;
            }
        });
    }

    function syncAccountInfoListRoute(routeRoot) {
        // 계정 정보 화면은 서버가 최초 값을 렌더링해두고,
        // 프런트는 route 진입 시 현재 상태 객체를 기준으로 필요한 항목만 다시 맞춘다.
        // 이렇게 하면 템플릿의 SSR 초기값과 프런트 상태가 같은 데이터를 바라보게 된다.
        const usernameValue = routeRoot.querySelector('[data-account-info-value="username"]');
        const phoneValue = routeRoot.querySelector('[data-account-info-value="phone"]');
        const emailValue = routeRoot.querySelector('[data-account-info-value="email"]');
        const createdAtValue = routeRoot.querySelector('[data-account-info-value="createdAt"]');
        const countryValue = routeRoot.querySelector('[data-account-info-value="country"]');
        const languageValue = routeRoot.querySelector("[data-language-current-value]");

        if (usernameValue instanceof HTMLElement) {
            usernameValue.textContent = currentAccountState.handle || "사용자 아이디 정보 없음";
        }
        if (phoneValue instanceof HTMLElement) {
            phoneValue.textContent = currentAccountState.phone || "등록된 휴대폰 번호가 없습니다.";
        }
        if (emailValue instanceof HTMLElement) {
            emailValue.textContent = currentAccountState.email || "등록된 이메일이 없습니다.";
        }
        if (createdAtValue instanceof HTMLElement) {
            createdAtValue.textContent = currentAccountState.createdAt || "생성일 정보 없음";
        }
        if (countryValue instanceof HTMLElement) {
            countryValue.textContent = currentAccountState.country || "설정되지 않음";
        }
        if (languageValue instanceof HTMLElement) {
            languageValue.textContent = currentAccountState.language || "설정되지 않음";
        }
    }

    /*
     * activeDetailRoute 값에 따라 어떤 상세 화면 동기화 함수를 호출할지 결정한다.
     * Spring에서 서버 라우팅을 일부 맡기더라도, 프론트 상세 패널을 유지할 경우 이 함수가 허브 역할을 한다.
     */
    function syncDetailRoute(routeRoot) {
        if (activeDetailRoute === "account-info-auth") {
            syncAccountInfoAuthRoute(routeRoot);
            return;
        }
        if (activeDetailRoute === "account-info-list") {
            syncAccountInfoListRoute(routeRoot);
            return;
        }
        if (activeDetailRoute === "username-edit") {
            bindRouteOnce(routeRoot, "boundUsername", bindUsernameRoute);
            syncUsernameRoute(routeRoot);
            return;
        }
        if (activeDetailRoute === "password-edit") {
            syncPasswordEditorRoute(routeRoot);
            return;
        }
        if (activeDetailRoute === "deactivate-edit") {
            syncDeactivateRoute(routeRoot);
            return;
        }
        if (activeDetailRoute === "deactivate-confirm") {
            bindRouteOnce(routeRoot, "boundDeactivateConfirm", bindDeactivateConfirmRoute);
            syncDeactivateConfirmRoute(routeRoot);
            return;
        }
        if (
            activeDetailRoute === "notification-push-edit" ||
            (!activeDetailRoute && activeSectionId === "notifications")
        ) {
            syncNotificationPushRoute(routeRoot);
            return;
        }
        if (activeDetailRoute === "phone-edit") {
            syncPhoneRoute(routeRoot);
            return;
        }
        if (activeDetailRoute === "email-edit") {
            const emailValueNode = routeRoot.querySelector("[data-email-current-value]");
            if (emailValueNode instanceof HTMLElement) {
                emailValueNode.textContent =
                    currentAccountState.email || "등록된 이메일이 없습니다.";
            }
            return;
        }
        if (activeDetailRoute === "country-edit") {
            bindRouteOnce(routeRoot, "boundCountryRoute", bindCountryRoute);
            syncCountryRoute(routeRoot);
            return;
        }
        if (activeDetailRoute === "language-edit") {
            const languageValue = routeRoot.querySelector("[data-language-current-value]");
            if (languageValue instanceof HTMLElement) {
                languageValue.textContent = currentAccountState.language || "설정되지 않음";
            }
            return;
        }
        if (
            activeDetailRoute === "privacy-blocked-accounts-edit" ||
            (!activeDetailRoute && activeSectionId === "privacy_and_safety")
        ) {
            if (!blockedAccountsLoaded) {
                void loadBlockedAccounts(blockedAccountsPage);
            }
            return;
        }
        if (activeDetailRoute === "subscription" || (!activeDetailRoute && activeSectionId === "subscription")) {
            const emptyMessage = routeRoot.querySelector("[data-subscription-empty]");
            const card = routeRoot.querySelector("[data-subscription-card]");
            const planValue = routeRoot.querySelector("[data-subscription-plan]");
            const billingCycleValue = routeRoot.querySelector("[data-subscription-billing-cycle]");
            const nextBillingDateValue = routeRoot.querySelector("[data-subscription-next-billing-date]");
            const statusValue = routeRoot.querySelector("[data-subscription-status]");
            const helpValue = routeRoot.querySelector("[data-subscription-help]");
            const cancelButton = routeRoot.querySelector("[data-subscription-cancel]");

            if (
                !(emptyMessage instanceof HTMLElement) ||
                !(card instanceof HTMLElement) ||
                !(planValue instanceof HTMLElement) ||
                !(billingCycleValue instanceof HTMLElement) ||
                !(nextBillingDateValue instanceof HTMLElement) ||
                !(statusValue instanceof HTMLElement) ||
                !(helpValue instanceof HTMLElement) ||
                !(cancelButton instanceof HTMLButtonElement)
            ) {
                return;
            }

            // 구독 화면은 진입 시 한 번만 조회하고, 해지 성공 후에만 다시 읽어온다.
            if (!subscriptionLoaded && !subscriptionLoading) {
                subscriptionLoading = true;

                void settingService.getSubscription()
                    .then((subscription) => {
                        subscriptionState = subscription;
                        subscriptionLoaded = true;
                        renderDetail();
                    })
                    .catch((error) => {
                        alert(error.message || "구독 정보를 불러오지 못했습니다.");
                    })
                    .finally(() => {
                        subscriptionLoading = false;
                    });

                return;
            }

            const hasSubscription =
                Boolean(subscriptionState?.id) &&
                Boolean(subscriptionState?.tier);
            const isFreeMember =
                !hasSubscription || subscriptionState?.tier === "free";

            emptyMessage.hidden = true;
            card.hidden = false;

            if (isFreeMember) {
                planValue.textContent = "Free";
                billingCycleValue.textContent = "-";
                nextBillingDateValue.textContent = "-";
                statusValue.textContent = "미구독";
                statusValue.classList.remove(
                    "subscription-panel__badge--scheduled",
                    "subscription-panel__badge--inactive",
                );
                statusValue.classList.add("subscription-panel__badge--inactive");
                cancelButton.hidden = true;
                helpValue.textContent =
                    "현재 활성화된 구독이 없습니다. 플랜 변경에서 구독을 시작할 수 있습니다.";
                return;
            }

            planValue.textContent =
                subscriptionState.tier === "pro_plus"
                    ? "Pro+"
                    : subscriptionState.tier === "pro"
                        ? "Pro"
                        : subscriptionState.tier === "expert"
                            ? "Expert"
                            : subscriptionState.tier;

            billingCycleValue.textContent =
                subscriptionState.billingCycle === "annual" ? "연간" : "월간";

            nextBillingDateValue.textContent = subscriptionState.expiresAt
                ? String(subscriptionState.expiresAt).slice(0, 10)
                : "-";

            statusValue.classList.remove(
                "subscription-panel__badge--scheduled",
                "subscription-panel__badge--inactive",
            );

            if (
                subscriptionState.status === "active" &&
                subscriptionState.billingCycle === "monthly" &&
                subscriptionState.quartz === false
            ) {
                statusValue.textContent = "해지 예정";
                statusValue.classList.add("subscription-panel__badge--scheduled");
                cancelButton.hidden = true;
                helpValue.textContent = "현재 결제 주기가 끝나면 자동으로 해지됩니다.";
                return;
            }

            if (subscriptionState.status === "active") {
                statusValue.textContent = "활성";
                cancelButton.hidden = subscriptionState.billingCycle === "annual";
                cancelButton.disabled = subscriptionState.billingCycle === "annual";
                helpValue.textContent =
                    subscriptionState.billingCycle === "annual"
                        ? "연간 구독은 setting에서 해지할 수 없습니다."
                        : "월간 구독은 현재 결제 주기가 끝나면 해지됩니다.";
                return;
            }

            statusValue.textContent = "만료";
            statusValue.classList.add("subscription-panel__badge--inactive");
            cancelButton.hidden = true;
            helpValue.textContent = "구독이 종료되었습니다.";
            return;
        }
    }

    /*
     * 좌측 메뉴 렌더링:
     * - 검색어로 필터링된 항목만 노출
     * - 현재 섹션은 배경색과 오른쪽 파란 인디케이터를 붙인다
     * - 외부 링크는 외부 링크 아이콘을 사용한다
     */
    function renderNavigation(searchTerm = "") {
        const normalizedTerm = searchTerm.trim().toLowerCase();
        navigationList.querySelectorAll("[data-nav-entry]").forEach((entry) => {
            const link = entry.querySelector("[data-section-id]");
            if (!(link instanceof HTMLElement)) return;
            const sectionId = link.dataset.sectionId;
            const label = link.querySelector(".navigation-entry__label")?.textContent || "";
            const isVisible = !normalizedTerm || label.toLowerCase().includes(normalizedTerm);
            const isActive = sectionId === activeSectionId;
            const indicator = entry.querySelector(".navigation-entry__indicator");
            entry.classList.toggle("navigation-entry--active", isActive);
            entry.classList.toggle("navigation-entry--hidden", !isVisible);
            link.setAttribute("aria-selected", String(isActive));
            if (indicator) indicator.hidden = !isActive;
        });
    }

    /*
     * 우측 상세 패널 렌더링:
     * - 좌측 메뉴에서 선택된 섹션 또는 활성 라우트를 data-detail-route-view로 표시
     * - 제목은 routeRoot의 data-route-title에서 읽는다
     */

    /*
     * 우측 상세 패널 전체 재렌더 진입점.
     * - 어떤 route를 보여줄지 결정
     * - 헤더/뒤로가기/모바일 상태를 함께 맞춤
     * - 최종적으로 syncDetailRoute()에서 데이터 주입
     *
     * Spring에서 초기 route를 지정한 뒤에도, 프론트 전환은 이 함수 하나로 유지하는 편이 단순하다.
     */
    function renderDetail() {
        resetDetailHeaderAction();
        hideDetailRouteViews();
        detailBackButton.hidden = !activeDetailRoute;

        const routeName =
            !activeDetailRoute && activeSectionId === "notifications"
                ? "notification-push-edit"
                : !activeDetailRoute && activeSectionId === "privacy_and_safety"
                    ? "privacy-blocked-accounts-edit"
                : (activeDetailRoute || activeSectionId);
        const routeRoot = showDetailRouteView(routeName);

        if (routeRoot instanceof HTMLElement) {
            detailTitle.textContent = routeRoot.dataset.routeTitle || "";
            if (
                activeDetailRoute ||
                (!activeDetailRoute && activeSectionId === "notifications") ||
                (!activeDetailRoute && activeSectionId === "privacy_and_safety") ||
                (!activeDetailRoute && activeSectionId === "subscription")
            ) {
                syncDetailRoute(routeRoot);
            }
            if (window.matchMedia("(max-width: 400px)").matches && !activeDetailRoute) {
                detailBackButton.hidden = false;
            }
        }

        syncMobileDetailState(true);
    }

    function syncMobileDetailState(isActive) {
        const isMobile = window.matchMedia("(max-width: 400px)").matches;
        settingsShell.classList.toggle("is-detail-active", isMobile && isActive);
    }

    /*
     * 표시 모달의 선택지 렌더링:
     * - 색상 선택은 브랜드 포인트 컬러만 바꾼다
     * - 배경 선택은 body data 속성을 바꿔 페이지 전체 톤을 바꾼다
     */
    function renderAppearanceOptions() {
        appearanceAccentList.querySelectorAll("[data-accent-id]").forEach((btn) => {
            btn.classList.toggle("appearance-chip--active", btn.dataset.accentId === appearanceState.accent);
        });
        appearanceSurfaceList.querySelectorAll("[data-surface-id]").forEach((btn) => {
            btn.classList.toggle("surface-chip--active", btn.dataset.surfaceId === appearanceState.surface);
        });
    }

    /*
     * body data 속성은 CSS 토큰을 직접 바꾸는 역할을 한다.
     * 이 방식으로 JS는 상태만 관리하고 실제 색상/배경 적용은 CSS가 담당한다.
     */
    function applyAppearanceState() {
        document.body.dataset.fontScale = appearanceState.fontScale;
        document.body.dataset.accent = appearanceState.accent;
        document.body.dataset.surface = appearanceState.surface;
        appearanceFontRange.value = appearanceState.fontScale;
        renderAppearanceOptions();
    }

    if (accountInfoAuthInput instanceof HTMLInputElement) {
        // 인증 화면은 인라인 에러를 두지 않고 입력 상태와 버튼 활성화만 관리한다.
        // 실패 안내는 아래 클릭 핸들러의 alert로 통일하고, 여기서는 현재 입력값에 맞는 UI 상태만 반영한다.
        accountInfoAuthInput.addEventListener("focus", () => applyAccountInfoAuthState(accountInfoAuthRoute));
        accountInfoAuthInput.addEventListener("blur", () => applyAccountInfoAuthState(accountInfoAuthRoute));
        accountInfoAuthInput.addEventListener("input", () => applyAccountInfoAuthState(accountInfoAuthRoute));
    }

    if (accountInfoAuthButton instanceof HTMLButtonElement) {
        // 계정 정보는 진입 전에 현재 비밀번호를 한 번 더 확인한다.
        // submit 기반으로 폼 전체를 보내지 않고, join의 단계 이동 버튼처럼 클릭 한 번으로
        // "입력값 확인 -> API 호출 -> 다음 상세 화면 이동"을 처리하는 쪽이 현재 프로젝트 스타일에 더 잘 맞는다.
        accountInfoAuthButton.addEventListener("click", async () => {
            if (!(accountInfoAuthInput instanceof HTMLInputElement)) {
                return;
            }

            const password = accountInfoAuthInput.value.trim();
            applyAccountInfoAuthState(accountInfoAuthRoute);

            if (!password) {
                return;
            }

            try {
                const isMatched = await settingService.checkPassword(password);

                if (!isMatched) {
                    alert("비밀번호를 다시 확인하세요.");
                    accountInfoAuthInput.value = "";
                    applyAccountInfoAuthState(accountInfoAuthRoute);
                    accountInfoAuthInput.focus();
                    return;
                }

                // 민감한 입력값은 성공 직후 바로 비워서 화면에 남지 않게 한다.
                accountInfoAuthInput.value = "";
                activeDetailRoute = "account-info-list";
                renderDetail();
            } catch (error) {
                alert(error.message || "비밀번호 확인 중 오류가 발생했습니다.");
            }
        });
    }

    if (currentPasswordInput instanceof HTMLInputElement) {
        currentPasswordInput.addEventListener("focus", () => applyPasswordEditorState(passwordEditRoute));
        currentPasswordInput.addEventListener("blur", () => applyPasswordEditorState(passwordEditRoute));
        currentPasswordInput.addEventListener("input", () => applyPasswordEditorState(passwordEditRoute));
    }

    if (nextPasswordInput instanceof HTMLInputElement) {
        nextPasswordInput.addEventListener("focus", () => applyPasswordEditorState(passwordEditRoute));
        nextPasswordInput.addEventListener("blur", () => applyPasswordEditorState(passwordEditRoute));
        nextPasswordInput.addEventListener("input", () => applyPasswordEditorState(passwordEditRoute));
    }

    if (confirmPasswordInput instanceof HTMLInputElement) {
        confirmPasswordInput.addEventListener("focus", () => applyPasswordEditorState(passwordEditRoute));
        confirmPasswordInput.addEventListener("blur", () => applyPasswordEditorState(passwordEditRoute));
        confirmPasswordInput.addEventListener("input", () => applyPasswordEditorState(passwordEditRoute));
    }

    if (passwordSaveButton instanceof HTMLButtonElement) {
        // 비밀번호 변경은 이 버튼 한 곳에서만 처리한다.
        // 현재 파일은 route별 동작을 큰 라우터로 추상화하기보다, 각 화면의 실질적인 저장/확인 버튼이
        // 자기 책임을 직접 가지는 쪽이 읽기 쉽다. join의 next-button 흐름과도 같은 결이다.
        passwordSaveButton.addEventListener("click", async () => {
            if (
                !(currentPasswordInput instanceof HTMLInputElement) ||
                !(nextPasswordInput instanceof HTMLInputElement) ||
                !(confirmPasswordInput instanceof HTMLInputElement)
            ) {
                return;
            }

            const currentPassword = currentPasswordInput.value.trim();
            const nextPassword = nextPasswordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            applyPasswordEditorState(passwordEditRoute);

            if (!currentPassword || !nextPassword || !confirmPassword) {
                return;
            }

            // 길이와 확인 일치는 서버까지 보낼 필요가 없는 대표적인 프런트 검증이다.
            // 사용자가 같은 화면에서 즉시 수정할 수 있게 가장 가까운 입력으로 포커스를 돌린다.
            if (nextPassword.length < 8) {
                alert("새 비밀번호 형식을 확인하세요.");
                nextPasswordInput.focus();
                return;
            }

            if (nextPassword !== confirmPassword) {
                alert("비밀번호를 다시 확인하세요.");
                confirmPasswordInput.value = "";
                passwordChangeState.confirmPassword = "";
                applyPasswordEditorState(passwordEditRoute);
                confirmPasswordInput.focus();
                return;
            }

            if (currentPassword === nextPassword) {
                alert("현재 비밀번호와 다른 비밀번호를 입력하세요.");
                nextPasswordInput.focus();
                return;
            }

            try {
                await settingService.updatePassword(currentPassword, nextPassword);

                // 비밀번호가 바뀐 뒤 기존 세션을 유지하면 사용자는 "언제 재인증이 필요한지"를 헷갈릴 수 있다.
                // 그래서 성공 시 즉시 로그아웃시키고, 이 프로젝트의 기본 비인증 진입점인 /member/join으로 보낸다.
                alert("비밀번호가 변경되었습니다. 다시 로그인해 주세요.");

                await settingService.logout();
                window.location.href = "/member/join";
            } catch (error) {
                // 서버가 현재 비밀번호 오류를 반환한 경우에는 현재 비밀번호만 다시 받는다.
                // 새 비밀번호/확인 입력은 사용자가 이미 맞춰둔 값일 수 있으므로 유지하는 편이 덜 번거롭다.
                alert(error.message || "비밀번호 변경 중 오류가 발생했습니다.");
                currentPasswordInput.value = "";
                passwordChangeState.currentPassword = "";
                applyPasswordEditorState(passwordEditRoute);
                currentPasswordInput.focus();
            }
        });
    }

    /*
     * 공통 모달 열기.
     * Spring API 연동 후에도 모달 open/close 자체는 프론트에서 유지하고,
     * 저장/인증 성공 시 상태값만 바꾼 뒤 renderDetail()을 다시 호출하는 구조가 가장 단순하다.
     */
    function openModal(modalType) {
        activeModal = modalType;
        modalLayer.hidden = false;
        appearanceModal.hidden = modalType !== "appearance";
        shortcutModal.hidden = modalType !== "shortcuts";
        languageSelectionModal.hidden = modalType !== "language-select";
        phoneAddModal.hidden = modalType !== "phone-add";
        phoneVerifyModal.hidden = true;
        emailAddModal.hidden = modalType !== "email-add";
        emailVerifyModal.hidden = true;
        blockedUnblockModal.hidden = modalType !== "blocked-unblock";

        if (modalType === "appearance") {
            appearanceCompleteButton.focus();
        } else if (modalType === "shortcuts") {
            const closeButton = shortcutModal.querySelector(".modal-close");
            closeButton?.focus();
        } else if (modalType === "language-select") {
            languageSelectionState.selectedLanguageId =
                getCurrentLanguageSelectionId();
            syncLanguageSelectionItems();

            const selectedLanguageItem = languageSelectionList.querySelector(
                `[data-setting-language-id="${languageSelectionState.selectedLanguageId}"]`,
            );

            if (selectedLanguageItem instanceof HTMLButtonElement) {
                selectedLanguageItem.focus();
            } else {
                languageSelectionNextButton.focus();
            }
        } else if (modalType === "phone-add") {
            resetPhoneModal();
            phoneAddInput.focus();
        } else if (modalType === "email-add") {
            resetEmailModal();
            emailAddInput.focus();
        }
    }

    // 열린 모달을 모두 닫고 모달 관련 임시 상태를 정리한다.
    function closeModal() {
        activeModal = "";
        modalLayer.hidden = true;
        appearanceModal.hidden = true;
        shortcutModal.hidden = true;
        languageSelectionModal.hidden = true;
        phoneAddModal.hidden = true;
        phoneVerifyModal.hidden = true;
        emailAddModal.hidden = true;
        emailVerifyModal.hidden = true;
        blockedUnblockModal.hidden = true;
        pendingBlockedId = null;
        resetPhoneModal();
        resetEmailModal();
    }

    function selectSection(sectionId) {
        activeSectionId = sectionId;
        activeDetailRoute = "";
        renderNavigation(searchInput.value);
        renderDetail();
    }

    searchInput.addEventListener("input", () => {
        renderNavigation(searchInput.value);
    });

    navigationList.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const link = target.closest("[data-section-id]");
        if (!(link instanceof HTMLAnchorElement)) {
            return;
        }

        const sectionId = link.dataset.sectionId;
        if (!sectionId) {
            return;
        }

        if (!link.target || link.target === "_self") {
            event.preventDefault();
        }

        if (link.target === "_blank") {
            return;
        }

        syncMobileDetailState(true);
        selectSection(sectionId);
    });

    detailRoutes.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const entryLink = target.closest(".detail-entry");
        if (!(entryLink instanceof HTMLAnchorElement)) {
            return;
        }

        if (
            activeSectionId === "account" &&
            entryLink.getAttribute("href") ===
            "/settings/your_twitter_data/account"
        ) {
            event.preventDefault();
            // 일반 계정은 기존처럼 비밀번호 확인을 거치고,
            // passwordless provider 계정만 바로 계정 정보 상세로 보낸다.
            activeDetailRoute = isPasswordlessAccount
                ? "account-info-list"
                : "account-info-auth";
            renderDetail();
            return;
        }

        if (
            activeSectionId === "account" &&
            entryLink.getAttribute("href") === "/settings/password"
        ) {
            event.preventDefault();
            activeDetailRoute = "password-edit";
            renderDetail();
            return;
        }

        if (
            activeSectionId === "account" &&
            entryLink.getAttribute("href") === "/settings/deactivate"
        ) {
            event.preventDefault();
            activeDetailRoute = "deactivate-edit";
            renderDetail();
            return;
        }

        if (
            activeSectionId === "notifications" &&
            (
                entryLink.getAttribute("href") === "/settings/notifications/filters" ||
                entryLink.getAttribute("href") ===
                "/settings/notifications/preferences"
            )
        ) {
            event.preventDefault();
            activeDetailRoute = "notification-push-edit";
            renderDetail();
            return;
        }

        if (
            activeSectionId === "privacy_and_safety" &&
            entryLink.getAttribute("href") ===
            "/settings/privacy_and_safety/mute_and_block"
        ) {
            event.preventDefault();
            // 개인정보 및 안전 섹션은 차단한 계정을 루트처럼 보여주고,
            // 기존 중간 "뮤트 및 차단" 화면은 최소 리스크 단계에서 접근만 끊는다.
            activeDetailRoute = "privacy-blocked-accounts-edit";
            renderDetail();
            return;
        }

        const entry = target.closest("[data-modal-type]");
        if (!(entry instanceof HTMLAnchorElement)) {
            return;
        }

        const modalType = entry.dataset.modalType;
        if (!modalType) {
            return;
        }

        event.preventDefault();
        openModal(modalType);
    });

    detailContent.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const deactivateLink = target.closest("[data-deactivate-link]");
        if (deactivateLink instanceof HTMLAnchorElement) {
            event.preventDefault();
            const deactivateTarget = deactivateLink.dataset.deactivateTarget;
            if (deactivateTarget === "username-edit") {
                activeDetailRoute = "username-edit";
                renderDetail();
            } else if (deactivateTarget === "account-info") {
                activeDetailRoute = isPasswordlessAccount
                    ? "account-info-list"
                    : "account-info-auth";
                renderDetail();
            }
            return;
        }

        const notificationFilterLink = target.closest(
            "[data-notification-filter-link]",
        );
        if (notificationFilterLink instanceof HTMLAnchorElement) {
            event.preventDefault();
            return;
        }

        const blockedAccountsLink = target.closest(
            "[data-privacy-blocked-accounts-link]",
        );
        if (blockedAccountsLink instanceof HTMLAnchorElement) {
            event.preventDefault();
            return;
        }

        const modalButton = target.closest("[data-modal-type]");
        if (modalButton instanceof HTMLButtonElement) {
            const modalType = modalButton.dataset.modalType;
            if (modalType) {
                openModal(modalType);
                return;
            }
        }

        const blockedUnblockOpenButton = target.closest("[data-blocked-unblock-open]");
        if (blockedUnblockOpenButton instanceof HTMLButtonElement) {
            pendingBlockedId = Number(blockedUnblockOpenButton.dataset.blockedId);
            blockedUnblockHandle.textContent = `${blockedUnblockOpenButton.dataset.blockedHandle || ""}`;
            openModal("blocked-unblock");
            return;
        }

        const subscriptionCancelButton = target.closest("[data-subscription-cancel]");
        if (subscriptionCancelButton instanceof HTMLButtonElement) {
            if (!subscriptionState?.id) {
                return;
            }

            const planName =
                subscriptionState.tier === "pro_plus"
                    ? "Pro+"
                    : subscriptionState.tier === "pro"
                        ? "Pro"
                        : subscriptionState.tier === "expert"
                            ? "Expert"
                            : subscriptionState.tier;

            // setting에서는 별도 모달을 늘리지 않고 최소 확인만 거친다.
            if (!confirm(`${planName} 구독을 해지하겠습니까?`)) {
                return;
            }

            void settingService.cancelSubscription(subscriptionState.id)
                .then(() => {
                    subscriptionLoaded = false;
                    alert("구독 해지가 예약되었습니다.");
                    renderDetail();
                })
                .catch((error) => {
                    alert(error.message || "구독 해지 중 오류가 발생했습니다.");
                });
            return;
        }

        const deactivateConfirmButton = target.closest("[data-deactivate-confirm]");
        if (deactivateConfirmButton instanceof HTMLButtonElement) {
            activeDetailRoute = "deactivate-confirm";
            renderDetail();
            return;
        }

        const notificationPushEnable = target.closest(
            "[data-notification-push-enable]",
        );
        if (notificationPushEnable instanceof HTMLButtonElement) {
            void persistPushEnabled(true);
            return;
        }

        const pushSaveButton = target.closest("[data-notification-push-save]");
        if (pushSaveButton instanceof HTMLButtonElement) {
            void saveNotificationPushPreference();
            return;
        }

        const infoButton = target.closest("[data-account-info-id]");
        const phoneUpdateButton = target.closest("[data-phone-update]");

        // 휴대폰 번호 업데이트는 상세 화면에서 새 폼을 다시 만들지 않고,
        // 기존 phone-add 모달 플로우를 그대로 재사용해 중복 로직을 피한다.
        if (phoneUpdateButton instanceof HTMLButtonElement) {
            openModal("phone-add");
            return;
        }

        if (!(infoButton instanceof HTMLButtonElement)) {
            return;
        }

        if (infoButton.dataset.accountInfoId === "username") {
            activeDetailRoute = "username-edit";
            renderDetail();
            return;
        }

        if (infoButton.dataset.accountInfoId === "phone") {
            activeDetailRoute = "phone-edit";
            renderDetail();
            return;
        }

        if (infoButton.dataset.accountInfoId === "email") {
            activeDetailRoute = "email-edit";
            renderDetail();
            return;
        }

        if (infoButton.dataset.accountInfoId === "country") {
            activeDetailRoute = "country-edit";
            renderDetail();
            return;
        }

        if (infoButton.dataset.accountInfoId === "language") {
            activeDetailRoute = "language-edit";
            renderDetail();
        }
    });

    detailContent.addEventListener("change", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement)) {
            return;
        }

        if (target.matches("[data-notification-push-toggle]")) {
            void persistPushEnabled(target.checked);
            return;
        }

        if (target.matches("[data-notification-push-check]")) {
            const toggleKey = target.dataset.notificationPushCheck;
            if (
                toggleKey &&
                Object.hasOwn(notificationPreferenceState.pushAlerts, toggleKey)
            ) {
                notificationPreferenceState.pushAlerts[toggleKey] =
                    target.checked;

                // 개별 상세 체크를 바꿀 때는 master의 의미도 함께 다시 계산한다.
                // 단, 마지막 체크를 끄는 순간 상세 영역까지 바로 숨기면 저장 버튼을 누를 수 없으므로
                // 여기서는 상단 toggle의 checked 상태만 즉시 따라가게 하고
                // empty/content 전환은 저장 시점의 renderDetail에서 최종 반영한다.
                notificationPreferenceState.isPushEnabled = hasEnabledPushAlert();

                const currentRoute = target.closest('[data-detail-route-view="notification-push-edit"]');
                const masterToggle = currentRoute?.querySelector("[data-notification-push-toggle]");

                if (masterToggle instanceof HTMLInputElement) {
                    masterToggle.checked = notificationPreferenceState.isPushEnabled;
                }
            }
            return;
        }

    });

    detailBackButton.addEventListener("click", () => {
        if (
            window.matchMedia("(max-width: 400px)").matches &&
            activeDetailRoute === ""
        ) {
            syncMobileDetailState(false);
            return;
        }

        if (
            activeDetailRoute === "username-edit" ||
            activeDetailRoute === "phone-edit" ||
            activeDetailRoute === "email-edit" ||
            activeDetailRoute === "country-edit" ||
            activeDetailRoute === "language-edit"
        ) {
            activeDetailRoute = "account-info-list";
        } else if (
            activeDetailRoute === "password-edit" ||
            activeDetailRoute === "deactivate-edit"
        ) {
            activeDetailRoute = "";
        } else if (activeDetailRoute === "privacy-blocked-accounts-edit") {
            activeDetailRoute = "";
        } else if (activeDetailRoute === "notification-push-edit") {
            activeDetailRoute = "";
        } else if (activeDetailRoute === "account-info-list") {
            activeDetailRoute = "account-info-auth";
        } else {
            activeDetailRoute = "";
        }
        renderDetail();
    });

    phoneAddCloseButton.addEventListener("click", (event) => {
        event.preventDefault();
        closeModal();
    });

    phoneAddInput.addEventListener("input", () => {
        phoneAddInput.value = phoneAddInput.value.replace(/[^0-9]/g, "");

        const hasPhoneNumber = phoneAddInput.value.trim().length > 0;
        phoneAddActionButton.textContent = hasPhoneNumber ? "다음" : "취소";
        phoneAddActionButton.classList.toggle(
            "phone-modal__action--primary",
            hasPhoneNumber,
        );
    });

    phoneCodeInput.addEventListener("input", () => {
        phoneCodeInput.value = phoneCodeInput.value.replace(/[^0-9]/g, "");

        const hasCode = phoneCodeInput.value.trim().length > 0;
        phoneCodeActionButton.disabled = !hasCode;
        phoneCodeActionButton.classList.toggle(
            "phone-modal__action--primary",
            hasCode,
        );
        phoneCodeActionButton.classList.toggle(
            "phone-modal__action--disabled",
            !hasCode,
        );
    });

    phoneAddActionButton.addEventListener("click", async () => {
        const phoneNumber = phoneAddInput.value.trim();

        if (!phoneNumber) {
            return;
        }

        try {
            const isAvailable = await settingService.checkPhone(phoneNumber);

            if (!isAvailable) {
                alert("이미 사용 중인 휴대폰 번호입니다.");
                phoneAddInput.focus();
                return;
            }

            pendingPhoneNumber = phoneNumber;
            phoneVerifyNumber.textContent = phoneNumber;
            phoneVerifyModal.hidden = false;
            phoneVerifyConfirmButton.focus();
        } catch (error) {
            alert(error.message || "휴대폰 번호 확인 중 오류가 발생했습니다.");
        }
    });

    phoneVerifyEditButton.addEventListener("click", () => {
        phoneVerifyModal.hidden = true;
        phoneAddInput.focus();
    });

    phoneVerifyConfirmButton.addEventListener("click", async () => {
        try {
            phoneCertCode = await settingService.sendSms(pendingPhoneNumber);

            phoneVerifyModal.hidden = true;
            phoneAddStep.hidden = true;
            phoneCodeStep.hidden = false;
            phoneCodeInput.value = "";
            phoneCodeActionButton.disabled = true;
            phoneCodeActionButton.classList.remove("phone-modal__action--primary");
            phoneCodeActionButton.classList.add("phone-modal__action--disabled");
            phoneCodeNumber.textContent = pendingPhoneNumber;
            phoneCodeInput.focus();
        } catch (error) {
            alert(error.message || "인증번호 전송에 실패했습니다.");
        }
    });

    phoneCodeActionButton.addEventListener("click", async () => {
        const code = phoneCodeInput.value.trim();

        if (!code) {
            return;
        }

        if (code !== phoneCertCode) {
            alert("잘못된 인증번호입니다.");
            phoneCodeInput.focus();
            return;
        }

        try {
            await settingService.updatePhone(pendingPhoneNumber);

            currentAccountState.phone = pendingPhoneNumber;
            window.settingMember.memberPhone = pendingPhoneNumber;

            closeModal();
            renderDetail();
        } catch (error) {
            alert(error.message || "휴대폰 번호 저장 중 오류가 발생했습니다.");
        }
    });

    phoneCodeResendButton.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            phoneCertCode = await settingService.sendSms(pendingPhoneNumber);
            phoneCodeInput.focus();
        } catch (error) {
            alert(error.message || "인증번호 재전송에 실패했습니다.");
        }
    });

    emailAddCloseButton.addEventListener("click", (event) => {
        event.preventDefault();
        closeModal();
    });

    emailAddInput.addEventListener("input", () => {
        emailAddInput.value = emailAddInput.value.trimStart();

        const hasEmailAddress = emailAddInput.value.trim().length > 0;
        emailAddActionButton.textContent = hasEmailAddress ? "다음" : "취소";
        emailAddActionButton.classList.toggle(
            "phone-modal__action--primary",
            hasEmailAddress,
        );
        emailAddActionButton.classList.toggle(
            "email-modal__action--primary",
            hasEmailAddress,
        );
    });

    emailCodeInput.addEventListener("input", () => {
        const hasCode = emailCodeInput.value.trim().length > 0;
        emailCodeActionButton.disabled = !hasCode;
        emailCodeActionButton.classList.toggle(
            "phone-modal__action--primary",
            hasCode,
        );
        emailCodeActionButton.classList.toggle(
            "email-modal__action--primary",
            hasCode,
        );
        emailCodeActionButton.classList.toggle(
            "phone-modal__action--disabled",
            !hasCode,
        );
        emailCodeActionButton.classList.toggle(
            "email-modal__action--disabled",
            !hasCode,
        );
    });

    emailAddActionButton.addEventListener("click", async () => {
        const emailAddress = emailAddInput.value.trim();

        if (!emailAddress) {
            return;
        }

        try {
            const isAvailable = await settingService.checkEmail(emailAddress);

            if (!isAvailable) {
                alert("이미 사용 중인 이메일입니다.");
                emailAddInput.focus();
                return;
            }

            pendingEmailAddress = emailAddress;
            emailVerifyAddress.textContent = emailAddress;
            emailVerifyModal.hidden = false;
            activeModal = "email-verify";
            emailVerifyConfirmButton.focus();
        } catch (error) {
            alert(error.message || "이메일 확인 중 오류가 발생했습니다.");
        }
    });

    emailVerifyEditButton.addEventListener("click", () => {
        emailVerifyModal.hidden = true;
        activeModal = "email-add";
        emailAddInput.focus();
    });

    emailVerifyConfirmButton.addEventListener("click", async () => {
        try {
            emailCertCode = await settingService.sendEmailCode(pendingEmailAddress);

            emailVerifyModal.hidden = true;
            activeModal = "email-add";
            emailAddStep.hidden = true;
            emailCodeStep.hidden = false;
            emailCodeAddress.textContent = pendingEmailAddress;
            emailCodeInput.value = "";
            emailCodeActionButton.disabled = true;
            emailCodeActionButton.classList.remove("phone-modal__action--primary");
            emailCodeActionButton.classList.remove("email-modal__action--primary");
            emailCodeActionButton.classList.add("phone-modal__action--disabled");
            emailCodeActionButton.classList.add("email-modal__action--disabled");
            emailCodeInput.focus();
        } catch (error) {
            alert(error.message || "인증번호 전송에 실패했습니다.");
        }
    });

    emailCodeResendButton.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            emailCertCode = await settingService.sendEmailCode(pendingEmailAddress);
            emailCodeInput.focus();
        } catch (error) {
            alert(error.message || "인증번호 재전송에 실패했습니다.");
        }
    });

    emailCodeActionButton.addEventListener("click", async () => {
        const code = emailCodeInput.value.trim();

        if (!code) {
            return;
        }

        if (code !== emailCertCode) {
            alert("잘못된 인증번호입니다.");
            emailCodeInput.focus();
            return;
        }

        try {
            await settingService.updateEmail(pendingEmailAddress);

            currentAccountState.email = pendingEmailAddress;
            window.settingMember.memberEmail = pendingEmailAddress;

            closeModal();
            renderDetail();
        } catch (error) {
            alert(error.message || "이메일 저장 중 오류가 발생했습니다.");
        }
    });

    languageSelectionList.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const languageItem = target.closest("[data-setting-language-id]");
        if (!(languageItem instanceof HTMLButtonElement)) {
            return;
        }

        languageSelectionState.selectedLanguageId =
            languageItem.dataset.settingLanguageId || "ko";
        syncLanguageSelectionItems();
    });

    // 언어 모달은 단일 선택 후 바로 저장하는 구조로 단순화했다.
    // 저장 성공 시에는 현재 setting 상태와 서버에서 주입한 초기값만 함께 갱신한다.
    languageSelectionNextButton.addEventListener("click", async () => {
        const selectedLanguageLabel = getSelectedLanguageLabel();

        if (!selectedLanguageLabel || selectedLanguageLabel === "설정되지 않음") {
            alert("언어를 선택하세요.");
            return;
        }

        try {
            await settingService.updateLanguage(selectedLanguageLabel);

            currentAccountState.language = selectedLanguageLabel;
            window.settingMember.memberLanguage = selectedLanguageLabel;

            closeModal();

            if (activeDetailRoute === "language-edit") {
                renderDetail();
            }
        } catch (error) {
            alert(error.message || "언어 저장 중 오류가 발생했습니다.");
        }
    });

    modalLayer.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        if (target.hasAttribute("data-modal-close")) {
            closeModal();
        }
    });

    blockedUnblockCancelButton.addEventListener("click", () => {
        closeModal();
    });

    blockedUnblockConfirmButton.addEventListener("click", async () => {
        try {
            await settingService.unblockMember(pendingBlockedId);
            closeModal();
            blockedAccountsLoaded = false;
            await loadBlockedAccounts(blockedAccountsPage);
        } catch (error) {
            alert(error.message || "차단 해제 중 오류가 발생했습니다.");
        }
    });

    appearanceAccentList.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const button = target.closest("[data-accent-id]");
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }

        appearanceState.accent = button.dataset.accentId || "blue";
        applyAppearanceState();
    });

    appearanceSurfaceList.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const button = target.closest("[data-surface-id]");
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }

        appearanceState.surface = button.dataset.surfaceId || "light";
        applyAppearanceState();
    });

    appearanceFontRange.addEventListener("input", () => {
        appearanceState.fontScale = appearanceFontRange.value;
        applyAppearanceState();
    });

    appearanceCompleteButton.addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && activeModal) {
            closeModal();
        }
    });



    applyAppearanceState();
    renderNavigation();
    renderDetail();
    syncMobileDetailState(false);
});
