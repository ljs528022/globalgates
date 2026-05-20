(function () {
  const overlay = document.getElementById('npOverlay');
  const closeBtn = document.getElementById('npClose');

  const newPw = document.getElementById('newPw');
  const confirmPw = document.getElementById('confirmPw');
  const newPwWrap = document.getElementById('newPwWrap');
  const confirmPwWrap = document.getElementById('confirmPwWrap');
  const submitBtn = document.getElementById('npSubmit');

  const eyeBtn = document.getElementById('toggleNewPw');
  const confirmEyeBtn = document.getElementById('toggleConfirmPw');

  if (!newPw || !confirmPw || !newPwWrap || !confirmPwWrap || !submitBtn) return;

  const setFieldState = (input, wrap) => {
    const hasValue = input.value.trim().length > 0;
    wrap.classList.toggle('has-value', hasValue);
  };

  const validate = () => {
    const a = newPw.value;
    const b = confirmPw.value;
    const ok = a.length >= 1;

    submitBtn.disabled = !ok;
    submitBtn.textContent = ok ? '완료' : '비밀번호를 변경하세요';
    submitBtn.style.cursor = ok ? 'pointer' : 'default';
    submitBtn.classList.toggle('is-enabled', ok);
    submitBtn.classList.toggle('is-disabled', !ok);
  };

  const bindFocus = (input, wrap) => {
    input.addEventListener('focus', () => wrap.classList.add('is-focus'));
    input.addEventListener('blur', () => {
      wrap.classList.remove('is-focus');
      setFieldState(input, wrap);
      validate();
    });
    input.addEventListener('input', () => {
      setFieldState(input, wrap);
      validate();
    });
  };

  bindFocus(newPw, newPwWrap);
  bindFocus(confirmPw, confirmPwWrap);

  const bindEyeToggle = (btn, input) => {
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.classList.toggle('is-show', !showing);
    });
  };

  bindEyeToggle(eyeBtn, newPw);
  bindEyeToggle(confirmEyeBtn, confirmPw);

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  }

  setFieldState(newPw, newPwWrap);
  setFieldState(confirmPw, confirmPwWrap);
  validate();
})();


