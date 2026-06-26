import { LogOut, X } from 'lucide-react';
import type { RecordingState } from '../../../hooks/useMeetingState';

interface LeaveConfirmDialogProps {
  isOpen: boolean;
  recordingState: RecordingState;
  isProcessing: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function getWarningMessage(recordingState: RecordingState, isProcessing: boolean): string {
  if (recordingState === 'recording') {
    return '현재 녹음이 진행 중입니다. 페이지를 벗어나면 녹음이 중단되고 회의록이 저장되지 않습니다.';
  }
  if (isProcessing) {
    return '파일을 분석 중입니다. 페이지를 벗어나면 분석이 중단되고 회의록이 저장되지 않습니다.';
  }
  return '녹음을 시작하거나 파일 업로드를 완료해야 회의록이 저장됩니다. 지금 나가면 현재 내용이 사라집니다.';
}

export function LeaveConfirmDialog({
  isOpen,
  recordingState,
  isProcessing,
  onConfirm,
  onClose,
}: LeaveConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="font-semibold text-[#1A1D2E]">회의에서 나가기</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-[#6B7280] mb-6">
            {getWarningMessage(recordingState, isProcessing)}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] transition-all"
            >
              계속 진행하기
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-all"
            >
              나가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
