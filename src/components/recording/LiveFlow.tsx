import { motion, AnimatePresence } from 'motion/react';
import type { MeetingStateReturn } from './useMeetingState';
import { LiveControls } from './LiveControls';
import { TranscriptSection } from './TranscriptSection';
import { SummarySection } from './SummarySection';
import { MeetingEndButton } from './MeetingEndButton';
import generatingSceneImg from '../../assets/images/generating_scene.png';

interface LiveFlowProps {
  state: MeetingStateReturn;
  onMeetingEnd: () => void;
}

export function LiveFlow({ state, onMeetingEnd }: LiveFlowProps) {
  const hasSegments = state.segments.length > 0;

  return (
    <div className="space-y-6">
      {/* Mic controls — always visible in live mode */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5 flex flex-col items-center">
        {state.recordingState === 'idle' && (
          <p className="text-sm text-[#6B7280] mb-2">녹음 버튼을 눌러 회의를 시작해보세요.</p>
        )}
        <LiveControls
          recordingState={state.recordingState}
          elapsedSeconds={state.elapsedSeconds}
          isLoadingSummary={state.isLoadingSummary}
          liveError={state.liveError}
          handleRecordingToggle={state.handleRecordingToggle}
          handleSummaryClick={state.handleSummaryClick}
          formatTime={state.formatTime}
        />
      </div>

      {/* Transcript — fades in as segments stream from WebSocket */}
      <AnimatePresence>
        {hasSegments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
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
              isRecording={state.recordingState === 'recording'}
              canExport={hasSegments}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary generating loading image */}
      <AnimatePresence>
        {state.isLoadingSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-10"
          >
            <img src={generatingSceneImg} alt="생성 중" className="w-48 object-contain mb-6" />
            <p className="text-sm text-[#6B7280]">회의록을 생성하고 있습니다...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary content */}
      {(state.showSummary || !!state.summaryError) && (
        <SummarySection
          summaryData={state.summaryData}
          summaryError={state.summaryError}
        />
      )}

      {/* End meeting button */}
      {state.showSummary && (
        <MeetingEndButton meetingId={state.liveMeetingId} onClick={onMeetingEnd} />
      )}
    </div>
  );
}
