import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../common/Button';
import type { MeetingStateReturn } from '../../hooks/useMeetingState';
import { TranscriptSection } from './TranscriptSection';
import { SummarySection } from './SummarySection';
import { StepCards } from './StepCards';
import type { StepDef } from './StepCards';
import { LoadingAnimation } from '../common/LoadingAnimation';
import uploadFileIcon from '../../assets/icons/upload_file_icon.webp';
import uploadCompleteIcon from '../../assets/icons/upload_complete_icon.webp';

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
          <motion.div
            key="upload"
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 relative"
          >
            {/* Subtle breathing radial gradient backdrop */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[560px] rounded-full"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(91,95,245,0.16) 0%, rgba(139,92,246,0.06) 50%, transparent 75%)',
                }}
              />
            </div>

            <AnimatePresence mode="wait">
              {state.isProcessing ? (
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
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full flex flex-col items-center gap-6"
                >
                  <div className="text-center">
                    <p className="text-lg font-semibold text-[#1A1D2E]">오디오 파일 분석</p>
                    <p className="text-sm text-[#6B7280] mt-1">파일을 업로드하면 대화 내용과 요약을 자동으로 생성해드려요</p>
                  </div>

                  {!state.uploadedFile ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); state.setIsDragging(true); }}
                      onDragLeave={() => state.setIsDragging(false)}
                      onDrop={state.handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-full max-w-lg cursor-pointer"
                    >
                      <div className="flex flex-col items-center gap-6 py-24 px-10">
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
                            rx="20" ry="20"
                            style={{ animation: 'dash-flow 0.8s linear infinite' }}
                          />
                        </svg>
                        <motion.img
                          src={uploadFileIcon}
                          alt="upload"
                          className="w-40 h-40 object-contain relative z-10"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ filter: state.isDragging ? 'brightness(0.85)' : 'none' }}
                        />
                        <div className="text-center relative z-10">
                          <p className="text-base font-medium text-[#1A1D2E]">오디오 파일 업로드</p>
                          <p className="text-sm text-[#9CA3AF] mt-1">MP3, WAV, M4A, OGG, FLAC 지원</p>
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
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex flex-col items-center gap-5 py-6"
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Pulsing glow ring */}
                        <motion.div
                          className="absolute rounded-full"
                          style={{
                            width: '220px',
                            height: '220px',
                            background:
                              'radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 70%)',
                          }}
                          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <img
                          src={uploadCompleteIcon}
                          alt="upload complete"
                          className="w-44 h-44 object-contain relative z-10"
                        />
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
