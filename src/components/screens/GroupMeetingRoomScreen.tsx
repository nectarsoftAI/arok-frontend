import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate, useBlocker } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { SPEAKER_PALETTE } from "../common/SpeakerAvatar";
import { HostEndDialog } from "../groupMeeting/HostEndDialog";
import { GuestEndedDialog } from "../groupMeeting/GuestEndedDialog";
import { LeaveDialog } from "../groupMeeting/LeaveDialog";
import { MeetingInfoBar } from "../groupMeeting/MeetingInfoBar";
import { ConnectionBanners } from "../groupMeeting/ConnectionBanners";
import { WaitingRoom } from "../groupMeeting/WaitingRoom";
import { ParticipantPanel } from "../groupMeeting/ParticipantPanel";
import { TranscriptPanel } from "../groupMeeting/TranscriptPanel";
import { MeetingControlBar } from "../groupMeeting/MeetingControlBar";
import { type GroupSegment } from "../recording/GroupTranscriptSection";
import { useOnlineMeeting, isMeetingOver } from "../../hooks/useOnlineMeeting";
import { useMicStream } from "../../hooks/useMicStream";
import { useVoiceCall } from "../../hooks/useVoiceCall";
import { useAuthStore } from "../../store/authStore";
import { meetingsApi } from "../../api/meetings";

function formatDateTime(date: Date): string {
  return date.toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export function GroupMeetingRoomScreen() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const routeState = location.state as {
    role?: "host" | "guest";
    title?: string;
    link?: string;
    token?: string;
  } | null;

  const role: "host" | "guest" = routeState?.role ?? "guest";
  const title = routeState?.title ?? "온라인 회의";
  const meetingLink = routeState?.link ?? (roomId ? `arok.meet/${roomId}` : "");
  const guestToken = routeState?.token;

  const micStream = useMicStream();

  const {
    participants,
    transcripts,
    roomStatus,
    error,
    isReconnecting,
    reconnectAttempt,
    isReconnectStalled,
    isNetworkOffline,
    isCongested,
    startedAt,
    startMeeting,
    endMeeting,
    reconnectNow,
  } = useOnlineMeeting(roomId, role, micStream.ensureTrack, guestToken);

  const startedAtDisplay = startedAt ? formatDateTime(new Date(startedAt)) : null;

  const {
    isMuted,
    activeSpeakerIds,
    error: voiceCallError,
    toggleMute,
  } = useVoiceCall(roomId, role, user?.id, roomStatus, micStream.ensureTrack, guestToken);

  const [showHostEndDialog, setShowHostEndDialog] = useState(false);
  const [showGuestEndedDialog, setShowGuestEndedDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isControlBarHidden, setIsControlBarHidden] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  // 초대 링크로 재입장하면 route state의 role이 항상 "guest"로 고정되므로,
  // 서버가 알려주는 실제 참여자 role(ADMIN)을 우선 신뢰하고
  // 아직 참여자 목록이 없는 최초 로딩 순간만 route state로 대체함
  const myServerRole = participants.find((p) => p.profileId === user?.id)?.role;
  const isHost = myServerRole ? myServerRole === "ADMIN" : role === "host";

  // "나가기" 확인 다이얼로그를 통해 의도적으로 페이지를 벗어날 때는 블로커를 건너뜀
  const intentionalLeaveRef = useRef(false);

  // 회의 중 이탈 방지 — 사이드바/로그아웃 등 다른 경로로 페이지를 벗어나려 해도
  // 아래 "나가기" 다이얼로그가 동일하게 뜨도록 함 (blocker.state === "blocked")
  const blocker = useBlocker(() => roomStatus === "LIVE" && !intentionalLeaveRef.current);

  useEffect(() => {
    if (roomStatus !== "LIVE") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [roomStatus]);

  // 경과 시간 타이머 — LIVE 상태이고 startedAt(실제 시작 시각)이 확정된 뒤에만 동작.
  // setElapsedSeconds(s => s + 1) 대신 매 tick마다 "현재시각 - startedAt"을 다시 계산해서
  // 재입장/재연결 시에도 원래 시작 시각 기준으로 정확히 이어지도록 함 (드리프트 방지)
  useEffect(() => {
    if (roomStatus !== "LIVE" || !startedAt) {
      setElapsedSeconds(0);
      return;
    }
    const startMs = new Date(startedAt).getTime();
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [roomStatus, startedAt]);

  // 회의 종료 시: 방장은 요약 트리거 후 즉시 이동, 게스트는 다이얼로그 표시.
  // COMPLETED(정상 종료)뿐 아니라 FAILED(장시간 연결 두절로 서버가 자체 종료)도 "끝난 회의"로
  // 취급해야 함 — 이걸 안 하면 화면이 실시간 회의 상태로 영원히 멈춰있게 됨(대화록/참여자는
  // 그 시점 값으로 고정된 채 아무 반응도 없음)
  useEffect(() => {
    if (!isMeetingOver(roomStatus) || !roomId) return;
    if (isHost) {
      meetingsApi.summarize(roomId).catch(() => {});
      navigate(`/meetings/${roomId}`, { state: { role: "host" } });
    } else {
      setShowGuestEndedDialog(true);
    }
  }, [roomStatus, roomId, navigate, isHost]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleHostEnd = () => {
    setShowHostEndDialog(false);
    endMeeting();
    // meeting_ended 수신 시 useEffect에서 자동 navigate
  };

  // 나가기 다이얼로그는 두 경로에서 열림: ① 컨트롤 바의 "나가기" 버튼(showLeaveDialog),
  // ② 사이드바 이동·로그아웃 등 다른 곳을 클릭해 라우터가 이탈을 가로챈 경우(blocker.state === "blocked")
  const isLeaveDialogOpen = showLeaveDialog || blocker.state === "blocked";

  // 나가기 확정 — 회의 자체는 종료하지 않고 본인만 이탈.
  // 별도 leave API/WS 메시지는 없어서, 페이지를 벗어나 컴포넌트가 unmount되면
  // useOnlineMeeting/useVoiceCall의 정리 로직이 WS·LiveKit 연결을 끊고
  // 서버가 그 연결 종료를 감지해 participant_left를 브로드캐스트하는 기존 흐름을 그대로 활용함
  const handleLeaveConfirm = () => {
    setShowLeaveDialog(false);
    if (blocker.state === "blocked") {
      // 사이드바/로그아웃 등이 원래 가려던 목적지로 그대로 이어서 이동
      blocker.proceed?.();
    } else {
      intentionalLeaveRef.current = true;
      navigate("/meetings");
    }
  };

  const handleLeaveCancel = () => {
    setShowLeaveDialog(false);
    blocker.reset?.();
  };

  const goToDetail = () => {
    navigate(`/meetings/${roomId}`, { state: { role: isHost ? "host" : "guest" } });
  };

  // transcript speakerDisplay로 실제 display_name 수집 (발화 이전엔 알 수 없음)
  const transcriptDisplayNames = useMemo(() => {
    const map: Record<string, string> = {};
    transcripts.forEach((t) => {
      if (t.profileId !== user?.id && t.speakerDisplay) {
        map[t.profileId] = t.speakerDisplay;
      }
    });
    return map;
  }, [transcripts, user?.id]);

  // participants → 표시용 이름 매핑
  const othersInOrder = participants.filter((p) => p.profileId !== user?.id);
  const nameMap = Object.fromEntries(
    participants.map((p) => {
      if (p.profileId === user?.id) return [p.profileId, user.displayName || "나"];
      const knownName = transcriptDisplayNames[p.profileId];
      if (knownName) return [p.profileId, knownName];
      const otherIdx = othersInOrder.findIndex((o) => o.profileId === p.profileId);
      return [p.profileId, `참여자 ${String.fromCharCode(65 + otherIdx)}`];
    }),
  );

  // 참여자 패널 아바타 색상 — 참여(join) 순서 기준으로 고정해서 정렬 순서가 바뀌어도 색이 안 변함
  const participantColorIndex = useMemo(
    () => new Map(participants.map((p, i) => [p.profileId, i])),
    [participants],
  );

  // 참여자 패널 정렬: 방장 → 나 → 나머지(참여 순)
  const sortedParticipants = useMemo(() => {
    const admin = participants.find((p) => p.role === "ADMIN");
    const me = participants.find((p) => p.profileId === user?.id);
    const rest = participants.filter(
      (p) => p.profileId !== admin?.profileId && p.profileId !== me?.profileId,
    );
    const head = [admin, me && me.profileId !== admin?.profileId ? me : undefined].filter(
      (p): p is typeof participants[number] => Boolean(p),
    );
    return [...head, ...rest];
  }, [participants, user?.id]);

  // transcripts → GroupSegment 변환 (speakerDisplay 직접 사용, 자신도 실명 표시)
  const segments: GroupSegment[] = transcripts.map((t, i) => ({
    id: String(i),
    speakerLabel: t.profileId,
    speakerName: t.speakerDisplay || nameMap[t.profileId] || "참여자",
    text: t.text,
    startSec: t.startSec ?? 0, // partial 상태는 아직 확정 타임스탬프가 없음
    isMine: t.profileId === user?.id,
  }));

  // live 화자 색상 맵
  const uniqueProfiles = [...new Set(transcripts.map((t) => t.profileId))];
  const colorMap: Record<string, string> = Object.fromEntries(
    uniqueProfiles.map((pid, i) => [pid, SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]]),
  );

  const isWaiting = roomStatus === "PROCESSING";

  return (
    <>
      <HostEndDialog
        isOpen={showHostEndDialog}
        onClose={() => setShowHostEndDialog(false)}
        onConfirm={handleHostEnd}
      />

      <GuestEndedDialog
        isOpen={showGuestEndedDialog}
        onGoToDetail={goToDetail}
        reason={roomStatus === "FAILED" ? "failed" : "ended"}
      />

      <LeaveDialog isOpen={isLeaveDialogOpen} onCancel={handleLeaveCancel} onConfirm={handleLeaveConfirm} />

      <div className="h-full flex flex-col relative">
        <MeetingInfoBar
          title={title}
          startedAt={startedAtDisplay}
          meetingLink={meetingLink}
          linkCopied={linkCopied}
          onCopyLink={handleCopyLink}
        />

        <ConnectionBanners
          isNetworkOffline={isNetworkOffline}
          isReconnecting={isReconnecting}
          reconnectAttempt={reconnectAttempt}
          isReconnectStalled={isReconnectStalled}
          isCongested={isCongested}
          errorMessage={error || voiceCallError}
          onReconnectNow={reconnectNow}
        />

        {/* ── 메인 영역 ── */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <AnimatePresence mode="wait">
            {isWaiting ? (
              <WaitingRoom
                participants={participants}
                nameMap={nameMap}
                currentUserId={user?.id}
                isHost={isHost}
                onStart={startMeeting}
              />
            ) : (
              <motion.div
                key="in-progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex overflow-hidden min-h-0"
                style={{ height: "100%" }}
              >
                <TranscriptPanel
                  elapsedSeconds={elapsedSeconds}
                  segments={segments}
                  isActive={roomStatus === "LIVE"}
                  colorMap={colorMap}
                />
                <ParticipantPanel
                  totalCount={participants.length}
                  sortedParticipants={sortedParticipants}
                  nameMap={nameMap}
                  colorIndexMap={participantColorIndex}
                  currentUserId={user?.id}
                  activeSpeakerIds={activeSpeakerIds}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isWaiting && (
          <MeetingControlBar
            isHidden={isControlBarHidden}
            onToggleHidden={() => setIsControlBarHidden((v) => !v)}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onLeaveClick={() => setShowLeaveDialog(true)}
            isHost={isHost}
            onEndClick={() => setShowHostEndDialog(true)}
          />
        )}
      </div>
    </>
  );
}
