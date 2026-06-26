import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import type { MeetingStateReturn } from '../../hooks/useMeetingState';
import { TranscriptSection } from './TranscriptSection';
import { SummarySection } from './SummarySection';
import { StepCards } from './StepCards';
import type { StepDef } from './StepCards';
import { LoadingAnimation } from '../common/LoadingAnimation';

interface UploadFlowProps {
  state: MeetingStateReturn;
  onComplete?: () => void;
}

export function UploadFlow({ state, onComplete }: UploadFlowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isComplete = state.hasConversation && !state.isProcessing;

  const steps: StepDef[] = [
    {
      label: '대화 내용',
      content: (
        <TranscriptSection
          headless
          meetingMode="upload"
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
          /* Upload / Processing phase — content centered in available space */
          <motion.div
            key="upload"
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col items-center justify-center gap-6"
          >
            <AnimatePresence mode="wait">
              {state.isProcessing ? (
                /* Analyzing — sequential image animation */
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingAnimation
                    title="대화 내용 분석하고 있어요"
                    subtitle="잠시만 기다려 주세요..."
                  />
                </motion.div>
              ) : (
                /* Upload zone */
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full flex flex-col items-center gap-6"
                >
                  <p className="text-base text-[#6B7280] text-center">
                    오디오 파일을 업로드하면 자동으로 분석해드려요
                  </p>

                  {!state.uploadedFile ? (
                    /* Animated dashed border drop zone */
                    <div
                      onDragOver={(e) => { e.preventDefault(); state.setIsDragging(true); }}
                      onDragLeave={() => state.setIsDragging(false)}
                      onDrop={state.handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-full max-w-sm cursor-pointer"
                    >
                      <div className="flex flex-col items-center gap-4 py-12 px-6">
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={{ overflow: 'visible' }}
                        >
                          <rect
                            x="0" y="0"
                            width="100%" height="100%"
                            fill={state.isDragging ? 'rgba(91,95,245,0.06)' : 'transparent'}
                            stroke={state.isDragging ? '#5B5FF5' : '#D1D5DB'}
                            strokeWidth="2"
                            strokeDasharray="8 5"
                            rx="16" ry="16"
                            style={{ animation: 'dash-flow 0.8s linear infinite' }}
                          />
                        </svg>
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                            state.isDragging ? 'bg-[#EEF2FF]' : 'bg-[#F3F4F6]'
                          }`}
                        >
                          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={state.isDragging ? '#5B5FF5' : '#9CA3AF'}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-[#1A1D2E]">오디오 파일 업로드</p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">MP3, WAV, M4A, OGG, FLAC 지원</p>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && state.handleFileSelect(e.target.files[0])}
                      />
                    </div>
                  ) : (
                    /* File selected — check icon + filename + manual trigger button */
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex flex-col items-center gap-4 py-6"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center">
                        <CheckCircle2 className="w-9 h-9 text-[#10B981]" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#1A1D2E]">{state.uploadedFile.name}</p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">
                          {(state.uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => state.setUploadedFile(null)}>
                          다시 선택
                        </Button>
                        <Button variant="primary" onClick={state.handleProcessFile}>
                          파일 분석하기
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {state.error && (
                    <p className="text-xs text-red-500 text-center">{state.error}</p>
                  )}
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
