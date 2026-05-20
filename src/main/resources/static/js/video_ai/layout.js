// VideoAiLayout — DOM 렌더링 유틸 모음
const VideoAiLayout = {

    // XSS 안전한 문자열 escape (chat/layout.js 와 동일 컨벤션)
    escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    },

    // 회의 1개 HTML — 기존 event.js 의 인라인 템플릿을 그대로 옮겨오되 escape 처리
    meetingItemHtml(m) {
        const id = this.escapeHtml(m.id);
        const title = this.escapeHtml(m.title);
        const date = this.escapeHtml(m.date);
        const handle = this.escapeHtml(m.handle);
        return (
            '<div class="vai-meeting-item" data-id="' + id + '">' +
            '  <div class="vai-meeting-row">' +
            '    <div class="vai-meeting-info">' +
            '      <span class="vai-meeting-title">' + title + '</span>' +
            '      <div class="vai-meeting-meta">' +
            '        <span>' + date + '</span>' +
            '        <span class="vai-meeting-dot">&middot;</span>' +
            '        <span class="vai-meeting-handle">' + handle + '</span>' +
            '      </div>' +
            '    </div>' +
            '    <div class="vai-meeting-chevron">' +
            '      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">' +
            '        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>' +
            '      </svg>' +
            '    </div>' +
            '  </div>' +
            '  <div class="vai-sub-actions">' +
            '    <div class="vai-sub-action" data-action="audio">' +
            '      <div class="vai-sub-action-icon">' +
            '        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>' +
            '      </div>' +
            '      <span class="vai-sub-action-label">오디오 재생</span>' +
            '    </div>' +
            '    <div class="vai-sub-action" data-action="summary">' +
            '      <div class="vai-sub-action-icon">' +
            '        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-6h8v2H8v-2zm0-4h8v2H8v-2zm0 8h5v2H8v-2z"></path></svg>' +
            '      </div>' +
            '      <span class="vai-sub-action-label">요약본 보기</span>' +
            '    </div>' +
            '    <div class="vai-sub-action" data-action="chat">' +
            '      <div class="vai-sub-action-icon">' +
            '        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.93 11.94c0-4.6-3.95-8.42-8.93-8.42s-8.93 3.82-8.93 8.42c-.01.83.13 1.6.33 2.29.1.34.21.65.3.94.1.3.18.55.25.79.13.48.19.94.11 1.46-.08.6-.27 1.23-.58 1.91 1.3.39 2.62.06 4.12-.61l.47-.21.44.25c1.1.61 1.87 1.11 3.49 1.11 4.98 0 8.93-3.63 8.93-8.18z"></path></svg>' +
            '      </div>' +
            '      <span class="vai-sub-action-label">AI에게 질문</span>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );
    },

    // 채팅 빈 상태 HTML — 패널 처음 열릴 때 placeholder.
    // message 를 생략하면 회의별 챗봇용 기본 문구 사용 (기존 호출자와 호환).
    chatEmptyHtml(message) {
        const text = this.escapeHtml(message || '이 회의에 대해 질문해보세요');
        return (
            '<div class="vai-chat-empty">' +
            '  <svg viewBox="0 0 24 24" width="32" height="32" fill="rgb(139,152,165)">' +
            '    <path d="M20.93 11.94c0-4.6-3.95-8.42-8.93-8.42s-8.93 3.82-8.93 8.42c-.01.83.13 1.6.33 2.29.1.34.21.65.3.94.1.3.18.55.25.79.13.48.19.94.11 1.46-.08.6-.27 1.23-.58 1.91 1.3.39 2.62.06 4.12-.61l.47-.21.44.25c1.1.61 1.87 1.11 3.49 1.11 4.98 0 8.93-3.63 8.93-8.18z"></path>' +
            '  </svg>' +
            '  <span>' + text + '</span>' +
            '</div>'
        );
    },

    // 메시지 div 1개 추가 — 빈 텍스트로 만들면 스트리밍용 컨테이너로 재사용 가능
    // AI 빈 메시지일 땐 점 3개 인디케이터를 자식으로 미리 넣어둠 (첫 청크 도착 시 제거)
    appendChatMessage(chatMessages, text, type) {
        const empty = chatMessages.querySelector('.vai-chat-empty');
        if (empty) empty.remove();
        const div = document.createElement('div');
        div.className = 'vai-msg ' + (type === 'user' ? 'vai-msg-user' : 'vai-msg-ai');
        if (text) {
            div.textContent = text;
        } else if (type !== 'user') {
            const dots = document.createElement('span');
            dots.className = 'vai-msg-loading';
            dots.setAttribute('aria-label', '응답 생성 중');
            dots.appendChild(document.createElement('span'));
            dots.appendChild(document.createElement('span'));
            dots.appendChild(document.createElement('span'));
            div.appendChild(dots);
        }
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return div;
    },

    // 스트리밍 첫 청크/완료/오류 어떤 시점이든 호출 가능 — loading 인디케이터 제거
    finishLoading(div) {
        if (!div) return;
        const dots = div.querySelector && div.querySelector('.vai-msg-loading');
        if (dots) dots.remove();
    },

    // 스트리밍 청크를 기존 div 에 append.
    // - AI 메시지면 raw 마크다운 텍스트를 dataset 에 누적해 매번 marked.parse → DOMPurify.sanitize → innerHTML.
    // - 사용자 메시지(혹은 라이브러리 미로딩 fallback) 는 [BR] 만 <br> 로 치환하는 평문 처리.
    appendChatChunk(chatMessages, div, chunk) {
        if (!chunk) return;
        const dots = div.querySelector && div.querySelector('.vai-msg-loading');
        if (dots) dots.remove();

        const isAi = div.classList && div.classList.contains('vai-msg-ai');
        const markedReady = typeof window !== 'undefined' && typeof window.marked !== 'undefined';

        if (isAi && markedReady) {
            // 라이브러리 텍스트 단위로 누적 — 부분 마크다운 (` *bold ` 시작만 와도) 이 다음 청크와 합쳐져 정상 렌더됨
            const prev = div.dataset.rawMarkdown || '';
            const next = prev + chunk.replaceAll('[BR]', '\n');
            div.dataset.rawMarkdown = next;
            const html = window.marked.parse(next, { breaks: true, gfm: true });
            div.innerHTML = (typeof window.DOMPurify !== 'undefined')
                ? window.DOMPurify.sanitize(html)
                : html;
        } else {
            const parts = chunk.split('[BR]');
            for (let i = 0; i < parts.length; i++) {
                if (i > 0) div.appendChild(document.createElement('br'));
                if (parts[i]) div.appendChild(document.createTextNode(parts[i]));
            }
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoAiLayout;
}
