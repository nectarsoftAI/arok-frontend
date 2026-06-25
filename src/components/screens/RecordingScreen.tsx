import { useState, useEffect } from 'react';
import { useBlocker, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { MeetingTitleDialog } from '../MeetingTitleDialog';
import { LeaveConfirmDialog } from '../LeaveConfirmDialog';
import { MeetingEndDialog } from '../MeetingEndDialog';
import { useMeetingState } from '../recording/useMeetingState';
import { UploadFlow } from '../recording/UploadFlow';
import { LiveFlow } from '../recording/LiveFlow';
import meetingImg1 from '../../assets/images/meeting_scene_1.png';
import meetingImg2 from '../../assets/images/meeting_scene_2.png';
import meetingImg3 from '../../assets/images/meeting_scene_3.png';

const MEETING_IMAGES = [meetingImg1, meetingImg2, meetingImg3];

export function RecordingScreen() {
  const [imgIndex, setImgIndex] = useState(0);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const navigate = useNavigate();
  const state = useMeetingState();

  const blocker = useBlocker(!!state.meetingTitle && !state.showSummary);

  useEffect(() => {
    if (state.meetingTitle) return;
    const interval = setInterval(() => {
      setImgIndex(prev => (prev + 1) % MEETING_IMAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [state.meetingTitle]);

  const activeMeetingId =
    state.meetingMode === 'upload' ? state.meetingId : state.liveMeetingId;

  const isComplete =
    state.showSummary || (!!state.summaryError && !!activeMeetingId);

  const handleMeetingEnd = () => {
    setShowEndDialog(false);
    if (activeMeetingId) navigate(`/meetings/${activeMeetingId}`);
  };

  return (
    <div className="h-full flex flex-col">
      <MeetingTitleDialog
        isOpen={state.showTitleDialog}
        onConfirm={state.handleTitleConfirm}
        onClose={() => state.setShowTitleDialog(false)}
      />

      <LeaveConfirmDialog
        isOpen={blocker.state === 'blocked'}
        recordingState={state.recordingState}
        isProcessing={state.isProcessing}
        onConfirm={() => blocker.proceed?.()}
        onClose={() => blocker.reset?.()}
      />

      <MeetingEndDialog
        isOpen={showEndDialog}
        onConfirm={handleMeetingEnd}
        onClose={() => setShowEndDialog(false)}
      />

      {!state.meetingTitle ? (
        /* ── 시작 화면 슬라이드쇼 ── */
        <div className="flex-1 flex items-center justify-center">
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
        /* ── 회의 진행 화면 ── */
        <div className="flex flex-col flex-1 min-h-0 px-6 py-6 gap-5">
          <div className="flex items-center flex-shrink-0">
            <h1 className="text-2xl font-bold text-[#1A1D2E]">{state.meetingTitle}</h1>
          </div>

          {state.meetingMode === 'upload' ? (
            <UploadFlow
              state={state}
              onComplete={isComplete ? () => setShowEndDialog(true) : undefined}
            />
          ) : (
            <LiveFlow
              state={state}
              onComplete={isComplete ? () => setShowEndDialog(true) : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}
