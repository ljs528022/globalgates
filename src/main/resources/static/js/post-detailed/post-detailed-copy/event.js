window.onload = () => {

    const SVG = layout.SVG;
    const esc = layout.esc;

    // ── 유틸 ──
    function showToast(msg) {
        const t = document.getElementById("postDetailMoreToast");
        if (!t) return;
        t.textContent = msg;
        t.hidden = false;
        clearTimeout(t._timer);
        t._timer = setTimeout(function() { t.hidden = true; }, 3000);
    }

    function getCardMeta(el) {
        const card = el.closest("[data-post-card]");
        if (!card) return null;
        return {
            card: card,
            postId: card.dataset.postId,
            targetMemberId: card.dataset.memberId,
            handle: card.querySelector(".postHandle")?.textContent?.trim() || "@user",
            name: card.querySelector(".postName")?.textContent?.trim() || ""
        };
    }

    function syncPath(btn, active) {
        const p = btn ? btn.querySelector("path") : null;
        if (!p) return;
        p.setAttribute("d", active ? (p.dataset.pathActive || p.getAttribute("d")) : (p.dataset.pathInactive || p.getAttribute("d")));
    }

    // ══════════════════════════════════════════════════
    // ── 1. 인라인 답글 작성기 ──
    // ══════════════════════════════════════════════════
    const overlay = document.querySelector(".post-detail-inline-reply");
    const replyBox = document.querySelector(".post-detail-reply-box");
    const composeView = overlay ? overlay.querySelector(".post-detail-inline-reply-card") : null;
    const locationView = replyBox ? replyBox.querySelector(".tweet-modal__location-view") : null;
    const inlineEditor = overlay ? overlay.querySelector(".post-detail-inline-reply-editor") : null;
    const inlineSubmit = overlay ? overlay.querySelector(".tweet-modal__submit") : null;
    const inlineGaugeText = overlay ? overlay.querySelector(".composerGaugeText") : null;
    const inlineMaxLength = 500;

    let selectedLocation = null;
    let attachedFiles = [];
    let attachedUrls = [];
    let savedRange = null;
    let ps = null;

    // 서브뷰 전환 (위치 선택 ↔ 작성기)
    function showSubView(view) {
        if (composeView) composeView.classList.add("off");
        if (locationView) { locationView.classList.add("off"); locationView.removeAttribute("hidden"); }
        if (view) { view.classList.remove("off"); view.removeAttribute("hidden"); }
    }
    function backToCompose() {
        if (locationView) locationView.classList.add("off");
        if (composeView) composeView.classList.remove("off");
    }

    // 위치 검색 (카카오맵)
    const geoBtn = overlay ? overlay.querySelector(".tweet-modal__tool-btn--geo") : null;
    const locationList = locationView ? locationView.querySelector("[data-location-list]") : null;
    const locationSearchInput = locationView ? locationView.querySelector("[data-location-search]") : null;
    const locationSearchBtn = locationView ? locationView.querySelector("[data-location-search-btn]") : null;
    const locationClose = locationView ? locationView.querySelector(".tweet-modal__location-close") : null;
    const locationDeleteBtn = locationView ? locationView.querySelector("[data-location-delete]") : null;
    const locationCompleteBtn = locationView ? locationView.querySelector("[data-location-complete]") : null;
    const locationDisplay = overlay ? overlay.querySelector(".tweet-modal__location-display") : null;
    const locationDisplayText = locationDisplay ? locationDisplay.querySelector(".tweet-modal__location-display-text-inner") : null;

    function updateLocationUI() {
        if (locationDisplay && locationDisplayText) {
            if (selectedLocation) {
                locationDisplayText.value = selectedLocation;
                locationDisplay.removeAttribute("hidden");
            } else {
                locationDisplayText.value = "";
                locationDisplay.setAttribute("hidden", "");
            }
        }
        if (locationDeleteBtn) locationDeleteBtn.hidden = !selectedLocation;
        if (locationCompleteBtn) locationCompleteBtn.disabled = !selectedLocation;
    }

    function searchPlaces() {
        let keyword = locationSearchInput ? locationSearchInput.value : "";
        if (!keyword.replace(/^\s+|\s+$/g, '')) { alert('키워드를 입력해주세요!'); return false; }
        if (!ps) ps = new kakao.maps.services.Places();
        ps.keywordSearch(keyword, function(datas, status) {
            if (status === kakao.maps.services.Status.OK) {
                const addressNameSet = new Set();
                datas.forEach(function(data) {
                    let addressName = data.address_name;
                    const addressNames = addressName.split(" ");
                    const lastPart = addressNames[addressNames.length - 1];
                    if (/^[0-9-]+$/.test(lastPart)) addressName = addressNames.slice(0, -1).join(" ");
                    addressNameSet.add(addressName);
                });
                let html = '';
                addressNameSet.forEach(function(addressName) {
                    html += '<button type="button" class="tweet-modal__location-item"><span class="tweet-modal__location-item-label">' + addressName + '</span><span class="tweet-modal__location-item-check"></span></button>';
                });
                if (locationList) locationList.innerHTML = html;
            } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                alert('검색 결과가 존재하지 않습니다.');
            } else if (status === kakao.maps.services.Status.ERROR) {
                alert('검색 결과 중 오류가 발생했습니다.');
            }
        });
    }

    if (geoBtn && locationView) {
        geoBtn.addEventListener("click", function() {
            showSubView(locationView);
            if (locationSearchInput) locationSearchInput.value = '';
            if (locationList) locationList.innerHTML = '';
            updateLocationUI();
        });
    }
    if (locationSearchBtn) locationSearchBtn.addEventListener("click", function() { searchPlaces(); });
    if (locationSearchInput) locationSearchInput.addEventListener("keyup", function(e) { if (e.key === "Enter") searchPlaces(); });
    if (locationList) {
        locationList.addEventListener("click", function(e) {
            let item = e.target.closest(".tweet-modal__location-item");
            if (!item) return;
            let allItems = locationList.querySelectorAll(".tweet-modal__location-item");
            for (let i = 0; i < allItems.length; i++) allItems[i].classList.remove("isSelected");
            item.classList.add("isSelected");
            selectedLocation = item.querySelector(".tweet-modal__location-item-label").textContent;
            updateLocationUI();
            backToCompose();
        });
    }
    if (locationDeleteBtn) {
        locationDeleteBtn.addEventListener("click", function() {
            selectedLocation = null;
            updateLocationUI();
            if (locationList) {
                let allItems = locationList.querySelectorAll(".tweet-modal__location-item");
                for (let i = 0; i < allItems.length; i++) allItems[i].classList.remove("isSelected");
            }
            backToCompose();
        });
    }
    if (locationCompleteBtn) locationCompleteBtn.addEventListener("click", function() { backToCompose(); });
    if (locationClose) locationClose.addEventListener("click", function() { backToCompose(); });

    // 볼드/이탤릭
    const boldBtn = overlay ? overlay.querySelector(".tweet-modal__tool-btn--bold") : null;
    const italicBtn = overlay ? overlay.querySelector(".tweet-modal__tool-btn--italic") : null;

    function syncFormatButtons() {
        if (boldBtn) boldBtn.classList.toggle("active", document.queryCommandState("bold"));
        if (italicBtn) italicBtn.classList.toggle("active", document.queryCommandState("italic"));
    }
    if (boldBtn && inlineEditor) boldBtn.addEventListener("click", function() { inlineEditor.focus(); document.execCommand("bold"); syncFormatButtons(); });
    if (italicBtn && inlineEditor) italicBtn.addEventListener("click", function() { inlineEditor.focus(); document.execCommand("italic"); syncFormatButtons(); });
    if (inlineEditor) {
        inlineEditor.addEventListener("keyup", syncFormatButtons);
        inlineEditor.addEventListener("mouseup", syncFormatButtons);
    }

    // 이모지 피커
    const emojiBtn = overlay ? overlay.querySelector(".tweet-modal__tool-btn--emoji") : null;

    function saveCursorRange() {
        let sel = window.getSelection();
        if (sel.rangeCount > 0 && inlineEditor.contains(sel.anchorNode)) {
            savedRange = sel.getRangeAt(0).cloneRange();
        }
    }

    if (inlineEditor) {
        inlineEditor.addEventListener("keyup", saveCursorRange);
        inlineEditor.addEventListener("mouseup", saveCursorRange);
        inlineEditor.addEventListener("input", saveCursorRange);
    }

    function insertEmojiToEditor(emoji) {
        if (!inlineEditor) return;
        inlineEditor.focus();
        let sel = window.getSelection();
        if (savedRange && inlineEditor.contains(savedRange.startContainer)) {
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }
        let textNode = document.createTextNode(emoji);
        if (sel.rangeCount > 0 && inlineEditor.contains(sel.getRangeAt(0).startContainer)) {
            let range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            inlineEditor.appendChild(textNode);
            let range = document.createRange();
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        savedRange = sel.getRangeAt(0).cloneRange();
        inlineEditor.dispatchEvent(new Event("input"));
    }

    if (emojiBtn && inlineEditor) {
        let picker = new EmojiButton({ position: "top-start", rootElement: overlay });
        picker.on("emoji", function(emoji) { insertEmojiToEditor(emoji); });
        emojiBtn.addEventListener("click", function() { picker.togglePicker(emojiBtn); });
    }

    // 파일 첨부 (이미지/동영상 1개)
    const fileBtn = overlay ? overlay.querySelector(".tweet-modal__tool-file .tweet-modal__tool-btn") : null;
    const imageInput = overlay ? overlay.querySelector(".tweet-modal__file-input") : null;
    const attachmentPreview = overlay ? overlay.querySelector("[data-attachment-preview]") : null;
    const attachmentMedia = overlay ? overlay.querySelector("[data-attachment-media]") : null;

    if (fileBtn && imageInput) fileBtn.addEventListener("click", function() { imageInput.click(); });

    function makeImageCell(index, url, cls) {
        return '<div class="media-cell ' + cls + '"><div class="media-cell-inner"><div class="media-img-container"><div class="media-bg" style="background-image:url(\'' + url + '\');"></div><img src="' + url + '" class="media-img" /></div><button type="button" class="media-btn-delete" data-remove-index="' + index + '"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div>';
    }

    function updateAttachmentView() {
        if (attachedFiles.length === 0) {
            if (attachmentPreview) attachmentPreview.setAttribute("hidden", "");
            if (attachmentMedia) attachmentMedia.innerHTML = "";
            return;
        }
        if (attachmentPreview) attachmentPreview.removeAttribute("hidden");
        if (attachedFiles[0].type.includes("video")) {
            let url = attachedUrls[0];
            let file = attachedFiles[0];
            if (attachmentMedia) attachmentMedia.innerHTML = '<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer"><div class="media-cell media-cell--single"><div class="media-cell-inner"><div class="media-img-container"><video class="tweet-modal__attachment-video" controls><source src="' + url + '" type="' + file.type + '"></video></div><button type="button" class="media-btn-delete" data-remove-index="0"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div></div>';
        } else {
            if (attachmentMedia) attachmentMedia.innerHTML = '<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer">' + makeImageCell(0, attachedUrls[0], "media-cell--single") + '</div>';
        }
    }

    if (imageInput && attachmentPreview && attachmentMedia) {
        imageInput.addEventListener("change", function(e) {
            let files = e.target.files;
            if (files.length === 0) return;
            let file = files[0];
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.addEventListener("load", function(ev) {
                attachedFiles = [file];
                attachedUrls = [ev.target.result];
                imageInput.value = "";
                updateAttachmentView();
            });
        });
        attachmentMedia.addEventListener("click", function(e) {
            if (e.target.closest("[data-remove-index]")) {
                attachedFiles = [];
                attachedUrls = [];
                updateAttachmentView();
            }
        });
    }

    // 글자수 카운터 + 제출
    if (inlineSubmit) inlineSubmit.disabled = true;

    if (inlineEditor) {
        inlineEditor.addEventListener("input", function() {
            let length = inlineEditor.textContent.length;
            let remaining = inlineMaxLength - length;
            if (inlineGaugeText) {
                inlineGaugeText.textContent = remaining;
                if (remaining < 0) inlineGaugeText.style.color = "rgb(244, 33, 46)";
                else if (remaining < 20) inlineGaugeText.style.color = "rgb(255, 173, 31)";
                else inlineGaugeText.style.color = "";
            }
            if (inlineSubmit) inlineSubmit.disabled = (length === 0 || remaining < 0);
        });
    }

    if (inlineSubmit) {
        inlineSubmit.addEventListener("click", async function(e) {
            e.preventDefault();
            let text = inlineEditor ? inlineEditor.textContent.trim() : "";
            if (!text) return;

            let formData = new FormData();
            formData.append("memberId", memberId);
            formData.append("postContent", text);
            if (selectedLocation) formData.append("location", selectedLocation);
            if (attachedFiles.length > 0) {
                for (let i = 0; i < attachedFiles.length; i++) formData.append("files", attachedFiles[i]);
            }

            await service.writeReply(postId, formData);

            inlineEditor.innerHTML = "";
            if (inlineSubmit) inlineSubmit.disabled = true;
            if (inlineGaugeText) { inlineGaugeText.textContent = inlineMaxLength; inlineGaugeText.style.color = ""; }
            attachedFiles = [];
            attachedUrls = [];
            if (attachmentPreview) attachmentPreview.setAttribute("hidden", "");
            if (attachmentMedia) attachmentMedia.innerHTML = "";
            if (imageInput) imageInput.value = "";
            selectedLocation = null;
            updateLocationUI();
            if (boldBtn) boldBtn.classList.remove("active");
            if (italicBtn) italicBtn.classList.remove("active");

            await service.getReplies(postId, memberId, layout.showReplies);
        });
    }

    // ══════════════════════════════════════════════════
    // ── 2. 좋아요 토글 (이벤트 위임) ──
    // ══════════════════════════════════════════════════
    document.addEventListener("click", async function(e) {
        const btn = e.target.closest(".tweet-action-btn--like");
        if (!btn) return;
        e.preventDefault();
        const meta = getCardMeta(btn);
        if (!meta) return;
        const isActive = btn.classList.contains("active");
        const countEl = btn.querySelector(".tweet-action-count");
        let count = parseInt(countEl ? countEl.textContent : "0");

        if (isActive) {
            await service.deleteLike(memberId, meta.postId);
            btn.classList.remove("active");
            if (countEl) countEl.textContent = count - 1;
        } else {
            await service.addLike(memberId, meta.postId);
            btn.classList.add("active");
            if (countEl) countEl.textContent = count + 1;
        }
        syncPath(btn, !isActive);
    });

    // ── 4. 북마크 토글 (이벤트 위임) ──
    document.addEventListener("click", async function(e) {
        const btn = e.target.closest(".tweet-action-btn--bookmark");
        if (!btn) return;
        e.preventDefault();
        const meta = getCardMeta(btn);
        if (!meta) return;
        const isActive = btn.classList.contains("active");

        if (isActive) {
            await service.deleteBookmark(memberId, meta.postId);
            btn.classList.remove("active");
        } else {
            await service.addBookmark(memberId, meta.postId);
            btn.classList.add("active");
        }
        syncPath(btn, !isActive);
    });

    // ── 5. 공유 드롭다운 (이벤트 위임) ──
    const layers = document.getElementById("layers");
    let activeShareDrop = null;
    let activeShareBtn = null;

    function closeShareDrop() {
        if (activeShareDrop) activeShareDrop.remove();
        activeShareDrop = null;
        activeShareBtn = null;
    }

    document.addEventListener("click", function(e) {
        const btn = e.target.closest(".tweet-action-btn--share");
        if (!btn) {
            if (activeShareDrop && !activeShareDrop.contains(e.target)) closeShareDrop();
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (activeShareBtn === btn) { closeShareDrop(); return; }
        closeShareDrop();

        const meta = getCardMeta(btn);
        const rect = btn.getBoundingClientRect();
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML =
            '<div class="layers-overlay"></div>' +
            '<div class="layers-dropdown-inner">' +
            '<div role="menu" class="dropdown-menu" style="top:' + (rect.bottom + 8) + 'px;right:' + (window.innerWidth - rect.right) + 'px;display:flex;">' +
            '<div><div class="dropdown-inner">' +
            '<button type="button" class="menu-item share-menu-item--copy"><span class="menu-item__icon"><svg viewBox="0 0 24 24"><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></svg></span><span class="menu-item__label">링크 복사하기</span></button>' +
            '<button type="button" class="menu-item share-menu-item--chat"><span class="menu-item__icon"><svg viewBox="0 0 24 24"><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path></svg></span><span class="menu-item__label">Chat으로 전송하기</span></button>' +
            '</div></div></div></div>';

        lc.addEventListener("click", async function(ev) {
            const item = ev.target.closest(".menu-item");
            if (!item) return;
            ev.preventDefault();
            ev.stopPropagation();
            if (item.classList.contains("share-menu-item--copy")) {
                const url = window.location.origin + "/main/post/detail/" + (meta ? meta.postId : postId) + "?memberId=" + memberId;
                if (navigator.clipboard) await navigator.clipboard.writeText(url);
                showToast("링크가 복사되었습니다.");
            } else if (item.classList.contains("share-menu-item--chat")) {
                showToast("Chat 전송 기능은 준비 중입니다.");
            }
            closeShareDrop();
        });

        if (layers) layers.appendChild(lc);
        else document.body.appendChild(lc);
        activeShareDrop = lc;
        activeShareBtn = btn;
    });

    // ── 6. 더보기 드롭다운 (이벤트 위임) ──
    const moreDropdown = document.getElementById("postDetailMoreDropdown");
    const moreMenu = document.getElementById("postDetailMoreMenu");
    const moreOwnerPanel = document.getElementById("postDetailMoreOwner");
    const moreOtherPanel = document.getElementById("postDetailMoreOther");
    const moreFollowLabel = document.getElementById("postDetailMoreFollowLabel");
    const moreFollowIconPath = document.getElementById("postDetailMoreFollowIconPath");
    const moreBlockLabel = document.getElementById("postDetailMoreBlockLabel");
    let activeMoreBtn = null;
    let activeMoreMeta = null;
    const followState = {};

    function closeMoreDrop() {
        if (moreDropdown) moreDropdown.hidden = true;
        activeMoreBtn = null;
        activeMoreMeta = null;
    }

    document.addEventListener("click", function(e) {
        const btn = e.target.closest(".post-detail-more-trigger");
        if (!btn) {
            if (moreDropdown && !moreDropdown.hidden && !moreDropdown.contains(e.target)) closeMoreDrop();
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (activeMoreBtn === btn) { closeMoreDrop(); return; }

        const meta = getCardMeta(btn);
        if (!meta) return;
        activeMoreBtn = btn;
        activeMoreMeta = meta;

        const isMyPost = Number(meta.targetMemberId) === memberId;
        const isFollowing = followState[meta.handle] || false;

        if (isMyPost) {
            if (moreOwnerPanel) moreOwnerPanel.style.display = "";
            if (moreOtherPanel) moreOtherPanel.style.display = "none";
        } else {
            if (moreOwnerPanel) moreOwnerPanel.style.display = "none";
            if (moreOtherPanel) moreOtherPanel.style.display = "";
            if (moreFollowLabel) moreFollowLabel.textContent = isFollowing ? (meta.handle + " 님 언팔로우하기") : (meta.handle + " 님 팔로우하기");
            if (moreBlockLabel) moreBlockLabel.textContent = meta.handle + " 님 차단하기";
            if (moreFollowIconPath) moreFollowIconPath.setAttribute("d", isFollowing ? SVG.followDel : SVG.followAdd);
        }

        const rect = btn.getBoundingClientRect();
        if (moreMenu) {
            moreMenu.style.top = (rect.bottom + 8) + "px";
            moreMenu.style.left = Math.max(16, rect.right - 240) + "px";
        }
        if (moreDropdown) moreDropdown.hidden = false;
    });

    // 팔로우 토글
    document.getElementById("postDetailMoreFollow")?.addEventListener("click", async function() {
        if (!activeMoreMeta) return;
        const handle = activeMoreMeta.handle;
        const targetId = activeMoreMeta.targetMemberId;
        const isF = followState[handle] || false;
        if (isF) await service.unfollow(memberId, targetId);
        else await service.follow(memberId, targetId);
        followState[handle] = !isF;
        closeMoreDrop();
        showToast(isF ? (handle + " 님 팔로우를 취소했습니다") : (handle + " 님을 팔로우했습니다"));
    });

    // 수정
    document.getElementById("postDetailMoreEdit")?.addEventListener("click", function() {
        if (!activeMoreMeta) return;
        closeMoreDrop();
        window.location.href = "/main/post/detail/" + activeMoreMeta.postId + "?memberId=" + memberId;
    });

    // 삭제
    document.getElementById("postDetailMoreDelete")?.addEventListener("click", async function() {
        if (!activeMoreMeta) return;
        closeMoreDrop();
        if (!confirm("게시물을 삭제할까요? 삭제된 게시물은 복구할 수 없습니다.")) return;
        if (activeMoreMeta.postId === String(postId)) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/main/post/detail/delete/" + postId;
            document.body.appendChild(form);
            form.submit();
        } else {
            await service.deletePost(activeMoreMeta.postId);
            showToast("게시물이 삭제되었습니다");
            await service.getReplies(postId, memberId, layout.showReplies);
        }
    });

    // ── 7. 차단 다이얼로그 ──
    const blockDialog = document.getElementById("postDetailBlockDialog");
    const blockTitle = document.getElementById("postDetailBlockTitle");
    const blockDesc = document.getElementById("postDetailBlockDesc");
    const reportDialog = document.getElementById("postDetailReportDialog");

    function closeDialog(dialog) {
        if (dialog) dialog.hidden = true;
        document.body.classList.remove("modal-open");
    }

    document.getElementById("postDetailMoreBlock")?.addEventListener("click", function() {
        if (!activeMoreMeta || !blockDialog) return;
        closeMoreDrop();
        if (blockTitle) blockTitle.textContent = activeMoreMeta.handle + " 님을 차단할까요?";
        if (blockDesc) blockDesc.textContent = activeMoreMeta.handle + " 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.";
        blockDialog.hidden = false;
        document.body.classList.add("modal-open");
    });

    if (blockDialog) {
        blockDialog.addEventListener("click", function(e) {
            if (e.target.closest("[data-post-detail-block-close='true']")) {
                closeDialog(blockDialog);
                return;
            }
            if (e.target.closest("[data-post-detail-block-confirm='true']") && activeMoreMeta) {
                const form = document.createElement("form");
                form.method = "POST";
                form.action = "/main/post/detail/block";
                form.innerHTML = '<input type="hidden" name="blockerId" value="' + memberId + '">' +
                    '<input type="hidden" name="blockedId" value="' + activeMoreMeta.targetMemberId + '">';
                document.body.appendChild(form);
                form.submit();
            }
        });
    }

    // ── 8. 신고 다이얼로그 ──
    document.getElementById("postDetailMoreReport")?.addEventListener("click", function() {
        if (!activeMoreMeta || !reportDialog) return;
        closeMoreDrop();
        reportDialog.hidden = false;
        document.body.classList.add("modal-open");
    });

    if (reportDialog) {
        reportDialog.addEventListener("click", function(e) {
            if (e.target.closest("[data-post-detail-report-close='true']")) {
                closeDialog(reportDialog);
                return;
            }
            let item = e.target.closest(".post-detail-notification-report__item");
            if (item && activeMoreMeta) {
                let reason = item.dataset.reason || (item.querySelector("span") ? item.querySelector("span").textContent.trim() : "");
                const form = document.createElement("form");
                form.method = "POST";
                form.action = "/main/post/detail/report";
                form.innerHTML = '<input type="hidden" name="reporterId" value="' + memberId + '">' +
                    '<input type="hidden" name="targetId" value="' + activeMoreMeta.postId + '">' +
                    '<input type="hidden" name="targetType" value="post">' +
                    '<input type="hidden" name="reason" value="' + esc(reason) + '">';
                document.body.appendChild(form);
                form.submit();
            }
        });
    }

    // ── 9. 대댓글 모달 (댓글에 답글) ──
    const replyModal = document.querySelector("[data-reply-modal]");
    const replyEditor = replyModal ? replyModal.querySelector("[data-testid='tweetTextarea_0']") : null;
    const replySubmit = replyModal ? replyModal.querySelector("[data-testid='tweetButton']") : null;
    const replyClose = replyModal ? replyModal.querySelector("[data-testid='app-bar-close']") : null;
    const replySrcName = replyModal ? replyModal.querySelector("[data-reply-source-name]") : null;
    const replySrcHandle = replyModal ? replyModal.querySelector("[data-reply-source-handle]") : null;
    const replySrcTime = replyModal ? replyModal.querySelector("[data-reply-source-time]") : null;
    const replySrcText = replyModal ? replyModal.querySelector("[data-reply-source-text]") : null;
    const replySrcInitial = replyModal ? replyModal.querySelector("[data-reply-source-initial]") : null;
    let replyTargetPostId = null;

    function openReplyModal(meta) {
        if (!replyModal) return;
        replyTargetPostId = meta.postId;
        const card = meta.card;
        if (replySrcName) replySrcName.textContent = meta.name;
        if (replySrcHandle) replySrcHandle.textContent = meta.handle;
        if (replySrcTime) replySrcTime.textContent = card.querySelector(".post-detail-reply-identity span:last-child") ? card.querySelector(".post-detail-reply-identity span:last-child").textContent : "";
        if (replySrcText) replySrcText.textContent = card.querySelector(".post-detail-reply-text") ? card.querySelector(".post-detail-reply-text").textContent : "";
        if (replySrcInitial) replySrcInitial.textContent = (meta.name || "?").charAt(0);
        if (replyEditor) replyEditor.innerHTML = "";
        if (replySubmit) replySubmit.disabled = true;
        replyModal.hidden = false;
        document.body.classList.add("modal-open");
        if (replyEditor) replyEditor.focus();
    }

    function closeReplyModal() {
        if (!replyModal) return;
        replyModal.hidden = true;
        document.body.classList.remove("modal-open");
        replyTargetPostId = null;
    }

    // 답글 버튼 (이벤트 위임): hero→인라인 포커스, 댓글→대댓글 모달
    document.addEventListener("click", function(e) {
        const btn = e.target.closest("[data-testid='reply']");
        if (!btn) return;
        const card = btn.closest("[data-post-card]");
        if (!card) return;
        e.preventDefault();

        if (card.classList.contains("post-detail-hero")) {
            if (inlineEditor) {
                inlineEditor.focus();
                inlineEditor.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        } else {
            const meta = getCardMeta(btn);
            if (meta) openReplyModal(meta);
        }
    });

    if (replyClose) replyClose.addEventListener("click", closeReplyModal);
    if (replyModal) replyModal.addEventListener("click", function(e) { if (e.target === replyModal) closeReplyModal(); });

    if (replyEditor) {
        replyEditor.addEventListener("input", function() {
            if (replySubmit) replySubmit.disabled = !replyEditor.textContent.trim();
        });
    }

    if (replySubmit) {
        replySubmit.addEventListener("click", async function(e) {
            e.preventDefault();
            const text = replyEditor ? replyEditor.textContent.trim() : "";
            if (!text || !replyTargetPostId) return;
            const replyFormData = new FormData();
            replyFormData.append("memberId", memberId);
            replyFormData.append("postContent", text);
            await service.writeReply(replyTargetPostId, replyFormData);
            closeReplyModal();
            showToast("답글이 게시되었습니다");
            await service.getReplies(postId, memberId, layout.showReplies);
        });
    }

    // ── 10. 뒤로 가기 ──
    document.getElementById("postDetailBack")?.addEventListener("click", function() {
        window.history.back();
    });

    // ── 11. ESC / 스크롤 시 메뉴 닫기 ──
    document.addEventListener("keydown", function(e) {
        if (e.key !== "Escape") return;
        closeMoreDrop();
        closeShareDrop();
        closeDialog(blockDialog);
        closeDialog(reportDialog);
        closeReplyModal();
    });

    window.addEventListener("scroll", function() {
        closeMoreDrop();
        closeShareDrop();
    }, { passive: true });

    // ── 12. 프로필 이미지 없으면 SVG 아바타 동적 생성 ──
    document.querySelectorAll(".post-detail-avatar:not(.post-detail-avatar--image), .post-detail-inline-reply-avatar").forEach(function(el) {
        if (el.querySelector("img")) return;
        const initial = (el.textContent.trim() || "?").charAt(0);
        el.classList.add("post-detail-avatar--image");
        el.innerHTML = '<img src="' + layout.buildAvatarDataUri(initial) + '" alt="프로필"/>';
    });

    // ── 13. 페이지 로드 시 댓글 비동기 로딩 ──
    service.getReplies(postId, memberId, layout.showReplies);
};
