import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Check, Copy, Loader2, LogOut, PenLine, Sparkles, Download } from "lucide-react";
import linkIcon from "../../assets/icons/link_icon.webp";
import personGroupIcon from "../../assets/icons/person_group_icon.webp";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { SpeakerAvatar, SPEAKER_PALETTE } from "../common/SpeakerAvatar";
import { DialogShell } from "../common/dialogs/DialogShell";
import { GroupTranscriptSection, type GroupSegment } from "../recording/GroupTranscriptSection";

type RoomStatus = "waiting" | "in-progress";

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isCurrentUser: boolean;
}

const MOCK_HOST: Participant = { id: "1", name: "홍길동", isHost: true, isCurrentUser: false };
const MOCK_GUESTS: Participant[] = [
  { id: "2", name: "김철수", isHost: false, isCurrentUser: false },
  { id: "3", name: "이영희", isHost: false, isCurrentUser: false },
];
const MOCK_ME_GUEST: Participant = { id: "4", name: "박지수", isHost: false, isCurrentUser: true };

const HOST_END_FEATURES = [
  {
    icon: Sparkles,
    label: "AI 자동 요약",
    desc: "대화 내용이 자동으로 분석되고 요약됩니다",
  },
  {
    icon: PenLine,
    label: "대화 수정 및 편집",
    desc: "상세 화면에서 녹음된 대화를 수정할 수 있습니다",
  },
  {
    icon: Download,
    label: "요약 내보내기",
    desc: "회의 요약을 문서 파일로 저장하고 공유할 수 있습니다",
  },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatNow(): string {
  return new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GroupMeetingRoomScreen() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const routeState = location.state as {
    role?: "host" | "guest";
    title?: string;
    link?: string;
  } | null;

  const role: "host" | "guest" = routeState?.role ?? "guest";
  const title = routeState?.title ?? "온라인 회의";
  const meetingLink = routeState?.link ?? (roomId ? `arok.meet/${roomId}` : "");
  const startedAt = useRef(formatNow()).current;

  const participants: Participant[] =
    role === "host"
      ? [{ ...MOCK_HOST, isCurrentUser: true }, ...MOCK_GUESTS]
      : [MOCK_HOST, ...MOCK_GUESTS, MOCK_ME_GUEST];

  const [roomStatus, setRoomStatus] = useState<RoomStatus>("waiting");
  const [showHostEndDialog, setShowHostEndDialog] = useState(false);
  const [showGuestEndedDialog, setShowGuestEndedDialog] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [segments, setSegments] = useState<GroupSegment[]>([]);
  const segmentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // speakerLabel → color (상대방용)
  const colorMap: Record<string, string> = {
    "Speaker_2": SPEAKER_PALETTE[1],
    "Speaker_3": SPEAKER_PALETTE[2],
  };

  // Mock 세그먼트: 진행 중 상태가 되면 순차적으로 추가
  const MOCK_SEGMENTS: GroupSegment[] = [
    { id: "1", speakerLabel: "Speaker_2", speakerName: "김철수", text: "안녕하세요, 오늘 회의 시작하겠습니다.", startSec: 2, isMine: false },
    { id: "2", speakerLabel: "Speaker_1", speakerName: "나", text: "네, 잘 부탁드립니다.", startSec: 6, isMine: true },
    { id: "3", speakerLabel: "Speaker_3", speakerName: "이영희", text: "저도 잘 부탁드립니다. 오늘 안건이 무엇인가요?", startSec: 10, isMine: false },
    { id: "4", speakerLabel: "Speaker_1", speakerName: "나", text: "이번 주 진행 상황 공유하고, 다음 스프린트 계획을 논의할 예정입니다.", startSec: 15, isMine: true },
    { id: "5", speakerLabel: "Speaker_2", speakerName: "김철수", text: "좋습니다. 제가 먼저 이번 주 작업 내용을 공유할게요.", startSec: 21, isMine: false },
  ];

  useEffect(() => {
    if (roomStatus !== "in-progress") return;
    setElapsedSeconds(0);
    setSegments([]);

    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);

    // Mock 세그먼트 순차 추가
    MOCK_SEGMENTS.forEach((seg, i) => {
      const t = setTimeout(() => {
        setSegments((prev) => [...prev, seg]);
      }, (i + 1) * 2500);
      segmentTimerRef.current = t;
    });

    return () => {
      clearInterval(id);
      // 타이머 정리는 컴포넌트 언마운트 시 처리
    };
  }, [roomStatus]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const goToDetail = () => {
    navigate(`/meetings/${roomId}`, { state: { role } });
  };

  const guestCount = participants.filter((p) => !p.isHost).length;
  const canStart = guestCount > 0;

  return (
    <>
      {/* ── 방장: 회의 종료 확인 다이얼로그 ── */}
      <DialogShell
        isOpen={showHostEndDialog}
        onClose={() => setShowHostEndDialog(false)}
        icon={<LogOut className="w-4 h-4 text-[#EF4444]" />}
        iconBg="bg-[#EF4444]/10"
        title="회의를 종료하시겠습니까?"
      >
        <div className="p-6">
          <p className="text-sm text-[#6B7280] mb-1">
            참여자 모두에게 종료 알림이 전송됩니다.
          </p>
          <p className="text-xs text-[#9CA3AF] mb-5">
            상세 화면에서 다음 기능을 이용할 수 있어요
          </p>
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
          <Button variant="dark" onClick={goToDetail} className="w-full">
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
          <p className="text-sm text-[#1A1D2E] font-medium mb-1">
            방장이 회의를 종료했습니다.
          </p>
          <p className="text-sm text-[#6B7280] mb-6">
            상세 화면에서 대화 내용을 확인할 수 있습니다.
          </p>
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
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#5B5FF5] bg-[#F3F4F6] hover:bg-[#EEF2FF] rounded-lg px-3 py-1.5 transition-colors"
            >
              <img src={linkIcon} alt="" className="w-5 h-5 object-contain scale-125" />
              <span className="font-mono truncate max-w-[140px]">{meetingLink}</span>
              {linkCopied
                ? <Check className="w-3 h-3 text-[#5B5FF5]" />
                : <Copy className="w-3 h-3" />}
            </button>
          </div>

          {/* 진행 중: 참여자 아바타 한 줄 */}
          {roomStatus === "in-progress" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-3 overflow-x-auto"
            >
              {participants.map((p, i) => (
                <div key={p.id} className="flex items-center gap-1.5 flex-shrink-0">
                  <SpeakerAvatar
                    letter={p.name.charAt(0)}
                    color={SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]}
                    size="sm"
                  />
                  <span className="text-xs text-[#6B7280]">{p.name}</span>
                  {p.isHost && (
                    <span className="text-[10px] bg-[#EEF2FF] text-[#5B5FF5] px-1.5 py-0.5 rounded">방장</span>
                  )}
                  {p.isCurrentUser && (
                    <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded">나</span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* ── 메인 영역 ── */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden min-h-0">
          <AnimatePresence mode="wait">
            {roomStatus === "waiting" ? (
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
                    {participants.map((p, i) => (
                      <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                        <SpeakerAvatar
                          letter={p.name.charAt(0)}
                          color={SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]}
                          size="sm"
                        />
                        <span className="text-sm text-[#1A1D2E] flex-1">{p.name}</span>
                        <div className="flex items-center gap-1.5">
                          {p.isHost && (
                            <span className="text-xs bg-[#EEF2FF] text-[#5B5FF5] px-2 py-0.5 rounded-full font-medium">
                              방장
                            </span>
                          )}
                          {p.isCurrentUser && (
                            <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full font-medium">
                              나
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {role === "host" ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    {!canStart && (
                      <p className="text-sm text-[#6B7280] text-center">
                        참여자가 입장하면 회의를 시작할 수 있어요
                      </p>
                    )}
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={!canStart}
                      onClick={() => setRoomStatus("in-progress")}
                      className="w-full"
                    >
                      회의 시작
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-[#5B5FF5] animate-spin" />
                    <p className="text-sm text-[#6B7280] text-center">
                      방장이 회의를 시작하면 자동으로 입장됩니다
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

                  {role === "host" ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowHostEndDialog(true)}
                    >
                      회의 종료
                    </Button>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs text-[#9CA3AF]">방장만 회의를 종료할 수 있어요</p>
                      <button
                        onClick={() => setShowGuestEndedDialog(true)}
                        className="text-[10px] text-[#9CA3AF] underline underline-offset-2 hover:text-[#6B7280]"
                      >
                        (방장 종료 시뮬레이션)
                      </button>
                    </div>
                  )}
                </div>

                {/* 대화 내용 */}
                <div className="flex-1 min-h-0 bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
                  <GroupTranscriptSection
                    segments={segments}
                    isActive={segments.length < 5}
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
