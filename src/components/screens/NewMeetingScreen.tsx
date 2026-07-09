import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { StartMeetingDialog } from '../common/dialogs/StartMeetingDialog';
import { Button } from '../common/Button';
import meetingImg1 from '../../assets/images/meeting_scene_1.webp';
import meetingImg2 from '../../assets/images/meeting_scene_2.webp';
import meetingImg3 from '../../assets/images/meeting_scene_3.webp';

const MEETING_IMAGES = [meetingImg1, meetingImg2, meetingImg3];

export function NewMeetingScreen() {
  const [imgIndex, setImgIndex] = useState(0);
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIndex(prev => (prev + 1) % MEETING_IMAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleStartRecording = (title: string, mode: 'live' | 'upload') => {
    navigate(mode === 'live' ? '/recording/live' : '/recording/upload', {
      state: { title },
    });
  };

  const handleEnterRoom = (
    roomId: string,
    role: 'host' | 'guest',
    title: string,
    link: string,
    token?: string,
  ) => {
    navigate(`/group-meeting/room/${roomId}`, {
      state: { role, title, link, token },
    });
  };

  return (
    <div className="h-full flex flex-col">
      <StartMeetingDialog
        isOpen={showTitleDialog}
        onStartRecording={handleStartRecording}
        onEnterRoom={handleEnterRoom}
        onClose={() => setShowTitleDialog(false)}
      />

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
          <Button variant="hero" size="lg" onClick={() => setShowTitleDialog(true)}>
            새로운 회의 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
