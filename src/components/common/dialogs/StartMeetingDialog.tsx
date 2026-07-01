import { useState } from "react";
import { FileText, Check, Copy } from "lucide-react";
import recodingLiveImg from "../../../assets/icons/recoding_live_icon.webp";
import audioFileImg from "../../../assets/icons/audio_file_icon.webp";
import personSingleIcon from "../../../assets/icons/person_single_icon.webp";
import personGroupIcon from "../../../assets/icons/person_group_icon.webp";
import plusIcon from "../../../assets/icons/plus_icon.webp";
import linkIconImg from "../../../assets/icons/link_icon.webp";
import { DialogShell } from "./DialogShell";
import { Button } from "../Button";
import { Input } from "../Input";

export type MeetingMode = "live" | "upload";

type Step =
  | "branch"
  | "recording-title"
  | "recording-mode"
  | "online-entry"
  | "online-room-title"
  | "online-room-link";

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function extractRoomCode(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/([A-Z0-9]{6,10})$/i);
  return match ? match[1].toUpperCase() : trimmed.toUpperCase();
}

interface StartMeetingDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onStartRecording: (title: string, mode: MeetingMode) => void;
  onEnterRoom: (roomId: string, role: "host" | "guest", title: string, link: string) => void;
}

export function StartMeetingDialog({
  isOpen,
  onClose,
  onStartRecording,
  onEnterRoom,
}: StartMeetingDialogProps) {
  const [step, setStep] = useState<Step>("branch");
  const [recordingTitle, setRecordingTitle] = useState("");
  const [recordingMode, setRecordingMode] = useState<MeetingMode | null>(null);
  const [roomTitle, setRoomTitle] = useState("");
  const [roomId, setRoomId] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const meetingLink = roomId ? `arok.meet/${roomId}` : "";

  const resetAll = () => {
    setStep("branch");
    setRecordingTitle("");
    setRecordingMode(null);
    setRoomTitle("");
    setRoomId("");
    setLinkInput("");
    setLinkCopied(false);
  };

  const handleClose = () => {
    resetAll();
    onClose?.();
  };

  const handleStartRecording = () => {
    if (!recordingMode) return;
    onStartRecording(recordingTitle.trim(), recordingMode);
    resetAll();
    onClose?.();
  };

  const handleCreateRoomTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomTitle.trim()) return;
    setRoomId(generateRoomId());
    setStep("online-room-link");
  };

  const handleEnterAsHost = () => {
    onEnterRoom(roomId, "host", roomTitle.trim(), meetingLink);
    resetAll();
    onClose?.();
  };

  const handleJoinAsGuest = () => {
    const code = extractRoomCode(linkInput);
    if (!code) return;
    onEnterRoom(code, "guest", "온라인 회의", linkInput.trim());
    resetAll();
    onClose?.();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={handleClose}
      icon={<FileText className="w-4 h-4 text-[#5B5FF5]" />}
      iconBg="bg-[#5B5FF5]/10"
      title="새로운 회의 시작"
    >
      <div className="p-6">

        {/* ── 1단계: 회의 유형 선택 ── */}
        {step === "branch" && (
          <div>
            <p className="text-sm font-medium text-[#1A1D2E] mb-4">회의 유형을 선택해주세요</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStep("recording-title")}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-[#E5E7EB] hover:border-[#5B5FF5]/50 hover:bg-[#F9FAFB] transition-all text-center"
              >
                <img src={personSingleIcon} alt="녹음 모드" className="w-16 h-16 object-contain" />
                <div>
                  <div className="text-sm font-semibold text-[#1A1D2E]">녹음 모드</div>
                  <div className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                    직접 녹음하거나 파일을 업로드하여 회의록을 생성해요
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStep("online-entry")}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-[#E5E7EB] hover:border-[#5B5FF5]/50 hover:bg-[#F9FAFB] transition-all text-center"
              >
                <img src={personGroupIcon} alt="온라인 회의" className="w-16 h-16 object-contain" />
                <div>
                  <div className="text-sm font-semibold text-[#1A1D2E]">온라인 회의</div>
                  <div className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                    참여자들과 실시간으로 함께 회의를 진행해요
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── 2a: 녹음 제목 입력 ── */}
        {step === "recording-title" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (recordingTitle.trim()) setStep("recording-mode");
            }}
          >
            <label className="block mb-2 text-sm font-medium text-[#1A1D2E]">회의 제목</label>
            <Input
              type="text"
              variant="filled"
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
              placeholder="예: 프로젝트 진행 상황 회의"
              autoFocus
            />
            <p className="mt-2 text-xs text-[#6B7280]">
              회의 내용을 쉽게 구분할 수 있도록 제목을 입력해주세요.
            </p>
            <div className="mt-6 flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep("branch")}>
                이전
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!recordingTitle.trim()}
                className="flex-1"
              >
                다음
              </Button>
            </div>
          </form>
        )}

        {/* ── 2b: 녹음 방식 선택 ── */}
        {step === "recording-mode" && (
          <div>
            <p className="text-sm font-medium text-[#1A1D2E] mb-4">회의 방식을 선택해주세요</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRecordingMode("live")}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  recordingMode === "live"
                    ? "border-[#5B5FF5] bg-[#EEF2FF]"
                    : "border-[#E5E7EB] hover:border-[#5B5FF5]/50 hover:bg-[#F9FAFB]"
                }`}
              >
                <img src={recodingLiveImg} alt="실시간 녹음" className="w-16 h-16 object-contain" />
                <div className="text-center">
                  <div className={`text-sm font-semibold ${recordingMode === "live" ? "text-[#5B5FF5]" : "text-[#1A1D2E]"}`}>
                    실시간 녹음
                  </div>
                  <div className="text-xs text-[#6B7280] mt-0.5">마이크로 바로 녹음</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecordingMode("upload")}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                  recordingMode === "upload"
                    ? "border-[#5B5FF5] bg-[#EEF2FF]"
                    : "border-[#E5E7EB] hover:border-[#5B5FF5]/50 hover:bg-[#F9FAFB]"
                }`}
              >
                <img src={audioFileImg} alt="파일 업로드" className="w-16 h-16 object-contain" />
                <div className="text-center">
                  <div className={`text-sm font-semibold ${recordingMode === "upload" ? "text-[#5B5FF5]" : "text-[#1A1D2E]"}`}>
                    파일 업로드
                  </div>
                  <div className="text-xs text-[#6B7280] mt-0.5">녹음 파일을 업로드</div>
                </div>
              </button>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep("recording-title")}>
                이전
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!recordingMode}
                onClick={handleStartRecording}
                className="flex-1"
              >
                회의 시작하기
              </Button>
            </div>
          </div>
        )}

        {/* ── 3: 온라인 회의 — 새 회의 시작 / 링크 참여 ── */}
        {step === "online-entry" && (
          <div>
            <p className="text-sm font-medium text-[#1A1D2E] mb-4">
              새로운 회의를 시작하거나, 링크로 참여하세요
            </p>

            <div className="flex items-center gap-3 mb-6">
              {/* 새 회의 시작 버튼 */}
              <button
                type="button"
                onClick={() => {
                  setRoomTitle("");
                  setStep("online-room-title");
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#5B5FF5] hover:bg-[#5B5FF5]/90 text-white font-medium text-sm transition-colors flex-shrink-0"
              >
                <img src={plusIcon} alt="" className="w-6 h-6 object-contain scale-125" />
                새 회의
              </button>

              {/* 링크 입력 + 참여하기 */}
              <div className="relative flex-1">
                <img
                  src={linkIconImg}
                  alt=""
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 object-contain scale-125"
                />
                <Input
                  type="text"
                  variant="filled"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="링크 또는 코드 입력"
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && linkInput.trim()) handleJoinAsGuest();
                  }}
                />
              </div>
              <Button
                variant="secondary"
                disabled={!linkInput.trim()}
                onClick={handleJoinAsGuest}
                className="flex-shrink-0"
              >
                참여
              </Button>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep("branch")}
              className="w-full"
            >
              이전
            </Button>
          </div>
        )}

        {/* ── 4: 온라인 회의방 제목 입력 ── */}
        {step === "online-room-title" && (
          <form onSubmit={handleCreateRoomTitle}>
            <label className="block mb-2 text-sm font-medium text-[#1A1D2E]">회의 제목</label>
            <Input
              type="text"
              variant="filled"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              placeholder="예: 팀 주간 온라인 회의"
              autoFocus
            />
            <p className="mt-2 text-xs text-[#6B7280]">
              참여자들이 확인할 수 있도록 제목을 입력해주세요.
            </p>
            <div className="mt-6 flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep("online-entry")}>
                이전
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!roomTitle.trim()}
                className="flex-1"
              >
                다음
              </Button>
            </div>
          </form>
        )}

        {/* ── 5: 링크 생성 및 입장 ── */}
        {step === "online-room-link" && (
          <div>
            <p className="text-sm text-[#6B7280] mb-4">아래 링크를 참여자에게 공유하세요</p>
            <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-lg px-4 py-3 mb-6">
              <span className="flex-1 text-sm text-[#1A1D2E] font-mono truncate">{meetingLink}</span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs font-medium text-[#5B5FF5] hover:text-[#5B5FF5]/80 transition-colors flex-shrink-0"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    복사
                  </>
                )}
              </button>
            </div>
            <Button variant="primary" onClick={handleEnterAsHost} className="w-full">
              회의방 입장하기
            </Button>
          </div>
        )}

      </div>
    </DialogShell>
  );
}
