import { useState } from 'react';
import { Navigate, useBlocker, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { LeaveConfirmDialog } from '../common/dialogs/LeaveConfirmDialog';
import { MeetingEndDialog } from '../common/dialogs/MeetingEndDialog';
import { Badge } from '../common/Badge';
import { RecordingOrb } from '../recording/RecordingOrb';
import { TranscriptSection } from '../recording/TranscriptSection';
import { SummarySection } from '../recording/SummarySection';
import { StepCards } from '../recording/StepCards';
import type { StepDef } from '../recording/StepCards';
import { LoadingAnimation } from '../common/LoadingAnimation';
import { useLiveMeetingFlow } from '../../hooks/useLiveMeetingFlow';

const NO_TRANSCRIPTS: never[] = [];
const NO_SPEAKER_MAP: Record<string, string> = {};

interface LiveMeetingLocationState {
  title?: string;
}

export function LiveMeetingScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = (location.state as LiveMeetingLocationState | null)?.title ?? '';
  const [showEndDialog, setShowEndDialog] = useState(false);
  const state = useLiveMeetingFlow(title);

  const blocker = useBlocker(!state.showSummary);

  const hasSegments = state.segments.length > 0;
  const showStepCards = state.showSummary || !!state.summaryError;
  const isRecording = state.recordingState === 'recording';
  const showControls = state.recordingState === 'idle' || isRecording;
  const showTranscript = isRecording;
  const showLoading =
    state.recordingState === 'stopping' ||
    (state.recordingState === 'finished' && state.isLoadingSummary);

  const isComplete = state.showSummary || (!!state.summaryError && !!state.liveMeetingId);

  const orbState =
    state.recordingState === 'recording' ? 'recording'
    : state.recordingState === 'finished' ? 'finished'
    : 'idle';

  const handleMeetingEnd = () => {
    setShowEndDialog(false);
    if (state.liveMeetingId) navigate(`/meetings/${state.liveMeetingId}`);
  };

  if (!title) return <Navigate to="/" replace />;

  const steps: StepDef[] = [
    {
      label: '대화 내용',
      content: (
        <TranscriptSection
          headless
          meetingMode="live"
          transcripts={NO_TRANSCRIPTS}
          segments={state.segments}
          speakerColorMap={NO_SPEAKER_MAP}
          speakerIndexMap={NO_SPEAKER_MAP}
          liveColorMap={state.liveColorMap}
          liveIndexMap={state.liveIndexMap}
          formatSec={state.formatSec}
          isRecording={false}
          canExport={false}
        />
      ),
    },
    {
      label: '대화 요약',
      content: (
        <SummarySection
          headless
          summaryData={state.summaryData}
          summaryError={state.summaryError}
        />
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <LeaveConfirmDialog
        isOpen={blocker.state === 'blocked'}
        recordingState={state.recordingState}
        isProcessing={false}
        onConfirm={() => blocker.proceed?.()}
        onClose={() => blocker.reset?.()}
      />

      <MeetingEndDialog
        isOpen={showEndDialog}
        onConfirm={handleMeetingEnd}
        onClose={() => setShowEndDialog(false)}
      />

      <div className="flex flex-col flex-1 min-h-0 px-6 py-6 gap-5">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-[#1A1D2E]">{state.meetingTitle}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            {state.startedAt && (
              <Badge variant="neutral" size="md">
                {state.startedAt.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </Badge>
            )}
            <Badge variant="primary" size="md">실시간 녹음</Badge>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {!showStepCards ? (
              <motion.div
                key="streaming"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto"
              >
                <AnimatePresence>
                  {showTranscript && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TranscriptSection
                        meetingMode="live"
                        transcripts={NO_TRANSCRIPTS}
                        segments={state.segments}
                        speakerColorMap={NO_SPEAKER_MAP}
                        speakerIndexMap={NO_SPEAKER_MAP}
                        liveColorMap={state.liveColorMap}
                        liveIndexMap={state.liveIndexMap}
                        formatSec={state.formatSec}
                        isRecording={true}
                        canExport={hasSegments}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center"
                    >
                      <LoadingAnimation
                        title="회의록을 생성하고 있어요"
                        subtitle="잠시만 기다려 주세요..."
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showControls && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="mt-auto sticky bottom-0 pb-6 pt-4"
                      style={{ background: 'linear-gradient(to bottom, transparent, white 35%)' }}
                    >
                      <div className="flex flex-col items-center">
                        {state.recordingState === 'idle' && (
                          <p className="text-sm text-[#6B7280] mb-4">
                            녹음 버튼을 눌러 회의를 시작해보세요.
                          </p>
                        )}
                        <div className="flex flex-col items-center gap-2">
                          <RecordingOrb
                            state={orbState}
                            onToggle={state.handleRecordingToggle}
                            elapsedTime={state.formatTime(state.elapsedSeconds)}
                          />
                          {state.liveError && (
                            <p className="text-xs text-red-500 text-center max-w-xs">{state.liveError}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="stepcards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="flex-1 min-h-0 flex flex-col"
              >
                <StepCards steps={steps} onComplete={isComplete ? () => setShowEndDialog(true) : undefined} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
