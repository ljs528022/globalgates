window.onload = () => {
    // -------------------------------------------------------
    // LiveKit 설정 — body data-livekit-server-url 에서 주입 (서버에서 ${EC2_HOST}:${LIVEKIT_PORT} 조립)
    // -------------------------------------------------------
    let APPLICATION_SERVER_URL = document.body?.dataset?.livekitServerUrl || "";
    let LIVEKIT_URL = "wss://test-7paroumk.livekit.cloud";
    const LivekitClient = window.LivekitClient;

    let room = null;
    let sessionId = null;
    let partnerId = null;
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    let recordingStartTime = null;

    // -------------------------------------------------------
    // Toast 알림
    // -------------------------------------------------------
    function showToast(message) {
        const existing = document.querySelector(".video-toast");
        if (existing) existing.remove();

        const toast = document.createElement("div");
        toast.className = "video-toast";
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add("show"));
        setTimeout(() => {
            toast.classList.remove("show");
            toast.addEventListener("transitionend", () => toast.remove(), { once: true });
        }, 3000);
    }

    // -------------------------------------------------------
    // 1. 페이지 진입 시 URL 파라미터로 자동 입장
    // -------------------------------------------------------
    (async () => {
        const params = new URLSearchParams(window.location.search);
        const token       = params.get("token");
        const roomName    = params.get("roomName");
        sessionId         = params.get("sessionId");
        partnerId         = params.get("partnerId");   // 상대방 id 추가
        const userName    = params.get("userName") || "나";
        const partnerName = params.get("partnerName") || "상대방";

        if (!token || !roomName) {
            console.error("화상통화 정보가 없습니다. token:", token, "roomName:", roomName);
            return;
        }

        console.log("화상통화 입장 - roomName:", roomName, "partnerId:", partnerId);
        await joinVideoRoom(token, roomName, userName, partnerName);
    })();

    // -------------------------------------------------------
    // 2. LiveKit Room 연결
    // -------------------------------------------------------
    async function joinVideoRoom(token, roomName, userName, partnerName) {
        room = new LivekitClient.Room();

        // 상대방 트랙 수신
        room.on(LivekitClient.RoomEvent.TrackSubscribed, (track, _publication, participant) => {
            console.log("TrackSubscribed 수신 - kind:", track.kind, "/ 참가자:", participant.identity);
            addVideoTrack(track, partnerName);
        });

        // 상대방 트랙 제거
        room.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
            console.log("TrackUnsubscribed - kind:", track.kind, "/ 참가자:", participant.identity);
            track.detach();
            document.getElementById(track.sid)?.remove();
            if (track.kind === "video") removeVideoContainer(partnerName);
        });

        // 상대방 입장
        room.on(LivekitClient.RoomEvent.ParticipantConnected, (participant) => {
            console.log("참가자 입장:", partnerName);
            showToast(`${partnerName}님이 입장했습니다.`);
            updateParticipantList(userName, partnerName);

            // 상대방이 입장에 성공하면 바로 녹화 시작
            startRecording();
        });

        // 상대방 퇴장 - 녹화 종료
        room.on(LivekitClient.RoomEvent.ParticipantDisconnected, (participant) => {
            console.log("참가자 퇴장:", partnerName);
            showToast(`${partnerName}님이 퇴장했습니다.`);
            updateParticipantList(userName, null);
            removeVideoContainer(partnerName);

            if (isRecording) {
                stopRecording();
            }
        });

        // 내 연결 상태 변화 감지
        room.on(LivekitClient.RoomEvent.ConnectionStateChanged, (state) => {
            console.log("연결 상태 변화:", state);
            if (state === LivekitClient.ConnectionState.Reconnecting) {
                showToast("연결이 불안정합니다. 재연결 중...");
            } else if (state === LivekitClient.ConnectionState.Disconnected) {
                showToast("연결이 끊겼습니다.");
            }
        });

        // 상대방 연결 품질 저하 감지
        room.on(LivekitClient.RoomEvent.ParticipantConnectionQualityChanged, (quality, participant) => {
            if (quality === LivekitClient.ConnectionQuality.Lost) {
                showToast(`${partnerName}님의 연결이 끊겼습니다. 재연결을 기다리는 중...`);
            }
        });

        try {
            await room.connect(LIVEKIT_URL, token);
            console.log("LiveKit 연결 성공 - 내 identity:", room.localParticipant.identity);
            console.log("현재 원격 참가자:", [...room.remoteParticipants.values()].map(p => p.identity));

            // 카메라/마이크 활성화
            try {
                await room.localParticipant.enableCameraAndMicrophone();
                console.log("카메라/마이크 활성화 성공");
                showToast("통화에 참여했습니다.");
            } catch (deviceError) {
                console.error("카메라/마이크 사용 불가:", deviceError.message);
                showToast("입장할 수 없었습니다.");
                await room.disconnect();
                room = null;
                setTimeout(() => { window.location.href = "/chat"; }, 2000);
                return;
            }

            // 마이크 활성화 후 상대방이 이미 있으면 녹화 시작
            if (room.remoteParticipants.size >= 1 && !isRecording) {
                startRecording();
            }

            // 로컬 비디오 트랙 렌더링
            const localVideoPublication = room.localParticipant.videoTrackPublications.values().next().value;
            if (localVideoPublication?.track) {
                console.log("로컬 트랙 렌더링 - identity:", room.localParticipant.identity);
                addVideoTrack(localVideoPublication.track, userName, true);
            }

            const alreadyInRoom = room.remoteParticipants.size > 0;
            updateParticipantList(userName, alreadyInRoom ? partnerName : null);

        } catch (error) {
            console.error("LiveKit 연결 실패:", error.message);
            showToast("통화 연결에 실패했습니다.");
        }
    }

    // -------------------------------------------------------
    // 3. 트랙 렌더링
    // -------------------------------------------------------
    function addVideoTrack(track, participantIdentity, local = false) {
        if (document.getElementById(track.sid)) return;

        const element = track.attach();
        element.id = track.sid;

        if (track.kind === "video") {
            const container = createVideoContainer(participantIdentity, local);
            container.append(element);
            appendParticipantData(container, participantIdentity + (local ? " (나)" : "(상대방)"));
        } else {
            document.getElementById("layout-container").append(element);
        }
    }

    function createVideoContainer(participantIdentity, local = false) {
        const existing = document.getElementById(`camera-${participantIdentity}`);
        if (existing) return existing;

        const container = document.createElement("div");
        container.id = `camera-${participantIdentity}`;
        container.className = "video-container";
        const layoutContainer = document.getElementById("layout-container");
        if (local) {
            layoutContainer?.prepend(container);
        } else {
            layoutContainer?.append(container);
        }
        return container;
    }

    function appendParticipantData(container, participantIdentity) {
        if (container.querySelector(".participant-data")) return;
        const dataElement = document.createElement("div");
        dataElement.className = "participant-data";
        dataElement.innerHTML = `<p>${participantIdentity}</p>`;
        container.prepend(dataElement);
    }

    function removeVideoContainer(participantIdentity) {
        document.getElementById(`camera-${participantIdentity}`)?.remove();
    }

    // -------------------------------------------------------
    // 4. 녹화
    // -------------------------------------------------------
    function startRecording() {
        if (isRecording) return;

        audioChunks = [];
        const audioTrack = room?.localParticipant?.audioTrackPublications?.values()?.next()?.value?.track;
        if (!audioTrack) {
            showToast("마이크 트랙을 찾을 수 없습니다.");
            return;
        }

        const stream = new MediaStream([audioTrack.mediaStreamTrack]);
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        // 녹화가 멈추면 녹화 파일을 서버에 업로드
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            const duration = Math.floor((Date.now() - recordingStartTime) / 1000);

            showToast("녹화 파일을 업로드 중...");

            try {
                const formData = new FormData();
                formData.append("file", audioBlob, `recording_${Date.now()}.webm`);
                formData.append("acceptorId", partnerId || "");
                formData.append("meetingDurationTime", duration);

                const response = await fetch("/api/video-chat/recording", {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                });

                if (!response.ok) throw new Error("업로드 실패");

                const data = await response.json();
                console.log("녹화 파일 업로드 완료 - meetingId:", data.meetingId);
                showToast("녹화 파일이 저장되었습니다.");

            } catch (error) {
                console.error("녹화 파일 업로드 실패:", error.message);
                showToast("녹화 파일 업로드에 실패했습니다.");
            }
        };

        mediaRecorder.start();
        isRecording = true;
        recordingStartTime = Date.now();
        console.log("녹화 시작");
        showToast("🔴 녹화가 시작되었습니다.");
        updateRecordingUI(true);
    }

    function stopRecording() {
        if (!isRecording) return;
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }
        isRecording = false;
        console.log("녹화 중지");
        updateRecordingUI(false);
    }

    // REC 버튼 UI 갱신
    function updateRecordingUI(recording) {
        const recBtn = document.querySelector(".rec-btn");
        if (!recBtn) return;
        if (recording) {
            recBtn.classList.add("recording");
        } else {
            recBtn.classList.remove("recording");
        }
    }

    // REC 버튼 클릭 - 토글
    document.querySelector(".rec-btn")?.addEventListener("click", () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    // -------------------------------------------------------
    // 5. 통화 종료
    // -------------------------------------------------------
    document.querySelector(".end-btn")?.addEventListener("click", () => {
        const confirmed = window.confirm("통화를 종료하시겠습니까?");
        if (!confirmed) return;
        endVideoCall();
    });

    async function endVideoCall() {
        stopRecording();

        if (room) {
            room.localParticipant.videoTrackPublications.forEach(pub => pub.track?.stop());
            room.localParticipant.audioTrackPublications.forEach(pub => pub.track?.stop());
            await room.disconnect();
            room = null;
        }

        const layoutContainer = document.getElementById("layout-container");
        if (layoutContainer) layoutContainer.innerHTML = "";

        sessionId = null;
        window.location.href = "/chat";
    }

    // -------------------------------------------------------
    // 6. 브라우저 종료 시 자동 퇴장
    // -------------------------------------------------------
    window.addEventListener("beforeunload", () => {
        if (isRecording) {
            stopRecording();
        }
        room?.disconnect();
    });

    // -------------------------------------------------------
    // 7. 참여자 상태 표시
    // -------------------------------------------------------
    function updateParticipantList(userName, partnerName) {
        const list = document.getElementById("participantList");
        if (!list) return;

        const participants = [
            { name: userName, isMe: true },
            ...(partnerName ? [{ name: partnerName, isMe: false }] : [])
        ];

        list.innerHTML = participants.map(p => `
        <li class="participant-panel-item">
            <div class="participant-avatar">${p.name.charAt(0)}</div>
            <div class="participant-info">
                <span class="participant-name">${p.name}</span>
                ${p.isMe ? `<span class="participant-me-badge">나</span>` : ""}
            </div>
        </li>
    `).join("");
    }

    // 참여자 버튼 클릭 이벤트
    document.querySelector(".circle-btn")?.addEventListener("click", () => {
        const panel = document.getElementById("participantPanel");
        if (!panel) return;
        panel.classList.toggle("off");
    });

    // 패널 닫기 버튼
    document.getElementById("participantPanelClose")?.addEventListener("click", () => {
        document.getElementById("participantPanel")?.classList.add("off");
    });
};