import { useState, useEffect } from 'react';
import type { MeetingMode } from '../MeetingTitleDialog';
import { transcribeFile, type TranscriptSegment } from '../../api/stt';
import { useLiveSTT } from '../../hooks/useLiveSTT';
import type { SegmentMessage } from '../../services/live/types';

export type RecordingState = 'idle' | 'recording' | 'finished';

const SPEAKER_PALETTE = ['bg-[#5B5FF5]', 'bg-[#22D3EE]', 'bg-[#F59E0B]', 'bg-[#EC4899]'];

export interface MeetingStateReturn {
  meetingTitle: string;
  meetingMode: MeetingMode;
  showTitleDialog: boolean;
  setShowTitleDialog: (v: boolean) => void;
  recordingState: RecordingState;
  elapsedSeconds: number;
  hasConversation: boolean;
  showSummary: boolean;
  isLoadingSummary: boolean;
  meetingId: string | null;
  transcripts: TranscriptSegment[];
  error: string | null;
  uploadedFile: File | null;
  setUploadedFile: (f: File | null) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  isProcessing: boolean;
  segments: SegmentMessage[];
  liveError: string | null;
  handleTitleConfirm: (title: string, mode: MeetingMode) => void;
  handleRecordingToggle: () => Promise<void>;
  handleSummaryClick: () => void;
  handleFileSelect: (file: File) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleProcessFile: () => Promise<void>;
  formatTime: (seconds: number) => string;
  formatSec: (sec: number) => string;
  speakerColorMap: Record<string, string>;
  speakerIndexMap: Record<string, number>;
  liveColorMap: Record<string, string>;
  liveIndexMap: Record<string, number>;
  canSummarize: boolean;
}

export function useMeetingState(): MeetingStateReturn {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingMode, setMeetingMode] = useState<MeetingMode>('live');
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [hasConversation, setHasConversation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { segments, error: liveError, start: liveStart, stop: liveStop } = useLiveSTT();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (recordingState === 'recording') {
      interval = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    } else if (recordingState === 'finished') {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  useEffect(() => {
    if (recordingState === 'recording' && !hasConversation) {
      const timer = setTimeout(() => setHasConversation(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [recordingState, hasConversation]);

  useEffect(() => {
    if (liveError && recordingState === 'recording') {
      setRecordingState('idle');
    }
  }, [liveError, recordingState]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSec = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTitleConfirm = (title: string, mode: MeetingMode) => {
    setMeetingTitle(title);
    setMeetingMode(mode);
    setShowTitleDialog(false);
  };

  const handleRecordingToggle = async () => {
    if (recordingState === 'idle') {
      try {
        await liveStart();
        setRecordingState('recording');
      } catch {
        // liveError state is set inside useLiveSTT
      }
    } else if (recordingState === 'recording') {
      liveStop();
      setRecordingState('finished');
    }
  };

  const handleSummaryClick = () => {
    const can = meetingMode === 'live' ? recordingState === 'finished' : !!uploadedFile;
    if (can && !showSummary) {
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

  const handleProcessFile = async () => {
    if (!uploadedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await transcribeFile(uploadedFile);
      setMeetingId(result.meetingId);
      setTranscripts(result.transcripts);
      setHasConversation(true);
    } catch (err) {
      console.error(err);
      setError('파일 분석 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // upload 모드 화자 맵
  const uniqueSpeakers = [...new Set(transcripts.map(s => s.speakerLabel))];
  const speakerColorMap: Record<string, string> = Object.fromEntries(
    uniqueSpeakers.map((label, i) => [label, SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]])
  );
  const speakerIndexMap: Record<string, number> = Object.fromEntries(
    uniqueSpeakers.map((label, i) => [label, i + 1])
  );

  // live 모드 화자 맵
  const uniqueLiveSpeakers = [...new Set(segments.map(s => s.speaker_label))];
  const liveColorMap: Record<string, string> = Object.fromEntries(
    uniqueLiveSpeakers.map((label, i) => [label, SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]])
  );
  const liveIndexMap: Record<string, number> = Object.fromEntries(
    uniqueLiveSpeakers.map((label, i) => [label, i + 1])
  );

  const canSummarize = meetingMode === 'live' ? recordingState === 'finished' : !!uploadedFile;

  return {
    meetingTitle,
    meetingMode,
    showTitleDialog,
    setShowTitleDialog,
    recordingState,
    elapsedSeconds,
    hasConversation,
    showSummary,
    isLoadingSummary,
    meetingId,
    transcripts,
    error,
    uploadedFile,
    setUploadedFile,
    isDragging,
    setIsDragging,
    isProcessing,
    segments,
    liveError,
    handleTitleConfirm,
    handleRecordingToggle,
    handleSummaryClick,
    handleFileSelect,
    handleDrop,
    handleProcessFile,
    formatTime,
    formatSec,
    speakerColorMap,
    speakerIndexMap,
    liveColorMap,
    liveIndexMap,
    canSummarize,
  };
}
