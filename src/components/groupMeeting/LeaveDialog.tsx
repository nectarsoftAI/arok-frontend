import { LogOut } from "lucide-react";
import { Button } from "../common/Button";
import { DialogShell } from "../common/dialogs/DialogShell";

interface LeaveDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// 컨트롤 바의 "나가기" 버튼과, 사이드바/로그아웃 등 다른 경로로 이탈을 시도한 경우(blocker)
// 모두 이 다이얼로그로 통일해서 사용함
export function LeaveDialog({ isOpen, onCancel, onConfirm }: LeaveDialogProps) {
  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onCancel}
      icon={<LogOut className="w-4 h-4 text-[#5B5FF5]" />}
      iconBg="bg-[#5B5FF5]/10"
      title="회의에서 나가시겠습니까?"
    >
      <div className="p-6">
        <p className="text-sm text-[#6B7280] mb-6">
          회의는 계속 진행되며, 나가더라도 언제든 다시 참여할 수 있습니다.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            머무르기
          </Button>
          <Button variant="dark" onClick={onConfirm} className="flex-1">
            나가기
          </Button>
        </div>
      </div>
    </DialogShell>
  );
}
