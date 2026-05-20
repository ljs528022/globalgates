// VideoAiService IIFE 모듈 — fetch + ReadableStream 으로 SSE 소비
const VideoAiService = (() => {

    // SSE 이벤트 1건 (event/data 여러 줄) 파싱 — { event, data } 객체 반환.
    // event 줄 없으면 기본 'message'. data 가 JSON 이 아니면 null.
    function parseSseEvent(eventText) {
        const trimmed = eventText.trim();
        if (!trimmed) return null;
        let eventName = 'message';
        let dataRaw = null;
        for (const line of trimmed.split('\n')) {
            if (line.startsWith('event:')) {
                eventName = line.slice('event:'.length).trim();
            } else if (line.startsWith('data:')) {
                const piece = line.slice('data:'.length).trim();
                dataRaw = dataRaw === null ? piece : dataRaw + '\n' + piece;
            }
        }
        if (dataRaw === null) return null;
        try {
            return { event: eventName, data: JSON.parse(dataRaw) };
        } catch (e) {
            return null;
        }
    }

    // 공통 SSE 소비 — POST 후 ReadableStream 을 onChunk/onDone/onError 콜백으로 분기.
    // 회의별 / 전체 두 엔드포인트가 같은 SSE 포맷을 쓰므로 본문 로직을 공유한다.
    async function consumeStream(url, body, callbacks) {
        const cb = callbacks || {};

        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify(body),
                credentials: 'same-origin'
            });
        } catch (e) {
            cb.onError && cb.onError(e);
            return;
        }

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            cb.onError && cb.onError(new Error('HTTP ' + response.status + ' ' + errText));
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let receivedAny = false;

        // 한 SSE 블록 처리 — 명시적 done/error 면 onDone/onError 호출 후 true 반환
        // (호출자는 stream 을 종료한다).
        function handlePayload(payload) {
            if (!payload) return false;
            if (payload.event === 'done') {
                cb.onDone && cb.onDone();
                return true;
            }
            if (payload.event === 'error') {
                const msg = payload.data && payload.data.message
                    ? payload.data.message
                    : 'stream error';
                cb.onError && cb.onError(new Error(msg));
                return true;
            }
            if (payload.data && typeof payload.data.text === 'string') {
                receivedAny = true;
                cb.onChunk && cb.onChunk(payload.data.text);
            }
            return false;
        }

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                // SSE 이벤트는 빈 줄(`\n\n`) 단위로 분리됨 — 한 청크에 여러 이벤트가 들어올 수 있음
                let sepIdx;
                while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
                    const event = buffer.slice(0, sepIdx);
                    buffer = buffer.slice(sepIdx + 2);
                    if (handlePayload(parseSseEvent(event))) {
                        reader.cancel().catch(() => {});
                        return;
                    }
                }
            }
            // 스트림 종료 후에도 buffer 에 잔여 이벤트가 남을 수 있음 (마지막 \n\n 누락 케이스)
            if (buffer.trim()) {
                if (handlePayload(parseSseEvent(buffer))) return;
            }
            // 명시적 done/error 없이 EOF — receivedAny 면 정상 완료로 간주
            cb.onDone && cb.onDone();
        } catch (e) {
            // reader 가 도중에 끊긴 케이스 — 받은 게 있으면 done, 아니면 error
            if (receivedAny) {
                cb.onDone && cb.onDone();
            } else {
                cb.onError && cb.onError(e);
            }
        }
    }

    // history 정규화 — 배열 아니면 빈 배열, 잘못된 role 도 거름.
    // 서버는 최대 20 턴까지만 허용하므로 끝쪽(가장 최근) 부터 자른다.
    function normalizeHistory(history) {
        if (!Array.isArray(history)) return [];
        const out = [];
        for (const turn of history) {
            if (!turn || typeof turn.content !== 'string') continue;
            if (turn.role !== 'user' && turn.role !== 'assistant') continue;
            out.push({ role: turn.role, content: turn.content });
        }
        return out.slice(-20);
    }

    // POST /api/v1/video-chat/rag/stream/session → 특정 회의 1건에 한정한 SSE 스트림 소비.
    // videoSessionId 필수. history 는 같은 회의 채팅창의 직전 턴 배열 (없으면 빈 배열/생략).
    // callbacks: { onChunk(text), onDone(), onError(err) }
    const streamChat = async (question, videoSessionId, history, callbacks) => {
        if (videoSessionId == null) {
            throw new Error('streamChat: videoSessionId is required');
        }
        const body = {
            question,
            videoSessionId,
            history: normalizeHistory(history)
        };
        await consumeStream('/api/v1/video-chat/rag/stream/session', body, callbacks);
    };

    // POST /api/v1/video-chat/rag/stream/all → 회원 전체 회의 요약 통합 SSE 스트림 소비.
    // 별도 "전체 RAG 챗봇" UI 가 사용. videoSessionId 를 받지 않음.
    const streamChatAll = async (question, history, callbacks) => {
        const body = {
            question,
            history: normalizeHistory(history)
        };
        await consumeStream('/api/v1/video-chat/rag/stream/all', body, callbacks);
    };

    // GET /api/v1/video-chat/sessions → 본인(caller_id) 화상회의 목록 + 요약
    // 응답: [{ id, conversationId, callerId, receiverId, startedAt, endedAt, durationSec, summary }, ...]
    const fetchMySessions = async () => {
        const res = await fetch('/api/v1/video-chat/sessions', {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'same-origin'
        });
        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new Error('HTTP ' + res.status + ' ' + errText);
        }
        return res.json();
    };

    return { streamChat, streamChatAll, fetchMySessions };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoAiService;
}
