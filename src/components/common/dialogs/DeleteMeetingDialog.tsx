import { useState } from "react";
import { Trash2 } from "lucide-react";
import deleteMinutesIcon from "../../../assets/icons/delete_minutes_icon.png";
import { DialogShell } from "./DialogShell";
import { Button } from "../Button";
import { Input } from "../Input";

interface DeleteMeetingDialogProps {
  isOpen: boolean;
  meetingTitle: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function DeleteMeetingDialog({ isOpen, meetingTitle, onConfirm, onClose }: DeleteMeetingDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    if (isDeleting) return;
    setInputValue("");
    onClose();
  };

  const handleConfirm = async () => {
    if (inputValue !== meetingTitle) return;
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      setInputValue("");
    }
  };

  const isMatch = inputValue === meetingTitle;

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={handleClose}
      icon={<Trash2 className="w-4 h-4 text-red-500" />}
      iconBg="bg-red-100"
      title="회의록 삭제"
    >
      {isDeleting ? (
        <div className="p-10 flex flex-col items-center justify-center gap-4">
          <img src={deleteMinutesIcon} alt="삭제 중" className="w-20 h-20 object-contain" />
          <p className="text-sm text-[#6B7280]">회의록을 삭제하는 중이에요</p>
        </div>
      ) : (
        <div className="p-6">
          <p className="text-sm text-[#6B7280] mb-2">
            삭제하려면 아래에 회의 제목을 정확히 입력하세요.
          </p>
          <div className="px-3 py-2 bg-[#F3F4F6] rounded-lg text-sm font-medium text-[#1A1D2E] mb-3 break-all">
            {meetingTitle}
          </div>

          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="회의 제목 입력"
            className="focus:ring-red-400"
            autoFocus
          />

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              취소
            </Button>
            <Button type="button" variant="danger" onClick={handleConfirm} disabled={!isMatch} className="flex-1">
              삭제
            </Button>
          </div>
        </div>
      )}
    </DialogShell>
  );
}
