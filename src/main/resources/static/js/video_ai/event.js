document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. 회의 목록 — GET /api/v1/video-chat/sessions 응답을 화면 모델로 변환해 채움.
    //    caller_id = 인증된 본인 인 화상회의만 백엔드에서 필터링됨.
    let meetings = [];

    // 요약 첫 줄의 "—" 뒤 본문을 회의 제목으로 추출. 없으면 첫 줄 트림본 사용.
    function deriveTitle(summary) {
        if (!summary) return null;
        const firstLine = summary.split('\n')[0].trim();
        const dashIdx = firstLine.indexOf('—');
        const candidate = dashIdx >= 0 ? firstLine.slice(dashIdx + 1).trim() : firstLine;
        return candidate.length > 40 ? candidate.slice(0, 40) + '…' : candidate;
    }

    // API 응답 1건 → 위젯이 쓰는 회의 모델로 변환
    // 수신자 표시명: handle 우선(@형식), 없으면 nickname, 그것도 없으면 fallback
    function deriveHandle(s) {
        if (s.receiverHandle) return '@' + s.receiverHandle;
        if (s.receiverNickname) return s.receiverNickname;
        return '@user-' + s.receiverId;
    }

    function mapApiToMeeting(s) {
        const date = (s.startedAt || '').slice(0, 10);
        const title = deriveTitle(s.summary) || ('화상회의 ' + (date || '#' + s.id));
        return {
            id: 'sess-' + s.id,
            videoSessionId: s.id,
            title,
            date,
            handle: deriveHandle(s),
            audioUrl: '',
            summaryTitle: title,
            summaryText: s.summary || '요약본이 아직 준비되지 않았습니다.'
        };
    }

    // 2. 상태
    let currentMeeting = null;
    let expandedMeetingId = null;
    let isStreaming = false;
    // 회의별 채팅 history — 패널을 다시 열어도 같은 회의면 직전 대화가 유지된다.
    // 서버는 stateless 라 매 요청마다 이 배열을 그대로 동봉해 맥락을 잇는다.
    const historyByMeetingId = new Map();
    // 서버 상한(20)과 어긋나지 않게 클라이언트도 같은 슬라이딩 윈도우 적용
    const HISTORY_MAX_TURNS = 20;

    // 3. DOM 참조
    const fab = document.getElementById('vaiFab');
    const dropdown = document.getElementById('vaiDropdown');
    const meetingToggle = document.getElementById('vaiMeetingToggle');
    const meetingChevron = document.getElementById('vaiMeetingChevron');
    const meetingList = document.getElementById('vaiMeetingList');

    const audioPanel = document.getElementById('vaiAudioPanel');
    const audioPlayer = document.getElementById('vaiAudioPlayer');
    const audioTitle = document.getElementById('vaiAudioTitle');
    const audioBack = document.getElementById('vaiAudioBack');
    const audioClose = document.getElementById('vaiAudioClose');

    const summaryPanel = document.getElementById('vaiSummaryPanel');
    const summaryTitle = document.getElementById('vaiSummaryTitle');
    const summaryText = document.getElementById('vaiSummaryText');
    const summaryBack = document.getElementById('vaiSummaryBack');
    const summaryClose = document.getElementById('vaiSummaryClose');

    const chatPanel = document.getElementById('vaiChatPanel');
    const chatTitle = document.getElementById('vaiChatTitle');
    const chatMessages = document.getElementById('vaiChatMessages');
    const chatTextarea = document.getElementById('vaiChatTextarea');
    const chatSendBtn = document.getElementById('vaiChatSend');
    const chatBack = document.getElementById('vaiChatBack');
    const chatClose = document.getElementById('vaiChatClose');

    // 전체 회의 통합 AI 챗봇 UI — 회의별 챗봇과 별도 패널/상태
    const allChatToggle = document.getElementById('vaiAllChatToggle');
    const allChatPanel = document.getElementById('vaiAllChatPanel');
    const allChatMessages = document.getElementById('vaiAllChatMessages');
    const allChatTextarea = document.getElementById('vaiAllChatTextarea');
    const allChatSendBtn = document.getElementById('vaiAllChatSend');
    const allChatBack = document.getElementById('vaiAllChatBack');
    const allChatClose = document.getElementById('vaiAllChatClose');
    let isAllStreaming = false;
    // 전체 챗봇 history — 회의별 Map 과 달리 하나의 라인. 회의별과 섞이지 않음.
    const allChatHistory = [];

    // 4. 회의 목록 렌더링 — Spring 에서 가져온 데이터로 채움. 빈 결과/오류는 안내 메시지로 표시.
    function renderEmpty(message) {
        meetingList.innerHTML =
            '<div style="padding:16px 16px 16px 28px;color:#536471;font-size:14px;line-height:1.5;">' +
            VideoAiLayout.escapeHtml(message) +
            '</div>';
    }

    async function renderMeetings() {
        renderEmpty('회의 목록을 불러오는 중…');
        let list;
        try {
            list = await VideoAiService.fetchMySessions();
        } catch (e) {
            renderEmpty('회의 목록을 불러오지 못했습니다. (' + (e && e.message ? e.message : e) + ')');
            return;
        }
        meetings = (Array.isArray(list) ? list : []).map(mapApiToMeeting);
        if (meetings.length === 0) {
            renderEmpty('아직 본인이 시작한 화상회의가 없습니다.');
            return;
        }
        meetingList.innerHTML = meetings
            .map(m => VideoAiLayout.meetingItemHtml(m))
            .join('');
        bindMeetingEvents();
    }

    function findMeeting(id) {
        return meetings.find(m => m.id === id) || null;
    }

    // 5. 회의 행/서브액션 이벤트
    function bindMeetingEvents() {
        meetingList.querySelectorAll('.vai-meeting-row').forEach(row => {
            row.addEventListener('click', e => {
                e.stopPropagation();
                const item = row.closest('.vai-meeting-item');
                const id = item.getAttribute('data-id');
                const subActions = item.querySelector('.vai-sub-actions');
                const chevron = item.querySelector('.vai-meeting-chevron');

                if (expandedMeetingId === id) {
                    subActions.classList.remove('open');
                    chevron.classList.remove('expanded');
                    expandedMeetingId = null;
                    currentMeeting = null;
                } else {
                    collapseAllSubActions(true);
                    subActions.classList.add('open');
                    chevron.classList.add('expanded');
                    expandedMeetingId = id;
                    currentMeeting = findMeeting(id);
                }
            });
        });

        meetingList.querySelectorAll('.vai-sub-action').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                if (!currentMeeting) return;
                const action = btn.getAttribute('data-action');
                if (action === 'audio') openAudio();
                else if (action === 'summary') openSummary();
                else if (action === 'chat') openChat();
            });
        });
    }

    function collapseAllSubActions(instant) {
        const allSubs = meetingList.querySelectorAll('.vai-sub-actions');
        const allChevrons = meetingList.querySelectorAll('.vai-meeting-chevron');
        allSubs.forEach(s => {
            if (instant) s.classList.add('no-transition');
            s.classList.remove('open');
            if (instant) {
                // reflow 강제 → transition 즉시 적용
                s.offsetHeight;
                s.classList.remove('no-transition');
            }
        });
        allChevrons.forEach(c => c.classList.remove('expanded'));
        expandedMeetingId = null;
    }

    function closeAllPanels() {
        audioPanel.classList.remove('open');
        summaryPanel.classList.remove('open');
        chatPanel.classList.remove('open');
        allChatPanel.classList.remove('open');
        audioPlayer.pause();
    }

    function closeEverything() {
        dropdown.classList.remove('open');
        meetingList.classList.remove('open');
        meetingChevron.classList.remove('expanded');
        collapseAllSubActions();
        closeAllPanels();
    }

    function backToDropdown() {
        closeAllPanels();
        dropdown.classList.add('open');
    }

    // 6. FAB / 회의 목록 토글
    fab.addEventListener('click', e => {
        e.stopPropagation();
        if (dropdown.classList.contains('open')) {
            closeEverything();
        } else {
            closeAllPanels();
            dropdown.classList.add('open');
        }
    });

    meetingToggle.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = meetingList.classList.contains('open');
        if (isOpen) {
            meetingList.classList.remove('open');
            meetingChevron.classList.remove('expanded');
            collapseAllSubActions();
        } else {
            meetingList.classList.add('open');
            meetingChevron.classList.add('expanded');
        }
    });

    // 7. 패널 오픈
    function openAudio() {
        audioTitle.textContent = currentMeeting.title + ' - 오디오';
        if (currentMeeting.audioUrl) audioPlayer.src = currentMeeting.audioUrl;
        else audioPlayer.removeAttribute('src');
        dropdown.classList.remove('open');
        closeAllPanels();
        audioPanel.classList.add('open');
    }

    function openSummary() {
        summaryTitle.textContent = currentMeeting.summaryTitle;
        summaryText.textContent = currentMeeting.summaryText;
        dropdown.classList.remove('open');
        closeAllPanels();
        summaryPanel.classList.add('open');
    }

    function openChat() {
        chatTitle.textContent = currentMeeting.title + ' - AI 질문';
        resetChat();
        dropdown.classList.remove('open');
        closeAllPanels();
        chatPanel.classList.add('open');
        setTimeout(() => chatTextarea.focus(), 100);
    }

    // 전체 챗봇 열기 — history 와 메시지 영역은 유지 (재진입 시 직전 대화 그대로 보이게)
    function openAllChat() {
        if (allChatMessages.childElementCount === 0
                || allChatMessages.querySelector('.vai-chat-empty')) {
            // 첫 진입 또는 reset 된 상태 — placeholder 만 있을 때 통합 안내 문구로 갱신
            allChatMessages.innerHTML = VideoAiLayout.chatEmptyHtml(
                '전체 회의 요약에 대해 질문해보세요'
            );
        }
        dropdown.classList.remove('open');
        closeAllPanels();
        allChatPanel.classList.add('open');
        setTimeout(() => allChatTextarea.focus(), 100);
    }

    allChatToggle.addEventListener('click', e => {
        e.stopPropagation();
        openAllChat();
    });

    // 8. 뒤로/닫기
    audioBack.addEventListener('click', e => { e.stopPropagation(); backToDropdown(); });
    summaryBack.addEventListener('click', e => { e.stopPropagation(); backToDropdown(); });
    chatBack.addEventListener('click', e => { e.stopPropagation(); backToDropdown(); });
    allChatBack.addEventListener('click', e => { e.stopPropagation(); backToDropdown(); });
    audioClose.addEventListener('click', e => { e.stopPropagation(); closeEverything(); });
    summaryClose.addEventListener('click', e => { e.stopPropagation(); closeEverything(); });
    chatClose.addEventListener('click', e => { e.stopPropagation(); closeEverything(); });
    allChatClose.addEventListener('click', e => { e.stopPropagation(); closeEverything(); });

    document.addEventListener('click', e => {
        const container = document.getElementById('vaiContainer');
        if (!container.contains(e.target)) closeEverything();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeEverything();
    });

    function resetChat() {
        chatMessages.innerHTML = VideoAiLayout.chatEmptyHtml();
    }

    // 9. 메시지 전송 → VideoAiService.streamChat 으로 SSE 소비.
    // 회의별 history 를 동봉해 다음 턴 발화도 이전 맥락에서 해석되게 한다.
    async function sendMessage() {
        if (isStreaming) return;
        const text = chatTextarea.value.trim();
        if (!text || !currentMeeting) return;

        VideoAiLayout.appendChatMessage(chatMessages, text, 'user');
        chatTextarea.value = '';
        chatTextarea.style.height = 'auto';

        // 이번 요청에 보낼 history 는 사용자 새 발화 추가 전 스냅샷 — 백엔드에서는
        // history + (이번) question 으로 답을 만들기 때문에 question 을 history 에 미리 넣으면 중복.
        // 요청 보내는 시점에 history 스냅샷을 떠두고, 응답이 끝난 뒤에 user + assistant 를 같이 push.
        const meetingKeyAtSend = currentMeeting.id;
        const historySnapshot = (historyByMeetingId.get(meetingKeyAtSend) || []).slice();

        // AI 응답을 누적할 빈 div 미리 생성
        const aiDiv = VideoAiLayout.appendChatMessage(chatMessages, '', 'ai');
        isStreaming = true;
        chatSendBtn.disabled = true;
        chatTextarea.disabled = true;

        let aiAccum = '';

        await VideoAiService.streamChat(text, currentMeeting.videoSessionId, historySnapshot, {
            onChunk: chunk => {
                aiAccum += chunk;
                VideoAiLayout.appendChatChunk(chatMessages, aiDiv, chunk);
            },
            onDone: () => {
                VideoAiLayout.finishLoading(aiDiv);
                // 정상 응답을 받은 경우에만 history 에 누적 — 에러 응답은 다음 턴에 노이즈가 됨.
                // 응답 도중 사용자가 다른 회의로 이동했어도 원래 회의 history 에만 반영.
                if (aiAccum) {
                    const arr = historyByMeetingId.get(meetingKeyAtSend) || (() => {
                        const fresh = [];
                        historyByMeetingId.set(meetingKeyAtSend, fresh);
                        return fresh;
                    })();
                    arr.push({ role: 'user', content: text });
                    arr.push({ role: 'assistant', content: aiAccum });
                    if (arr.length > HISTORY_MAX_TURNS) {
                        arr.splice(0, arr.length - HISTORY_MAX_TURNS);
                    }
                }
                isStreaming = false;
                chatSendBtn.disabled = false;
                chatTextarea.disabled = false;
                chatTextarea.focus();
            },
            onError: err => {
                VideoAiLayout.finishLoading(aiDiv);
                const hasContent = aiDiv.childNodes.length > 0;
                VideoAiLayout.appendChatChunk(
                    chatMessages, aiDiv,
                    (hasContent ? '\n' : '') + '[오류] ' + (err && err.message ? err.message : String(err))
                );
                isStreaming = false;
                chatSendBtn.disabled = false;
                chatTextarea.disabled = false;
            }
        });
    }

    chatSendBtn.addEventListener('click', e => { e.stopPropagation(); sendMessage(); });
    chatTextarea.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    chatTextarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    // 10. 전체 챗봇 — VideoAiService.streamChatAll 로 SSE 소비.
    // 전역 allChatHistory 한 줄을 매 요청마다 동봉.
    async function sendAllMessage() {
        if (isAllStreaming) return;
        const text = allChatTextarea.value.trim();
        if (!text) return;

        VideoAiLayout.appendChatMessage(allChatMessages, text, 'user');
        allChatTextarea.value = '';
        allChatTextarea.style.height = 'auto';

        const historySnapshot = allChatHistory.slice();
        const aiDiv = VideoAiLayout.appendChatMessage(allChatMessages, '', 'ai');
        isAllStreaming = true;
        allChatSendBtn.disabled = true;
        allChatTextarea.disabled = true;

        let aiAccum = '';

        await VideoAiService.streamChatAll(text, historySnapshot, {
            onChunk: chunk => {
                aiAccum += chunk;
                VideoAiLayout.appendChatChunk(allChatMessages, aiDiv, chunk);
            },
            onDone: () => {
                VideoAiLayout.finishLoading(aiDiv);
                if (aiAccum) {
                    allChatHistory.push({ role: 'user', content: text });
                    allChatHistory.push({ role: 'assistant', content: aiAccum });
                    if (allChatHistory.length > HISTORY_MAX_TURNS) {
                        allChatHistory.splice(0, allChatHistory.length - HISTORY_MAX_TURNS);
                    }
                }
                isAllStreaming = false;
                allChatSendBtn.disabled = false;
                allChatTextarea.disabled = false;
                allChatTextarea.focus();
            },
            onError: err => {
                VideoAiLayout.finishLoading(aiDiv);
                const hasContent = aiDiv.childNodes.length > 0;
                VideoAiLayout.appendChatChunk(
                    allChatMessages, aiDiv,
                    (hasContent ? '\n' : '') + '[오류] ' + (err && err.message ? err.message : String(err))
                );
                isAllStreaming = false;
                allChatSendBtn.disabled = false;
                allChatTextarea.disabled = false;
            }
        });
    }

    allChatSendBtn.addEventListener('click', e => { e.stopPropagation(); sendAllMessage(); });
    allChatTextarea.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAllMessage(); }
    });
    allChatTextarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    renderMeetings();
});
