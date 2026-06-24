import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MeetingTitleDialog } from '../MeetingTitleDialog';
import { useMeetingState } from '../recording/useMeetingState';
import { ConversationPanel } from '../recording/ConversationPanel';
import { SummaryPanel } from '../recording/SummaryPanel';
import { LiveControls } from '../recording/LiveControls';
import { UploadControls } from '../recording/UploadControls';
import meetingImg1 from '../../assets/images/meeting_scene_1.png';
import meetingImg2 from '../../assets/images/meeting_scene_2.png';
import meetingImg3 from '../../assets/images/meeting_scene_3.png';

const MEETING_IMAGES = [meetingImg1, meetingImg2, meetingImg3];

export function RecordingScreen() {
  const [imgIndex, setImgIndex] = useState(0);
  const state = useMeetingState();

  useEffect(() => {
    if (state.meetingTitle) return;
    const interval = setInterval(() => {
      setImgIndex(prev => (prev + 1) % MEETING_IMAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [state.meetingTitle]);

  const controls = state.meetingMode === 'live' ? (
    <LiveControls
      recordingState={state.recordingState}
      elapsedSeconds={state.elapsedSeconds}
      isLoadingSummary={state.isLoadingSummary}
      liveError={state.liveError}
      handleRecordingToggle={state.handleRecordingToggle}
      handleSummaryClick={state.handleSummaryClick}
      formatTime={state.formatTime}
    />
  ) : (
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
  );

  return (
    <div className="h-full p-6">
      <MeetingTitleDialog
        isOpen={state.showTitleDialog}
        onConfirm={state.handleTitleConfirm}
        onClose={() => state.setShowTitleDialog(false)}
      />

      {!state.meetingTitle ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center flex flex-col items-center">
            <div className="relative w-72 h-48 mb-8 overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIndex}
                  src={MEETING_IMAGES[imgIndex]}
                  alt="회의 이미지"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                />
              </AnimatePresence>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {MEETING_IMAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-white w-4' : 'bg-white/60 w-1.5'}`}
                  />
                ))}
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-[#1A1D2E] mb-3">새로운 회의를 시작하세요</h2>
            <p className="text-sm text-[#6B7280] mb-8">AI가 자동으로 대화를 분석하고 요약해드립니다</p>
            <button
              onClick={() => state.setShowTitleDialog(true)}
              className="px-8 py-4 bg-gradient-to-br from-[#5B5FF5] to-[#818CF8] hover:from-[#5B5FF5]/90 hover:to-[#818CF8]/90 text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              새로운 회의 시작하기
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-[#1A1D2E]">{state.meetingTitle}</h1>
          </div>

          <div className="grid grid-cols-[1fr_0.67fr] grid-rows-1 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
            <ConversationPanel
              meetingMode={state.meetingMode}
              hasConversation={state.hasConversation}
              canSummarize={state.canSummarize}
              isProcessing={state.isProcessing}
              transcripts={state.transcripts}
              segments={state.segments}
              speakerColorMap={state.speakerColorMap}
              speakerIndexMap={state.speakerIndexMap}
              liveColorMap={state.liveColorMap}
              liveIndexMap={state.liveIndexMap}
              formatSec={state.formatSec}
              controls={controls}
            />
            <SummaryPanel
              meetingMode={state.meetingMode}
              showSummary={state.showSummary}
              isLoadingSummary={state.isLoadingSummary}
              summaryData={state.summaryData}
              isSummaryLoading={false}
              summaryError={state.summaryError}
            />
          </div>
        </>
      )}
    </div>
  );
}
