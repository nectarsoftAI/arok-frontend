import { useState } from "react";
import { FileText, X } from "lucide-react";
import recodingLiveImg from "../../../assets/icons/recoding_live_icon.png";
import audioFileImg from "../../../assets/icons/audio_file_icon.png";

export type MeetingMode = "live" | "upload";

interface MeetingTitleDialogProps {
  isOpen: boolean;
  onConfirm: (title: string, mode: MeetingMode) => void;
  onClose?: () => void;
}

export function MeetingTitleDialog({ isOpen, onConfirm, onClose }: MeetingTitleDialogProps) {
  const [step, setStep] = useState<"title" | "mode">("title");
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<MeetingMode | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setTitle("");
    setMode(null);
    setStep("title");
    onClose?.();
  };

  const handleTitleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) setStep("mode");
  };

  const handleStart = () => {
    if (mode) {
      onConfirm(title.trim(), mode);
      setTitle("");
      setMode(null);
      setStep("title");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5B5FF5]/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#5B5FF5]" />
            </div>
            <h3 className="font-semibold text-[#1A1D2E]">새로운 회의 시작</h3>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6">
          {step === "title" ? (
            <form onSubmit={handleTitleNext}>
              <label className="block mb-2 text-sm font-medium text-[#1A1D2E]">회의 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 프로젝트 진행 상황 회의"
                className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FF5] focus:border-transparent"
                autoFocus
              />
              <p className="mt-2 text-xs text-[#6B7280]">
                회의 내용을 쉽게 구분할 수 있도록 제목을 입력해주세요.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    title.trim()
                      ? "bg-[#5B5FF5] hover:bg-[#5B5FF5]/90 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  다음
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-sm font-medium text-[#1A1D2E] mb-4">회의 방식을 선택해주세요</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Live recording option */}
                <button
                  type="button"
                  onClick={() => setMode("live")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                    mode === "live"
                      ? "border-[#5B5FF5] bg-[#EEF2FF]"
                      : "border-[#E5E7EB] hover:border-[#5B5FF5]/50 hover:bg-[#F9FAFB]"
                  }`}
                >
                  <img src={recodingLiveImg} alt="실시간 녹음" className="w-16 h-16 object-contain" />
                  <div className="text-center">
                    <div className={`text-sm font-semibold ${mode === "live" ? "text-[#5B5FF5]" : "text-[#1A1D2E]"}`}>
                      실시간 녹음
                    </div>
                    <div className="text-xs text-[#6B7280] mt-0.5">마이크로 바로 녹음</div>
                  </div>
                </button>

                {/* File upload option */}
                <button
                  type="button"
                  onClick={() => setMode("upload")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                    mode === "upload"
                      ? "border-[#5B5FF5] bg-[#EEF2FF]"
                      : "border-[#E5E7EB] hover:border-[#5B5FF5]/50 hover:bg-[#F9FAFB]"
                  }`}
                >
                  <img src={audioFileImg} alt="파일 업로드" className="w-16 h-16 object-contain" />
                  <div className="text-center">
                    <div className={`text-sm font-semibold ${mode === "upload" ? "text-[#5B5FF5]" : "text-[#1A1D2E]"}`}>
                      파일 업로드
                    </div>
                    <div className="text-xs text-[#6B7280] mt-0.5">녹음 파일을 업로드</div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("title")}
                  className="px-4 py-2.5 rounded-lg font-medium border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] transition-all"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={!mode}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    mode
                      ? "bg-[#5B5FF5] hover:bg-[#5B5FF5]/90 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  회의 시작하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
