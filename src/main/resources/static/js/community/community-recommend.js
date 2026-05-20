/* ===========================================================
   AI 추천 모달 — 커뮤니티 가입 직후 유사 커뮤니티 Top-N 추천 UI

   사용:
       CommunityRecommend.showAfterJoin(communityId, communityName);

   책임:
       - Spring /api/communities/{id}/recommendations 호출
       - 카드 5장 렌더 (skeleton → 실데이터)
       - 각 카드 "가입" 클릭 시 join API 호출, 버튼 상태만 갱신
       - 카드 본문 클릭 시 해당 커뮤니티 상세 페이지로 이동

   주의:
       similarity 점수는 응답에 들어 있지만 화면에 출력하지 않는다.
       (정렬·로깅·V2 협업필터링 가중치 합성용으로 data-similarity 에만 보관)
   =========================================================== */
const CommunityRecommend = (() => {

    const COVER_VARIANTS = ['', '--blue', '--green', '--purple', '--orange'];

    // 모달 DOM 을 lazy 하게 만들어 body 끝에 붙인다. 페이지마다 markup 을 따로 두지 않아도 됨.
    function ensureMounted() {
        let overlay = document.getElementById('recommendOverlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'recommendOverlay';
        overlay.className = 'recommend-overlay';
        overlay.innerHTML = `
            <div class="recommend-dialog" role="dialog" aria-modal="true" aria-labelledby="recommendTitle">
                <header class="recommend-header">
                    <h2 id="recommendTitle" class="recommend-header__title">
                        <span class="recommend-header__highlight" data-recommend-base-name>커뮤니티</span>
                        에 가입하셨네요
                    </h2>
                    <p class="recommend-header__subtitle">이런 커뮤니티는 어떠세요?</p>
                    <button type="button" class="recommend-header__close" aria-label="닫기" data-recommend-close>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>
                    </button>
                </header>
                <section class="recommend-body" data-recommend-body></section>
                <footer class="recommend-footer">
                    <button type="button" class="recommend-footer__skip" data-recommend-close>건너뛰기</button>
                </footer>
            </div>
        `;
        document.body.appendChild(overlay);

        // 닫기 핸들러 — 백드롭/X/스킵 버튼/Esc 모두 close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.closest('[data-recommend-close]')) {
                close();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) close();
        });

        return overlay;
    }

    function renderSkeleton(bodyEl) {
        const row = `
            <div class="recommend-skeleton__row">
                <div class="recommend-skeleton__cover"></div>
                <div class="recommend-skeleton__lines">
                    <div class="recommend-skeleton__line"></div>
                    <div class="recommend-skeleton__line recommend-skeleton__line--short"></div>
                </div>
            </div>`;
        bodyEl.innerHTML = `<div class="recommend-skeleton">${row.repeat(5)}</div>`;
    }

    function escape(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    // 1행 카드 HTML — similarity 는 data-* 에만 두고 텍스트로는 노출하지 않는다.
    function renderCard(item, index) {
        const coverClass = `recommend-card__cover${COVER_VARIANTS[index % COVER_VARIANTS.length]}`;
        const category = item.category && item.category !== '기타' ? item.category : '커뮤니티';
        const tags = (item.tags || '').split(',').filter(Boolean).slice(0, 4).join(' · ');

        return `
            <article class="recommend-card"
                     data-recommend-card
                     data-id="${item.id}"
                     data-similarity="${item.similarity ?? ''}">
                <div class="${coverClass}" aria-hidden="true"></div>
                <div class="recommend-card__body">
                    <div class="recommend-card__name">${escape(item.communityName)}</div>
                    <div class="recommend-card__meta">
                        <span class="recommend-card__category">${escape(category)}</span>
                        <span class="recommend-card__tags">${escape(tags)}</span>
                    </div>
                </div>
                <button type="button"
                        class="recommend-card__action"
                        data-recommend-join
                        data-id="${item.id}">가입</button>
            </article>
        `;
    }

    function renderEmpty(bodyEl, message) {
        bodyEl.innerHTML = `<div class="recommend-state">${escape(message)}</div>`;
    }

    function renderItems(bodyEl, items) {
        if (!items || items.length === 0) {
            renderEmpty(bodyEl, '추천할 수 있는 비슷한 커뮤니티가 없어요.');
            return;
        }
        bodyEl.innerHTML = items.map(renderCard).join('');
    }

    // 카드 내 "가입" 버튼 + 카드 본문 클릭 위임
    function bindBodyActions(bodyEl) {
        if (bodyEl.dataset.bound === '1') return;
        bodyEl.dataset.bound = '1';

        bodyEl.addEventListener('click', async (e) => {
            const joinBtn = e.target.closest('[data-recommend-join]');
            if (joinBtn) {
                e.stopPropagation();
                const id = joinBtn.dataset.id;
                joinBtn.disabled = true;
                joinBtn.textContent = '가입 중...';
                try {
                    await CommunityService.join(id);
                    joinBtn.textContent = '가입됨';
                    joinBtn.classList.add('joined');
                } catch (err) {
                    console.error('[recommend] 가입 실패:', err);
                    joinBtn.textContent = '재시도';
                    joinBtn.disabled = false;
                }
                return;
            }
            const card = e.target.closest('[data-recommend-card]');
            if (card) {
                const id = card.dataset.id;
                if (id) {
                    location.href = `/community/${id}`;
                }
            }
        });
    }

    function close() {
        const overlay = document.getElementById('recommendOverlay');
        if (overlay) overlay.classList.remove('active');
    }

    // 외부에서 호출하는 진입점.
    // communityId: 방금 가입한 커뮤니티 id (추천의 기준점)
    // communityName: 헤더에 노출할 표시명
    //
    // 흐름: 추천을 먼저 fetch → items 가 0 개면 모달 자체를 띄우지 않는다.
    // 신호가 빈약한 신규 커뮤니티(태그/설명 미입력) 에 무관한 추천을 강제로 띄워
    // 사용자를 혼란스럽게 만들지 않기 위함. FastAPI 호출 실패 시에도 모달을 띄우지 않는다.
    async function showAfterJoin(communityId, communityName) {
        let items = [];
        try {
            const data = await CommunityService.getRecommendations(communityId, 5, 'tfidf');
            items = data?.items || [];
        } catch (err) {
            console.error('[recommend] 추천 조회 실패:', err);
            return;
        }

        if (items.length === 0) return;

        const overlay = ensureMounted();
        const bodyEl = overlay.querySelector('[data-recommend-body]');
        const nameEl = overlay.querySelector('[data-recommend-base-name]');

        nameEl.textContent = communityName || '커뮤니티';
        bindBodyActions(bodyEl);
        renderItems(bodyEl, items);
        overlay.classList.add('active');
    }

    return { showAfterJoin, close };
})();
