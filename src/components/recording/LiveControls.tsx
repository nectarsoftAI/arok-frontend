import { FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { RecordingOrb } from '../RecordingOrb';
import type { RecordingState } from './useMeetingState';

interface LiveControlsProps {
  recordingState: RecordingState;
  elapsedSeconds: number;
  isLoadingSummary: boolean;
  liveError: string | null;
  handleRecordingToggle: () => Promise<void>;
  handleSummaryClick: () => void;
  formatTime: (seconds: number) => string;
}

export function LiveControls({
  recordingState,
  elapsedSeconds,
  isLoadingSummary,
  liveError,
  handleRecordingToggle,
  handleSummaryClick,
  formatTime,
}: LiveControlsProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {recordingState === 'finished' ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
          </div>
          <div className="text-sm text-[#10B981] font-medium text-center mb-0.5">녹음 완료</div>
        </div>
      ) : recordingState === 'stopping' ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[#6B7280]/10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" />
          </div>
          <div className="text-sm text-[#6B7280] font-medium text-center mb-0.5">처리 중...</div>
        </div>
      ) : (
        <RecordingOrb
          state={recordingState}
          onToggle={handleRecordingToggle}
          elapsedTime={formatTime(elapsedSeconds)}
        />
      )}
      <button
        onClick={handleSummaryClick}
        disabled={recordingState !== 'finished' || isLoadingSummary}
        className={`w-full max-w-xs px-5 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm ${
          recordingState === 'finished' && !isLoadingSummary
            ? 'bg-[#22D3EE] hover:bg-[#22D3EE]/90 text-white hover:shadow-lg cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <FileText className="w-4 h-4" />
        {isLoadingSummary ? '요약 중...' : '요약'}
      </button>
      {liveError && (
        <p className="text-xs text-red-500 text-center w-full max-w-xs">{liveError}</p>
      )}
    </div>
  );
}
