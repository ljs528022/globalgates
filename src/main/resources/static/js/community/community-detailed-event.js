const LIKE_PATH_ON  = "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
const LIKE_PATH_OFF = "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
const BK_PATH_ON   = "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z";
const BK_PATH_OFF  = "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z";

// ===== 탭 전환 =====
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => { c.classList.remove('active'); c.classList.add('hidden'); });
  btn.classList.add('active');
  const target = document.getElementById('tab-' + tabId);
  target.classList.remove('hidden');
  target.classList.add('active');
}

// ===== 설명 더보기 =====
function toggleDesc() {
  document.querySelector('.community-desc').classList.toggle('hidden');
  document.querySelector('.community-desc-full').classList.toggle('hidden');
}

// ===== 참여 토글 =====
function toggleJoin() {
  const btn = document.getElementById('joinBtn');
  const joined = btn.classList.toggle('joined');
  document.getElementById('joinText').textContent = joined ? '나가기' : '참여하기';
}

// ===== 헤더 드롭다운 =====
function toggleHeaderDropdown(e) {
  e.stopPropagation();
  const menu = document.getElementById('headerDropdown');
  const isHidden = menu.classList.toggle('hidden');
  document.getElementById('overlay').classList.toggle('hidden', isHidden);
}

// ===== 드롭다운 전체 닫기 =====
function closeAllDropdowns() {
  document.getElementById('headerDropdown')?.classList.add('hidden');
  document.getElementById('overlay')?.classList.add('hidden');
  if (typeof closeShareDropdown === 'function') closeShareDropdown();
  if (typeof closeMoreDropdown === 'function') closeMoreDropdown();
}

// ===== 검색 토글 =====
function toggleSearch() {
  document.getElementById('searchOverlay').classList.toggle('visible');
}

// ===== placeCaretAtEnd (전역) =====
function placeCaretAtEnd(element) {
  const selection = window.getSelection(); if (!selection) return;
  const range = document.createRange(); range.selectNodeContents(element); range.collapse(false);
  selection.removeAllRanges(); selection.addRange(range);
}

// ===== window.onload =====
window.onload = () => {
  // ─── 페이지 데이터 ───
  const main = document.querySelector(".communityDetailPage");
  const communityId = main?.dataset.communityId;
  const memberId = main?.dataset.memberId;

  // 공용 답글 모달 활성화 — 자체 답글 모달 제거 패턴.
  postModalApi.bootstrap({
    services: CommunityDetailService,
    layout: CommunityDetailLayout,
    getMemberId: () => memberId,
    onReplySubmitSuccess: ({ button }) => {
      const cnt = button?.querySelector('.tweet-action-count');
      if (cnt) {
        const next = (Number.parseInt(cnt.textContent || "0", 10) || 0) + 1;
        cnt.textContent = String(next);
        button.setAttribute("aria-label", `답글 ${next}`);
      }
    },
  });

  // ─── DOM 요소 ───
  const headerSection = document.querySelector(".communityDetailHeader");
  const joinBtnContainer = document.querySelector(".communityDetailJoinArea");
  const popularFeedSection = document.querySelector("[data-feed='popular']");
  const latestFeedSection = document.querySelector("[data-feed='latest']");
  let postFeedSection = popularFeedSection; // 활성 탭에 따라 변경
  const mediaSection = document.querySelector(".communityDetailMedia");
  const aboutSection = document.getElementById("communityAboutContent");
  const searchInput = document.querySelector(".communitySearchInput");
  const searchTypeToggle = document.querySelector(".communitySearchType");

  // 이미지 확대 오버레이
  const previewOverlay = document.getElementById("postMediaPreviewOverlay");
  const previewImg = document.getElementById("postMediaPreviewImage");
  const previewClose = document.getElementById("postMediaPreviewClose");

  // ─── 상태 관리 ───
  const detailState = {
      community: null,
      popular: { page: 1, isLoading: false, hasMore: true },
      latest: { page: 1, isLoading: false, hasMore: true },
      posts: { page: 1, isLoading: false, hasMore: true },
      media: { page: 1, isLoading: false, hasMore: true },
      members: { page: 1, isLoading: false, hasMore: true },
      search: { page: 1, isLoading: false, hasMore: true, keyword: "", type: "latest" },
      activeTab: "popular",
  };

  const memberSection = document.querySelector("[data-feed='members']") || document.querySelector(".communityDetailMembers");

  // ─── 무한 스크롤 셋업 ───
  const _observerMap = new Map();
  function setupInfiniteScroll(container, loadFn, tabState) {
      // 이전 observer 정리
      const prev = _observerMap.get(container);
      if (prev) { prev.observer.disconnect(); prev.sentinel?.remove(); }

      const sentinel = document.createElement("div");
      sentinel.className = "scrollSentinel";
      container.appendChild(sentinel);
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting && !tabState.isLoading && tabState.hasMore) {
                  loadFn();
              }
          });
      }, { threshold: 0.1 });
      observer.observe(sentinel);
      _observerMap.set(container, { sentinel, observer });
      return { sentinel, observer };
  }

  // ─── 커뮤니티 상세 로드 ───
  async function loadDetail() {
      try {
          const data = await CommunityService.getDetail(communityId);
          detailState.community = data;
          const joined = data.isJoined ?? data.joined ?? false;
          if (headerSection) headerSection.innerHTML = CommunityDetailLayout.renderHeader(data, data.myRole);
          // 헤더 타이틀 + 페이지 타이틀 동적 설정
          const headerTitle = document.getElementById("headerTitle");
          if (headerTitle) headerTitle.textContent = data.communityName ?? "커뮤니티";
          document.title = (data.communityName ?? "커뮤니티") + " | GlobalGates";

          // 소개 탭: 멤버 목록 + 관리자 삭제 버튼
          try {
              const membersData = await CommunityService.getMembers(communityId, 1);
              let aboutHtml = CommunityDetailLayout.renderAbout(data, membersData.members || [], memberId);
              if (data.myRole === "creator") aboutHtml += CommunityDetailLayout.renderDeleteButton();
              if (aboutSection) aboutSection.innerHTML = aboutHtml;
          } catch {
              let aboutHtml = CommunityDetailLayout.renderAbout(data, [], memberId);
              if (data.myRole === "creator") aboutHtml += CommunityDetailLayout.renderDeleteButton();
              if (aboutSection) aboutSection.innerHTML = aboutHtml;
          }

          // 배너 카메라 버튼 이벤트 (관리자만)
          setupBannerUpload();
      } catch (error) {
          console.error("커뮤니티 상세 로드 실패:", error);
      }
  }

  // ─── 게시글 피드 로드 ───
  async function loadPosts() {
      const s = detailState.posts;
      if (s.isLoading || !s.hasMore) return;
      s.isLoading = true;
      if (s.page === 1) popularFeedSection?.classList.add("is-loading");
      try {
          const data = await CommunityDetailService.getPosts(communityId, s.page, "popular");
          const sentinel = postFeedSection?.querySelector(".scrollSentinel");
          const html = data.posts.map(p => CommunityDetailLayout.renderPostCard(p)).join("");
          if (sentinel) sentinel.insertAdjacentHTML("beforebegin", html);
          else if (postFeedSection) postFeedSection.innerHTML += html;

          s.hasMore = data.criteria?.hasMore ?? false;
          s.page++;
      } catch (error) {
          console.error("게시글 로드 실패:", error);
      } finally {
          s.isLoading = false;
          popularFeedSection?.classList.remove("is-loading");
      }
  }

  // ─── 최신 탭 로드 ───
  async function loadLatestPosts() {
      const s = detailState.latest;
      if (s.isLoading || !s.hasMore) return;
      s.isLoading = true;
      if (s.page === 1) latestFeedSection?.classList.add("is-loading");
      try {
          const data = await CommunityDetailService.getPosts(communityId, s.page, "latest");
          const sentinel = latestFeedSection?.querySelector(".scrollSentinel");
          const html = data.posts.map(p => CommunityDetailLayout.renderPostCard(p)).join("");
          if (sentinel) sentinel.insertAdjacentHTML("beforebegin", html);
          else if (latestFeedSection) latestFeedSection.innerHTML += html;

          s.hasMore = data.criteria?.hasMore ?? false;
          s.page++;
      } catch (error) {
          console.error("최신 게시글 로드 실패:", error);
      } finally {
          s.isLoading = false;
          latestFeedSection?.classList.remove("is-loading");
      }
  }

  // ─── 미디어 탭 로드 ───
  async function loadMedia() {
      const s = detailState.media;
      if (s.isLoading || !s.hasMore) return;
      s.isLoading = true;
      if (s.page === 1) mediaSection?.classList.add("is-loading");
      try {
          const data = await CommunityDetailService.getMedia(communityId, s.page);
          const sentinel = mediaSection?.querySelector(".scrollSentinel");
          const html = data.files.map(f => CommunityDetailLayout.renderMediaItem(f)).join("");
          if (sentinel) sentinel.insertAdjacentHTML("beforebegin", html);
          else if (mediaSection) mediaSection.innerHTML += html;

          s.hasMore = data.criteria?.hasMore ?? false;
          s.page++;
      } catch (error) {
          console.error("미디어 로드 실패:", error);
      } finally {
          s.isLoading = false;
          mediaSection?.classList.remove("is-loading");
      }
  }

  // ─── 멤버 탭 로드 ───
  async function loadMembers() {
      const s = detailState.members;
      if (s.isLoading || !s.hasMore) return;
      s.isLoading = true;
      if (s.page === 1) memberSection?.classList.add("is-loading");
      try {
          const data = await CommunityService.getMembers(communityId, s.page);
          const sentinel = memberSection?.querySelector(".scrollSentinel");
          const myRole = detailState.community?.myRole;
          const html = data.members.map(m => CommunityDetailLayout.renderMemberItem(m, myRole)).join("");
          if (sentinel) sentinel.insertAdjacentHTML("beforebegin", html);
          else if (memberSection) memberSection.innerHTML += html;

          s.hasMore = data.criteria?.hasMore ?? false;
          s.page++;
      } catch (error) {
          console.error("멤버 로드 실패:", error);
      } finally {
          s.isLoading = false;
          memberSection?.classList.remove("is-loading");
      }
  }

  // ─── 검색 ───
  async function searchPostsFn() {
      const s = detailState.search;
      if (s.isLoading || !s.hasMore || !s.keyword) return;
      s.isLoading = true;
      try {
          const data = await CommunityDetailService.searchPosts(communityId, s.page, s.keyword, s.type);
          const html = data.posts.map(p => CommunityDetailLayout.renderPostCard(p)).join("");
          if (postFeedSection) postFeedSection.innerHTML = s.page === 1 ? html : postFeedSection.innerHTML + html;
          s.hasMore = data.criteria?.hasMore ?? false;
          s.page++;
      } catch (error) {
          console.error("검색 실패:", error);
      } finally {
          s.isLoading = false;
      }
  }

  searchInput?.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const keyword = searchInput.value.trim();
      if (!keyword) return;
      detailState.search = { page: 1, isLoading: false, hasMore: true, keyword, type: detailState.search.type };
      if (postFeedSection) postFeedSection.innerHTML = "";
      searchPostsFn();
  });

  searchTypeToggle?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-type]");
      if (!btn) return;
      detailState.search.type = btn.dataset.type;
      searchTypeToggle.querySelectorAll("[data-type]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (detailState.search.keyword) {
          detailState.search.page = 1;
          detailState.search.hasMore = true;
          if (postFeedSection) postFeedSection.innerHTML = "";
          searchPostsFn();
      }
  });

  // ─── 탭 전환 (원본 구조: 인기/최신/미디어/소개) ───
  document.querySelectorAll(".tab-btn").forEach(tab => {
      tab.addEventListener("click", () => {
          const target = tab.dataset.tab;
          detailState.activeTab = target;
          document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
          tab.classList.add("active");

          document.querySelectorAll(".tab-content").forEach(c => {
              c.classList.remove("active");
              c.classList.add("hidden");
          });
          const targetEl = document.getElementById("tab-" + target);
          if (targetEl) {
              targetEl.classList.remove("hidden");
              targetEl.classList.add("active");
          }

          // 검색 타겟을 활성 탭의 피드 섹션으로 변경
          if (target === "popular") postFeedSection = popularFeedSection;
          else if (target === "latest") postFeedSection = latestFeedSection;

          if (target === "latest" && detailState.latest.page === 1) loadLatestPosts();
          if (target === "media" && detailState.media.page === 1) loadMedia();
      });
  });

  // ─── 가입/탈퇴 ───
  document.addEventListener("click", async (e) => {
      const joinBtn = e.target.closest("[data-action='join']");
      const leaveBtn = e.target.closest("[data-action='leave']");

      if (joinBtn) {
          joinBtn.disabled = true;
          try {
              await CommunityService.join(communityId);
              // 가입 성공 시 상세 새로고침 + AI 유사 커뮤니티 추천 모달 노출.
              // 추천 호출은 모달 내부에서 비동기로 수행되므로 메인 흐름을 막지 않는다.
              loadDetail();
              const baseName = detailState.community?.communityName
                  || document.getElementById("headerTitle")?.textContent
                  || "커뮤니티";
              if (typeof CommunityRecommend !== "undefined") {
                  CommunityRecommend.showAfterJoin(communityId, baseName);
              }
          } catch (err) { console.error(err); }
          finally { joinBtn.disabled = false; }
      }
      if (leaveBtn) {
          // 관리자(creator)는 탈퇴 불가 — 서버에서도 차단하지만 클라이언트에서 먼저 안내
          if (detailState.community?.myRole === "creator") {
              showToast("커뮤니티 생성자는 탈퇴할 수 없습니다. 커뮤니티를 삭제해주세요.");
              return;
          }
          if (!confirm("커뮤니티를 탈퇴하시겠습니까?")) return;
          leaveBtn.disabled = true;
          try {
              await CommunityService.leave(communityId);
              loadDetail();
          } catch (err) {
              console.error(err);
              showToast("커뮤니티 탈퇴에 실패했습니다.");
          }
          finally { leaveBtn.disabled = false; }
      }

      const deleteBtn = e.target.closest("[data-action='delete-community']");
      if (deleteBtn) {
          if (!confirm("정말로 이 커뮤니티를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
          try {
              await CommunityService.remove(communityId);
              location.href = "/community";
          } catch (err) { console.error(err); alert("커뮤니티 삭제에 실패했습니다."); }
      }
  });

  // ─── Connect 버튼 (팔로우/언팔로우) ───
  document.addEventListener("click", async (e) => {
      const connectBtn = e.target.closest(".connect-btn");
      if (!connectBtn) return;
      e.stopPropagation();
      const targetMemberId = connectBtn.dataset.memberId;
      if (!targetMemberId || !memberId) return;

      if (connectBtn.classList.contains("default")) {
          // Follow
          try {
              await fetch('/api/main/follows', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({followerId:memberId, followingId:targetMemberId}) });
              connectBtn.classList.remove("default");
              connectBtn.classList.add("connected");
              connectBtn.textContent = "Connected";
          } catch (err) { console.error(err); }
      } else {
          // Unfollow
          try {
              await fetch(`/api/main/follows/${memberId}/${targetMemberId}/delete`, { method:'POST' });
              connectBtn.classList.remove("connected");
              connectBtn.classList.add("default");
              connectBtn.textContent = "Connect";
          } catch (err) { console.error(err); }
      }
  });

  // ─── 이미지 확대 ───
  document.addEventListener("click", (e) => {
      const img = e.target.closest(".Post-Media-Img");
      if (img && previewOverlay && previewImg) {
          previewImg.src = img.src;
          previewImg.alt = img.alt;
          previewOverlay.classList.remove("off");
          document.body.classList.add("modal-open");
      }
  });

  // ─── 배너 이미지 업로드 (관리자 전용, S3) ───
  function setupBannerUpload() {
      const fileInput = document.getElementById("bannerFileInput");
      if (!fileInput) return;
      fileInput.addEventListener("change", async () => {
          const file = fileInput.files?.[0];
          if (!file) return;
          const formData = new FormData();
          formData.append("coverImage", file);
          try {
              await CommunityService.update(communityId, formData);
              loadDetail(); // 새 배너로 리렌더
          } catch (err) {
              console.error("배너 업로드 실패:", err);
          }
      });
  }

  function closePreview() {
      previewOverlay?.classList.add("off");
      document.body.classList.remove("modal-open");
      setTimeout(() => { if (previewImg) previewImg.src = ""; }, 200);
  }

  previewClose?.addEventListener("click", closePreview);
  previewOverlay?.addEventListener("click", (e) => {
      if (e.target === previewOverlay) closePreview();
  });
  document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePreview();
  });

  // ─── 관리자 메뉴 ───
  document.addEventListener("click", async (e) => {
      const menuBtn = e.target.closest(".communityMemberItem__menuBtn");
      if (!menuBtn) return;
      const targetMemberId = menuBtn.dataset.memberId;

      const action = prompt("작업을 선택하세요:\n1: 중재자 지정\n2: 일반 멤버로 변경\n3: 추방");
      try {
          if (action === "1") await CommunityService.changeRole(communityId, targetMemberId, "moderator");
          else if (action === "2") await CommunityService.changeRole(communityId, targetMemberId, "member");
          else if (action === "3") await CommunityService.kickMember(communityId, targetMemberId);
          detailState.members = { page: 1, isLoading: false, hasMore: true };
          if (memberSection) memberSection.innerHTML = "";
          setupInfiniteScroll(memberSection, loadMembers, detailState.members);
          loadMembers();
      } catch (err) {
          console.error("관리 작업 실패:", err);
      }
  });

  // ─── 게시글 클릭 → 상세 페이지 이동 (버튼 영역 제외) ───
  document.addEventListener("click", (e) => {
      // 인터랙티브 요소 클릭 시 상세 이동 차단
      if (e.target.closest(".tweet-action-btn") ||
          e.target.closest(".postMoreButton") ||
          e.target.closest(".Post-Media-Img") ||
          e.target.closest(".postAction") ||
          e.target.closest(".layers-dropdown-container") ||
          e.target.closest("[data-action]") ||
          e.target.closest("button")) return;
      const card = e.target.closest(".postCard[data-post-id]");
      if (!card) return;
      location.href = `/main/post/detail/${card.dataset.postId}?memberId=${memberId}`;
  });

  // ─── 초기 로드 ───
  loadDetail();
  if (popularFeedSection) {
      setupInfiniteScroll(popularFeedSection, loadPosts, detailState.posts);
      loadPosts();
  }
  if (latestFeedSection) setupInfiniteScroll(latestFeedSection, loadLatestPosts, detailState.latest);
  if (mediaSection) setupInfiniteScroll(mediaSection, loadMedia, detailState.media);
  if (memberSection) setupInfiniteScroll(memberSection, loadMembers, detailState.members);

  // ─── 뒤로가기/bfcache 복원 시 좋아요·북마크 등 최신 상태 동기화 ───
  window.addEventListener("pageshow", (e) => {
      if (!e.persisted) return;
      detailState.posts = { page: 1, isLoading: false, hasMore: true };
      detailState.latest = { page: 1, isLoading: false, hasMore: true };
      if (popularFeedSection) popularFeedSection.innerHTML = "";
      if (latestFeedSection) latestFeedSection.innerHTML = "";
      setupInfiniteScroll(popularFeedSection, loadPosts, detailState.posts);
      setupInfiniteScroll(latestFeedSection, loadLatestPosts, detailState.latest);
      loadDetail();
      loadPosts();
  });

  // ===== Toast =====
  const showToast = (msg) => {
    const el = Object.assign(document.createElement('div'), { className: 'postToast', textContent: msg });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  };


  let activeMoreButton = null, activeMoreDropdown = null;
  let activeShareButton = null, activeShareDropdown = null;
  let activeShareModal = null, activeShareToast = null;
  let activeCommunityModal = null, activeCommunityToast = null;
  const layersRoot = document.getElementById('layers');
  const communityFollowState = new Map();
  const communityReportReasons = ['다른 회사 제품 도용 신고','실제 존재하지 않는 제품 등록 신고','스펙·원산지 허위 표기 신고','특허 제품 무단 판매 신고','수출입 제한 품목 신고','반복적인 동일 게시물 신고'];

  // ===== Utils =====
  function getTextContent(el) { return el?.textContent.trim() ?? ''; }
  function escapeHtml(v) { return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c] ?? c); }
  function closeShareDropdown() {
    if (!activeShareDropdown) return;
    activeShareDropdown.remove(); activeShareDropdown = null;
    if (activeShareButton) { activeShareButton.setAttribute('aria-expanded','false'); activeShareButton = null; }
  }
  function getSharePostMeta(button) {
    const card = button.closest('.communityPostCard');
    const handle = getTextContent(card?.querySelector('.postHandle')) || '@user';
    const bk = card?.querySelector('.tweet-action-btn--bookmark') ?? null;
    const postId = card?.dataset.postId ?? '0';
    const permalink = `${window.location.origin}/main/post/detail/${postId}?memberId=${memberId}`;
    return { handle, permalink, bookmarkButton:bk };
  }
  function showShareToast(message) {
    activeShareToast?.remove();
    const toast = document.createElement('div'); toast.className = 'share-toast'; toast.setAttribute('role','status'); toast.textContent = message;
    document.body.appendChild(toast); activeShareToast = toast;
    window.setTimeout(() => { if (activeShareToast === toast) activeShareToast = null; toast.remove(); }, 3000);
  }
  function closeShareModal() { if (!activeShareModal) return; activeShareModal.remove(); activeShareModal = null; document.body.classList.remove('modal-open'); }
  function setBookmarkButtonState(button, isActive) {
    const path = button?.querySelector('path'); if (!button || !path) return;
    button.classList.toggle('active', isActive);
    button.setAttribute('data-testid', isActive ? 'removeBookmark' : 'bookmark');
    button.setAttribute('aria-label', isActive ? '북마크에 추가됨' : '북마크');
    // renderPostCard SVG에는 data-path-active/-inactive 속성이 없으므로 BK 상수로 직접 swap
    const activeD = path.dataset.pathActive ?? BK_PATH_ON;
    const inactiveD = path.dataset.pathInactive ?? BK_PATH_OFF;
    path.setAttribute('d', isActive ? activeD : inactiveD);
  }
  function openShareBookmarkModal(button) {
    const { bookmarkButton } = getSharePostMeta(button); closeShareDropdown(); closeShareModal();
    const isBookmarked = bookmarkButton?.classList.contains('active') ?? false;
    const modal = document.createElement('div'); modal.className = 'share-sheet';
    modal.innerHTML = `<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card share-sheet__card--bookmark" role="dialog" aria-modal="true" aria-labelledby="share-bookmark-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button><h2 id="share-bookmark-title" class="share-sheet__title">폴더에 추가</h2><span class="share-sheet__header-spacer"></span></div><button type="button" class="share-sheet__create-folder">새 북마크 폴더 만들기</button><button type="button" class="share-sheet__folder" data-share-folder="all-bookmarks"><span class="share-sheet__folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"></path></g></svg></span><span class="share-sheet__folder-name">모든 북마크</span><span class="share-sheet__folder-check${isBookmarked ? ' share-sheet__folder-check--active' : ''}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg></span></button></div>`;
    modal.addEventListener('click', (e) => {
      if (e.target.closest("[data-share-close='true']") || e.target.classList.contains('share-sheet__backdrop')) { e.preventDefault(); closeShareModal(); return; }
      if (e.target.closest('.share-sheet__create-folder')) { e.preventDefault(); showShareToast('새 폴더 만들기는 준비 중입니다'); closeShareModal(); return; }
      if (e.target.closest("[data-share-folder='all-bookmarks']")) {
        e.preventDefault();
        const nextActive = !isBookmarked;
        setBookmarkButtonState(bookmarkButton, nextActive);
        // bookmarkCount는 같은 카드의 .tweet-action-btn--views 카운터에 있음
        const countButton = bookmarkButton?.closest('.tweet-action-bar')?.querySelector('.tweet-action-btn--views');
        const cnt = countButton?.querySelector('.tweet-action-count');
        const prevCountText = cnt?.textContent?.trim();
        const prevAriaLabel = countButton?.getAttribute('aria-label');
        if (cnt && /^\d+$/.test(prevCountText)) {
          const nextCount = Math.max(0, parseInt(prevCountText, 10) + (nextActive ? 1 : -1));
          cnt.textContent = nextCount;
          countButton?.setAttribute('aria-label', `북마크 ${nextCount}`);
        }
        const postId = bookmarkButton?.dataset.postId;
        const rollbackShareBookmark = () => {
          setBookmarkButtonState(bookmarkButton, isBookmarked);
          if (cnt && prevCountText != null) cnt.textContent = prevCountText;
          if (countButton && prevAriaLabel != null) countButton.setAttribute('aria-label', prevAriaLabel);
        };
        if (postId && memberId) {
          const req = nextActive
            ? fetch('/api/main/bookmarks', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({memberId, postId}) })
            : fetch(`/api/main/bookmarks/members/${memberId}/posts/${postId}/delete`, { method:'POST' });
          req.then(r => { if (!r.ok) { rollbackShareBookmark(); showShareToast('요청을 처리하지 못했습니다. 다시 시도해 주세요.'); console.error('share-bookmark API failed', r.status); } })
             .catch(err => { rollbackShareBookmark(); showShareToast('요청을 처리하지 못했습니다. 다시 시도해 주세요.'); console.error(err); });
        }
        showShareToast(isBookmarked ? '북마크가 해제되었습니다' : '북마크에 추가되었습니다');
        closeShareModal();
      }
    });
    document.body.appendChild(modal); document.body.classList.add('modal-open'); activeShareModal = modal;
  }
  function copyShareLink(button) {
    const { permalink } = getSharePostMeta(button); closeShareDropdown();
    if (!navigator.clipboard?.writeText) { showShareToast('링크를 복사하지 못했습니다'); return; }
    navigator.clipboard.writeText(permalink).then(() => showShareToast('클립보드로 복사함')).catch(() => showShareToast('링크를 복사하지 못했습니다'));
  }
  function openShareDropdown(button) {
    if (!layersRoot) return; closeShareDropdown(); closeMoreDropdown();
    const rect = button.getBoundingClientRect(), top = rect.bottom + window.scrollY + 8, right = Math.max(16, window.innerWidth - rect.right);
    const lc = document.createElement('div'); lc.className = 'layers-dropdown-container';
    lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top:${top}px;right:${right}px;"><div class="dropdown-inner"><button type="button" role="menuitem" class="menu-item share-menu-item--copy"><span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></g></svg></span><span class="menu-item__label">링크 복사하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item--bookmark"><span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18 3V0h2v3h3v2h-3v3h-2V5h-3V3zm-7.5 1a.5.5 0 00-.5.5V7h3.5A2.5 2.5 0 0116 9.5v3.48l3 2.1V11h2v7.92l-5-3.5v7.26l-6.5-3.54L3 22.68V9.5A2.5 2.5 0 015.5 7H8V4.5A2.5 2.5 0 0110.5 2H12v2zm-5 5a.5.5 0 00-.5.5v9.82l4.5-2.46 4.5 2.46V9.5a.5.5 0 00-.5-.5z"></path></g></svg></span><span class="menu-item__label">폴더에 북마크 추가하기</span></button></div></div></div>`;
    lc.addEventListener('click', (e) => { const item = e.target.closest('.menu-item'); if (!item) { e.stopPropagation(); return; } e.preventDefault(); e.stopPropagation(); if (item.classList.contains('share-menu-item--copy')) { copyShareLink(activeShareButton ?? button); return; } if (item.classList.contains('share-menu-item--bookmark')) { openShareBookmarkModal(activeShareButton ?? button); return; } closeShareDropdown(); });
    layersRoot.appendChild(lc); activeShareDropdown = lc; activeShareButton = button; button.setAttribute('aria-expanded','true');
  }

  // ===== 더보기 드롭다운 =====
  function closeMoreDropdown() {
    if (!activeMoreDropdown) return;
    activeMoreDropdown.remove(); activeMoreDropdown = null;
    if (activeMoreButton) { activeMoreButton.setAttribute('aria-expanded','false'); activeMoreButton = null; }
  }
  function getCommunityUserMeta(button) {
    const card = button.closest('.communityPostCard');
    const handle = getTextContent(card?.querySelector('.postHandle')) || '@user';
    const displayName = getTextContent(card?.querySelector('.postName')) || '사용자';
    return { card, handle, displayName };
  }
  function showCommunityToast(message) {
    activeCommunityToast?.remove();
    const toast = document.createElement('div'); toast.className = 'notification-toast'; toast.setAttribute('role','status'); toast.textContent = message;
    document.body.appendChild(toast); activeCommunityToast = toast;
    window.setTimeout(() => { if (activeCommunityToast === toast) activeCommunityToast = null; toast.remove(); }, 3000);
  }
  function closeCommunityModal() { if (!activeCommunityModal) return; activeCommunityModal.remove(); activeCommunityModal = null; document.body.classList.remove('modal-open'); }
  function openCommunityBlockModal(button) {
    const { card, handle } = getCommunityUserMeta(button);
    const targetMemberId = card?.dataset.memberId;
    closeMoreDropdown(); closeCommunityModal();
    const modal = document.createElement('div'); modal.className = 'notification-dialog notification-dialog--block';
    modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--small" role="alertdialog" aria-modal="true" aria-labelledby="community-block-title" aria-describedby="community-block-desc"><h2 id="community-block-title" class="notification-dialog__title">${escapeHtml(handle)} 님을 차단할까요?</h2><p id="community-block-desc" class="notification-dialog__description">내 공개 게시물을 볼 수 있지만 더 이상 게시물에 참여할 수 없습니다. 또한 ${escapeHtml(handle)} 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.</p><div class="notification-dialog__actions"><button type="button" class="notification-dialog__danger notification-dialog__confirm-block">차단</button><button type="button" class="notification-dialog__secondary notification-dialog__close">취소</button></div></div>`;
    modal.addEventListener('click', (e) => { if (e.target.classList.contains('notification-dialog__backdrop') || e.target.closest('.notification-dialog__close')) { e.preventDefault(); closeCommunityModal(); return; } if (e.target.closest('.notification-dialog__confirm-block')) { e.preventDefault(); if (memberId && targetMemberId) { fetch('/api/main/blocks', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({blockerId:memberId, blockedId:targetMemberId}) }).catch(err => console.error(err)); document.querySelectorAll(`.postCard[data-member-id="${targetMemberId}"]`).forEach(el => el.remove()); } showCommunityToast(`${handle} 님을 차단했습니다`); closeCommunityModal(); } });
    document.body.appendChild(modal); document.body.classList.add('modal-open'); activeCommunityModal = modal;
  }
  function openCommunityReportModal() {
    closeMoreDropdown(); closeCommunityModal();
    const modal = document.createElement('div'); modal.className = 'notification-dialog notification-dialog--report';
    modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--report" role="dialog" aria-modal="true" aria-labelledby="community-report-title"><div class="notification-dialog__header"><button type="button" class="notification-dialog__icon-btn notification-dialog__close" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 id="community-report-title" class="notification-dialog__title">신고하기</h2></div><div class="notification-dialog__body"><p class="notification-dialog__question">이 게시물에 어떤 문제가 있나요?</p><ul class="notification-report__list">${communityReportReasons.map(r => `<li><button type="button" class="notification-report__item"><span>${escapeHtml(r)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.293 6.293 10.707 4.88 17.828 12l-7.121 7.12-1.414-1.413L14.999 12z"></path></g></svg></button></li>`).join('')}</ul></div></div>`;
    modal.addEventListener('click', (e) => { if (e.target.classList.contains('notification-dialog__backdrop') || e.target.closest('.notification-dialog__close')) { e.preventDefault(); closeCommunityModal(); return; } if (e.target.closest('.notification-report__item')) { e.preventDefault(); const reason = e.target.closest('.notification-report__item')?.querySelector('span')?.textContent ?? ''; const postId = activeMoreButton?.closest('.postCard')?.dataset.postId; if (memberId && postId) fetch('/api/main/reports', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({reporterId:memberId, targetId:postId, targetType:'post', reason}) }).catch(err => console.error(err)); showCommunityToast('신고가 접수되었습니다'); closeCommunityModal(); } });
    document.body.appendChild(modal); document.body.classList.add('modal-open'); activeCommunityModal = modal;
  }
  function handleMoreDropdownAction(button, actionClass) {
    const { card, handle } = getCommunityUserMeta(button);
    const targetMemberId = card?.dataset.memberId;
    if (actionClass === 'menu-item--follow-toggle') {
      const isF = card?.dataset.isFollowed === 'true';
      if (card) card.dataset.isFollowed = isF ? 'false' : 'true';
      closeMoreDropdown();
      if (memberId && targetMemberId) {
        if (isF) fetch(`/api/main/follows/${memberId}/${targetMemberId}/delete`, { method:'POST' }).catch(err => console.error(err));
        else fetch('/api/main/follows', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({followerId:memberId, followingId:targetMemberId}) }).catch(err => console.error(err));
      }
      showCommunityToast(isF ? `${handle} 님 팔로우를 취소했습니다` : `${handle} 님을 팔로우했습니다`);
      return;
    }
    if (actionClass === 'menu-item--block') { openCommunityBlockModal(button); return; }
    if (actionClass === 'menu-item--report') { openCommunityReportModal(button); return; }
    if (actionClass === 'menu-item--delete') {
      const postId = card?.dataset.postId;
      if (postId && confirm('게시물을 삭제할까요?')) {
        fetch(`/api/main/posts/delete/${postId}`, { method:'POST' }).then(() => { card.remove(); showCommunityToast('게시물이 삭제되었습니다'); }).catch(err => console.error(err));
      }
      closeMoreDropdown();
      return;
    }
  }
  function getMoreDropdownItems(button) {
    const { card, handle } = getCommunityUserMeta(button);
    const targetMemberId = card?.dataset.memberId;
    const isOwner = targetMemberId && targetMemberId == memberId;
    if (isOwner) {
      return [
        { actionClass:'menu-item--delete', label:'게시물 삭제하기', icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"></path></g></svg>' },
      ];
    }
    const isF = card?.dataset.isFollowed === 'true';
    return [
      { actionClass:'menu-item--follow-toggle', label:isF ? `${handle} 님 언팔로우하기` : `${handle} 님 팔로우하기`, icon:isF ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></g></svg>' },
      { actionClass:'menu-item--block', label:`${handle} 님 차단하기`, icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></g></svg>' },
      { actionClass:'menu-item--report', label:'게시물 신고하기', icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg>' },
    ];
  }
  function openMoreDropdown(button) {
    if (!layersRoot) return; closeMoreDropdown(); closeShareDropdown();
    const rect = button.getBoundingClientRect(), top = rect.bottom + window.scrollY + 8, right = Math.max(16, window.innerWidth - rect.right);
    const items = getMoreDropdownItems(button);
    const lc = document.createElement('div'); lc.className = 'layers-dropdown-container';
    lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top:${top}px;right:${right}px;"><div class="dropdown-inner" data-testid="Dropdown">${items.map(it => `<button type="button" role="menuitem" class="menu-item ${it.actionClass}"><span class="menu-item__icon">${it.icon}</span><span class="menu-item__label">${escapeHtml(it.label)}</span></button>`).join('')}</div></div></div>`;
    lc.addEventListener('click', (e) => { const item = e.target.closest('.menu-item'); if (item) { e.preventDefault(); e.stopPropagation(); const ac = Array.from(item.classList).find(c => c.startsWith('menu-item--')) ?? ''; if (activeMoreButton) handleMoreDropdownAction(activeMoreButton, ac); return; } e.stopPropagation(); });
    layersRoot.appendChild(lc); activeMoreDropdown = lc; activeMoreButton = button; button.setAttribute('aria-expanded','true');
  }

  // ===== Global document click =====
  document.addEventListener('click', (e) => {
    // FAB 버튼 → header 게시하기 버튼 시뮬레이션 → 공용 compose-modal 열림.
    if (e.target.closest('[data-compose]')) { e.preventDefault(); document.getElementById("createPostButton")?.click(); return; }

    const likeBtn = e.target.closest('.tweet-action-btn--like');
    if (likeBtn && !likeBtn.closest('[data-community-detail-reply-modal]')) {
      e.stopPropagation();
      // in-flight guard: 동일 버튼이 처리 중이면 무시 (rapid click race 방지)
      if (likeBtn.dataset.inFlight === '1') return;
      likeBtn.dataset.inFlight = '1';
      const on = likeBtn.classList.toggle('active');
      const cnt = likeBtn.querySelector('.tweet-action-count');
      const prevCount = cnt?.textContent?.trim();
      if (cnt && /^\d+$/.test(prevCount)) cnt.textContent = Math.max(0, parseInt(prevCount, 10) + (on ? 1 : -1));
      const likePath = likeBtn.querySelector('path');
      if (likePath) likePath.setAttribute('d', on ? LIKE_PATH_ON : LIKE_PATH_OFF);
      const postId = likeBtn.dataset.postId;
      const rollback = () => {
        likeBtn.classList.toggle('active', !on);
        if (likePath) likePath.setAttribute('d', !on ? LIKE_PATH_ON : LIKE_PATH_OFF);
        if (cnt && prevCount != null) cnt.textContent = prevCount;
      };
      const finish = () => { delete likeBtn.dataset.inFlight; };
      if (postId && memberId) {
        const req = on
          ? fetch('/api/main/likes', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({memberId, postId}) })
          : fetch(`/api/main/likes/posts/${postId}/delete`, { method:'POST' });
        req.then(r => { if (!r.ok) { rollback(); showShareToast('요청을 처리하지 못했습니다. 다시 시도해 주세요.'); console.error('like API failed', r.status); } })
           .catch(err => { rollback(); showShareToast('요청을 처리하지 못했습니다. 다시 시도해 주세요.'); console.error(err); })
           .finally(finish);
      } else { finish(); }
      return;
    }

    const bookmarkBtn = e.target.closest('.tweet-action-btn--bookmark');
    if (bookmarkBtn && !bookmarkBtn.closest('[data-community-detail-reply-modal]')) {
      e.stopPropagation();
      if (bookmarkBtn.dataset.inFlight === '1') return;
      bookmarkBtn.dataset.inFlight = '1';
      const on = bookmarkBtn.classList.toggle('active');
      const bkPath = bookmarkBtn.querySelector('path');
      if (bkPath) bkPath.setAttribute('d', on ? BK_PATH_ON : BK_PATH_OFF);
      const postId = bookmarkBtn.dataset.postId;
      const rollback = () => {
        bookmarkBtn.classList.toggle('active', !on);
        if (bkPath) bkPath.setAttribute('d', !on ? BK_PATH_ON : BK_PATH_OFF);
      };
      const finish = () => { delete bookmarkBtn.dataset.inFlight; };
      if (postId && memberId) {
        const req = on
          ? fetch('/api/main/bookmarks', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({memberId, postId}) })
          : fetch(`/api/main/bookmarks/members/${memberId}/posts/${postId}/delete`, { method:'POST' });
        req.then(r => { if (!r.ok) { rollback(); showShareToast('요청을 처리하지 못했습니다. 다시 시도해 주세요.'); console.error('bookmark API failed', r.status); } })
           .catch(err => { rollback(); showShareToast('요청을 처리하지 못했습니다. 다시 시도해 주세요.'); console.error(err); })
           .finally(finish);
      } else { finish(); }
      return;
    }

    const shareBtn = e.target.closest('.tweet-action-btn--share');
    if (shareBtn && !shareBtn.closest('[data-community-detail-reply-modal]')) {
      e.stopPropagation();
      activeShareButton === shareBtn ? closeShareDropdown() : openShareDropdown(shareBtn);
      return;
    }

    const moreBtn = e.target.closest('.postMoreButton');
    if (moreBtn) { e.stopPropagation(); activeMoreButton === moreBtn ? closeMoreDropdown() : openMoreDropdown(moreBtn); return; }

    if (!e.target.closest('.layers-dropdown-container')) { closeShareDropdown(); closeMoreDropdown(); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeShareDropdown(); closeMoreDropdown(); closeCommunityModal(); closeShareModal(); }
  });
};
