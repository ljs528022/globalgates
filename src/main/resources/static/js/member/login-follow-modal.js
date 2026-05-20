(function () {
  const overlay = document.getElementById('followOverlay');
  const closeBtn = document.getElementById('closeFollowModal');
  const followBtns = Array.from(document.querySelectorAll('.follow-btn'));
  const nextBtn = document.getElementById('nextBtn');

  const syncNext = () => {
    const followedCount = followBtns.filter((btn) => btn.classList.contains('is-following')).length;
    const enabled = followedCount > 0;

    nextBtn.disabled = !enabled;
    nextBtn.classList.toggle('is-enabled', enabled);
  };

  followBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const active = btn.classList.toggle('is-following');
      btn.textContent = active ? '팔로잉' : '팔로우';
      syncNext();
    });
  });

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  }

  syncNext();
})();
