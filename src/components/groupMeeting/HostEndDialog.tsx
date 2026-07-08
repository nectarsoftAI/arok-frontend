import { Download, LogOut, PenLine, Sparkles } from "lucide-react";
import { Button } from "../common/Button";
import { DialogShell } from "../common/dialogs/DialogShell";

const HOST_END_FEATURES = [
  { icon: Sparkles, label: "AI 자동 요약", desc: "대화 내용이 자동으로 분석되고 요약됩니다" },
  { icon: PenLine, label: "대화 수정 및 편집", desc: "상세 화면에서 녹음된 대화를 수정할 수 있습니다" },
  { icon: Download, label: "요약 내보내기", desc: "회의 요약을 문서 파일로 저장하고 공유할 수 있습니다" },
];

interface HostEndDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function HostEndDialog({ isOpen, onClose, onConfirm }: HostEndDialogProps) {
  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
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
        <Button variant="dark" onClick={onConfirm} className="w-full">
          회의 종료하기
        </Button>
      </div>
    </DialogShell>
  );
}
