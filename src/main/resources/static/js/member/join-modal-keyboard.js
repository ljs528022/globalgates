// 회원가입/로그인 모달 공용 키보드 단축키
// - Enter: 현재 떠 있는 모달의 주 액션(다음/확인/로그인) 버튼을 클릭
// - Escape: 현재 떠 있는 모달의 닫기(X) 버튼을 클릭 — 기존 닫기 핸들러(확인 다이얼로그 등)를 그대로 재사용
(() => {
  // 위에서 아래로 우선 순위: 우선 보이는 모달이 위쪽 처리 대상
  const MODAL_MAP = [
    // 회원가입 흐름
    { id: 'modal-create',       primary: '.next-button',      close: '.join-modal-header-close-button' },
    { id: 'overlay-phone',      primary: '.btn-confirm',      close: '.btn-edit' },
    { id: 'overlay-email',      primary: '.btn-confirm',      close: '.btn-edit' },
    { id: 'modal-code',         primary: '.next-button',      close: '.join-modal-header-close-button' },
    { id: 'modal-password',     primary: '.next-button',      close: '.join-modal-header-close-button' },
    { id: 'modal-oauth-birth',  primary: '.next-button',      close: '.join-modal-header-close-button' },
    { id: 'modal-business',     primary: '.next-button',      close: '.join-modal-header-close-button' },
    { id: 'modal-profile',      primary: '.ghost-button',     close: '.icon-button--close' },
    { id: 'modal-username',     primary: '.next-button',      close: '.join-modal-header-close-button' },
    { id: 'modal-language',     primary: '.next-button',      close: null },
    { id: 'modal-category',     primary: '.js-next-button',   close: null },
    { id: 'modal-notification', primary: '.notification-yes', close: '.join-modal-header-close-button' },
    { id: 'modal-submit',       primary: '.join-submit-button', close: '.join-modal-header-close-button' },
    // 로그인 흐름
    { id: 'login-modal',                  primary: '#nextBtn',              close: '.login-close' },
    { id: 'login-password-modal',         primary: '#loginBtn',             close: '.login-close' },
    { id: 'login-reactivation-modal',     primary: '#reactivationSendBtn',  close: '.auth-close' },
    { id: 'login-reactivation-code-modal',primary: '#reactivationCodeBtn',  close: '.code-close' },
  ];

  const isVisible = (el) => {
    if (!el) return false;
    if (el.style.display === 'none') return false;
    // aria-hidden만 true인 경우(로그인 모달)와 컴퓨티드 display none을 모두 잡는다.
    const computed = window.getComputedStyle(el);
    if (computed.display === 'none' || computed.visibility === 'hidden') return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    return el.offsetParent !== null || computed.position === 'fixed';
  };

  const getTopMostModal = () => {
    // 표시 중인 모달이 여러 개일 수 있으나, 보통 한 번에 하나만 떠 있다.
    // 마지막에 등장한(=배열 뒤쪽) 항목을 우선해 위쪽으로 친다.
    for (let i = MODAL_MAP.length - 1; i >= 0; i--) {
      const entry = MODAL_MAP[i];
      const el = document.getElementById(entry.id);
      if (isVisible(el)) return { entry, el };
    }
    return null;
  };

  const shouldIgnoreEnter = (target) => {
    if (!target) return false;
    const tag = target.tagName;
    if (tag === 'TEXTAREA') return true;
    if (target.isContentEditable) return true;
    // SELECT 요소 안에서 Enter는 옵션 선택용으로 두는 게 자연스럽다.
    if (tag === 'SELECT') return true;
    // 버튼/링크에 포커스가 있으면 브라우저가 자체적으로 클릭하므로 중복 실행을 막는다.
    if (tag === 'BUTTON' || tag === 'A') return true;
    return false;
  };

  document.addEventListener('keydown', (event) => {
    if (event.isComposing || event.keyCode === 229) return; // 한글 IME 조합 중
    if (event.key !== 'Enter' && event.key !== 'Escape') return;

    const top = getTopMostModal();
    if (!top) return;

    if (event.key === 'Enter') {
      if (shouldIgnoreEnter(event.target)) return;
      const button = top.el.querySelector(top.entry.primary);
      if (!button || button.disabled) return;
      event.preventDefault();
      button.click();
      return;
    }

    // Escape
    event.preventDefault();
    if (top.entry.close) {
      const closeBtn = top.el.querySelector(top.entry.close);
      closeBtn?.click();
    } else {
      // 닫기 버튼이 없는 모달(언어/카테고리)은 그냥 숨긴다.
      top.el.style.display = 'none';
    }
  });
})();
