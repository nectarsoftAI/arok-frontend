import { LogOut } from "lucide-react";
import { Button } from "../common/Button";
import { DialogShell } from "../common/dialogs/DialogShell";

interface GuestEndedDialogProps {
  isOpen: boolean;
  onGoToDetail: () => void;
  // 방장이 직접 종료한 게 아니라(reason: "failed") 장시간 연결 두절로 서버가 자체 종료한
  // 경우엔 "방장이 회의를 종료했습니다"라고 안내하면 사실과 다르므로 문구를 구분함
  reason?: "ended" | "failed";
}

export function GuestEndedDialog({ isOpen, onGoToDetail, reason = "ended" }: GuestEndedDialogProps) {
  const description = reason === "failed"
    ? "네트워크 연결이 오래 끊겨 회의가 종료되었습니다."
    : "방장이 회의를 종료했습니다.";

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={() => {}}
      icon={<LogOut className="w-4 h-4 text-[#6B7280]" />}
      iconBg="bg-[#F3F4F6]"
      title="회의가 종료되었습니다"
    >
      <div className="p-6">
        <p className="text-sm text-[#1A1D2E] font-medium mb-1">{description}</p>
        <p className="text-sm text-[#6B7280] mb-6">상세 화면에서 대화 내용을 확인할 수 있습니다.</p>
        <Button variant="primary" onClick={onGoToDetail} className="w-full">
          상세 화면으로 이동
        </Button>
      </div>
    </DialogShell>
  );
}
