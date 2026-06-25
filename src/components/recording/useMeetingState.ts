import { useState, useEffect } from 'react';
import type { MeetingMode } from '../MeetingTitleDialog';
import { transcribeFile } from '../../api/stt';
import type { TranscriptSegment } from '../../api/types';
import { parseSummaryDto, type SummaryResponse } from '../../api/summary';
import { meetingsApi } from '../../api/meetings';
import { useLiveSTT } from '../../hooks/useLiveSTT';
import type { SegmentMessage } from '../../services/live/types';

export type RecordingState = 'idle' | 'recording' | 'stopping' | 'finished';

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
  liveMeetingId: string | null;
  transcripts: TranscriptSegment[];
  error: string | null;
  uploadedFile: File | null;
  setUploadedFile: (f: File | null) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  isProcessing: boolean;
  summaryData: SummaryResponse | null;
  summaryError: string | null;
  segments: SegmentMessage[];
  liveError: string | null;
  handleTitleConfirm: (title: string, mode: MeetingMode) => void;
  handleRecordingToggle: () => Promise<void>;
  handleSummaryClick: () => Promise<void>;
  handleFileSelect: (file: File) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleProcessFile: () => Promise<void>;
  formatTime: (seconds: number) => string;
  formatSec: (sec: number) => string;
  speakerColorMap: Record<string, string>;
  speakerIndexMap: Record<string, string>;
  liveColorMap: Record<string, string>;
  liveIndexMap: Record<string, string>;
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
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);

  const [summaryError, setSummaryError] = useState<string | null>(null);

  const { meetingId: liveMeetingId, segments, error: liveError, isEnded: liveIsEnded, start: liveStart, stop: liveStop } = useLiveSTT();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (recordingState === 'recording') {
      interval = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    } else if (recordingState === 'stopping' || recordingState === 'finished') {
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

  // 서버가 session_ended 전송 → finished 전환 + 요약 자동 호출
  useEffect(() => {
    if (!liveIsEnded || !liveMeetingId) return;
    if (recordingState === 'recording' || recordingState === 'stopping') {
      setRecordingState('finished');
    }

    const controller = new AbortController();
    setIsLoadingSummary(true);
    setSummaryError(null);
    meetingsApi.summarize(liveMeetingId, controller.signal)
      .then(({ data }) => {
        const parsed = parseSummaryDto(data);
        if (parsed) {
          setSummaryData(parsed);
          setShowSummary(true);
          setHasConversation(true);
        } else {
          setSummaryError('요약 데이터 파싱에 실패했습니다.');
        }
      })
      .catch((err: unknown) => {
        const aborted = err instanceof Error && err.name === 'CanceledError';
        if (!aborted) setSummaryError('요약 생성에 실패했습니다. 다시 시도해 주세요.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingSummary(false);
      });

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveIsEnded, liveMeetingId]);

  useEffect(() => {
    if (liveError && (recordingState === 'recording' || recordingState === 'stopping')) {
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
      setRecordingState('recording'); // 즉시 상태 전환 → 중복 클릭 차단
      try {
        await liveStart(meetingTitle);
      } catch {
        setRecordingState('idle'); // 실패 시 롤백
        // liveError state is set inside useLiveSTT
      }
    } else if (recordingState === 'recording') {
      liveStop(); // {"type":"end"} 전송 — server가 session_ended 보내면 'finished'로 전환
      setRecordingState('stopping');
    }
  };

  // 요약 버튼: 자동 호출 실패 시 수동 재시도용
  const handleSummaryClick = async () => {
    if (showSummary || isLoadingSummary) return;
    if (meetingMode === 'live') {
      if (recordingState !== 'finished' || !liveMeetingId) return;
      setIsLoadingSummary(true);
      setSummaryError(null);
      try {
        const { data } = await meetingsApi.summarize(liveMeetingId);
        const parsed = parseSummaryDto(data);
        if (parsed) {
          setSummaryData(parsed);
          setShowSummary(true);
          setHasConversation(true);
        } else {
          setSummaryError('요약 데이터 파싱에 실패했습니다.');
        }
      } catch {
        setSummaryError('요약 생성에 실패했습니다. 다시 시도해 주세요.');
      } finally {
        setIsLoadingSummary(false);
      }
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
    setSummaryError(null);
    try {
      const result = await transcribeFile(uploadedFile, meetingTitle || undefined);
      const newMeetingId = result.meetingId;
      setMeetingId(newMeetingId);
      setTranscripts(result.transcripts);
      setHasConversation(true);

      // 요약은 GET /api/v1/meetings/{id}로 DB에서 조회 (Java가 Python 요약 완료 후 저장)
      const { data } = await meetingsApi.getById(newMeetingId);
      const parsed = parseSummaryDto(data.summary);
      if (parsed) {
        setSummaryData(parsed);
        setShowSummary(true);
      } else {
        setSummaryError('요약 생성에 실패했습니다.');
      }
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

  const speakerIndexMap: Record<string, string> = Object.fromEntries(
    uniqueSpeakers.map((label, i) => [label, String.fromCharCode(65 + i)])
  );

  // live 모드 화자 맵
  const uniqueLiveSpeakers = [...new Set(segments.map(s => s.speaker_label))];
  const liveColorMap: Record<string, string> = Object.fromEntries(
    uniqueLiveSpeakers.map((label, i) => [label, SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]])
  );

  const liveIndexMap: Record<string, string> = Object.fromEntries(
    uniqueLiveSpeakers.map((label, i) => [label, String.fromCharCode(65 + i)])
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
    liveMeetingId,
    transcripts,
    error,
    uploadedFile,
    setUploadedFile,
    isDragging,
    setIsDragging,
    isProcessing,
    summaryData,
    summaryError,
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
