import { useState, useEffect } from 'react';
import { useBlocker, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { StartMeetingDialog } from '../common/dialogs/StartMeetingDialog';
import { LeaveConfirmDialog } from '../common/dialogs/LeaveConfirmDialog';
import { MeetingEndDialog } from '../common/dialogs/MeetingEndDialog';
import { useMeetingState } from '../../hooks/useMeetingState';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { UploadFlow } from '../recording/UploadFlow';
import { LiveFlow } from '../recording/LiveFlow';
import meetingImg1 from '../../assets/images/meeting_scene_1.webp';
import meetingImg2 from '../../assets/images/meeting_scene_2.webp';
import meetingImg3 from '../../assets/images/meeting_scene_3.webp';

const MEETING_IMAGES = [meetingImg1, meetingImg2, meetingImg3];

export function NewMeetingScreen() {
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

  const handleEnterRoom = (
    roomId: string,
    role: 'host' | 'guest',
    title: string,
    link: string,
  ) => {
    navigate(`/group-meeting/room/${roomId}`, {
      state: { role, title, link },
    });
  };

  return (
    <div className="h-full flex flex-col">
      <StartMeetingDialog
        isOpen={state.showTitleDialog}
        onStartRecording={state.handleTitleConfirm}
        onEnterRoom={handleEnterRoom}
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
            <Button variant="hero" size="lg" onClick={() => state.setShowTitleDialog(true)}>
              새로운 회의 시작하기
            </Button>
          </div>
        </div>
      ) : (
        /* ── 회의 진행 화면 ── */
        <div className="flex flex-col flex-1 min-h-0 px-6 py-6 gap-5">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-[#1A1D2E]">{state.meetingTitle}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              {state.startedAt && (
                <Badge variant="neutral" size="md">
                  {state.startedAt.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </Badge>
              )}
              <Badge variant="primary" size="md">
                {state.meetingMode === 'live' ? '실시간 녹음' : '파일 업로드'}
              </Badge>
            </div>
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
