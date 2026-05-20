const mypageLayout = (() => {
    const ICON_PATHS = {
        more: "M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z",
        reply: "M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z",
        like: "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
        views: "M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z",
        bookmark: "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z",
        share: "M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"
    };
    const FILLED_ICON_PATHS = {
        // 동적 카드도 첫 렌더부터 "현재 상태 그대로" 보여줘야 하므로,
        // liked/bookmarked 상태에서는 event.js의 보정 전이라도 채워진 path를 바로 내려준다.
        like: "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
        bookmark: "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"
    };

    const createActionIcon = (path) => `
        <svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true">
            <path d="${path}"></path>
        </svg>
    `;

    // 동적 카드도 정적 템플릿 카드와 같은 액션 규약을 쓰도록 data-action 속성을 함께 내려준다.
    // 이렇게 해두면 event.js는 카드가 "처음부터 있었는지" 또는 "조회 후 렌더링됐는지"를 구분하지 않고
    // 동일한 이벤트 위임 경로로 처리할 수 있다. 조회/페이징 로직에는 손대지 않고 액션 바인딩만 분리하려는 의도다.
    // 더미 카드의 구조를 그대로 유지하되, 실제 데이터만 끼워 넣는다.
    const createMyProductCard = (product) => {
        // 상품 카드도 서버가 내려준 "최종 표시용 URL"을 그대로 사용한다.
        // 이전 구현은 raw S3 key를 프런트에서 직접 버킷 주소와 이어 붙였는데,
        // 이 프로젝트의 다른 화면은 presigned URL을 서버에서 만들어 내려주는 구조다.
        // 프런트가 저장 경로 규칙을 알 필요가 없도록, 여기서는 첫 번째 이미지 URL만 그대로 쓴다.
        const image = product.postFiles?.[0] || "/images/main/global-gates-logo.png";

        const hashtags = (product.hashtags ?? [])
            .map((tag) => `<span class="Category-Tag">#${tag.tagName}</span>`)
            .join("");

        return `
            <article class="Post-Card" data-type="image-1" data-product-id="${product.id}">
                <div class="Post-Body">
                    <header class="Post-Header">
                        <div class="Post-Identity">
                            <strong class="Post-Title">${product.postTitle ?? ""}</strong>
                            <span class="Post-Category">상품 번호 ${product.id ?? ""}</span>
                        </div>
                        <div class="Post-Identity">
                            <span class="Post-Time">${product.createdDatetime ?? ""}</span>
                            <button class="Post-More-Button" type="button" aria-label="더 보기"
                                    data-action="more" data-card-type="myproduct">
                                <svg class="Post-More-Icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <g>
                                        <path d="${ICON_PATHS.more}"></path>
                                    </g>
                                </svg>
                            </button>
                        </div>
                    </header>
                    <div class="Post-Product-Info">
                        <div class="Post-Product-Image">
                            <img src="${image}" alt="${product.postTitle ?? "상품 이미지"}">
                        </div>
                        <div class="Post-Product-Detail">
                            <div class="Detail-Category-Tags">${hashtags}</div>
                            <span name="stock" class="Detail-Value">수량 ${product.productStock ?? 0}</span>
                            <span name="price" class="Detail-Value">가격 ${Number(product.productPrice ?? 0).toLocaleString()}원</span>
                        </div>
                    </div>
                    <p class="Post-Text">${product.postContent ?? ""}</p>
                    <footer class="Post-Metrics">
                        <div class="Post-Action-Bar">
                            <button class="Post-Action-Btn Like" type="button" aria-label="좋아요 0"
                                    data-action="like" data-liked="false">
                                <svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true">
                                    <path d="${ICON_PATHS.like}"></path>
                                </svg>
                                <span class="Post-Action-Count">0</span>
                            </button>
                            <button class="Post-Action-Btn" type="button" aria-label="조회수 0">
                                <svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true">
                                    <path d="${ICON_PATHS.views}"></path>
                                </svg>
                                <span class="Post-Action-Count">0</span>
                            </button>
                            <div class="Post-Action-Right">
                                <button class="Post-Action-Btn Bookmark" type="button" aria-label="북마크"
                                        data-action="bookmark" data-bookmarked="false">
                                    <svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true">
                                        <path d="${ICON_PATHS.bookmark}"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </footer>
                </div>
            </article>
        `;
    };

    // 다른 layout.js 파일들과 같은 방식으로
    // page가 1이면 기존 내용을 교체하고, 2페이지 이상이면 뒤에 이어 붙인다.
    const showMyProductList = (postProductWithPagingDTO, page) => {
        const productSection = document.querySelector(".Profile-Content.MyProducts .Profile-Content-List");
        if (!productSection) return;

        const products = postProductWithPagingDTO?.posts ?? [];
        const html = products.map(createMyProductCard).join("");

        if (products.length === 0 && page === 1) {
            productSection.innerHTML = `
                <p class="feedEmpty" style="padding: 20px; text-align: center; color: #536471;">
                    등록된 상품이 없습니다.
                </p>`;
            return;
        }

        if (page === 1) {
            productSection.innerHTML = html;
        } else {
            productSection.innerHTML += html;
        }
    };
    const createPostMediaCell = (image, className) => { // 이미지 1칸의 공통 마크업을 더미 구조 그대로 만든다.
        return `
          <div class="Post-Media-Cell ${className}">
              <div class="Post-Media-Cell-Inner">
                  <div class="Post-Media-Img-Container">
                      <div class="Post-Media-Bg" style="background-image: url('${image.filePath}');"></div>
                      <img src="${image.filePath}" alt="게시글 이미지" class="Post-Media-Img" draggable="false">
                  </div>
              </div>
          </div>
      `;
    };

    const createPostMediaHtml = (images) => { // 이미지 개수 1~4장에 따라 기존 CSS가 기대하는 마크업 구조를 만든다.
        if (images.length === 1) { // 1장은 더미 카드와 완전히 같은 단일 구조를 쓴다.
            return `
              <div class="Post-Media-Grid">
                  <div class="Post-Media-Aspect-Ratio--Single" style="position:relative;">
                      <div class="Post-Media-Absolute-Layer">
                          ${createPostMediaCell(images[0], "Post-Media-Cell--Single")}
                      </div>
                  </div>
              </div>
          `;
        }

        if (images.length === 2) { // 2장은 좌우 2칸 구조를 쓴다.
            return `
              <div class="Post-Media-Grid">
                  <div class="Post-Media-Aspect-Ratio" style="position:relative;">
                      <div class="Post-Media-Absolute-Layer">
                          <div class="Post-Media-Row">
                              ${createPostMediaCell(images[0], "Post-Media-Cell--Left")}
                              ${createPostMediaCell(images[1], "Post-Media-Cell--Right")}
                          </div>
                      </div>
                  </div>
              </div>
          `;
        }

        if (images.length === 3) { // 3장은 왼쪽 큰 이미지 1장 + 오른쪽 위아래 2장 구조를 쓴다.
            return `
              <div class="Post-Media-Grid">
                  <div class="Post-Media-Aspect-Ratio" style="position:relative;">
                      <div class="Post-Media-Absolute-Layer">
                          <div class="Post-Media-Row">
                              ${createPostMediaCell(images[0], "Post-Media-Cell--Left-Tall")}
                              <div class="Post-Media-Col">
                                  ${createPostMediaCell(images[1], "Post-Media-Cell--Right-Top")}
                                  ${createPostMediaCell(images[2], "Post-Media-Cell--Right-Bottom")}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          `;
        }

        // 4장은 2x2 그리드 구조를 쓴다.
        return  ` 
          <div class="Post-Media-Grid">
              <div class="Post-Media-Aspect-Ratio" style="position:relative;">
                  <div class="Post-Media-Absolute-Layer">
                      <div class="Post-Media-Row">
                          <div class="Post-Media-Col">
                              ${createPostMediaCell(images[0], "Post-Media-Cell--Top-Left")}
                              ${createPostMediaCell(images[1], "Post-Media-Cell--Bottom-Left")}
                          </div>
                          <div class="Post-Media-Col">
                              ${createPostMediaCell(images[2], "Post-Media-Cell--Top-Right")}
                              ${createPostMediaCell(images[3], "Post-Media-Cell--Bottom-Right")}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      `;
    };

    const createMyPostCard = (post, options = {}) => { // 게시글 1개를 더미 카드와 같은 Post-Card 마크업으로 바꾼다.
        const files = post.postFiles ?? []; // 첨부파일이 없을 때도 안전하게 처리하기 위해 기본값을 준다.
        const images = files.filter((file) => String(file.contentType).toUpperCase() === "IMAGE").slice(0, 4); // 이미지 파일만 최대 4장까지 뽑는다.
        const attachment = files.find((file) => String(file.contentType).toUpperCase() !== "IMAGE"); // 이미지가 없을 때 보여줄 일반 첨부파일 1개를 찾는다.
        const hashtags = (post.hashtags ?? []).map((tag) => `<a class="postHashtag" href="/explore/search?keyword=${encodeURIComponent(tag.tagName)}">#${tag.tagName}</a>`).join(" "); // 해시태그를 main 피드와 동일한 a 링크로 만든다.
        const viewCount = 0; // 현재 DTO에 조회수 필드가 없어서 더미 구조만 유지하고 값은 0으로 둔다.
        // 카드의 초기 아이콘 상태는 서버가 내려준 최종 상태를 그대로 따른다.
        // Likes 탭만 예외적으로 "내가 좋아요한 글 목록"이라는 화면 의미가 더 강하므로,
        // 옵션이 켜지면 DTO 값보다 우선해서 채워진 하트를 보여준다.
        // Java boolean isLiked/isBookmarked → Jackson 직렬화 시 liked/bookmarked 로 떨어짐
        const isLiked = options.forceLiked || post.liked === true || post.isLiked === true;
        const isBookmarked = post.bookmarked === true || post.isBookmarked === true;
        const cardType = options.cardType || "mypost";

        let mediaHtml = ""; // 이미지나 첨부파일이 있을 때만 채울 영역이다.
        let dataType = "text"; // 기본 카드 타입은 텍스트 게시글이다.

        if (images.length > 0) { // 이미지가 있으면 이미지 카드 구조를 만든다.
            dataType = `image-${images.length}`;
            mediaHtml = createPostMediaHtml(images);
        } else if (attachment) { // 이미지가 없고 일반 첨부파일이 있으면 파일 카드 구조를 만든다.
            dataType = "file";
            mediaHtml = `
              <div class="Post-Attachment-File">
                  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                  </svg>
                  <span class="Post-Attachment-File-Name">${attachment.originalName ?? ""}</span>
              </div>
          `;
        }

        const avatarHtml = post.memberProfileFileName
            ? `<div class="postAvatar postAvatar--image"><img class="postAvatarImage" src="${post.memberProfileFileName}" alt="프로필 이미지"></div>`
            : `<div class="postAvatar">${(post.memberNickname || post.memberHandle || "?").charAt(0)}</div>`;

        const communityMetaHtml = post.communityId && post.communityName
            ? `<div class="Post-Community-Meta">
                   <a class="Post-Community-Meta-Link" href="/community/${post.communityId}">${post.communityName}</a>
               </div>`
            : "";

        return `<article class="postCard${post.communityId ? " Post-Card--Community" : ""}" data-type="${dataType}" data-post-id="${post.id}" data-member-id="${post.memberId}" data-member-handle="${post.memberHandle ?? ""}" data-card-type="${cardType}"${post.communityId ? ` data-community-id="${post.communityId}"` : ""}>
              <div class="postBody">
                  ${communityMetaHtml}
                  <header class="postHeader">
                      <div class="postIdentity">
                          ${avatarHtml}
                          <div class="postIdentity__copy">
                              <div class="postIdentity__nameRow">
                                  <strong class="postName">${post.memberNickname ?? post.memberHandle ?? ""}</strong>
                              </div>
                              <div class="postIdentity__metaRow">
                                  <span class="postHandle">${post.memberHandle ?? ""}</span>
                                  <span class="postIdentity__sep">·</span>
                                  <span class="postTime">${post.createdDatetime ?? ""}</span>
                              </div>
                          </div>
                      </div>
                      <button class="postMoreButton" type="button" aria-label="더 보기" data-action="more" data-card-type="${cardType}">
                          <svg viewBox="0 0 24 24" class="postMoreIcon" aria-hidden="true">
                              <path d="${ICON_PATHS.more}"/>
                          </svg>
                      </button>
                  </header>
                  <p class="Post-Text postText">${post.postContent ?? ""}</p>
                  ${hashtags ? `<div class="postHashtags">${hashtags}</div>` : ""}
                  ${mediaHtml}
                  <footer class="postMetrics">
                      <div class="tweet-action-bar">
                          <button class="tweet-action-btn" type="button" aria-label="답글 ${post.replyCount ?? 0}"
                                  data-action="reply">
                              <svg viewBox="0 0 24 24" class="tweet-action-icon" aria-hidden="true">
                                  <path d="${ICON_PATHS.reply}"/>
                              </svg>
                              <span class="tweet-action-count">${post.replyCount ?? 0}</span>
                          </button>
                          <button class="tweet-action-btn tweet-action-btn--like${isLiked ? " active" : ""}" type="button" aria-label="좋아요 ${post.likeCount ?? 0}"
                                  data-action="like" data-liked="${isLiked}">
                              ${createActionIcon(isLiked ? FILLED_ICON_PATHS.like : ICON_PATHS.like)}
                              <span class="tweet-action-count">${post.likeCount ?? 0}</span>
                          </button>
                          <button class="tweet-action-btn" type="button" aria-label="조회수 ${viewCount}">
                              <svg viewBox="0 0 24 24" class="tweet-action-icon" aria-hidden="true">
                                  <path d="${ICON_PATHS.views}"/>
                              </svg>
                              <span class="tweet-action-count">${viewCount}</span>
                          </button>
                          <div class="tweet-action-right">
                              <button class="tweet-action-btn tweet-action-btn--bookmark${isBookmarked ? " active" : ""}" type="button" aria-label="북마크"
                                      data-action="bookmark" data-bookmarked="${isBookmarked}">
                                  ${createActionIcon(isBookmarked ? FILLED_ICON_PATHS.bookmark : ICON_PATHS.bookmark)}
                              </button>
                              <button class="tweet-action-btn" type="button" aria-label="공유" data-action="share">
                                  <svg viewBox="0 0 24 24" class="tweet-action-icon" aria-hidden="true">
                                      <path d="${ICON_PATHS.share}"/>
                                  </svg>
                              </button>
                          </div>
                      </div>
                  </footer>
              </div>
          </article>
      `;
    };

    const showMyPostList = (postWithPagingDTO, page) => { // API 응답으로 받은 게시글 배열을 화면에 그린다.
        const postSection = document.querySelector(".Profile-Content.Posts .Profile-Content-List"); // 게시물 탭의 목록 영역을 찾는다.
        if (!postSection) return; // 목록 영역이 없으면 끝낸다.

        const posts = postWithPagingDTO?.posts ?? []; // posts가 없을 때도 빈 배열로 처리한다.
        const html = posts.map((post) => createMyPostCard(post, { cardType: "mypost" })).join(""); // 게시글마다 카드 HTML을 만들어 하나의 문자열로 합친다.

        if (posts.length === 0 && page === 1) { // 첫 페이지부터 비어 있으면 빈 문구를 보여준다.
            postSection.innerHTML = `
              <p class="feedEmpty" style="padding: 20px; text-align: center; color: #536471;">
                  작성한 게시글이 없습니다.
              </p>`;

            return;
        }

        if (page === 1) {
            postSection.innerHTML = html;
        } else {
            postSection.innerHTML += html;
        }
    };

    const showMyReplyList = (postWithPagingDTO, page) => {
        const replySection = document.querySelector(".Profile-Content.Replies .Profile-Content-List");
        if (!replySection) return;

        const posts = postWithPagingDTO?.posts ?? [];
        const html = posts.map((post) => createMyPostCard(post, { cardType: "myreply" })).join("");

        if (posts.length === 0 && page === 1) {
            replySection.innerHTML = `
              <p class="feedEmpty" style="padding: 20px; text-align: center; color: #536471;">
                  작성한 답글이 없습니다.
              </p>`;
            return;
        }

        if (page === 1) {
            replySection.innerHTML = html;
        } else {
            replySection.innerHTML += html;
        }
    };

    const showMyLikedPostList = (postWithPagingDTO, page) => {
        // Likes 탭은 카드 구조를 새로 만들지 않고 Posts 탭과 같은 렌더러를 재사용한다.
        // 이렇게 하면 첨부파일, 해시태그, 액션 버튼, 이미지 레이아웃 규칙이 한 군데에서 유지된다.
        const likeSection = document.querySelector(".Profile-Content.Likes .Profile-Content-List");
        if (!likeSection) return;

        const posts = postWithPagingDTO?.posts ?? [];
        // Likes 탭은 목록 정의상 모두 "좋아요한 글"이므로 첫 렌더부터 하트를 채운 상태로 고정한다.
        const html = posts.map((post) => createMyPostCard({ ...post, isLiked: true }, { forceLiked: true })).join("");

        if (posts.length === 0 && page === 1) {
            likeSection.innerHTML = `
              <p class="feedEmpty" style="padding: 20px; text-align: center; color: #536471;">
                  좋아요한 게시글이 없습니다.
              </p>`;
            return;
        }

        if (page === 1) {
            likeSection.innerHTML = html;
        } else {
            likeSection.innerHTML += html;
        }
    };

    // 가격/수량 포맷터. 숫자가 아니면 빈 문자열 — 카드에서 자연스럽게 hide 처리된다.
    const formatEstimationNumber = (value) => {
        if (typeof value !== "number" || Number.isNaN(value)) return "";
        return value.toLocaleString("ko-KR");
    };

    // 상태 라벨. requesting(기본 상태)은 표시 가치가 없어 숨기고,
    // 승인/거절일 때만 한국어로 띄운다 — estimaition-list/event.js 의 formatStatusLabel 과 같은 톤.
    const formatEstimationStatusLabel = (status) => {
        switch (String(status ?? "").toLowerCase()) {
            case "approve":
                return "승인됨";
            case "reject":
                return "거절됨";
            default:
                return "";
        }
    };

    const createMyEstimationCard = (estimation, isExpert) => {
        // expert는 받은 견적이라 requester(요청자)를, non-expert는 보낸 견적이라 receiver(수신자)를
        // 카드 상단에 노출한다. 양쪽 모두 닉네임 > 이름 > 이메일 순으로 표시 우선순위를 둔다.
        const partnerNickname = isExpert ? estimation.requesterNickname : estimation.receiverNickname;
        const partnerName     = isExpert ? estimation.requesterName     : estimation.receiverName;
        const partnerHandle   = isExpert ? estimation.requesterHandle   : estimation.receiverHandle;
        const partnerEmail    = isExpert ? estimation.requesterEmail    : estimation.receiverEmail;

        const partnerDisplay = partnerNickname
            || partnerName
            || partnerEmail
            || (isExpert ? "요청자 정보 없음" : "공개 요청");
        const partnerHandleText = partnerHandle ? `@${partnerHandle}` : "";

        const createdAt = estimation.createdDateTime || "";

        // productTitle이 null이면 상품이 inactive 또는 미선택 — 상품 블록 자체를 그리지 않는다.
        const productSection = estimation.productTitle
            ? `
                <div class="Request-Product">
                    <strong class="Request-Product-Title">${estimation.productTitle}</strong>
                    <div class="Request-Product-Meta">
                        ${estimation.productStock != null
                            ? `<span class="Request-Product-Stock">수량 ${formatEstimationNumber(estimation.productStock)}</span>`
                            : ""}
                        ${estimation.productPrice != null
                            ? `<span class="Request-Product-Price">${formatEstimationNumber(estimation.productPrice)}원</span>`
                            : ""}
                    </div>
                </div>
            `
            : "";

        return `
            <div class="Request-Container">
                <div class="Request-Card">
                    <div class="Request-Partner">
                        <strong class="Request-Partner-Name">${partnerDisplay}</strong>
                        ${partnerHandleText
                            ? `<span class="Request-Partner-Handle">${partnerHandleText}</span>`
                            : ""}
                    </div>
                    <div class="Request-Title">${estimation.title ?? ""}</div>
                    ${productSection}
                    <div class="Request-With">
                        ${(() => {
                            const statusLabel = formatEstimationStatusLabel(estimation.status);
                            return statusLabel
                                ? `<span class="With-People">${statusLabel}</span>`
                                : "";
                        })()}
                        <span class="With-People">${createdAt}</span>
                    </div>
                </div>
            </div>
        `;
    };

    const showMyEstimationSummary = (data) => {
        const section = document.querySelector("[data-mypage-estimation-list]");
        if (!section) return;

        const estimations = data?.estimations ?? [];
        const isExpert = !!data?.expert;

        if (estimations.length === 0 && isExpert) {
            section.innerHTML = `
                <div class="Request-Container">
                    <div class="Request-Title">견적 요청이 없습니다.</div>
                </div>
            `;
            return;
        }
        if (estimations.length === 0 && !isExpert) {
            section.innerHTML = `
                <div class="Request-Container">
                    <div class="Request-Title">요청한 견적이 없습니다.</div>
                </div>
            `;
            return;
        }

        section.innerHTML = estimations.map((estimation) => createMyEstimationCard(estimation, isExpert)).join("");
    };

    const appendMyRequestedEstimationList = (data, page) => {
        const section = document.querySelector("[data-mypage-estimation-list]");
        if (!section) return;

        // 사이드바 첫 화면은 summary API가 이미 5개를 렌더링한다.
        // 그래서 non-expert의 첫 "더 보기"는 page 1 전체를 다시 덮어쓰지 않고,
        // 같은 1페이지 안의 6번째 이후 항목만 뒤에 이어 붙여야 한다.
        const estimations = (data?.estimations ?? []).slice(page === 1 ? 5 : 0);
        const html = estimations.map((estimation) => createMyEstimationCard(estimation, false)).join("");

        if (estimations.length === 0 && page === 1) {
            return;
        }

        section.innerHTML += html;
    };

    return {
        showMyProductList: showMyProductList,
        showMyPostList: showMyPostList,
        showMyReplyList: showMyReplyList,
        showMyLikedPostList: showMyLikedPostList,
        showMyEstimationSummary: showMyEstimationSummary,
        appendMyRequestedEstimationList: appendMyRequestedEstimationList
    };
})();
