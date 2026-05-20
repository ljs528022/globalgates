(function () {
  const overlay = document.getElementById('abnormalOverlay');
  const closeBtn = document.getElementById('closeAbnormal');
  const input = document.getElementById('abnormalInput');
  const fieldWrap = document.getElementById('abnormalFieldWrap');
  const nextBtn = document.getElementById('abnormalNextBtn');

  if (!input || !fieldWrap || !nextBtn) return;

  const syncState = () => {
    const hasValue = input.value.trim().length > 0;
    fieldWrap.classList.toggle('has-value', hasValue);

    nextBtn.disabled = !hasValue;
    nextBtn.classList.toggle('is-enabled', hasValue);
    nextBtn.classList.toggle('is-disabled', !hasValue);
  };

  input.addEventListener('focus', () => {
    fieldWrap.classList.add('is-focus');
  });

  input.addEventListener('blur', () => {
    fieldWrap.classList.remove('is-focus');
    syncState();
  });

  input.addEventListener('input', syncState);

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  }

  syncState();
})();
