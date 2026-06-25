import { motion, AnimatePresence } from 'motion/react';
import type { MeetingStateReturn } from './useMeetingState';
import { UploadControls } from './UploadControls';
import { TranscriptSection } from './TranscriptSection';
import { SummarySection } from './SummarySection';
import { MeetingEndButton } from './MeetingEndButton';
import analyzingSceneImg from '../../assets/images/analyzing_scene.png';
import generatingSceneImg from '../../assets/images/generating_scene.png';

interface UploadFlowProps {
  state: MeetingStateReturn;
  onMeetingEnd: () => void;
}

export function UploadFlow({ state, onMeetingEnd }: UploadFlowProps) {
  return (
    <div className="space-y-6">
      {/* Step 1: Upload area — hidden once processing or conversation is loaded */}
      <AnimatePresence>
        {!state.isProcessing && !state.hasConversation && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5"
          >
            <p className="text-sm text-[#6B7280] mb-4 text-center">
              오디오 파일을 업로드하면 자동으로 분석해드려요
            </p>
            <UploadControls
              uploadedFile={state.uploadedFile}
              setUploadedFile={state.setUploadedFile}
              isDragging={state.isDragging}
              setIsDragging={state.setIsDragging}
              isProcessing={state.isProcessing}
              hasConversation={state.hasConversation}
              error={state.error}
              handleDrop={state.handleDrop}
              handleFileSelect={state.handleFileSelect}
              handleProcessFile={state.handleProcessFile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 2: Analyzing loading image */}
      <AnimatePresence>
        {state.isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-10"
          >
            <img src={analyzingSceneImg} alt="분석 중" className="w-48 object-contain mb-6" />
            <p className="text-sm text-[#6B7280]">대화를 분석하고 있습니다...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Transcript — appears after processing completes */}
      <AnimatePresence>
        {state.hasConversation && !state.isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <TranscriptSection
              meetingMode="upload"
              transcripts={state.transcripts}
              segments={state.segments}
              speakerColorMap={state.speakerColorMap}
              speakerIndexMap={state.speakerIndexMap}
              liveColorMap={state.liveColorMap}
              liveIndexMap={state.liveIndexMap}
              formatSec={state.formatSec}
              isRecording={false}
              canExport={state.hasConversation}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 4: Summary generating (live mode uses this; upload mode keeps isLoadingSummary false) */}
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

      {/* Step 5: Summary content */}
      {(state.showSummary || !!state.summaryError) && (
        <SummarySection
          summaryData={state.summaryData}
          summaryError={state.summaryError}
        />
      )}

      {/* Step 6: End meeting button */}
      {state.showSummary && (
        <MeetingEndButton meetingId={state.meetingId} onClick={onMeetingEnd} />
      )}
    </div>
  );
}
