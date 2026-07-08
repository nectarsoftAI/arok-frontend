import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate, useBlocker } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Check, Copy, LogOut, PenLine, Sparkles, Download, Mic, MicOff } from "lucide-react";
import linkIcon from "../../assets/icons/link_icon.webp";
import personGroupIcon from "../../assets/icons/person_group_icon.webp";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { SpeakerAvatar, SPEAKER_PALETTE } from "../common/SpeakerAvatar";
import { DialogShell } from "../common/dialogs/DialogShell";
import { MeetingEndDialog } from "../common/dialogs/MeetingEndDialog";
import { GroupTranscriptSection, type GroupSegment } from "../recording/GroupTranscriptSection";
import { useOnlineMeeting } from "../../hooks/useOnlineMeeting";
import { useMicStream } from "../../hooks/useMicStream";
import { useVoiceCall } from "../../hooks/useVoiceCall";
import { useAuthStore } from "../../store/authStore";
import { meetingsApi } from "../../api/meetings";

const HOST_END_FEATURES = [
  { icon: Sparkles, label: "AI 자동 요약", desc: "대화 내용이 자동으로 분석되고 요약됩니다" },
  { icon: PenLine, label: "대화 수정 및 편집", desc: "상세 화면에서 녹음된 대화를 수정할 수 있습니다" },
  { icon: Download, label: "요약 내보내기", desc: "회의 요약을 문서 파일로 저장하고 공유할 수 있습니다" },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatNow(): string {
  return new Date().toLocaleString("ko-KR", {
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
  const startedAt = useRef(formatNow()).current;

  const micStream = useMicStream();

  const {
    participants,
    transcripts,
    roomStatus,
    error,
    isRecording,
    isReconnecting,
    reconnectAttempt,
    maxReconnectAttempts,
    isNetworkOffline,
    isCongested,
    startMeeting,
    endMeeting,
  } = useOnlineMeeting(roomId, role, micStream.ensureTrack, guestToken);

  const {
    isMuted,
    activeSpeakerIds,
    error: voiceCallError,
    toggleMute,
  } = useVoiceCall(roomId, role, user?.id, roomStatus, micStream.ensureTrack, guestToken);

  const [showHostEndDialog, setShowHostEndDialog] = useState(false);
  const [showGuestEndedDialog, setShowGuestEndedDialog] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  // 초대 링크로 재입장하면 route state의 role이 항상 "guest"로 고정되므로,
  // 서버가 알려주는 실제 참여자 role(ADMIN)을 우선 신뢰하고
  // 아직 참여자 목록이 없는 최초 로딩 순간만 route state로 대체함
  const myServerRole = participants.find((p) => p.profileId === user?.id)?.role;
  const isHost = myServerRole ? myServerRole === "ADMIN" : role === "host";

  // 회의 중 이탈 방지
  const blocker = useBlocker(roomStatus === "LIVE");

  useEffect(() => {
    if (roomStatus !== "LIVE") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [roomStatus]);

  // 경과 시간 타이머 — LIVE 상태일 때만 동작
  useEffect(() => {
    if (roomStatus !== "LIVE") return;
    setElapsedSeconds(0);
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [roomStatus]);

  // 회의 종료 시: 방장은 요약 트리거 후 즉시 이동, 게스트는 다이얼로그 표시
  useEffect(() => {
    if (roomStatus !== "COMPLETED" || !roomId) return;
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
      {/* ── 회의 중 이탈 방지 경고 ── */}
      <MeetingEndDialog
        isOpen={blocker.state === "blocked"}
        leaveWarning
        onConfirm={() => blocker.proceed?.()}
        onClose={() => blocker.reset?.()}
      />

      {/* ── 방장: 회의 종료 확인 다이얼로그 ── */}
      <DialogShell
        isOpen={showHostEndDialog}
        onClose={() => setShowHostEndDialog(false)}
        icon={<LogOut className="w-4 h-4 text-[#EF4444]" />}
        iconBg="bg-[#EF4444]/10"
        title="회의를 종료하시겠습니까?"
      >
        <div className="p-6">
          <p className="text-sm text-[#6B7280] mb-1">참여자 모두에게 종료 알림이 전송됩니다.</p>
          <p className="text-xs text-[#9CA3AF] mb-5">상세 화면에서 다음 기능을 이용할 수 있어요</p>
          <div className="space-y-2.5 mb-6">
            {HOST_END_FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F9FAFB]">
                <div className="w-7 h-7 rounded-md bg-[#5B5FF5]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-[#5B5FF5]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#1A1D2E]">{label}</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="dark" onClick={handleHostEnd} className="w-full">
            회의 종료하기
          </Button>
        </div>
      </DialogShell>

      {/* ── 참여자: 방장 종료 알림 다이얼로그 ── */}
      <DialogShell
        isOpen={showGuestEndedDialog}
        onClose={() => {}}
        icon={<LogOut className="w-4 h-4 text-[#6B7280]" />}
        iconBg="bg-[#F3F4F6]"
        title="회의가 종료되었습니다"
      >
        <div className="p-6">
          <p className="text-sm text-[#1A1D2E] font-medium mb-1">방장이 회의를 종료했습니다.</p>
          <p className="text-sm text-[#6B7280] mb-6">상세 화면에서 대화 내용을 확인할 수 있습니다.</p>
          <Button variant="primary" onClick={goToDetail} className="w-full">
            상세 화면으로 이동
          </Button>
        </div>
      </DialogShell>

      <div className="h-full flex flex-col">
        {/* ── 상단 회의 정보 바 ── */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold text-[#1A1D2E]">{title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="neutral" size="md">{startedAt}</Badge>
                <Badge variant="primary" size="md">온라인 회의</Badge>
                {isRecording && (
                  <Badge variant="primary" size="md">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      녹음 중
                    </span>
                  </Badge>
                )}
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#5B5FF5] bg-[#F3F4F6] hover:bg-[#EEF2FF] rounded-lg px-3 py-1.5 transition-colors"
            >
              <img src={linkIcon} alt="" className="w-5 h-5 object-contain scale-125" />
              <span className="font-mono truncate max-w-[140px]">{meetingLink}</span>
              {linkCopied ? <Check className="w-3 h-3 text-[#5B5FF5]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          {/* 진행 중: 참여자 아바타 */}
          {!isWaiting && participants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-3 overflow-x-auto"
            >
              {participants.map((p, i) => (
                <div key={p.profileId} className="flex items-center gap-1.5 flex-shrink-0">
                  <SpeakerAvatar
                    letter={(nameMap[p.profileId] ?? "?").charAt(0)}
                    color={SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]}
                    size="sm"
                    speaking={activeSpeakerIds.includes(p.profileId)}
                  />
                  <span className="text-xs text-[#6B7280]">{nameMap[p.profileId] ?? "참여자"}</span>
                  {p.role === "ADMIN" && (
                    <span className="text-[10px] bg-[#EEF2FF] text-[#5B5FF5] px-1.5 py-0.5 rounded">방장</span>
                  )}
                  {p.profileId === user?.id && (
                    <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded">나</span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* ── 네트워크 끊김 배너 — WS onclose보다 먼저 뜨는 즉각 신호 ── */}
        {isNetworkOffline && !isReconnecting && (
          <div className="flex-shrink-0 px-6 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            네트워크 연결이 불안정합니다
          </div>
        )}

        {/* ── 재연결 중 배너 ── */}
        {isReconnecting && (
          <div className="flex-shrink-0 px-6 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            재연결 중 {reconnectAttempt}/{maxReconnectAttempts}
          </div>
        )}

        {/* ── 전송 지연 배너 — 오디오는 계속 보내지만 네트워크가 못 따라가는 상태 ── */}
        {isCongested && (
          <div className="flex-shrink-0 px-6 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            네트워크가 느려 전송이 지연되고 있습니다
          </div>
        )}

        {/* ── 에러 배너 — STT/음성통화 공용 ── */}
        {(error || voiceCallError) && (
          <div className="flex-shrink-0 px-6 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600">
            {error || voiceCallError}
          </div>
        )}

        {/* ── 메인 영역 ── */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden min-h-0">
          <AnimatePresence mode="wait">
            {isWaiting ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="w-full max-w-md flex flex-col items-center gap-6">
                  {/* 참여자 목록 */}
                  <div className="w-full bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center gap-2">
                      <img src={personGroupIcon} alt="" className="w-4 h-4 object-contain" />
                      <span className="text-sm font-medium text-[#1A1D2E]">
                        참여자 {participants.length}명 입장
                      </span>
                    </div>
                    <ul className="divide-y divide-[#F3F4F6]">
                      {participants.length === 0 ? (
                        <li className="px-5 py-4 text-sm text-[#9CA3AF] text-center">연결 중...</li>
                      ) : (
                        participants.map((p, i) => (
                          <li key={p.profileId} className="flex items-center gap-3 px-5 py-3">
                            <SpeakerAvatar
                              letter={(nameMap[p.profileId] ?? "?").charAt(0)}
                              color={SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]}
                              size="sm"
                            />
                            <span className="text-sm text-[#1A1D2E] flex-1">
                              {nameMap[p.profileId] ?? "참여자"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {p.role === "ADMIN" && (
                                <span className="text-xs bg-[#EEF2FF] text-[#5B5FF5] px-2 py-0.5 rounded-full font-medium">방장</span>
                              )}
                              {p.profileId === user?.id && (
                                <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full font-medium">나</span>
                              )}
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {isHost ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={startMeeting}
                      className="w-full"
                    >
                      회의 시작
                    </Button>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-[#5B5FF5] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-[#6B7280] text-center">
                        방장이 회의를 시작하면 자동으로 녹음이 시작됩니다
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* 진행 중 */
              <motion.div
                key="in-progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col gap-4"
                style={{ height: "100%" }}
              >
                {/* 상태 표시 + 종료 컨트롤 */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-0.5 bg-[#EEF2FF] rounded-full flex items-center gap-1.5">
                      <motion.div
                        className="w-1.5 h-1.5 bg-[#EF4444] rounded-full"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-[#5B5FF5] text-xs font-medium">진행 중</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-[#F3F4F6] rounded-full px-4 py-1.5">
                      <motion.div
                        className="w-1.5 h-1.5 bg-[#EF4444] rounded-full flex-shrink-0"
                        animate={{ opacity: [1, 0.25, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                      <span className="text-sm font-bold text-[#1A1D2E] font-mono tabular-nums">
                        {formatTime(elapsedSeconds)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={isMuted ? "danger" : "secondary"}
                      size="sm"
                      onClick={toggleMute}
                      className="flex items-center gap-1.5"
                    >
                      {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      {isMuted ? "음소거됨" : "음소거"}
                    </Button>

                    {isHost ? (
                      <Button variant="danger" size="sm" onClick={() => setShowHostEndDialog(true)}>
                        회의 종료
                      </Button>
                    ) : (
                      <p className="text-xs text-[#9CA3AF]">방장만 회의를 종료할 수 있어요</p>
                    )}
                  </div>
                </div>

                {/* 대화 내용 */}
                <div className="flex-1 min-h-0 bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
                  <GroupTranscriptSection
                    segments={segments}
                    isActive={roomStatus === "LIVE"}
                    colorMap={colorMap}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
