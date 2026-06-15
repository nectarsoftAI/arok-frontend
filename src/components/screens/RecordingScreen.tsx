import { useState, useEffect, useRef } from "react";
import { FileText, Download, CheckCircle2, Square, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MeetingTitleDialog, MeetingMode } from "../MeetingTitleDialog";
import { RecordingOrb } from "../RecordingOrb";
import meetingImg1 from "../../../assets/meetingIMG.png";
import meetingImg2 from "../../../assets/meetingIMG2.png";
import meetingImg3 from "../../../assets/meetingIMG3.png";
import recodingLiveImg from "../../../assets/recoding_live.png";

const MEETING_IMAGES = [meetingImg1, meetingImg2, meetingImg3];

type RecordingState = 'idle' | 'recording' | 'finished';

export function RecordingScreen() {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingMode, setMeetingMode] = useState<MeetingMode>("live");
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [hasConversation, setHasConversation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (meetingTitle) return;
    const interval = setInterval(() => {
      setImgIndex(prev => (prev + 1) % MEETING_IMAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [meetingTitle]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (recordingState === 'finished') {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  useEffect(() => {
    if (recordingState === 'recording' && !hasConversation) {
      const timer = setTimeout(() => {
        setHasConversation(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [recordingState, hasConversation]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTitleConfirm = (title: string, mode: MeetingMode) => {
    setMeetingTitle(title);
    setMeetingMode(mode);
    setShowTitleDialog(false);
  };

  const handleRecordingToggle = () => {
    if (recordingState === 'idle') {
      setRecordingState('recording');
    } else if (recordingState === 'recording') {
      setRecordingState('finished');
    }
  };

  const handleSummaryClick = () => {
    const canSummarize = meetingMode === "live" ? recordingState === 'finished' : !!uploadedFile;
    if (canSummarize && !showSummary) {
      setIsLoadingSummary(true);
      setTimeout(() => {
        setIsLoadingSummary(false);
        setShowSummary(true);
        setHasConversation(true);
      }, 1500);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|ogg|flac|aac|wma)$/i)) {
      setUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleProcessFile = () => {
    if (!uploadedFile) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasConversation(true);
    }, 2000);
  };

  const messages = [
    { speaker: "A", text: "프로젝트 진행 상황을 먼저 논의해볼까요?", time: "10:23" },
    { speaker: "B", text: "네, 좋습니다. 현재 개발 진행률은 약 70% 정도입니다.", time: "10:24" },
    { speaker: "A", text: "생각보다 빠르게 진행되고 있네요. 마케팅 계획은 어떤가요?", time: "10:25" },
    { speaker: "B", text: "마케팅팀과 협의 중입니다. 다음 주까지 초안을 완료할 예정입니다.", time: "10:26" },
    { speaker: "A", text: "좋습니다. 예산 관련해서 추가 논의가 필요할 것 같은데요.", time: "10:27" },
    { speaker: "B", text: "네, 예산 세부 내용은 별도 문서로 공유하겠습니다.", time: "10:28" },
  ];

  const keywords = ["프로젝트", "진행 상황", "개발", "마케팅", "예산", "일정", "회의"];

  const canSummarize = meetingMode === "live" ? recordingState === 'finished' : !!uploadedFile;

  return (
    <div className="h-full p-6">
      <MeetingTitleDialog
        isOpen={showTitleDialog}
        onConfirm={handleTitleConfirm}
        onClose={() => setShowTitleDialog(false)}
      />

      {!meetingTitle ? (
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
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                />
              </AnimatePresence>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {MEETING_IMAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === imgIndex ? "bg-white w-4" : "bg-white/60 w-1.5"}`}
                  />
                ))}
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-[#1A1D2E] mb-3">새로운 회의를 시작하세요</h2>
            <p className="text-sm text-[#6B7280] mb-8">AI가 자동으로 대화를 분석하고 요약해드립니다</p>
            <button
              onClick={() => setShowTitleDialog(true)}
              className="px-8 py-4 bg-gradient-to-br from-[#5B5FF5] to-[#818CF8] hover:from-[#5B5FF5]/90 hover:to-[#818CF8]/90 text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              새로운 회의 시작하기
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-[#1A1D2E]">{meetingTitle}</h1>
          </div>

          <div className="grid grid-cols-[1fr_0.67fr] gap-6" style={{ height: 'calc(100vh - 200px)' }}>
            {/* Left Column - Conversation */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full">
              <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
                <h2 className="font-semibold text-[#1A1D2E]">대화 내용</h2>
                <button
                  disabled={!canSummarize}
                  className={`px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg transition-colors flex items-center gap-2 ${
                    canSummarize ? 'text-[#6B7280] hover:bg-[#F3F4F6] cursor-pointer' : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  대화 내보내기
                </button>
              </div>

              {/* Messages */}
              <div className="overflow-auto p-5 space-y-4" style={{ height: 'calc(100% - 300px)' }}>
                {!hasConversation ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-8">
                    <img src={recodingLiveImg} alt="녹음" className="w-20 h-20 object-contain mb-6 opacity-60" />
                    <h3 className="font-semibold text-[#1A1D2E] mb-2">대화를 시작해보세요</h3>
                    <p className="text-sm text-[#6B7280]">
                      {meetingMode === "live"
                        ? "녹음 버튼을 눌러 회의를 시작하세요."
                        : "오디오 파일을 업로드하면 자동으로 분석됩니다."}
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${
                          msg.speaker === "A" ? "bg-[#5B5FF5]" : "bg-[#22D3EE]"
                        }`}
                      >
                        {msg.speaker}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-[#6B7280] mb-1">화자 {msg.speaker}</div>
                        <div className="bg-[#F3F4F6] rounded-xl px-4 py-2.5 text-sm text-[#1A1D2E]">{msg.text}</div>
                        <div className="text-xs text-[#9CA3AF] mt-1 text-right">{msg.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Controls */}
              <div className="border-t border-[#E5E7EB] flex flex-col items-center justify-center flex-shrink-0" style={{ height: '280px' }}>
                {meetingMode === "live" ? (
                  /* Live recording controls */
                  <div className="flex flex-col items-center gap-3">
                    {recordingState === 'finished' ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                        </div>
                        <div className="text-sm text-[#10B981] font-medium text-center mb-0.5">녹음 완료</div>
                      </div>
                    ) : (
                      <RecordingOrb
                        state={recordingState}
                        onToggle={handleRecordingToggle}
                        elapsedTime={formatTime(elapsedSeconds)}
                      />
                    )}
                    <button
                      onClick={handleSummaryClick}
                      disabled={recordingState !== 'finished' || isLoadingSummary}
                      className={`w-full max-w-xs px-5 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm ${
                        recordingState === 'finished' && !isLoadingSummary
                          ? 'bg-[#22D3EE] hover:bg-[#22D3EE]/90 text-white hover:shadow-lg cursor-pointer'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      {isLoadingSummary ? '요약 중...' : '요약'}
                    </button>
                  </div>
                ) : (
                  /* File upload controls */
                  <div className="flex flex-col items-center gap-4 w-full px-6">
                    {!uploadedFile ? (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                          isDragging
                            ? 'border-[#5B5FF5] bg-[#EEF2FF]'
                            : 'border-[#E5E7EB] hover:border-[#5B5FF5]/50 hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <Upload className="w-8 h-8 text-[#5B5FF5]" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-[#1A1D2E]">오디오 파일 업로드</p>
                          <p className="text-xs text-[#6B7280] mt-0.5">MP3, WAV, M4A, OGG 등 지원</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        />
                      </div>
                    ) : (
                      <div className="w-full bg-[#F3F4F6] rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#5B5FF5]/10 flex items-center justify-center flex-shrink-0">
                          <Upload className="w-5 h-5 text-[#5B5FF5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A1D2E] truncate">{uploadedFile.name}</p>
                          <p className="text-xs text-[#6B7280]">{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-[#6B7280]" />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2 w-full">
                      {uploadedFile && !hasConversation && (
                        <button
                          onClick={handleProcessFile}
                          disabled={isProcessing}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-all ${
                            isProcessing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#5B5FF5] hover:bg-[#5B5FF5]/90 text-white'
                          }`}
                        >
                          {isProcessing ? '분석 중...' : '파일 분석하기'}
                        </button>
                      )}
                      <button
                        onClick={handleSummaryClick}
                        disabled={!canSummarize || isLoadingSummary}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-all ${
                          canSummarize && !isLoadingSummary
                            ? 'bg-[#22D3EE] hover:bg-[#22D3EE]/90 text-white cursor-pointer'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        {isLoadingSummary ? '요약 중...' : '요약'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full">
              <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
                <h2 className="font-semibold text-[#1A1D2E]">대화 요약</h2>
                <button
                  disabled={!showSummary}
                  className={`px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg transition-colors flex items-center gap-2 ${
                    showSummary ? 'text-[#6B7280] hover:bg-[#F3F4F6] cursor-pointer' : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  요약 내보내기
                </button>
              </div>

              <div className="overflow-auto p-5 space-y-5 flex-1">
                {isLoadingSummary ? (
                  <div className="space-y-5 animate-pulse">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                    <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                ) : !showSummary ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#22D3EE]/10 to-[#22D3EE]/20 flex items-center justify-center mb-6">
                      <FileText className="w-10 h-10 text-[#22D3EE]" />
                    </div>
                    <h3 className="font-semibold text-[#1A1D2E] mb-2">요약이 준비되지 않았습니다</h3>
                    <p className="text-sm text-[#6B7280]">
                      {meetingMode === "live" ? "대화를 진행한 후 요약 버튼을 눌러주세요." : "파일을 업로드한 후 요약 버튼을 눌러주세요."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-[#1A1D2E] text-sm">주요 내용</h3>
                      <ul className="space-y-2">
                        {["프로젝트 진행 상황 (70% 완료)", "개발 진행 순조로움", "마케팅 계획 (다음 주까지 초안 완료 예정)", "예산 관련 추가 논의 필요"].map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-[#1A1D2E]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#5B5FF5] mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
                      <h3 className="font-semibold text-[#1A1D2E] text-sm">결정 사항</h3>
                      <ul className="space-y-2">
                        {["마케팅 계획 초안 공유", "예산 내용 별도 문서 공유", "다음 회의에서 세부 계획 논의"].map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-[#1A1D2E]">
                            <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
                      <h3 className="font-semibold text-[#1A1D2E] text-sm">후속 조치</h3>
                      <ul className="space-y-3">
                        {[
                          { task: "마케팅 초안 작성", assignee: "화자 A", due: "6/10" },
                          { task: "예산 문서 준비", assignee: "화자 B", due: "6/08" },
                          { task: "다음 회의 일정 조율", assignee: "화자 A", due: "6/12" },
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Square className="w-4 h-4 text-[#6B7280] flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-[#1A1D2E]">{item.task}</div>
                              <div className="flex gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#5B5FF5] text-xs rounded">{item.assignee}</span>
                                <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-xs rounded">{item.due}</span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
                      <h3 className="font-semibold text-[#1A1D2E] text-sm">키워드</h3>
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((keyword, idx) => (
                          <span key={idx} className="px-3 py-1 bg-[#EEF2FF] text-[#5B5FF5] text-xs rounded-md">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
