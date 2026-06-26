import { LogOut } from 'lucide-react';
import type { RecordingState } from '../../../hooks/useMeetingState';
import { DialogShell } from './DialogShell';

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
  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={<LogOut className="w-4 h-4 text-orange-500" />}
      iconBg="bg-orange-100"
      title="회의에서 나가기"
    >
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
    </DialogShell>
  );
}
