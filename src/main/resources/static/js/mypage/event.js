// Notification event.js를 마이페이지용으로 이식
// 핵심 변경사항:
//   - populateReplyModal: .notif-tweet-item → .Post-Card 기반으로 정보 추출
//   - openReplyModal trigger: [data-testid='reply'] → .Post-Action-Btn.Reply
//   - 판매글 선택 버튼/서브뷰: Notification HTML의 [data-product-select-modal] 구조 그대로 유지
// 나머지 로직(이모지, 첨부파일, 위치, 태그, 임시저장, 공유 등)은 Notification event.js 100% 동일

window.onload = function () {
    // 목록 탭은 동일한 UI를 유지하고, owner/visitor에 따라 호출 API만 event 계층에서 분기한다.
    const mypageContext = window.mypageContext || {
        isOwner: true,
        loginMemberId: null,
        pageMemberId: null,
    };

    // 사이드바 게시하기 + 공용 답글 모달 활성화. memberId는 mypageContext.loginMemberId 사용.
    postModalApi.bootstrap({
        services: service,
        layout: layout,
        getMemberId: () => mypageContext.loginMemberId,
        // 답글 게시 후 카드의 답글 카운트 +1.
        onReplySubmitSuccess: ({ button }) => {
            updateReplyCount(button);
        },
    });

    // 모달이 열려 있는 동안 body에 붙이는 CSS 클래스 이름.
    // mypage.css의 `body.modal-open { overflow: hidden; }` 규칙을 트리거해서
    // 배경 페이지가 스크롤되지 않도록 막는다.
    // 파일 전체(여러 모달 열기/닫기 지점)에서 이 클래스를 반복 사용하므로,
    // 오타 한 번에 스크롤 잠금이 실패하는 일을 막기 위해 상수로 한 곳에서 관리한다.
    const BODY_MODAL_OPEN_CLASS = "modal-open";


    // ===== 4. Utils =====
    function getTextContent(el) {
        return el?.textContent.trim() ?? "";
    }

    function escapeHtml(value) {
        return String(value).replace(
            /[&<>"']/g,
            (c) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                })[c] ?? c,
        );
    }

    // 답글 버튼 카운트 증가 (마이페이지 .Post-Action-Btn.Reply 기준)
    function updateReplyCount(button) {
        const cnt = button.querySelector(".tweet-action-count, .Post-Action-Count");
        if (!cnt) return;
        const next = (Number.parseInt(cnt.textContent || "0", 10) || 0) + 1;
        cnt.textContent = String(next);
        button.setAttribute("aria-label", `답글 ${next}`);
    }



    // 게시물 탭과 내 상품 탭은 둘 다 "첫 진입 1페이지 로드 + 이후 스크롤 append" 구조를 쓴다.
    // 그래서 탭마다 page / checkScroll / hasMore / loaded 상태를 따로 들고 가야
    // 한쪽 탭의 무한 스크롤 상태가 다른 탭 동작에 섞이지 않는다.
    let activeProfileTab = "Posts";
    let myPostPage = 1;
    let myPostCheckScroll = true;
    let myPostHasMore = true;
    let myPostLoaded = false;
    let myReplyPage = 1;
    let myReplyCheckScroll = true;
    let myReplyHasMore = true;
    let myReplyLoaded = false;
    let myProductPage = 1;
    let myProductCheckScroll = true;
    let myProductHasMore = true;
    let myProductLoaded = false;
    let myLikedPage = 1;
    let myLikedCheckScroll = true;
    let myLikedHasMore = true;
    let myLikedLoaded = false;
    let myRequestedEstimationPage = 1;
    let myRequestedEstimationCheckScroll = true;
    let myRequestedEstimationHasMore = true;
    let myRequestedEstimationOpened = false;
    let myEstimationSummary = null;

    // main의 Connected 버튼 UX를 마이페이지 요약 카드에만 좁혀 이식한다.
    // 이 페이지는 "이미 팔로우 중인 사람"만 렌더링하므로,
    // default/connected 전체 상태 머신 대신 "연결 끊기 확인 → 언팔로우" 흐름만 유지하면 충분하다.
    const disconnectModal = document.getElementById("disconnectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalConfirm = document.getElementById("modalConfirm");
    const modalCancel = document.getElementById("modalCancel");
    let disconnectTarget = null;

    function openDisconnectModal(btn) {
        if (!disconnectModal || !modalTitle) {
            return;
        }

        disconnectTarget = btn;

        // 카드 루트에 handle을 저장해 두면,
        // main처럼 클릭 시점에 모달 제목만 동적으로 맞춰 바꿀 수 있다.
        const card = btn.closest(".Mypage-Follow-Card");
        const handle = card?.dataset.handle || "";

        modalTitle.textContent = handle
            ? `${handle} 님과의 연결을 끊으시겠습니까?`
            : "연결을 끊으시겠습니까?";

        disconnectModal.classList.add("active");
    }

    function closeDisconnectModal() {
        disconnectModal?.classList.remove("active");
        disconnectTarget = null;
    }

    // 네비게이션 탭 (마이페이지)
    const navBarDivs = document.querySelectorAll(".Profile-Tab-Item");
    const navBarTexts = document.querySelectorAll(".Profile-Tab-Text");
    const navUnderlines = document.querySelectorAll(".Profile-Tab-Indicator");
    const contentDivs = document.querySelectorAll(".Profile-Content");
    navBarDivs.forEach((nav, i) => {
        nav.addEventListener("click", () => {
            navBarTexts.forEach((t) => t.classList.remove("selected"));
            navUnderlines.forEach((u) => u.classList.add("off"));
            contentDivs.forEach((c) => c.classList.add("off"));
            navBarTexts[i].classList.add("selected");
            navUnderlines[i].classList.remove("off");
            contentDivs[i].classList.remove("off");

            if (nav.classList.contains("Posts")) {
                activeProfileTab = "Posts";

                // 게시물 탭은 첫 진입 시에만 1페이지를 서버에서 가져온다.
                // 이후에는 이미 그려진 목록을 유지하고,
                // 추가 페이지는 아래 scroll 이벤트에서 이어 붙인다.
                if (!myPostLoaded) {
                    if (mypageContext.isOwner) {
                        myPageService.getMyPosts(myPostPage, (data) => {
                            mypageLayout.showMyPostList(data, myPostPage);
                            myPostHasMore = data.criteria.hasMore;
                        });
                    } else {
                        myPageService.getProfilePosts(mypageContext.pageMemberId, myPostPage, (data) => {
                            mypageLayout.showMyPostList(data, myPostPage);
                            myPostHasMore = data.criteria.hasMore;
                        });
                    }
                    myPostLoaded = true;
                }
            }

            if (nav.classList.contains("Replies")) {
                activeProfileTab = "Replies";

                // Replies 탭도 다른 목록 탭과 같은 규칙으로 첫 진입 시에만 1페이지를 로드한다.
                if (!myReplyLoaded) {
                    if (mypageContext.isOwner) {
                        myPageService.getMyReplies(myReplyPage, (data) => {
                            mypageLayout.showMyReplyList(data, myReplyPage);
                            myReplyHasMore = data.criteria.hasMore;
                        });
                    } else {
                        myPageService.getProfileReplies(mypageContext.pageMemberId, myReplyPage, (data) => {
                            mypageLayout.showMyReplyList(data, myReplyPage);
                            myReplyHasMore = data.criteria.hasMore;
                        });
                    }
                    myReplyLoaded = true;
                }
            }

            if (nav.classList.contains("MyProducts")) {
                activeProfileTab = "MyProducts";

                // 첫 진입 시에만 1페이지를 로드한다.
                // 이후에는 스크롤로 다음 페이지를 이어서 불러온다.
                if (!myProductLoaded) {
                    if (mypageContext.isOwner) {
                        myPageService.getMyProducts(myProductPage, (data) => {
                            mypageLayout.showMyProductList(data, myProductPage);
                            myProductHasMore = data.criteria.hasMore;
                        });
                    } else {
                        myPageService.getProfileProducts(mypageContext.pageMemberId, myProductPage, (data) => {
                            mypageLayout.showMyProductList(data, myProductPage);
                            myProductHasMore = data.criteria.hasMore;
                        });
                    }
                    myProductLoaded = true;
                }
            }

            if (nav.classList.contains("Likes")) {
                activeProfileTab = "Likes";

                // Likes 탭도 다른 목록 탭과 같은 규칙으로 첫 진입 시에만 1페이지를 로드한다.
                // 이후에는 이미 렌더링된 목록을 유지하고,
                // 추가 페이지는 아래 스크롤 이벤트에서 이어 붙인다.
                if (!myLikedLoaded) {
                    myPageService.getMyLikedPosts(myLikedPage, (data) => {
                        mypageLayout.showMyLikedPostList(data, myLikedPage);
                        myLikedHasMore = data.criteria.hasMore;
                    });
                    myLikedLoaded = true;
                }
            }
        });
    });
    document.querySelector(".Profile-Tab-Item.Posts")?.click();

    const profileConnectButton = document.querySelector(".Profile-Edit-Btn.Connect, .Profile-Edit-Btn.Connected");
    const profileChatButton = document.querySelector(".Profile-Edit-Btn.Chat");
    const profileMoreButton = document.querySelector(".Profile-Edit-Btn.More");
    let pendingProfileBlock = false;
    let pendingProfileReport = false;
    let activeProfileMoreDropdown = null;
    let activeProfileMoreButton = null;
    let pendingBlockMemberId = null;
    let pendingReportTargetId = null;
    let pendingReportTargetType = null;
    let selectedOwnedPostId = null;
    let selectedOwnedCardType = "";
    let activePostMoreDropdown = null;
    let activePostMoreButton = null;

    const MORE_MENU_ICONS = {
        follow: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm13 4v3h2v-3h3V8h-3V5h-2v3h-3v2h3zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>',
        unfollow: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>',
        block: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></g></svg>',
        report: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg>',
        edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g></svg>',
        delete: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"></path></g></svg>',
    };

    function buildMenuItem(actionClass, icon, label) {
        return '<button type="button" role="menuitem" class="menu-item ' + actionClass + '">' +
            '<span class="menu-item__icon">' + icon + '</span>' +
            '<span class="menu-item__label">' + label + '</span>' +
            '</button>';
    }

    if (!mypageContext.isOwner && profileChatButton instanceof HTMLButtonElement) {
        // 상대 프로필의 Chat 버튼은 새 채팅방 생성 로직을 여기서 직접 만들지 않고,
        // 기존 chat 진입점에 partnerId만 넘겨 현재 채팅 화면 흐름을 그대로 재사용한다.
        profileChatButton.addEventListener("click", () => {
            if (!mypageContext.pageMemberId) {
                return;
            }

            window.location.href = `/chat?partnerId=${mypageContext.pageMemberId}`;
        });
    }

    if (!mypageContext.isOwner && profileConnectButton instanceof HTMLButtonElement) {
        // 상대 프로필의 상단 Approve 버튼은 사이드바 카드와 달리
        // "현재 보고 있는 페이지 주인" 한 명에 대해서만 팔로우 상태를 토글한다.
        profileConnectButton.addEventListener("click", async () => {
            if (!mypageContext.loginMemberId || !mypageContext.pageMemberId) {
                return;
            }

            try {
                if (profileConnectButton.classList.contains("Connected")) {
                    await myPageService.unfollow(mypageContext.loginMemberId, mypageContext.pageMemberId);
                    profileConnectButton.classList.remove("Connected");
                    profileConnectButton.classList.add("Connect");
                    profileConnectButton.textContent = "Approve";
                    return;
                }

                await myPageService.follow(mypageContext.loginMemberId, mypageContext.pageMemberId);
                profileConnectButton.classList.remove("Connect");
                profileConnectButton.classList.add("Connected");
                profileConnectButton.textContent = "Approved";
            } catch (error) {
                alert(error.message || "연결 상태 변경 중 오류가 발생했습니다.");
            }
        });
    }

    // 견적요청 버튼은 estimation-regist 측 hidden 트리거(#createEstimationButton)를 대신 클릭한다.
    document.querySelector(".Profile-Edit-Btn.Request")
        ?.addEventListener("click", () => {
            document.getElementById("createEstimationButton")?.click();
        });

    // 사이드바 견적 요약/더보기는 본인 mypage에서만 의미가 있다.
    // mypage.html에서도 th:if="${isOwner}"로 마크업이 숨겨지지만,
    // JS에서도 호출 자체를 건너뛰어 불필요한 API 트래픽을 막는다.
    // expert/non-expert 분기는 서버가 role 기준으로 알아서 처리한다.
    if (mypageContext.isOwner) {
        myPageService.getMyEstimationsSummary((data) => {
            myEstimationSummary = data;
            mypageLayout.showMyEstimationSummary(data);
        });

        // non-expert만 마이페이지 안에서 같은 카드 아래에 추가 페이지를 이어 붙인다.
        document.querySelector("[data-mypage-estimation-more]")?.addEventListener("click", () => {
            if (myRequestedEstimationOpened) {
                return;
            }

            // non-expert는 summary에서 이미 5개를 보고 시작하므로,
            // 첫 클릭에서는 requester 목록 1페이지를 다시 받아와 6번째 이후만 append 한다.
            myRequestedEstimationOpened = true;
            myRequestedEstimationPage = 1;

            myPageService.getMyRequestedEstimations(myRequestedEstimationPage, (data) => {
                mypageLayout.appendMyRequestedEstimationList(data, myRequestedEstimationPage);
                myRequestedEstimationHasMore = data.criteria.hasMore;
            });
        });
    }

    // 기존 main/event.js의 스크롤 페이징 구조와 같은 방식이다.
    // 현재 활성 탭이 내 상품이고, 다음 페이지가 남아 있을 때만 추가 로드한다.
    window.addEventListener("scroll", (e) => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight < scrollHeight - 100) return;

        // 게시물 탭이 활성 상태일 때만 다음 페이지를 조회한다.
        // checkScroll은 짧은 시간 동안 중복 요청을 막는 잠금 역할이고,
        // hasMore가 false면 더 내려도 추가 요청을 보내지 않는다.
        if (activeProfileTab === "Posts" && myPostCheckScroll && myPostHasMore) {
            myPostCheckScroll = false;
            myPostPage++;

            if (mypageContext.isOwner) {
                myPageService.getMyPosts(myPostPage, (data) => {
                    mypageLayout.showMyPostList(data, myPostPage);
                    myPostHasMore = data.criteria.hasMore;
                });
            } else {
                myPageService.getProfilePosts(mypageContext.pageMemberId, myPostPage, (data) => {
                    mypageLayout.showMyPostList(data, myPostPage);
                    myPostHasMore = data.criteria.hasMore;
                });
            }

            setTimeout(() => {
                myPostCheckScroll = true;
            }, 1000);
        }

        if (activeProfileTab === "Replies" && myReplyCheckScroll && myReplyHasMore) {
            myReplyCheckScroll = false;
            myReplyPage++;

            if (mypageContext.isOwner) {
                myPageService.getMyReplies(myReplyPage, (data) => {
                    mypageLayout.showMyReplyList(data, myReplyPage);
                    myReplyHasMore = data.criteria.hasMore;
                });
            } else {
                myPageService.getProfileReplies(mypageContext.pageMemberId, myReplyPage, (data) => {
                    mypageLayout.showMyReplyList(data, myReplyPage);
                    myReplyHasMore = data.criteria.hasMore;
                });
            }

            setTimeout(() => {
                myReplyCheckScroll = true;
            }, 1000);
        }

        if (activeProfileTab === "MyProducts" && myProductCheckScroll && myProductHasMore) {
            myProductCheckScroll = false;
            myProductPage++;

            if (mypageContext.isOwner) {
                myPageService.getMyProducts(myProductPage, (data) => {
                    mypageLayout.showMyProductList(data, myProductPage);
                    myProductHasMore = data.criteria.hasMore;
                });
            } else {
                myPageService.getProfileProducts(mypageContext.pageMemberId, myProductPage, (data) => {
                    mypageLayout.showMyProductList(data, myProductPage);
                    myProductHasMore = data.criteria.hasMore;
                });
            }

            setTimeout(() => {
                myProductCheckScroll = true;
            }, 1000);
        }

        if (activeProfileTab === "Likes" && myLikedCheckScroll && myLikedHasMore) {
            myLikedCheckScroll = false;
            myLikedPage++;

            myPageService.getMyLikedPosts(myLikedPage, (data) => {
                mypageLayout.showMyLikedPostList(data, myLikedPage);
                myLikedHasMore = data.criteria.hasMore;
            });

            setTimeout(() => {
                myLikedCheckScroll = true;
            }, 1000);
        }

        if (myRequestedEstimationOpened && myRequestedEstimationCheckScroll && myRequestedEstimationHasMore) {
            myRequestedEstimationCheckScroll = false;
            myRequestedEstimationPage++;

            myPageService.getMyRequestedEstimations(myRequestedEstimationPage, (data) => {
                mypageLayout.appendMyRequestedEstimationList(data, myRequestedEstimationPage);
                myRequestedEstimationHasMore = data.criteria.hasMore;
            });

            setTimeout(() => {
                myRequestedEstimationCheckScroll = true;
            }, 1000);
        }
    });

    // 마이페이지 기존 기능들
    // 프로필 수정 모달
    const modalBackDrop = document.querySelector(".Modal-BackDrop");
    const profileEditModalOverlay = document.querySelector(
        ".Profile-Edit-Modal-Overlay",
    );

    function openModal(el) {
        el?.classList.remove("off");
        modalBackDrop?.classList.remove("off");
        document.body.classList.add(BODY_MODAL_OPEN_CLASS);
    }

    function closeModal(el) {
        el?.classList.add("off");
        modalBackDrop?.classList.add("off");
        document.body.classList.remove(BODY_MODAL_OPEN_CLASS);
    }

    modalBackDrop?.addEventListener("click", () => {
        const opens = document.querySelectorAll(
            ".Profile-Edit-Modal-Overlay:not(.off), .Product-Write-Modal:not(.off)",
        );
        opens.forEach((m) => m.classList.add("off"));
        modalBackDrop.classList.add("off");
        document.body.classList.remove(BODY_MODAL_OPEN_CLASS);
    });
    document
        .querySelector(".Profile-Edit-Btn.Edit")
        ?.addEventListener("click", () => openModal(profileEditModalOverlay));
    document
        .querySelector(".Profile-Edit-Close-Button")
        ?.addEventListener("click", () => closeModal(profileEditModalOverlay));

    // [FIX 1] 생년월일 정규식
    const birthdateInput = document.querySelector(
        ".Profile-Edit-Birthdate-Input",
    );
    const birthdateError = document.querySelector(
        ".Profile-Edit-Birthdate-Error",
    );
    if (birthdateInput) {
        birthdateInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
            if (!birthdateError) return;
            const val = e.target.value;
            if (val.length < 8) {
                birthdateError.style.display = "none";
                return;
            }
            const y = parseInt(val.substring(0, 4), 10),
                m = parseInt(val.substring(4, 6), 10),
                d = parseInt(val.substring(6, 8), 10);
            const cur = new Date().getFullYear();
            let err = "";
            if (y < 1900 || y > cur) err = `연도: 1900~${cur}`;
            else if (m < 1 || m > 12) err = "월: 01~12";
            else {
                const last = new Date(y, m, 0).getDate();
                if (d < 1 || d > last) err = `일: 01~${last}`;
            }
            if (err) {
                birthdateError.style.display = "inline";
                birthdateError.textContent = err;
            } else {
                birthdateError.style.display = "none";
            }
        });
    }

    const profileEditSaveButton = document.querySelector(
        ".Profile-Edit-Save-Button",
    );
    const profileEditNameInput = document.querySelector(
        ".Profile-Edit-Name-Input",
    );
    const profileEditBioTextarea = document.querySelector(
        ".Profile-Edit-Bio-Textarea",
    );
    const profileEditBannerArea = document.querySelector(
        ".Profile-Edit-Banner-Area",
    );
    const profileEditAvatarImage = document.querySelector(
        ".Profile-Edit-Avatar-Image",
    );
    const profileEditBannerButton = document.querySelector(
        ".Profile-Edit-Banner-Button",
    );
    const profileEditAvatarButton = document.querySelector(
        ".Profile-Edit-Avatar-Button",
    );
    const profileEditBannerFileInput = document.querySelector(
        ".Profile-Edit-Banner-FileInput",
    );
    const profileEditAvatarFileInput = document.querySelector(
        ".Profile-Edit-Avatar-FileInput",
    );

    let profileCheckSubmit = true;

    function showProfilePreview(file, callback) {
        // 프로필 수정 모달은 선택 직후 결과가 보여야 사용자가 어떤 파일을 올리는지 알 수 있다.
        // 그래서 업로드 요청을 보내기 전, FileReader로 로컬 미리보기만 먼저 만든다.
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(file);
    }

    profileEditBannerButton?.addEventListener("click", () => {
        // 실제 file input은 디자인 상 숨겨져 있으므로
        // 사용자는 버튼을 누르고, JS가 file input 클릭을 대신 실행한다.
        profileEditBannerFileInput?.click();
    });

    profileEditAvatarButton?.addEventListener("click", () => {
        profileEditAvatarFileInput?.click();
    });

    profileEditBannerFileInput?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];

        showProfilePreview(file, (result) => {
            // 모달 안 배너 배경을 즉시 바꿔서 저장 전에도 새 이미지를 확인하게 한다.
            if (profileEditBannerArea) {
                profileEditBannerArea.style.backgroundImage = `url('${result}')`;
            }
        });
    });

    profileEditAvatarFileInput?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];

        showProfilePreview(file, (result) => {
            // 아바타도 같은 방식으로 미리보기만 먼저 반영한다.
            if (profileEditAvatarImage) {
                profileEditAvatarImage.style.backgroundImage = `url('${result}')`;
            }
        });
    });

    profileEditSaveButton?.addEventListener("click", async (e) => {
        e.preventDefault();

        // 저장 버튼 연속 클릭으로 같은 요청이 여러 번 나가는 것을 막는다.
        if (!profileCheckSubmit) {
            return;
        }

        const memberNickname = profileEditNameInput?.value.trim() || "";
        const memberBio = profileEditBioTextarea?.value.trim() || "";
        const birthDate = birthdateInput?.value.trim() || "";

        if (!memberNickname) {
            alert("이름을 입력해주세요.");
            profileEditNameInput?.focus();
            return;
        }

        // 기존 생년월일 검증 로직은 그대로 두고,
        // 에러 문구가 보이는 상태일 때만 저장을 막아서 현재 UI 규칙을 유지한다.
        if (birthdateError && birthdateError.style.display !== "none") {
            alert("생년월일 형식을 확인해주세요.");
            birthdateInput?.focus();
            return;
        }

        const formData = new FormData();
        formData.append("memberNickname", memberNickname);
        formData.append("memberBio", memberBio);
        formData.append("birthDate", birthDate);

        // 파일은 사용자가 새로 고른 경우에만 전송한다.
        // 선택하지 않은 쪽은 서버에서 기존 프로필/배너 이미지를 그대로 유지한다.
        if (profileEditAvatarFileInput?.files?.[0]) {
            formData.append("profileImage", profileEditAvatarFileInput.files[0]);
        }

        if (profileEditBannerFileInput?.files?.[0]) {
            formData.append("bannerImage", profileEditBannerFileInput.files[0]);
        }

        try {
            profileCheckSubmit = false;
            profileEditSaveButton.disabled = true;

            const result = await myPageService.updateProfile(formData);

            alert(result.message || "프로필 수정 성공");

            // 텍스트와 이미지가 같이 바뀌기 때문에 부분 DOM 갱신보다 새로고침이 안전하다.
            // 새로고침 시 서버가 다시 member / profileImageUrl / bannerImageUrl 을 내려준다.
            window.location.reload();
        } catch (error) {
            alert(error.message || "프로필 수정 중 오류가 발생했습니다.");
        } finally {
            profileCheckSubmit = true;
            profileEditSaveButton.disabled = false;
        }
    });

    // [FIX 2] 클립보드 토스트
    const clipboardToast = document.querySelector(".Clipboard-Toast");

    function showClipboardToast(msg) {
        if (!clipboardToast) return;
        clipboardToast.querySelector("div").textContent =
            msg || "클립보드로 복사함";
        clipboardToast.classList.add("show");
        setTimeout(() => clipboardToast.classList.remove("show"), 2500);
    }

    // Like / Bookmark는 정적 카드와 동적 카드가 섞여 있으므로 "최초 DOM에만 바인딩"하지 않는다.
    // 대신 클릭 직전에 필요한 아이콘 구조를 보장하고, 상태 토글은 이벤트 위임 경로에서 처리한다.
    const EMPTY_HEART = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" data-icon="like-empty" aria-hidden="true"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
    const FULL_HEART = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" data-icon="like-full" aria-hidden="true"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
    const EMPTY_BK = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" data-icon="bookmark-empty" aria-hidden="true"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg>`;
    const FULL_BK = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" data-icon="bookmark-full" aria-hidden="true"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg>`;

    function ensureLikeButtonIcons(btn) {
        if (!btn || btn.dataset.likeIconsReady === "true") {
            return;
        }

        const inLikes = !!btn.closest(".Profile-Content.Likes");
        const count = btn.querySelector(".tweet-action-count, .Post-Action-Count");
        const emptyWrapper = document.createElement("span");
        const fullWrapper = document.createElement("span");
        const isLiked = btn.dataset.liked === "true" || inLikes;

        btn.querySelectorAll("svg").forEach((svg) => svg.remove());

        emptyWrapper.innerHTML = EMPTY_HEART;
        fullWrapper.innerHTML = FULL_HEART;

        const emptyIcon = emptyWrapper.firstChild;
        const fullIcon = fullWrapper.firstChild;

        emptyIcon.classList.toggle("off", isLiked);
        fullIcon.classList.toggle("off", !isLiked);
        btn.classList.toggle("active", isLiked);
        btn.dataset.liked = String(isLiked);
        btn.dataset.likeIconsReady = "true";

        if (count) {
            btn.insertBefore(emptyIcon, count);
            btn.insertBefore(fullIcon, count);
            return;
        }

        btn.appendChild(emptyIcon);
        btn.appendChild(fullIcon);
    }

    function ensureBookmarkButtonIcons(btn) {
        if (!btn || btn.dataset.bookmarkIconsReady === "true") {
            return;
        }

        const count = btn.querySelector(".tweet-action-count, .Post-Action-Count");
        const emptyWrapper = document.createElement("span");
        const fullWrapper = document.createElement("span");
        const isBookmarked = btn.dataset.bookmarked === "true";

        btn.querySelectorAll("svg").forEach((svg) => svg.remove());

        emptyWrapper.innerHTML = EMPTY_BK;
        fullWrapper.innerHTML = FULL_BK;

        const emptyIcon = emptyWrapper.firstChild;
        const fullIcon = fullWrapper.firstChild;

        emptyIcon.classList.toggle("off", isBookmarked);
        fullIcon.classList.toggle("off", !isBookmarked);
        btn.classList.toggle("active", isBookmarked);
        btn.dataset.bookmarked = String(isBookmarked);
        btn.dataset.bookmarkIconsReady = "true";

        if (count) {
            btn.insertBefore(emptyIcon, count);
            btn.insertBefore(fullIcon, count);
            return;
        }

        btn.appendChild(emptyIcon);
        btn.appendChild(fullIcon);
    }

    function toggleLikeButton(btn) {
        ensureLikeButtonIcons(btn);

        const count = btn.querySelector(".tweet-action-count, .Post-Action-Count");
        const emptyIcon = btn.querySelector('[data-icon="like-empty"]');
        const fullIcon = btn.querySelector('[data-icon="like-full"]');
        const isLiked = btn.dataset.liked === "true";
        const nextLiked = !isLiked;

        btn.dataset.liked = String(nextLiked);
        btn.classList.toggle("active", nextLiked);
        emptyIcon?.classList.toggle("off", nextLiked);
        fullIcon?.classList.toggle("off", !nextLiked);

        if (!count) {
            return;
        }

        const current = parseInt(count.textContent.replace(/[^0-9]/g, ""), 10) || 0;
        count.textContent = nextLiked ? current + 1 : Math.max(0, current - 1);
    }

    function toggleBookmarkButton(btn) {
        ensureBookmarkButtonIcons(btn);

        const emptyIcon = btn.querySelector('[data-icon="bookmark-empty"]');
        const fullIcon = btn.querySelector('[data-icon="bookmark-full"]');
        const isBookmarked = btn.dataset.bookmarked === "true";
        const nextBookmarked = !isBookmarked;

        btn.dataset.bookmarked = String(nextBookmarked);
        btn.classList.toggle("active", nextBookmarked);
        emptyIcon?.classList.toggle("off", nextBookmarked);
        fullIcon?.classList.toggle("off", !nextBookmarked);
    }

    // 서버가 렌더한 정적 카드(답글/좋아요 탭 샘플)는 최초 진입 시 한 번만 아이콘 구조를 맞춘다.
    // 조회 후 추가되는 DOM은 아래 이벤트 위임 경로에서 클릭 시점에 자동으로 보정된다.
    document.querySelectorAll(".tweet-action-btn--like, .Post-Action-Btn.Like").forEach((btn) => ensureLikeButtonIcons(btn));
    document.querySelectorAll(".tweet-action-btn--bookmark, .Post-Action-Btn.Bookmark").forEach((btn) => ensureBookmarkButtonIcons(btn));

    let activeMoreMenu = null,
        activeMenuEl = null,
        menuTrackRaf = null;
    const postMoreMenuPost = document.querySelector(".Post-More-Menu.Post");
    const postMoreMenuOwnerPost = document.querySelector(".Post-More-Menu.OwnerPost");
    const postMoreMenuProduct = document.querySelector(
        ".Post-More-Menu.Product",
    );
    const postMoreMenuProductOther = document.querySelector(
        ".Post-More-Menu.ProductOther",
    );
    const postMoreMenuShare = document.querySelector(".Post-More-Menu.Share");

    // 내 상품 더보기 메뉴에서 마지막으로 선택한 상품 id를 잠시 저장해둔다.
    // 삭제 확인 모달은 어떤 카드에서 열렸는지 자체를 모르기 때문에,
    // 더보기 버튼을 누른 시점에 이 값을 기억해두고 confirmDeleteProduct에서 재사용한다.
    let selectedMyProductId = null;
    const allMoreMenus = [
        postMoreMenuPost,
        postMoreMenuOwnerPost,
        postMoreMenuProduct,
        postMoreMenuProductOther,
        postMoreMenuShare,
    ];

    function closeAllMoreMenus() {
        allMoreMenus.forEach((m) => m?.classList.add("off"));
        activeMoreMenu = null;
        activeMenuEl = null;
        if (menuTrackRaf) {
            cancelAnimationFrame(menuTrackRaf);
            menuTrackRaf = null;
        }
        if (activeProfileMoreDropdown) {
            activeProfileMoreDropdown.remove();
            activeProfileMoreDropdown = null;
            activeProfileMoreButton = null;
        }
        if (activePostMoreDropdown) {
            activePostMoreDropdown.remove();
            activePostMoreDropdown = null;
            activePostMoreButton = null;
        }
    }

    function trackMenuPosition() {
        if (!activeMoreMenu || !activeMenuEl) return;
        const rect = activeMoreMenu.getBoundingClientRect();
        const menuW = activeMenuEl.offsetWidth;
        let left = rect.left;
        if (left + menuW > window.innerWidth - 8)
            left = Math.max(8, rect.right - menuW);
        activeMenuEl.style.top = `${rect.bottom + 4}px`;
        activeMenuEl.style.left = `${left}px`;
        menuTrackRaf = requestAnimationFrame(trackMenuPosition);
    }

    function positionMenuUnderBtn(menuEl, btnEl) {
        if (menuTrackRaf) cancelAnimationFrame(menuTrackRaf);
        menuEl.style.position = "fixed";
        menuEl.style.zIndex = "9999";
        activeMenuEl = menuEl;
        activeMoreMenu = btnEl;
        trackMenuPosition();
    }

    function openMoreMenu(menuEl, btnEl) {
        if (!menuEl) return;
        if (!menuEl.classList.contains("off") && activeMoreMenu === btnEl) {
            closeAllMoreMenus();
            return;
        }
        closeAllMoreMenus();
        positionMenuUnderBtn(menuEl, btnEl);
        menuEl.classList.remove("off");
        activeMoreMenu = btnEl;
    }

    // 소모달 열기/닫기 헬퍼
    // 프로필 수정 모달(openModal/closeModal)과 동일하게 body.modal-open을
    // 함께 토글해서 모달이 떠 있는 동안 배경 페이지 스크롤이 잠기도록 한다.
    // 이 일관성이 없으면 삭제/차단 같은 소모달을 열었을 때만 배경이 스크롤되는
    // 사소한 UX 버그가 생긴다.
    function openSmallModal(sel) {
        closeAllMoreMenus();
        const m = document.querySelector(sel);
        if (m) {
            m.classList.remove("off");
            modalBackDrop?.classList.remove("off");
            document.body.classList.add(BODY_MODAL_OPEN_CLASS);
        }
    }

    function closeSmallModal(sel) {
        document.querySelector(sel)?.classList.add("off");
        modalBackDrop?.classList.add("off");
        document.body.classList.remove(BODY_MODAL_OPEN_CLASS);
    }

    function getProfileHandleText() {
        // 현재 마이페이지 템플릿에서 프로필 handle은 .Profile-Handle-Text 에 렌더된다.
        // 이전 selector(.Profile-Name-Handle)는 존재하지 않아서 메뉴 문구가 항상 @user로 떨어졌다.
        return document.querySelector(".Profile-Handle-Text")?.textContent?.trim() || "@user";
    }

    function openReportDialog(question, reasons, targetId, targetType) {
        pendingProfileReport = true;
        pendingReportTargetId = targetId;
        pendingReportTargetType = targetType;

        const dialog = document.querySelector(".Notification-Dialog--Report");
        const questionEl = dialog?.querySelector(".Notification-Dialog__Question");
        const itemEls = dialog?.querySelectorAll(".Notification-Report__Item span");
        if (questionEl) {
            questionEl.textContent = question;
        }

        itemEls?.forEach((span, index) => {
            if (reasons[index]) {
                span.textContent = reasons[index];
            }
        });

        dialog?.classList.remove("off");
    }

    function openProfileReportDialog() {
        openReportDialog(
            "이 프로필에 어떤 문제가 있나요?",
            [
                "사칭 또는 허위 프로필 신고",
                "스팸 또는 반복 홍보 신고",
                "욕설 또는 부적절한 표현 신고",
                "허위 전문가 정보 신고",
                "기타 운영정책 위반 신고",
                "반복적인 악성 활동 신고"
            ],
            mypageContext.pageMemberId,
            "member"
        );
    }

    function closePostMoreDropdown() {
        activePostMoreDropdown?.remove();
        activePostMoreDropdown = null;
        activePostMoreButton = null;
    }

    function getPostMetaFromButton(button) {
        const card = button.closest(".postCard, .Post-Card");
        if (!card) return null;

        return {
            postId: Number(card.dataset.postId),
            memberId: Number(card.dataset.memberId),
            handle: card.dataset.memberHandle || card.querySelector(".postHandle")?.textContent?.trim() || "@user",
            cardType: card.dataset.cardType || button.dataset.cardType || "",
        };
    }

    function reloadOwnedPostList(cardType) {
        if (cardType === "myreply") {
            myReplyPage = 1;
            myReplyHasMore = true;
            myPageService.getMyReplies(1, (data) => {
                mypageLayout.showMyReplyList(data, 1);
                myReplyHasMore = data.criteria.hasMore;
            });
            return;
        }

        myPostPage = 1;
        myPostHasMore = true;
        myPageService.getMyPosts(1, (data) => {
            mypageLayout.showMyPostList(data, 1);
            myPostHasMore = data.criteria.hasMore;
        });
    }

    async function handlePostDropdownAction(button, actionClass) {
        const meta = getPostMetaFromButton(button);
        if (!meta) return;

        if (actionClass === "menu-item--follow-toggle") {
            const isFollowing = profileConnectButton?.classList.contains("Connected");

            if (isFollowing) {
                await myPageService.unfollow(mypageContext.loginMemberId, meta.memberId);
            } else {
                await myPageService.follow(mypageContext.loginMemberId, meta.memberId);
            }

            closePostMoreDropdown();
            return;
        }

        if (actionClass === "menu-item--block") {
            pendingProfileBlock = true;
            pendingBlockMemberId = meta.memberId;
            closePostMoreDropdown();
            openSmallModal(".Small-Modal.Ban-User");
            return;
        }

        if (actionClass === "menu-item--report") {
            closePostMoreDropdown();
            openReportDialog(
                "이 게시물에 어떤 문제가 있나요?",
                [
                    "허위 정보 또는 오해를 유발하는 내용",
                    "스팸 또는 반복 홍보",
                    "욕설 또는 혐오 표현",
                    "저작권 또는 도용 문제",
                    "부적절한 이미지 또는 첨부파일",
                    "기타 운영정책 위반"
                ],
                meta.postId,
                "post"
            );
            return;
        }

        if (actionClass === "menu-item--edit") {
            // 공용 작성 모달의 수정 모드를 열어 모든 필드(제목/본문/위치/태그/미디어/상품)를 그대로 편집한다.
            closePostMoreDropdown();
            postModalApi.openEdit(meta.postId);
            return;
        }

        if (actionClass === "menu-item--delete") {
            if (!window.confirm("게시물을 삭제할까요?")) {
                closePostMoreDropdown();
                return;
            }

            await myPageService.deletePost(meta.postId);
            reloadOwnedPostList(meta.cardType);
            closePostMoreDropdown();
        }
    }

    function openPostMoreDropdown(button) {
        closePostMoreDropdown();

        const meta = getPostMetaFromButton(button);
        if (!meta) return;

        const isMyPost = Number(meta.memberId) === Number(mypageContext.loginMemberId);
        const isFollowing = profileConnectButton?.classList.contains("Connected");
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const right = Math.max(16, window.innerWidth - rect.right);

        const menuItemsHtml = isMyPost
            ? buildMenuItem("menu-item--edit", MORE_MENU_ICONS.edit, "게시물 수정하기") +
              buildMenuItem("menu-item--delete", MORE_MENU_ICONS.delete, "게시물 삭제하기")
            : buildMenuItem(
                "menu-item--follow-toggle",
                isFollowing ? MORE_MENU_ICONS.unfollow : MORE_MENU_ICONS.follow,
                isFollowing ? `${meta.handle} 님 언팔로우하기` : `${meta.handle} 님 팔로우하기`
            ) +
              buildMenuItem("menu-item--block", MORE_MENU_ICONS.block, `${meta.handle} 님 차단하기`) +
              buildMenuItem("menu-item--report", MORE_MENU_ICONS.report, "게시물 신고하기");

        const dropdown = document.createElement("div");
        dropdown.className = "layers-dropdown-container";
        dropdown.style.position = "absolute";
        dropdown.style.top = "0";
        dropdown.style.left = "0";
        dropdown.style.width = "100%";
        dropdown.style.height = "0";
        dropdown.style.pointerEvents = "none";
        dropdown.style.zIndex = "30";
        dropdown.innerHTML =
            '<div class="layers-overlay"></div>' +
            '<div class="layers-dropdown-inner">' +
            '<div role="menu" class="dropdown-menu" style="top:' + top + 'px;right:' + right + 'px;display:flex;">' +
            '<div><div class="dropdown-inner">' + menuItemsHtml + '</div></div>' +
            '</div></div>';

        dropdown.addEventListener("click", (e) => {
            const item = e.target.closest(".menu-item");
            if (!item) {
                e.stopPropagation();
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            let actionClass = "";
            if (item.classList.contains("menu-item--follow-toggle")) actionClass = "menu-item--follow-toggle";
            else if (item.classList.contains("menu-item--block")) actionClass = "menu-item--block";
            else if (item.classList.contains("menu-item--report")) actionClass = "menu-item--report";
            else if (item.classList.contains("menu-item--edit")) actionClass = "menu-item--edit";
            else if (item.classList.contains("menu-item--delete")) actionClass = "menu-item--delete";

            if (actionClass && activePostMoreButton) {
                handlePostDropdownAction(activePostMoreButton, actionClass);
            }
        });

        document.body.appendChild(dropdown);
        activePostMoreDropdown = dropdown;
        activePostMoreButton = button;
    }

    function closeProfileMoreDropdown() {
        if (!activeProfileMoreDropdown) {
            return;
        }

        activeProfileMoreDropdown.remove();
        activeProfileMoreDropdown = null;
        activeProfileMoreButton = null;
    }

    function openProfileVisitorDropdown(button) {
        closeProfileMoreDropdown();

        const handle = getProfileHandleText();
        const isFollowing = profileConnectButton?.classList.contains("Connected");
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const right = Math.max(16, window.innerWidth - rect.right);

        const followIcon = isFollowing
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm13 4v3h2v-3h3V8h-3V5h-2v3h-3v2h3zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>';
        const followLabel = isFollowing ? `${handle} 님 언팔로우하기` : `${handle} 님 팔로우하기`;

        const dropdown = document.createElement("div");
        dropdown.className = "layers-dropdown-container";
        dropdown.style.position = "absolute";
        dropdown.style.top = "0";
        dropdown.style.left = "0";
        dropdown.style.width = "100%";
        dropdown.style.height = "0";
        dropdown.style.pointerEvents = "none";
        dropdown.style.zIndex = "30";
        dropdown.innerHTML =
            '<div class="layers-overlay"></div>' +
            '<div class="layers-dropdown-inner">' +
            '<div role="menu" class="dropdown-menu" style="top:' + top + 'px;right:' + right + 'px;display:flex;">' +
            '<div><div class="dropdown-inner">' +
            '<button type="button" role="menuitem" class="menu-item menu-item--follow-toggle">' +
            '<span class="menu-item__icon">' + followIcon + '</span>' +
            '<span class="menu-item__label">' + followLabel + '</span>' +
            '</button>' +
            '<button type="button" role="menuitem" class="menu-item menu-item--block">' +
            '<span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></g></svg></span>' +
            '<span class="menu-item__label">' + handle + ' 님 차단하기</span>' +
            '</button>' +
            '<button type="button" role="menuitem" class="menu-item menu-item--report">' +
            '<span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg></span>' +
            '<span class="menu-item__label">프로필 신고하기</span>' +
            '</button>' +
            '</div></div>' +
            '</div>' +
            '</div>';

        dropdown.addEventListener("click", (e) => {
            const item = e.target.closest(".menu-item");
            if (!item) {
                e.stopPropagation();
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if (item.classList.contains("menu-item--follow-toggle")) {
                closeProfileMoreDropdown();
                profileConnectButton?.click();
                return;
            }

            if (item.classList.contains("menu-item--block")) {
                pendingProfileBlock = true;
                pendingBlockMemberId = mypageContext.pageMemberId;
                closeProfileMoreDropdown();
                openSmallModal(".Small-Modal.Ban-User");
                return;
            }

            if (item.classList.contains("menu-item--report")) {
                closeProfileMoreDropdown();
                openProfileReportDialog();
                return;
            }
        });

        document.body.appendChild(dropdown);
        activeProfileMoreDropdown = dropdown;
        activeProfileMoreButton = button;
    }

    if (!mypageContext.isOwner && profileMoreButton instanceof HTMLButtonElement) {
        profileMoreButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (activeProfileMoreButton === profileMoreButton) {
                closeProfileMoreDropdown();
                return;
            }

            closeAllMoreMenus();
            openProfileVisitorDropdown(profileMoreButton);
        });
    }

    // ── 게시글 더보기 메뉴 ──
    postMoreMenuPost?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();

        // Approve / Disapprove 토글
        if (btn.classList.contains("ApproveToggle")) {
            const approved = btn.dataset.approved === "true";
            const username = btn.dataset.username;
            const newApproved = !approved;
            btn.dataset.approved = String(newApproved);
            const textEl = btn.querySelector(".ApproveText");
            const iconEl = btn.querySelector(".ApproveIcon");
            if (textEl)
                textEl.textContent = newApproved
                    ? `${username} Disapprove`
                    : `${username} Approve`;
            if (iconEl) {
                iconEl.innerHTML = newApproved
                    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>`
                    : `<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></g></svg>`;
            }
            return;
        }
        if (btn.classList.contains("BanUser")) {
            openSmallModal(".Small-Modal.Ban-User");
            return;
        }
        if (btn.classList.contains("Report")) {
            closeAllMoreMenus();
            document
                .querySelector(".Notification-Dialog--Report")
                ?.classList.remove("off");
            return;
        }
        closeAllMoreMenus();
    });

    postMoreMenuOwnerPost?.addEventListener("click", async (e) => {
        const btn = e.target.closest(".DeleteOwnedPost");
        if (!btn || !selectedOwnedPostId) return;

        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm("게시물을 삭제할까요?")) {
            closeAllMoreMenus();
            return;
        }

        try {
            await myPageService.deletePost(selectedOwnedPostId);

            if (selectedOwnedCardType === "myreply") {
                myReplyPage = 1;
                myReplyHasMore = true;
                myPageService.getMyReplies(1, (data) => {
                    mypageLayout.showMyReplyList(data, 1);
                    myReplyHasMore = data.criteria.hasMore;
                });
            } else {
                myPostPage = 1;
                myPostHasMore = true;
                myPageService.getMyPosts(1, (data) => {
                    mypageLayout.showMyPostList(data, 1);
                    myPostHasMore = data.criteria.hasMore;
                });
            }

            selectedOwnedPostId = null;
            selectedOwnedCardType = "";
            closeAllMoreMenus();
        } catch (error) {
            alert(error.message || "게시물 삭제 중 오류가 발생했습니다.");
        }
    });

    // ── 내 상품 더보기 메뉴 ──
    postMoreMenuProduct?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        if (btn.classList.contains("DeleteProduct")) {
            // 실제 삭제는 여기서 바로 하지 않는다.
            // 사용자가 마지막으로 한 번 더 확인할 수 있도록 삭제 확인 모달만 띄운다.
            openSmallModal(".Small-Modal.Delete-Product");
            return;
        }
        if (btn.classList.contains("Edit")) {
            console.log("상품 수정");
            closeAllMoreMenus();
            return;
        }
        closeAllMoreMenus();
    });

    // ── 타인 상품 더보기 (관심없음) ──
    postMoreMenuProductOther?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        if (btn.classList.contains("NotInterested")) {
            openSmallModal(".Small-Modal.Not-Interested");
            return;
        }
        closeAllMoreMenus();
    });

    // ── 차단 모달 이벤트 ──
    document
        .querySelector(".Small-Modal.Ban-User .Small-Button.Ban")
        ?.addEventListener("click", async () => {
            if (!pendingProfileBlock || !pendingBlockMemberId) {
                closeSmallModal(".Small-Modal.Ban-User");
                return;
            }

            try {
                await myPageService.block(mypageContext.loginMemberId, pendingBlockMemberId);
                pendingProfileBlock = false;
                pendingBlockMemberId = null;
                closeSmallModal(".Small-Modal.Ban-User");
                showClipboardToast("차단되었습니다.");
            } catch (error) {
                alert(error.message || "차단 처리 중 오류가 발생했습니다.");
            }
        });

    document
        .querySelectorAll(
            ".Small-Modal.Ban-User .Small-Button.Cancel, .Small-Modal.Ban-User .Close-Button",
        )
        .forEach((el) => {
            el.addEventListener("click", () => {
                pendingProfileBlock = false;
                pendingBlockMemberId = null;
                closeSmallModal(".Small-Modal.Ban-User");
            });
        });

    // ── 관심없음 모달 이벤트 ──
    document
        .getElementById("confirmNotInterested")
        ?.addEventListener("click", () => {
            // 현재 열었던 카드 숨기거나 표시 처리
            closeSmallModal(".Small-Modal.Not-Interested");
            showClipboardToast("이 상품이 더 이상 표시되지 않습니다.");
        });
    document.querySelectorAll(".Not-Interested-Close").forEach((el) => {
        el.addEventListener("click", () =>
            closeSmallModal(".Small-Modal.Not-Interested"),
        );
    });

    // ── 상품 삭제 모달 이벤트 ──
    document
        .getElementById("confirmDeleteProduct")
        ?.addEventListener("click", async () => {
            // 더보기 버튼에서 저장한 상품 id가 없으면
            // 삭제 대상을 특정할 수 없으므로 요청을 보내지 않는다.
            if (!selectedMyProductId) {
                alert("삭제할 상품을 찾을 수 없습니다.");
                return;
            }

            try {
                const result = await myPageService.deleteProduct(selectedMyProductId);

                closeSmallModal(".Small-Modal.Delete-Product");

                // 상품 삭제 후에는 현재 화면 일부만 직접 지우지 않고,
                // 기존 내 상품 목록 조회 흐름을 다시 태워서 화면 상태를 맞춘다.
                // 이렇게 해야 page / hasMore / 무한스크롤 상태가 꼬이지 않는다.
                myProductPage = 1;
                myProductHasMore = true;

                myPageService.getMyProducts(1, (data) => {
                    mypageLayout.showMyProductList(data, 1);
                    myProductHasMore = data.criteria.hasMore;
                });

                // 한 번 삭제가 끝난 상품 id는 더 이상 들고 있을 이유가 없으므로 바로 비운다.
                selectedMyProductId = null;
                showClipboardToast(result.message || "상품이 삭제되었습니다.");
            } catch (error) {
                alert(error.message || "상품 삭제 중 오류가 발생했습니다.");
            }
        });
    document.querySelectorAll(".Delete-Product-Close").forEach((el) => {
        el.addEventListener("click", () => {
            // 삭제를 취소한 경우에도 이전에 선택했던 상품 id는 함께 비운다.
            // 그래야 다음 삭제 요청에서 예전 값이 섞이지 않는다.
            selectedMyProductId = null;
            closeSmallModal(".Small-Modal.Delete-Product");
        });
    });

    // ── 신고 모달 이벤트 ──
    document
        .querySelector(".Notification-Dialog__Close")
        ?.addEventListener("click", () => {
            pendingProfileReport = false;
            pendingReportTargetId = null;
            pendingReportTargetType = null;
            document
                .querySelector(".Notification-Dialog--Report")
                ?.classList.add("off");
        });
    document
        .querySelector(".Notification-Dialog__Backdrop")
        ?.addEventListener("click", () => {
            pendingProfileReport = false;
            pendingReportTargetId = null;
            pendingReportTargetType = null;
            document
                .querySelector(".Notification-Dialog--Report")
                ?.classList.add("off");
        });

    document
        .querySelectorAll(".Notification-Report__Item")
        .forEach((item) => {
            item.addEventListener("click", async () => {
                if (!pendingProfileReport) {
                    return;
                }

                const reason = item.querySelector("span")?.textContent?.trim() || "";

                try {
                    await myPageService.report(
                        mypageContext.loginMemberId,
                        pendingReportTargetId,
                        pendingReportTargetType,
                        reason
                    );

                    pendingProfileReport = false;
                    pendingReportTargetId = null;
                    pendingReportTargetType = null;
                    document.querySelector(".Notification-Dialog--Report")?.classList.add("off");
                    showClipboardToast("신고가 접수되었습니다.");
                } catch (error) {
                    alert(error.message || "신고 처리 중 오류가 발생했습니다.");
                }
            });
        });

    // ── 외부 클릭 시 더보기 메뉴 닫기 ──
    document.addEventListener("click", (e) => {
        if (
            !e.target.closest(".Post-More-Menu") &&
            !e.target.closest(".postMoreButton, .Post-More-Button") &&
            !e.target.closest('.tweet-action-btn[data-action="share"], .Post-Action-Btn.Share') &&
            !e.target.closest(".Profile-Edit-Btn.More") &&
            !e.target.closest(".layers-dropdown-container")
        ) {
            closeAllMoreMenus();
            closeProfileMoreDropdown();
        }
    });

    // 게시글 카드 클릭 → 게시글 상세 이동 (액션/프로필/링크는 각자 핸들러)
    document.body.addEventListener("click", (e) => {
        const card = e.target.closest('.postCard[data-post-id], .Post-Card[data-post-id]');
        if (!card) return;
        if (e.target.closest('button, a, [data-action], [data-profile-id]')) return;

        const postId = card.dataset.postId;
        const memberId = mypageContext.loginMemberId;
        const url = memberId
            ? `/main/post/detail/${postId}?memberId=${memberId}`
            : `/main/post/detail/${postId}`;
        location.href = url;
    });

    // ── 카드 액션 버튼 이벤트 위임 ──
    document.body.addEventListener(
        "click",
        async (e) => {
            // 답글 트리거는 공용 답글 모달(post-modal.js setupReply)이 처리한다.
            // 자체 답글 모달 마크업/CSS/핸들러는 Phase 3 후속 PR에서 통째 제거 예정.

            // 좋아요 버튼: UI 를 즉시 토글한 뒤 서버에 동기화한다.
            // 서버 호출이 실패하면 토글을 한 번 더 호출해 UI/DB 가 어긋나지 않도록 롤백한다.
            const likeBtn = e.target.closest('.tweet-action-btn--like, .Post-Action-Btn.Like, [data-action="like"]');
            if (likeBtn) {
                e.preventDefault();
                e.stopPropagation();
                const postId = likeBtn.closest('.postCard, .Post-Card')?.dataset.postId;
                if (!postId) return;

                const wasLiked = likeBtn.dataset.liked === 'true';
                toggleLikeButton(likeBtn);
                try {
                    if (wasLiked) {
                        await myPageService.deleteLike(mypageContext.loginMemberId, postId);

                        // Likes 탭은 "내가 좋아요한 글"만 모은 곳이라,
                        // 좋아요를 풀면 그 카드도 목록에서 빠지는 게 정의와 맞다.
                        // 다른 탭(Posts/Replies)에서 좋아요 끄는 경우엔 카드를 남겨둔다.
                        const card = likeBtn.closest('.postCard, .Post-Card');
                        if (card?.closest('.Profile-Content.Likes')) {
                            card.remove();
                            const likeList = document.querySelector('.Profile-Content.Likes .Profile-Content-List');
                            if (likeList && !likeList.querySelector('.postCard, .Post-Card')) {
                                likeList.innerHTML = `
                                  <p class="feedEmpty" style="padding: 20px; text-align: center; color: #536471;">
                                      좋아요한 게시글이 없습니다.
                                  </p>`;
                            }
                        }
                    } else {
                        await myPageService.addLike(mypageContext.loginMemberId, postId);
                    }
                } catch (error) {
                    console.error('좋아요 토글 실패', error);
                    toggleLikeButton(likeBtn);
                }
                return;
            }

            // 북마크도 같은 패턴 — 낙관적 토글 + 서버 sync + 실패 시 롤백.
            const bookmarkBtn = e.target.closest('.tweet-action-btn--bookmark, .Post-Action-Btn.Bookmark, [data-action="bookmark"]');
            if (bookmarkBtn) {
                e.preventDefault();
                e.stopPropagation();
                const postId = bookmarkBtn.closest('.postCard, .Post-Card')?.dataset.postId;
                if (!postId) return;

                const wasBookmarked = bookmarkBtn.dataset.bookmarked === 'true';
                toggleBookmarkButton(bookmarkBtn);
                try {
                    if (wasBookmarked) {
                        await myPageService.deleteBookmark(mypageContext.loginMemberId, postId);
                    } else {
                        await myPageService.addBookmark(mypageContext.loginMemberId, postId);
                    }
                } catch (error) {
                    console.error('북마크 토글 실패', error);
                    toggleBookmarkButton(bookmarkBtn);
                }
                return;
            }

            // 공유 버튼
            const shareBtn = e.target.closest('.Post-Action-Btn.Share, [data-action="share"]');
            if (shareBtn) {
                e.preventDefault();
                e.stopPropagation();
                openMoreMenu(postMoreMenuShare, shareBtn);
                return;
            }
            // 더보기 버튼
            const moreBtn = e.target.closest('.postCard .postMoreButton, .Post-Card .postMoreButton, .Post-Card .Post-More-Button, .postCard [data-action="more"], .Post-Card [data-action="more"]');
            if (moreBtn) {
                e.preventDefault();
                e.stopPropagation();
                const card = moreBtn.closest(".postCard, .Post-Card");
                const cardType = moreBtn.dataset.cardType || card?.dataset.cardType || "";

                // 내 상품 카드의 더보기 버튼을 누른 순간
                // 어떤 상품을 대상으로 메뉴를 열었는지 먼저 기억해둔다.
                // 이후 삭제 메뉴 클릭, 삭제 확인 버튼 클릭은 모두 이 id를 기준으로 동작한다.
                selectedMyProductId = card?.dataset.productId || null;

                // 내 상품 탭인지 확인
                const isMyProduct = !!card?.closest(
                    ".Profile-Content.MyProducts",
                );
                let targetMenu;
                if (isMyProduct || cardType === "myproduct") {
                    targetMenu = postMoreMenuProduct;
                } else if (card?.querySelector(".Post-Title")) {
                    // 내 탭이 아닌데 상품 카드면 → 타인 상품 (관심없음)
                    targetMenu = postMoreMenuProductOther;
                } else if (cardType === "mypost" || cardType === "myreply") {
                    closeAllMoreMenus();
                    openPostMoreDropdown(moreBtn);
                    return;
                } else {
                    targetMenu = postMoreMenuPost;
                }
                openMoreMenu(targetMenu, moreBtn);
                return;
            }
        },
        true,
    );

    // ── 공유 메뉴 클릭 처리 ──
    postMoreMenuShare?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        if (btn.classList.contains("CopyLink")) {
            closeAllMoreMenus();
            navigator.clipboard
                ?.writeText(window.location.href)
                .then(() => showClipboardToast("클립보드로 복사함"))
                .catch(() => showClipboardToast("링크를 복사하지 못했습니다"));
            return;
        }
        if (btn.classList.contains("SendChat")) {
            closeAllMoreMenus();
            openShareChatModal();
            return;
        }
        if (btn.classList.contains("AddBookmark")) {
            closeAllMoreMenus();
            openShareBookmarkModal();
            return;
        }
        closeAllMoreMenus();
    });

    // ── 공유 Chat 모달 ──
    let activeShareModal = null;

    function closeShareModal() {
        if (!activeShareModal) return;
        activeShareModal.remove();
        activeShareModal = null;
        document.body.classList.remove(BODY_MODAL_OPEN_CLASS);
    }

    function openShareChatModal() {
        closeShareModal();
        const users = [];
        document.querySelectorAll(".Sidebar-User-Cell").forEach((cell, i) => {
            const name =
                cell.querySelector(".Sidebar-User-Name")?.textContent.trim() ||
                "";
            const handle =
                cell
                    .querySelector(".Sidebar-User-Handle")
                    ?.textContent.trim() || "";
            const avatar =
                cell.querySelector(".Sidebar-User-Avatar-Img")?.src || "";
            if (name || handle) users.push({id: i, name, handle, avatar});
        });
        const rowsHtml = users.length
            ? users
                .map(
                    (u) =>
                        `<button type="button" class="Share-Sheet-User">
                <span class="Share-Sheet-User-Avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}"></span>
                <span class="Share-Sheet-User-Body">
                    <span class="Share-Sheet-User-Name">${escapeHtml(u.name)}</span>
                    <span class="Share-Sheet-User-Handle">${escapeHtml(u.handle)}</span>
                </span>
            </button>`,
                )
                .join("")
            : `<p class="Share-Sheet-Empty">전송할 수 있는 사용자가 없습니다.</p>`;

        const modal = document.createElement("div");
        modal.className = "Share-Sheet";
        modal.innerHTML = `
            <div class="Share-Sheet-Backdrop"></div>
            <div class="Share-Sheet-Card" role="dialog" aria-modal="true">
                <div class="Share-Sheet-Header">
                    <button type="button" class="Share-Sheet-Icon-Btn Share-Sheet-Close-Btn" aria-label="닫기">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>
                    </button>
                    <h2 class="Share-Sheet-Title">공유하기</h2>
                    <span class="Share-Sheet-Header-Spacer"></span>
                </div>
                <div class="Share-Sheet-Search">
                    <input type="text" class="Share-Sheet-Search-Input" placeholder="검색" aria-label="검색">
                </div>
                <div class="Share-Sheet-List">${rowsHtml}</div>
            </div>`;
        modal
            .querySelector(".Share-Sheet-Backdrop")
            .addEventListener("click", closeShareModal);
        modal
            .querySelector(".Share-Sheet-Close-Btn")
            .addEventListener("click", closeShareModal);
        modal.querySelectorAll(".Share-Sheet-User").forEach((btn) =>
            btn.addEventListener("click", () => {
                closeShareModal();
                showClipboardToast("쪽지로 전송됐습니다.");
            }),
        );
        document.body.appendChild(modal);
        document.body.classList.add(BODY_MODAL_OPEN_CLASS);
        activeShareModal = modal;
    }

    // ── 공유 북마크 모달 ──
    function openShareBookmarkModal() {
        closeShareModal();
        const modal = document.createElement("div");
        modal.className = "Share-Sheet";
        modal.innerHTML = `
            <div class="Share-Sheet-Backdrop"></div>
            <div class="Share-Sheet-Card Share-Sheet-Card--Bookmark" role="dialog" aria-modal="true">
                <div class="Share-Sheet-Header">
                    <button type="button" class="Share-Sheet-Icon-Btn Share-Sheet-Close-Btn" aria-label="닫기">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>
                    </button>
                    <h2 class="Share-Sheet-Title">폴더에 추가</h2>
                    <span class="Share-Sheet-Header-Spacer"></span>
                </div>
                <button type="button" class="Share-Sheet-Create-Folder Share-Sheet-Close-Btn">새 북마크 폴더 만들기</button>
                <button type="button" class="Share-Sheet-Folder" id="allBookmarkFolder">
                    <span class="Share-Sheet-Folder-Icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"/></svg>
                    </span>
                    <span class="Share-Sheet-Folder-Name">모든 북마크</span>
                    <span class="Share-Sheet-Folder-Check" id="bookmarkCheck">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"/></svg>
                    </span>
                </button>
            </div>`;
        modal
            .querySelector(".Share-Sheet-Backdrop")
            .addEventListener("click", closeShareModal);
        modal
            .querySelector(".Share-Sheet-Close-Btn")
            .addEventListener("click", closeShareModal);
        const folderBtn = modal.querySelector("#allBookmarkFolder");
        const checkEl = modal.querySelector("#bookmarkCheck");
        let bookmarked = false;
        checkEl.style.color = "transparent";
        folderBtn.addEventListener("click", () => {
            bookmarked = !bookmarked;
            checkEl.style.color = bookmarked ? "#1d9bf0" : "transparent";
            if (bookmarked) {
                closeShareModal();
                showClipboardToast("북마크에 추가됐습니다.");
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add(BODY_MODAL_OPEN_CLASS);
        activeShareModal = modal;
    }

    // Escape 키로 공유 모달 닫기
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAllMoreMenus();
            closeShareModal();
        }
    });

    // [FIX 4] 사이드바 팔로우 버튼 hover
    document.querySelectorAll(".Sidebar-Follow-Btn").forEach((btn) => {
        const textEl = btn.querySelector(".Sidebar-Follow-Btn-Text");
        if (!textEl) return;
        const original = textEl.textContent.trim();
        btn.addEventListener("mouseenter", () => {
            if (original === "Approved") textEl.textContent = "Disapprove";
        });
        btn.addEventListener("mouseleave", () => {
            textEl.textContent = original;
        });
    });

    // 내 상품 등록 모달
    const productWriteModal = document.querySelector(".Product-Write-Modal");
    const productWriteForm = document.querySelector(".Product-Write-Form");
    const productSubmitButton = document.querySelector(
        ".Input-Footer-Button.submit",
    );
    const productCancelButton = document.querySelector(
        ".Input-Footer-Button.cancel",
    );
    const productCloseButton = document.querySelector(
        ".Product-Write-Modal .Modal-Close-Button",
    );
    const productNameInput = document.querySelector("input[name='postName']");
    const productPriceInput = document.querySelector("input[name='postPrice']");
    const productStockInput = document.querySelector("input[name='postStock']");
    const productContentInput = document.querySelector(
        "textarea[name='postContent']",
    );
    const productImageInput = document.getElementById("productImageInput");
    const productImageHidden = document.getElementById("productImageHidden");
    const productImageUploadArea = document.querySelector(
        ".Product-Image-Upload-Area",
    );
    const productImagePlaceholder = document.querySelector(
        ".Product-Image-Upload-Placeholder",
    );
    const productImagePreviewGrid = document.querySelector(
        ".Product-Image-Preview-Grid",
    );
    const productImageResetButton = document.querySelector(
        ".Product-Image-Reset-Btn",
    );
    let productPreviewUrls = [];
    let productSubmitting = false;

    function clearProductPreviewUrls() {
        if (!productPreviewUrls.length) return;
        productPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        productPreviewUrls = [];
    }

    function syncProductImageHiddenInput(files) {
        if (!productImageHidden) return;
        productImageHidden.value = files.map((file) => file.name).join(",");
    }

    function renderProductImagePreview() {
        if (!productImagePreviewGrid || !productImageInput) return;

        const files = Array.from(productImageInput.files || []).slice(0, 4);

        clearProductPreviewUrls();
        syncProductImageHiddenInput(files);

        if (!files.length) {
            productImagePreviewGrid.innerHTML = "";
            productImagePreviewGrid.classList.add("off");
            productImagePlaceholder?.classList.remove("off");
            productImageResetButton?.classList.add("off");
            if (productImageResetButton) productImageResetButton.disabled = true;
            return;
        }

        productPreviewUrls = files.map((file) => URL.createObjectURL(file));
        productImagePreviewGrid.classList.remove("off");
        productImagePlaceholder?.classList.add("off");
        productImageResetButton?.classList.remove("off");
        if (productImageResetButton) productImageResetButton.disabled = false;

        productImagePreviewGrid.innerHTML = `
            <div class="Product-Img-Grid" data-count="${files.length}">
                ${productPreviewUrls
                    .map(
                        (url, index) => `
                            <div class="Product-Img-Item">
                                <img src="${url}" alt="상품 이미지 미리보기 ${index + 1}">
                                <button type="button" class="Product-Image-Remove-Btn" data-image-index="${index}">✕</button>
                            </div>
                        `,
                    )
                    .join("")}
            </div>
        `;
    }

    function resetProductImages() {
        clearProductPreviewUrls();
        if (productImageInput) {
            productImageInput.value = "";
        }
        syncProductImageHiddenInput([]);
        if (productImagePreviewGrid) {
            productImagePreviewGrid.innerHTML = "";
            productImagePreviewGrid.classList.add("off");
        }
        productImagePlaceholder?.classList.remove("off");
        productImageResetButton?.classList.add("off");
        if (productImageResetButton) productImageResetButton.disabled = true;
    }

    function resetProductForm() {
        productWriteForm?.reset();
        selectedTags = [];
        renderTags();
        showTopChips();
        resetProductImages();
    }

    function getSelectedCategoryName() {
        const selectedCategory = categoryScroll?.querySelector(
            ".Cat-Chip--Sub-Active, .Cat-Chip--Active",
        );
        return selectedCategory?.dataset.cat || "";
    }

    document
        .querySelector(".Content-Header-Button")
        ?.addEventListener("click", () => openModal(productWriteModal));
    productCloseButton?.addEventListener("click", () => {
        resetProductForm();
        closeModal(productWriteModal);
    });
    productCancelButton?.addEventListener("click", (e) => {
            e.preventDefault();
            resetProductForm();
            closeModal(productWriteModal);
        });
    productImageUploadArea?.addEventListener("click", (e) => {
        if (e.target.closest("[data-image-index]")) {
            return;
        }
        productImageInput?.click();
    });
    productImageInput?.addEventListener("change", renderProductImagePreview);
    productImageResetButton?.addEventListener("click", resetProductImages);
    productImagePreviewGrid?.addEventListener("click", (e) => {
        const removeButton = e.target.closest("[data-image-index]");
        if (!removeButton || !productImageInput?.files?.length) return;
        e.stopPropagation();

        const removeIndex = Number(removeButton.dataset.imageIndex);
        const dataTransfer = new DataTransfer();

        Array.from(productImageInput.files)
            .filter((_, index) => index !== removeIndex)
            .forEach((file) => dataTransfer.items.add(file));

        productImageInput.files = dataTransfer.files;
        renderProductImagePreview();
    });
    productSubmitButton?.addEventListener("click", async (e) => {
        e.preventDefault();

        const postTitle = productNameInput?.value.trim() || "";
        const productPrice = productPriceInput?.value.trim() || "";
        const productStock = productStockInput?.value.trim() || "";
        const postContent = productContentInput?.value.trim() || "";
        const postTag = postTagsInput?.value.trim() || "";
        const categoryName = getSelectedCategoryName();

        if (productSubmitting) {
            return;
        }

        if (!postTitle) {
            alert("상품 이름을 입력해주세요.");
            productNameInput?.focus();
            return;
        }

        if (!productPrice || !/^\d+$/.test(productPrice)) {
            alert("상품 가격을 숫자로 입력해주세요.");
            productPriceInput?.focus();
            return;
        }

        if (!productStock || !/^\d+$/.test(productStock)) {
            alert("상품 수량을 숫자로 입력해주세요.");
            productStockInput?.focus();
            return;
        }

        if (!postContent) {
            alert("상품 설명을 입력해주세요.");
            productContentInput?.focus();
            return;
        }

        if (!categoryName) {
            alert("상품 카테고리를 선택해주세요.");
            return;
        }

        console.log("받아온 상품정보", {
            postTitle,
            productPrice,
            productStock,
            postContent,
            postTag,
            categoryName,
        });

        const formData = new FormData();
        formData.append("postTitle", postTitle);
        formData.append("productPrice", productPrice);
        formData.append("productStock", productStock);
        formData.append("postContent", postContent);
        formData.append("categoryName", categoryName);

        if (postTag) {
            formData.append("postTag", postTag);
        }

        Array.from(productImageInput?.files || []).forEach((file) => {
            formData.append("images", file);
        });

        try {
            productSubmitting = true;
            productSubmitButton.disabled = true;

            const result = await myPageService.writeProduct(formData);

            alert(result.message || "상품 등록 성공");
            resetProductForm();
            closeModal(productWriteModal);

            // 상품 등록이 성공하면 내 상품 목록은 첫 페이지부터 다시 그려야 한다.
            // 이렇게 해야 새로 등록한 상품이 가장 위에 보이고, 기존 무한 스크롤 상태도 초기화된다.
            myProductPage = 1;
            myProductHasMore = true;
            myProductLoaded = true;

            myPageService.getMyProducts(myProductPage, (data) => {
                mypageLayout.showMyProductList(data, myProductPage);
                myProductHasMore = data.criteria.hasMore;
            });
        } catch (error) {
            alert(error.message || "상품 등록 중 오류가 발생했습니다.");
        } finally {
            productSubmitting = false;
            productSubmitButton.disabled = false;
        }
    });

    // [FIX 7] 상품 수량 숫자만
    const stockInput = document.querySelector(".Product-Stock-Input");
    if (stockInput) {
        stockInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
        });
        stockInput.addEventListener("keydown", (e) => {
            const allowed = [
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Tab",
                "Home",
                "End",
            ];
            if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
            if (e.key >= "0" && e.key <= "9") return;
            e.preventDefault();
        });
    }

    // 카테고리 칩
    const categoryScroll = document.getElementById("categoryScroll");
    const scrollLeftBtn = document.getElementById("scrollLeft");
    const scrollRightBtn = document.getElementById("scrollRight");

    function updateScrollArrows() {
        if (!categoryScroll) return;
        const {scrollLeft, scrollWidth, clientWidth} = categoryScroll;
        scrollLeftBtn?.style.setProperty(
            "display",
            scrollLeft > 0 ? "flex" : "none",
        );
        scrollRightBtn?.style.setProperty(
            "display",
            scrollLeft < scrollWidth - clientWidth - 1 ? "flex" : "none",
        );
    }

    categoryScroll?.addEventListener("scroll", updateScrollArrows);
    window.addEventListener("resize", updateScrollArrows);
    updateScrollArrows();
    scrollLeftBtn?.addEventListener("click", () =>
        categoryScroll.scrollBy({left: -160, behavior: "smooth"}),
    );
    scrollRightBtn?.addEventListener("click", () =>
        categoryScroll.scrollBy({left: 160, behavior: "smooth"}),
    );

    // 태그
    const tagList = document.getElementById("tagList");
    const postTagsInput = document.querySelector("input[name='postTag']");
    const composerTagToggle = document.getElementById("composerTagToggle");
    const composerTagEditor = document.getElementById("composerTagEditor");
    const productTagInput = document.getElementById("productTag");
    const originalChips = categoryScroll
        ? Array.from(categoryScroll.querySelectorAll(".Cat-Chip"))
        : [];
    let chipViewState = "top",
        selectedTags = [];

    function renderTags() {
        if (!tagList) return;
        if (!selectedTags.length) {
            tagList.classList.add("off");
            tagList.innerHTML = "";
            if (postTagsInput) postTagsInput.value = "";
            return;
        }
        tagList.classList.remove("off");
        tagList.innerHTML = selectedTags
            .map(
                ({label}) =>
                    `<span class="Category-Tag" data-tag="${label}" style="cursor:pointer;" title="클릭하여 제거">${label}<button type="button" class="Tag-Remove-Btn" aria-label="태그 삭제">✕</button></span>`,
            )
            .join("");
        if (postTagsInput)
            postTagsInput.value = selectedTags.map((t) => t.label).join(",");
    }

    function addTag(label, chipKey) {
        const t = label.trim();
        if (!t || selectedTags.some((x) => x.chipKey === chipKey)) return;
        selectedTags.push({label: t, chipKey});
        renderTags();
    }

    function removeTagByKey(chipKey) {
        selectedTags = selectedTags.filter((t) => t.chipKey !== chipKey);
        renderTags();
        categoryScroll
            ?.querySelectorAll(".Cat-Chip--Sub-Active,.Cat-Chip--Active")
            .forEach((chip) => {
                const key = chip.dataset.chipKey || chip.dataset.cat;
                if (key === chipKey)
                    chip.classList.remove(
                        "Cat-Chip--Sub-Active",
                        "Cat-Chip--Active",
                    );
            });
    }

    // [FIX 9] 태그 클릭으로 제거
    tagList?.addEventListener("click", (e) => {
        const tagEl = e.target.closest(".Category-Tag");
        if (!tagEl) return;
        const label = tagEl.dataset.tag;
        if (!label) return;
        const found = selectedTags.find((t) => t.label === label);
        if (found) removeTagByKey(found.chipKey);
    });

    function showTopChips() {
        if (!categoryScroll) return;
        chipViewState = "top";
        categoryScroll.innerHTML = "";
        originalChips.forEach((chip) => {
            // 이 대카테고리 아래 서브태그가 하나라도 선택돼 있으면 활성화 표시
            const subs = (chip.dataset.subs || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            const hasSubSelected =
                subs.length > 0 &&
                subs.some((s) => selectedTags.some((t) => t.chipKey === s));
            // 서브 없는 칩은 자신이 직접 태그됐을 때 활성화
            const selfSelected =
                subs.length === 0 &&
                selectedTags.some((t) => t.chipKey === chip.dataset.cat);
            chip.classList.toggle(
                "Cat-Chip--Active",
                hasSubSelected || selfSelected,
            );
            chip.classList.remove("Cat-Chip--Parent-Highlight");
            categoryScroll.appendChild(chip);
        });
        categoryScroll.scrollLeft = 0;
        updateScrollArrows();
    }

    function showSubChips(parentName, subsArray, parentChipKey) {
        if (!categoryScroll) return;
        chipViewState = "sub";
        categoryScroll.innerHTML = "";
        const b = document.createElement("button");
        b.type = "button";
        b.className = "Cat-Chip Cat-Chip--Back";
        b.textContent = `‹ ${parentName}`;
        b.dataset.action = "back";
        categoryScroll.appendChild(b);
        subsArray.forEach((sub) => {
            const sc = document.createElement("button");
            sc.type = "button";
            sc.className = "Cat-Chip";
            sc.dataset.cat = sub;
            sc.dataset.chipKey = sub;
            sc.textContent = sub;
            if (selectedTags.some((t) => t.chipKey === sub))
                sc.classList.add("Cat-Chip--Sub-Active");
            categoryScroll.appendChild(sc);
        });
        categoryScroll.scrollLeft = 0;
        updateScrollArrows();
    }

    categoryScroll?.addEventListener("click", (e) => {
        const chip = e.target.closest(".Cat-Chip");
        if (!chip) return;
        e.preventDefault();
        // 뒤로가기
        if (chip.dataset.action === "back") {
            showTopChips();
            return;
        }
        const hasSubs = chip.classList.contains("Cat-Chip--Has-Subs");
        // 탑뷰: 서브 있는 칩 → 서브뷰 진입만 (자체 태그 추가 없음)
        if (hasSubs && chipViewState === "top") {
            const pn = chip.dataset.cat;
            const subs = (chip.dataset.subs || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            showSubChips(pn, subs, chip.dataset.cat);
            return;
        }
        // 서브뷰: 서브칩 토글
        if (chipViewState === "sub") {
            const ck = chip.dataset.chipKey || chip.dataset.cat;
            const ia = chip.classList.contains("Cat-Chip--Sub-Active");
            chip.classList.toggle("Cat-Chip--Sub-Active", !ia);
            if (ia) removeTagByKey(ck);
            else addTag(ck, ck);
            return;
        }
        // 탑뷰: 서브 없는 칩 → 직접 태그 토글
        const ck = chip.dataset.cat;
        const ia = chip.classList.contains("Cat-Chip--Active");
        chip.classList.toggle("Cat-Chip--Active", !ia);
        if (ia) removeTagByKey(ck);
        else addTag(ck, ck);
        updateScrollArrows();
    });
    composerTagToggle?.addEventListener("click", () => {
        composerTagToggle.classList.add("off");
        composerTagEditor?.classList.remove("off");
        productTagInput?.focus();
    });
    productTagInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const v = productTagInput.value.trim();
            if (v) addTag(v, `manual:${v}`);
            productTagInput.value = "";
            composerTagEditor?.classList.add("off");
            composerTagToggle?.classList.remove("off");
        }
        if (e.key === "Escape") {
            productTagInput.value = "";
            composerTagEditor?.classList.add("off");
            composerTagToggle?.classList.remove("off");
        }
    });
    productTagInput?.addEventListener("blur", () => {
        const v = productTagInput.value.trim();
        if (v) addTag(v, `manual:${v}`);
        productTagInput.value = "";
        composerTagEditor?.classList.add("off");
        composerTagToggle?.classList.remove("off");
    });

    // 이미지 프리뷰
    const mediaPreviewOverlay = document.querySelector(
        ".Post-Media-Preview-Overlay",
    );
    const mediaPreviewImage = document.querySelector(
        ".Post-Media-Preview-Image",
    );
    document
        .querySelector(".Post-Media-Preview-Close")
        ?.addEventListener("click", () => {
            mediaPreviewOverlay?.classList.add("off");
            document.body.classList.remove(BODY_MODAL_OPEN_CLASS);
        });
    mediaPreviewOverlay?.addEventListener("click", (e) => {
        if (e.target === mediaPreviewOverlay) {
            mediaPreviewOverlay.classList.add("off");
            document.body.classList.remove(BODY_MODAL_OPEN_CLASS);
        }
    });
    document.querySelector(".Primary-Column")?.addEventListener(
        "click",
        (e) => {
            const imgEl = e.target.closest(".Post-Media-Img");
            if (imgEl && mediaPreviewOverlay && mediaPreviewImage) {
                e.preventDefault();
                mediaPreviewImage.src = imgEl.src;
                mediaPreviewImage.alt = imgEl.alt;
                mediaPreviewOverlay.classList.remove("off");
                document.body.classList.add(BODY_MODAL_OPEN_CLASS);
            }
        },
        true,
    );

    // 마이페이지에는 main 전체처럼 여러 종류의 Connect 버튼이 섞여 있지 않다.
    // 그래서 이벤트 위임 범위를 사이드바의 연결 버튼으로만 한정해서,
    // 다른 탭/모달 버튼과 충돌하지 않게 한다.
    document.addEventListener("click", (e) => {
        const followBtn = e.target.closest(".Mypage-Follow-Button.connect-btn.connected");
        if (!followBtn) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        openDisconnectModal(followBtn);
    });

    modalConfirm?.addEventListener("click", async () => {
        if (!disconnectTarget) {
            return;
        }

        const followerId = disconnectTarget.dataset.loginMemberId;
        const followingId = disconnectTarget.dataset.followingId;
        const card = disconnectTarget.closest(".Mypage-Follow-Card");

        if (!followerId || !followingId) {
            closeDisconnectModal();
            return;
        }

        try {
            // 서버 반영이 성공한 뒤에만 카드를 제거해야
            // 화면이 실제 팔로우 상태와 어긋나지 않는다.
            await myPageService.unfollow(followerId, followingId);
            card?.remove();

            // 요약 카드가 모두 비면 "더 보기" 링크도 의미가 없어지므로 같이 걷어낸다.
            if (!document.querySelector(".Mypage-Follow-Card")) {
                document.querySelector(".Sidebar-Card-More")?.remove();
            }
        } catch (error) {
            alert(error.message || "팔로우 해제 중 오류가 발생했습니다.");
        } finally {
            closeDisconnectModal();
        }
    });

    modalCancel?.addEventListener("click", () => {
        closeDisconnectModal();
    });

    disconnectModal?.addEventListener("click", (e) => {
        if (e.target === disconnectModal) {
            closeDisconnectModal();
        }
    });

    document.querySelector(".Header-Back-Btn").addEventListener("click", (e) => {
        e.preventDefault();
        history.back();
    })

};

function placeCaretAtEnd(element) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

