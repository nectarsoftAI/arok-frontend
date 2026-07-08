import { LogOut } from "lucide-react";
import { DialogShell } from "./DialogShell";
import { Button } from "../Button";

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function LogoutConfirmDialog({ isOpen, onConfirm, onClose }: LogoutConfirmDialogProps) {
  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={<LogOut className="w-4 h-4 text-red-500" />}
      iconBg="bg-red-100"
      title="로그아웃"
    >
      <div className="p-6">
        <p className="text-sm text-[#6B7280] mb-6">정말 로그아웃 하시겠습니까?</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            로그아웃
          </Button>
        </div>
      </div>
    </DialogShell>
  );
}
