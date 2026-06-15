import { useState } from "react";
import { X, Trash2 } from "lucide-react";

interface DeleteMeetingDialogProps {
  isOpen: boolean;
  meetingTitle: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteMeetingDialog({ isOpen, meetingTitle, onConfirm, onClose }: DeleteMeetingDialogProps) {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  const handleConfirm = () => {
    if (inputValue === meetingTitle) {
      onConfirm();
      setInputValue("");
    }
  };

  const isMatch = inputValue === meetingTitle;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="font-semibold text-[#1A1D2E]">회의록 삭제</h3>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-[#6B7280] mb-2">
            삭제하려면 아래에 회의 제목을 정확히 입력하세요.
          </p>
          <div className="px-3 py-2 bg-[#F3F4F6] rounded-lg text-sm font-medium text-[#1A1D2E] mb-3 break-all">
            {meetingTitle}
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="회의 제목 입력"
            className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            autoFocus
          />

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] transition-all"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isMatch}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                isMatch
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
