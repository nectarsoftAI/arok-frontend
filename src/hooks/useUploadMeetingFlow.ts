import { useState } from 'react';
import { transcribeFile } from '../api/stt';
import type { TranscriptSegment } from '../api/types';
import { parseSummaryDto, type SummaryResponse } from '../api/summary';
import { meetingsApi } from '../api/meetings';
import { SPEAKER_PALETTE } from '../components/common/SpeakerAvatar';

export interface UseUploadMeetingFlowReturn {
  meetingTitle: string;
  startedAt: Date | null;
  hasConversation: boolean;
  showSummary: boolean;
  meetingId: string | null;
  transcripts: TranscriptSegment[];
  error: string | null;
  uploadedFile: File | null;
  setUploadedFile: (f: File | null) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  isProcessing: boolean;
  summaryData: SummaryResponse | null;
  summaryError: string | null;
  handleFileSelect: (file: File) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleProcessFile: () => Promise<void>;
  formatSec: (sec: number) => string;
  speakerColorMap: Record<string, string>;
  speakerIndexMap: Record<string, string>;
}

export function useUploadMeetingFlow(meetingTitle: string): UseUploadMeetingFlowReturn {
  const [startedAt] = useState<Date | null>(() => new Date());
  const [hasConversation, setHasConversation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const formatSec = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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

      // STT 응답에 summary가 포함돼 있으면 바로 사용, 없으면 DB 재조회
      const parsed = parseSummaryDto(result.summary);
      if (parsed) {
        setSummaryData(parsed);
        setShowSummary(true);
      } else {
        const { data } = await meetingsApi.getById(newMeetingId);
        const parsedFallback = parseSummaryDto(data.summary);
        if (parsedFallback) {
          setSummaryData(parsedFallback);
          setShowSummary(true);
        } else {
          setSummaryError('요약 생성에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('파일 분석 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const uniqueSpeakers = [...new Set(transcripts.map(s => s.speakerLabel))];
  const speakerColorMap: Record<string, string> = Object.fromEntries(
    uniqueSpeakers.map((label, i) => [label, SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]])
  );
  const speakerIndexMap: Record<string, string> = Object.fromEntries(
    uniqueSpeakers.map((label, i) => [label, String.fromCharCode(65 + i)])
  );

  return {
    meetingTitle,
    startedAt,
    hasConversation,
    showSummary,
    meetingId,
    transcripts,
    error,
    uploadedFile,
    setUploadedFile,
    isDragging,
    setIsDragging,
    isProcessing,
    summaryData,
    summaryError,
    handleFileSelect,
    handleDrop,
    handleProcessFile,
    formatSec,
    speakerColorMap,
    speakerIndexMap,
  };
}
