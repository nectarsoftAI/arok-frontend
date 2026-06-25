import { motion, AnimatePresence } from 'motion/react';
import type { MeetingStateReturn } from './useMeetingState';
import { LiveControls } from './LiveControls';
import { TranscriptSection } from './TranscriptSection';
import { SummarySection } from './SummarySection';
import { StepCards } from './StepCards';
import type { StepDef } from './StepCards';
import { LoadingAnimation } from './LoadingAnimation';

interface LiveFlowProps {
  state: MeetingStateReturn;
  onComplete?: () => void;
}

export function LiveFlow({ state, onComplete }: LiveFlowProps) {
  const hasSegments = state.segments.length > 0;
  const isComplete = state.showSummary || !!state.summaryError;
  const isRecording = state.recordingState === 'recording';
  // Controls only during idle or active recording
  const showControls = state.recordingState === 'idle' || isRecording;
  // Transcript only while actively recording
  const showTranscript = isRecording;
  // Loading state: from the moment recording stops until summary is ready
  const showLoading =
    state.recordingState === 'stopping' ||
    (state.recordingState === 'finished' && state.isLoadingSummary);

  const steps: StepDef[] = [
    {
      label: '대화 내용',
      content: (
        <TranscriptSection
          headless
          meetingMode="live"
          transcripts={state.transcripts}
          segments={state.segments}
          speakerColorMap={state.speakerColorMap}
          speakerIndexMap={state.speakerIndexMap}
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
    <div className="flex flex-col flex-1 min-h-0">
      <AnimatePresence mode="wait">
        {!isComplete ? (
          /* Streaming phase */
          <motion.div
            key="streaming"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto"
          >
            {/* Transcript — only during active recording */}
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
                    transcripts={state.transcripts}
                    segments={state.segments}
                    speakerColorMap={state.speakerColorMap}
                    speakerIndexMap={state.speakerIndexMap}
                    liveColorMap={state.liveColorMap}
                    liveIndexMap={state.liveIndexMap}
                    formatSec={state.formatSec}
                    isRecording={true}
                    canExport={hasSegments}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading — from recording stop through summary generation */}
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

            {/* Mic controls — idle or recording, no card background, fixed at bottom */}
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
                    <LiveControls
                      recordingState={state.recordingState}
                      elapsedSeconds={state.elapsedSeconds}
                      liveError={state.liveError}
                      handleRecordingToggle={state.handleRecordingToggle}
                      formatTime={state.formatTime}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Step cards — fills remaining height */
          <motion.div
            key="stepcards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="flex-1 min-h-0 flex flex-col"
          >
            <StepCards steps={steps} onComplete={onComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
