(() => {
    const SVG_LIKE_OFF = "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
    const SVG_LIKE_ON = "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z";
    const SVG_BOOKMARK_OFF = "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z";
    const SVG_BOOKMARK_ON = "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z";

    const MAX_REPLY_LENGTH = 500;

    const newsId = window.newsId;
    const memberId = window.memberId;

    function esc(str) {
        const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return String(str ?? "").replace(/[&<>"']/g, c => map[c] || c);
    }

    function formatCount(n) {
        const num = Number(n) || 0;
        if (num < 1000) return String(num);
        if (num < 1000000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1).replace(/\.0$/, "") + "천";
        return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }

    /** "yyyy-MM-dd HH:mm:ss[.fff]" 문자열 → Date (서버는 KST 그대로 보냄). */
    function parseServerTime(str) {
        if (!str) return null;
        // 마이크로초 부분 제거 후 ISO 변환
        const clean = String(str).replace(/(\.\d+)?$/, "").replace(" ", "T");
        const d = new Date(clean);
        return isNaN(d.getTime()) ? null : d;
    }

    /**
     * 1일 이내는 상대시간(방금 전/X분 전/X시간 전), 그 이후는 yyyy.MM.dd.
     * (서버 DateUtils.toRelativeOrDate 와 동일 로직)
     */
    function formatRelativeOrDate(str) {
        const d = parseServerTime(str);
        if (!d) return "";
        const diffSec = Math.max(0, (Date.now() - d.getTime()) / 1000);
        if (diffSec < 60) return "방금 전";
        const m = Math.floor(diffSec / 60);
        if (m < 60) return m + "분 전";
        const h = Math.floor(m / 60);
        if (h < 24) return h + "시간 전";
        const yyyy = d.getFullYear();
        const MM = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}.${MM}.${dd}`;
    }

    function showToast(message) {
        const toast = document.getElementById("newsToast");
        if (!toast) return;
        toast.textContent = message;
        toast.hidden = false;
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => { toast.hidden = true; }, 2400);
    }

    function setActionPath(button, active) {
        const path = button?.querySelector("path");
        if (!path) return;
        const next = active ? path.dataset.pathActive : path.dataset.pathInactive;
        if (next) path.setAttribute("d", next);
    }

    function setActionCount(button, count) {
        const span = button?.querySelector(".tweet-action-count");
        if (span) span.textContent = formatCount(count);
    }

    // ── 액션바 ──
    function initActionBar() {
        const likeBtn = document.querySelector(".post-detail-action-button-like");
        const bookmarkBtn = document.querySelector(".post-detail-action-button-bookmark");
        const replyBtn = document.querySelector('.post-detail-actions [data-testid="reply"]');
        const shareBtn = document.querySelector(".tweet-action-btn-share");

        if (likeBtn) {
            likeBtn.addEventListener("click", async () => {
                if (!memberId) { showToast("로그인이 필요합니다."); return; }
                try {
                    const res = await fetch(`/api/news/${newsId}/likes`, { method: "POST" });
                    if (!res.ok) throw new Error("like failed");
                    const data = await res.json();
                    likeBtn.classList.toggle("active", data.liked);
                    setActionPath(likeBtn, data.liked);
                    setActionCount(likeBtn, data.likeCount);
                } catch (e) {
                    console.error(e);
                    showToast("좋아요 처리에 실패했습니다.");
                }
            });
        }

        if (bookmarkBtn) {
            bookmarkBtn.addEventListener("click", async () => {
                if (!memberId) { showToast("로그인이 필요합니다."); return; }
                try {
                    const res = await fetch(`/api/news/${newsId}/bookmarks`, { method: "POST" });
                    if (!res.ok) throw new Error("bookmark failed");
                    const data = await res.json();
                    bookmarkBtn.classList.toggle("active", data.bookmarked);
                    setActionPath(bookmarkBtn, data.bookmarked);
                    showToast(data.bookmarked ? "북마크에 추가했습니다." : "북마크를 해제했습니다.");
                } catch (e) {
                    console.error(e);
                    showToast("북마크 처리에 실패했습니다.");
                }
            });
        }

        if (replyBtn) {
            replyBtn.addEventListener("click", () => {
                const editor = document.querySelector(".post-detail-inline-reply-editor");
                editor?.focus();
                editor?.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        }

        if (shareBtn) {
            initShareDropdown(shareBtn);
        }
    }

    // ── 공유 드롭다운 (post-detailed 패턴과 동일) ──
    function initShareDropdown(shareBtn) {
        let activeDrop = null;

        const close = () => {
            activeDrop?.remove();
            activeDrop = null;
            shareBtn.setAttribute("aria-expanded", "false");
        };

        shareBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (activeDrop) { close(); return; }

            const rect = shareBtn.getBoundingClientRect();
            const lc = document.createElement("div");
            lc.className = "layers-dropdown-container";
            lc.innerHTML =
                '<div class="layers-overlay"></div>' +
                '<div class="layers-dropdown-inner">' +
                '<div role="menu" class="dropdown-menu" style="top:' + (rect.bottom + 8) + 'px;right:' + (window.innerWidth - rect.right) + 'px;display:flex;">' +
                '<div><div class="dropdown-inner">' +
                '<button type="button" class="menu-item share-menu-item--copy">' +
                '<span class="menu-item__icon"><svg viewBox="0 0 24 24"><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></svg></span>' +
                '<span class="menu-item__label">링크 복사하기</span>' +
                '</button>' +
                '</div></div></div></div>';

            lc.addEventListener("click", async (ev) => {
                const item = ev.target.closest(".menu-item");
                if (!item) return;
                ev.preventDefault();
                ev.stopPropagation();
                if (item.classList.contains("share-menu-item--copy")) {
                    if (!navigator.clipboard?.writeText) {
                        showToast("이 브라우저에서는 링크 복사를 지원하지 않습니다.");
                    } else {
                        try {
                            await navigator.clipboard.writeText(window.location.href);
                            showToast("링크가 복사되었습니다.");
                        } catch (err) {
                            showToast("링크 복사에 실패했습니다.");
                        }
                    }
                }
                close();
            });

            document.body.appendChild(lc);
            activeDrop = lc;
            shareBtn.setAttribute("aria-expanded", "true");
        });

        document.addEventListener("click", (e) => {
            if (!activeDrop) return;
            if (e.target === shareBtn || shareBtn.contains(e.target)) return;
            if (activeDrop.contains(e.target)) return;
            close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") close();
        });

        window.addEventListener("scroll", () => close(), { passive: true });
    }

    // ── 인라인 답글 작성기 ──
    function initComposer() {
        const editor = document.querySelector(".post-detail-inline-reply-editor");
        const submit = document.querySelector("[data-reply-submit]");
        const gauge = document.querySelector("[data-reply-gauge]");
        const gaugeText = document.querySelector("[data-reply-gauge-text]");
        if (!editor || !submit) return;

        const updateGauge = () => {
            const text = editor.textContent || "";
            const len = text.length;
            const trimmedLen = text.trim().length;
            const remaining = MAX_REPLY_LENGTH - len;

            if (gauge) {
                gauge.setAttribute("aria-valuenow", String(len));
                const ratio = Math.min(len / MAX_REPLY_LENGTH, 1);
                const fillColor = remaining < 0 ? "#f4212e" : (remaining <= 20 ? "#ffad1f" : "#1d9bf0");
                gauge.style.background = "conic-gradient(" + fillColor + " " + (ratio * 360) + "deg, #d7dfe4 0deg)";
                if (remaining <= 20) gauge.classList.add("composerGauge--warn");
                else gauge.classList.remove("composerGauge--warn");
                if (remaining < 0) gauge.classList.add("composerGauge--over");
                else gauge.classList.remove("composerGauge--over");
            }
            if (gaugeText) {
                gaugeText.textContent = String(remaining);
                if (remaining < 0) gaugeText.style.color = "rgb(244, 33, 46)";
                else if (remaining <= 20) gaugeText.style.color = "rgb(255, 173, 31)";
                else gaugeText.style.color = "";
            }
            submit.disabled = trimmedLen === 0 || len > MAX_REPLY_LENGTH;
        };

        editor.addEventListener("input", updateGauge);
        editor.addEventListener("blur", updateGauge);
        updateGauge();

        editor.addEventListener("paste", (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData)?.getData("text") ?? "";
            document.execCommand("insertText", false, text);
        });

        submit.addEventListener("click", async () => {
            if (!memberId) { showToast("로그인이 필요합니다."); return; }
            const content = (editor.textContent || "").trim();
            if (!content) return;
            submit.disabled = true;
            try {
                const res = await fetch(`/api/news/${newsId}/replies`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content })
                });
                if (!res.ok) throw new Error("write failed");
                const data = await res.json();
                editor.textContent = "";
                updateGauge();
                showToast("답글을 게시했습니다.");
                updateReplyCount(data.replyCount);
                await loadReplies(currentSort);
            } catch (e) {
                console.error(e);
                showToast("답글 게시에 실패했습니다.");
                submit.disabled = false;
            }
        });
    }

    function updateReplyCount(count) {
        const replyBtn = document.querySelector('.post-detail-actions [data-testid="reply"]');
        setActionCount(replyBtn, count);
    }

    // ── 답글 카드 빌더 ──
    function buildReplyCard(r) {
        const profile = r.memberProfileFileName
            ? esc(r.memberProfileFileName)
            : "/images/profile/default_image.png";
        const handle = r.memberHandle ? esc(r.memberHandle) : "";
        const name = esc(r.memberName || r.memberHandle || "사용자");
        // 표기 시간: 수정된 적이 있으면 updated_datetime, 아니면 created_datetime
        const isEdited = !!(r.createdDatetime && r.updatedDatetime && r.updatedDatetime > r.createdDatetime);
        const displayTimeRaw = isEdited ? r.updatedDatetime : r.createdDatetime;
        const time = esc(formatRelativeOrDate(displayTimeRaw));
        const content = esc(r.content || "");
        const likeCount = formatCount(r.likeCount || 0);
        const liked = !!r.liked;
        const isAuthor = memberId && r.memberId === memberId;

        return `
        <article class="postCard" data-reply-id="${r.id}" data-member-id="${r.memberId}">
            <div class="postBody">
                <header class="postHeader">
                    <div class="postIdentity">
                        <div class="postAvatar postAvatar--image">
                            <img src="${profile}" alt="프로필" onerror="this.src='/images/profile/default_image.png'"/>
                        </div>
                        <div class="postIdentity__copy">
                            <div class="postIdentity__nameRow">
                                <strong class="postName">${name}</strong>
                            </div>
                            <div class="postIdentity__metaRow">
                                <span class="postHandle">${handle}</span>
                                <span class="postIdentity__sep">·</span>
                                <span class="postTime" data-reply-time>${time}${isEdited ? ' <span class="reply-edited-flag">(수정됨)</span>' : ''}</span>
                            </div>
                        </div>
                    </div>
                    ${isAuthor ? `
                    <div class="post-detail-more-wrap">
                        <button class="postMoreButton" type="button" aria-label="더 보기" aria-haspopup="menu" aria-expanded="false" data-action="reply-more">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
                        </button>
                        <div class="dropdown-menu post-detail-reply-more-menu" role="menu" hidden>
                            <button type="button" class="dropdown-item post-detail-reply-more-edit" role="menuitem" data-action="reply-edit">수정</button>
                            <button type="button" class="dropdown-item post-detail-reply-more-delete" role="menuitem" data-action="reply-delete">삭제</button>
                        </div>
                    </div>` : ""}
                </header>
                <p class="postText" data-reply-text>${content}</p>
                <div class="post-detail-actions post-detail-actions--reply">
                    <button class="reply-action reply-action--like ${liked ? "is-active" : ""}" type="button" data-action="reply-like" aria-label="좋아요">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path data-path-inactive="${SVG_LIKE_OFF}" data-path-active="${SVG_LIKE_ON}" d="${liked ? SVG_LIKE_ON : SVG_LIKE_OFF}"></path>
                        </svg>
                        <span class="reply-action__count tweet-action-count">${likeCount}</span>
                    </button>
                    <div class="reply-share-wrap">
                        <button class="reply-action reply-action--share" type="button" data-action="reply-share-open" aria-haspopup="menu" aria-expanded="false" aria-label="공유">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
                            </svg>
                        </button>
                        <div class="dropdown-menu reply-share-menu" role="menu" hidden>
                            <button type="button" class="dropdown-item reply-share-item" role="menuitem" data-action="reply-share-link">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></svg>
                                <span>링크 복사하기</span>
                            </button>
                            <button type="button" class="dropdown-item reply-share-item" role="menuitem" data-action="reply-share-content">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 2H8c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-3h2c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4 18H4V9h2v8c0 1.1.9 2 2 2h7v1zm4-5H8V4h11v11z"></path></svg>
                                <span>내용 복사하기</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>`;
    }

    // ── 답글 목록 로드 ──
    let currentSort = "latest";

    async function loadReplies(sort) {
        currentSort = sort || "latest";
        const container = document.getElementById("newsReplies");
        if (!container) return;
        try {
            const res = await fetch(`/api/news/${newsId}/replies?sort=${currentSort}`);
            if (!res.ok) throw new Error("load failed");
            const list = await res.json();
            if (!list || list.length === 0) {
                container.innerHTML = `<div class="post-detail-replies-empty">아직 답글이 없습니다.</div>`;
                return;
            }
            container.innerHTML = list.map(buildReplyCard).join("");
        } catch (e) {
            console.error(e);
            container.innerHTML = `<div class="post-detail-replies-empty">답글을 불러오지 못했습니다.</div>`;
        }
    }

    function closeAllReplyMenus(except) {
        document.querySelectorAll(".post-detail-reply-more-menu").forEach(menu => {
            if (menu === except) return;
            menu.hidden = true;
            const trigger = menu.parentElement?.querySelector(".postMoreButton");
            trigger?.setAttribute("aria-expanded", "false");
        });
    }

    function closeAllReplyShareMenus(except) {
        document.querySelectorAll(".reply-share-menu").forEach(menu => {
            if (menu === except) return;
            menu.hidden = true;
            const trigger = menu.parentElement?.querySelector('[data-action="reply-share-open"]');
            trigger?.setAttribute("aria-expanded", "false");
        });
    }

    // 인라인 수정 폼: 동일 카드의 텍스트 영역을 textarea + 버튼 두 개로 교체한다.
    function enterReplyEdit(card) {
        if (!card) return;
        if (card.querySelector("[data-reply-edit-form]")) return;
        const textEl = card.querySelector("[data-reply-text]");
        if (!textEl) return;
        const original = textEl.textContent || "";
        const replyId = card.dataset.replyId;

        const form = document.createElement("div");
        form.className = "post-detail-reply-edit";
        form.dataset.replyEditForm = "true";
        form.innerHTML = `
            <textarea class="post-detail-reply-edit-input" maxlength="500">${esc(original)}</textarea>
            <div class="post-detail-reply-edit-actions">
                <button type="button" class="post-detail-reply-edit-cancel" data-action="reply-edit-cancel">취소</button>
                <button type="button" class="post-detail-reply-edit-save" data-action="reply-edit-save">저장</button>
            </div>
        `;
        textEl.hidden = true;
        textEl.after(form);

        const textarea = form.querySelector("textarea");
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        // 주의: form 자체에 data-reply-id를 두지 않는다. closest("[data-reply-id]") 가 article 대신 form 을 잡아 저장 로직이 깨진다.
        form.dataset.replyEditFor = replyId;
        form.dataset.original = original;
    }

    function exitReplyEdit(card, nextText) {
        if (!card) return;
        const form = card.querySelector("[data-reply-edit-form]");
        const textEl = card.querySelector("[data-reply-text]");
        if (form) form.remove();
        if (textEl) {
            if (typeof nextText === "string") textEl.textContent = nextText;
            textEl.hidden = false;
        }
    }

    // ── 답글 카드 동작 (위임) ──
    function initReplyDelegation() {
        const container = document.getElementById("newsReplies");
        if (!container) return;

        container.addEventListener("click", async (e) => {
            const actionEl = e.target.closest('[data-action]');
            const action = actionEl?.dataset.action;
            const likeBtn = action === "reply-like" ? actionEl : null;
            const moreBtn = action === "reply-more" ? actionEl : null;
            const editBtn = action === "reply-edit" ? actionEl : null;
            const editCancelBtn = action === "reply-edit-cancel" ? actionEl : null;
            const editSaveBtn = action === "reply-edit-save" ? actionEl : null;
            const deleteBtn = action === "reply-delete" ? actionEl : null;
            const shareOpenBtn = action === "reply-share-open" ? actionEl : null;
            const shareLinkBtn = action === "reply-share-link" ? actionEl : null;
            const shareContentBtn = action === "reply-share-content" ? actionEl : null;

            if (shareOpenBtn) {
                e.stopPropagation();
                const wrap = shareOpenBtn.closest(".reply-share-wrap");
                const menu = wrap?.querySelector(".reply-share-menu");
                if (!menu) return;
                const willOpen = menu.hidden;
                closeAllReplyShareMenus(willOpen ? menu : null);
                menu.hidden = !willOpen;
                shareOpenBtn.setAttribute("aria-expanded", String(willOpen));
                return;
            }

            const copyAndToast = async (text, okMsg) => {
                if (!navigator.clipboard?.writeText) {
                    showToast("이 브라우저에서는 복사를 지원하지 않습니다.");
                    return;
                }
                try {
                    await navigator.clipboard.writeText(text);
                    showToast(okMsg);
                } catch {
                    showToast("복사에 실패했습니다.");
                }
            };

            if (shareLinkBtn) {
                e.stopPropagation();
                closeAllReplyShareMenus(null);
                await copyAndToast(window.location.href, "링크가 복사되었습니다.");
                return;
            }

            if (shareContentBtn) {
                e.stopPropagation();
                closeAllReplyShareMenus(null);
                const card = shareContentBtn.closest("article[data-reply-id]");
                const text = card?.querySelector("[data-reply-text]")?.textContent || "";
                await copyAndToast(text, "내용이 복사되었습니다.");
                return;
            }

            if (likeBtn) {
                if (!memberId) { showToast("로그인이 필요합니다."); return; }
                const card = likeBtn.closest("[data-reply-id]");
                const replyId = card?.dataset.replyId;
                if (!replyId) return;
                try {
                    const res = await fetch(`/api/news/replies/${replyId}/likes`, { method: "POST" });
                    if (!res.ok) throw new Error("reply like failed");
                    const data = await res.json();
                    likeBtn.classList.toggle("is-active", data.liked);
                    setActionPath(likeBtn, data.liked);
                    const span = likeBtn.querySelector(".tweet-action-count");
                    if (span) {
                        const cur = parseInt(span.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                        span.textContent = formatCount(data.liked ? cur + 1 : Math.max(0, cur - 1));
                    }
                } catch (err) {
                    console.error(err);
                    showToast("좋아요 처리에 실패했습니다.");
                }
                return;
            }

            if (moreBtn) {
                e.stopPropagation();
                const wrap = moreBtn.closest(".post-detail-more-wrap");
                const menu = wrap?.querySelector(".post-detail-reply-more-menu");
                if (!menu) return;
                const willOpen = menu.hidden;
                closeAllReplyMenus(willOpen ? menu : null);
                menu.hidden = !willOpen;
                moreBtn.setAttribute("aria-expanded", String(willOpen));
                return;
            }

            if (editBtn) {
                e.stopPropagation();
                closeAllReplyMenus(null);
                const card = editBtn.closest("[data-reply-id]");
                enterReplyEdit(card);
                return;
            }

            if (editCancelBtn) {
                e.stopPropagation();
                const card = editCancelBtn.closest("[data-reply-id]");
                exitReplyEdit(card);
                return;
            }

            if (editSaveBtn) {
                e.stopPropagation();
                const form = editSaveBtn.closest("[data-reply-edit-form]");
                const card = form?.closest("article[data-reply-id]");
                const textarea = form?.querySelector("textarea");
                const replyId = form?.dataset.replyEditFor;
                if (!form || !card || !textarea || !replyId) return;
                const next = textarea.value.trim();
                if (!next) { showToast("내용을 입력해주세요."); return; }
                if (next === form.dataset.original?.trim()) { exitReplyEdit(card); return; }
                editSaveBtn.disabled = true;
                try {
                    const res = await fetch(`/api/news/replies/${replyId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: next })
                    });
                    if (!res.ok) throw new Error("update failed");
                    const data = await res.json();
                    exitReplyEdit(card, data.content ?? next);
                    // 시간 라벨: 방금 수정됐으니 "방금 전 (수정됨)"
                    const timeEl = card.querySelector("[data-reply-time]");
                    if (timeEl) {
                        timeEl.innerHTML = `·&nbsp;방금 전 <span class="reply-edited-flag">(수정됨)</span>`;
                    }
                    showToast("답글을 수정했습니다.");
                } catch (err) {
                    console.error(err);
                    showToast("답글 수정에 실패했습니다.");
                    editSaveBtn.disabled = false;
                }
                return;
            }

            if (deleteBtn) {
                e.stopPropagation();
                const card = deleteBtn.closest("[data-reply-id]");
                const replyId = card?.dataset.replyId;
                if (!replyId) return;
                closeAllReplyMenus(null);
                if (!confirm("이 답글을 삭제하시겠습니까?")) return;
                try {
                    const res = await fetch(`/api/news/replies/${replyId}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("delete failed");
                    showToast("답글을 삭제했습니다.");
                    await loadReplies(currentSort);
                    const replyBtn = document.querySelector('.post-detail-actions [data-testid="reply"]');
                    const span = replyBtn?.querySelector(".tweet-action-count");
                    if (span) {
                        const cur = parseInt(span.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                        span.textContent = formatCount(Math.max(0, cur - 1));
                    }
                } catch (err) {
                    console.error(err);
                    showToast("답글 삭제에 실패했습니다.");
                }
            }
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".post-detail-reply-more-menu") &&
                !e.target.closest('[data-action="reply-more"]')) {
                closeAllReplyMenus(null);
            }
            if (!e.target.closest(".reply-share-menu") &&
                !e.target.closest('[data-action="reply-share-open"]')) {
                closeAllReplyShareMenus(null);
            }
        });
    }

    // ── 정렬 드롭다운 ──
    function initSortDropdown() {
        const wrap = document.querySelector(".post-detail-sort");
        const trigger = wrap?.querySelector(".post-detail-sort-button");
        const menu = wrap?.querySelector(".post-detail-sort-menu");
        if (!wrap || !trigger || !menu) return;

        const triggerLabel = trigger.querySelector("span");

        const markActiveItem = (sort) => {
            menu.querySelectorAll("[data-sort]").forEach(btn => {
                btn.classList.toggle("active", btn.dataset.sort === sort);
            });
        };

        const close = () => {
            menu.hidden = true;
            trigger.setAttribute("aria-expanded", "false");
            trigger.classList.remove("is-open");
        };
        const open = () => {
            menu.hidden = false;
            trigger.setAttribute("aria-expanded", "true");
            trigger.classList.add("is-open");
            markActiveItem(trigger.dataset.sort || "latest");
        };

        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.hidden ? open() : close();
        });

        menu.addEventListener("click", async (e) => {
            const item = e.target.closest("[data-sort]");
            if (!item) return;
            const sort = item.dataset.sort;
            if (triggerLabel) triggerLabel.textContent = sort === "popular" ? "인기순" : "최신순";
            trigger.dataset.sort = sort;
            markActiveItem(sort);
            close();
            await loadReplies(sort);
        });

        document.addEventListener("click", (e) => {
            if (!wrap.contains(e.target)) close();
        });
    }

    // ── 뒤로 가기 ──
    function initBack() {
        const backBtn = document.getElementById("newsBackButton");
        if (!backBtn) return;
        backBtn.addEventListener("click", () => {
            if (window.history.length > 1) window.history.back();
            else window.location.href = "/explore?tab=news";
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initBack();
        initActionBar();
        initComposer();
        initReplyDelegation();
        initSortDropdown();
        loadReplies("latest");
    });
})();
