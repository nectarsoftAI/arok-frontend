import { RecordingOrb } from '../RecordingOrb';
import type { RecordingState } from './useMeetingState';

interface LiveControlsProps {
  recordingState: RecordingState;
  elapsedSeconds: number;
  liveError: string | null;
  handleRecordingToggle: () => Promise<void>;
  formatTime: (seconds: number) => string;
}

export function LiveControls({
  recordingState,
  elapsedSeconds,
  liveError,
  handleRecordingToggle,
  formatTime,
}: LiveControlsProps) {
  const orbState =
    recordingState === 'recording' ? 'recording'
    : recordingState === 'finished' ? 'finished'
    : 'idle';

  return (
    <div className="flex flex-col items-center gap-2">
      <RecordingOrb
        state={orbState}
        onToggle={handleRecordingToggle}
        elapsedTime={formatTime(elapsedSeconds)}
      />
      {liveError && (
        <p className="text-xs text-red-500 text-center max-w-xs">{liveError}</p>
      )}
    </div>
  );
}
