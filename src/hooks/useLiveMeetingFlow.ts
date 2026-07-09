import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { parseSummaryDto, type SummaryResponse } from '../api/summary';
import { meetingsApi } from '../api/meetings';
import { useLiveSTT } from './useLiveSTT';
import { SPEAKER_PALETTE } from '../components/common/SpeakerAvatar';

function getSummarizeErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const serverMessage: string | undefined = err.response?.data?.message;
    if (status === 422) return serverMessage ?? '음성이 인식되지 않았습니다. 더 길게 말한 뒤 다시 시도해 주세요.';
    if (status === 404) return '회의를 찾을 수 없습니다.';
    if (status && status >= 500) return serverMessage ?? '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    if (!err.response) return '네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.';
  }
  return '요약 생성에 실패했습니다. 다시 시도해 주세요.';
}

export type RecordingState = 'idle' | 'recording' | 'stopping' | 'finished';

export interface UseLiveMeetingFlowReturn {
  meetingTitle: string;
  startedAt: Date | null;
  recordingState: RecordingState;
  elapsedSeconds: number;
  hasConversation: boolean;
  showSummary: boolean;
  isLoadingSummary: boolean;
  liveMeetingId: string | null;
  segments: import('../services/live/types').SegmentMessage[];
  liveError: string | null;
  summaryData: SummaryResponse | null;
  summaryError: string | null;
  handleRecordingToggle: () => Promise<void>;
  formatTime: (seconds: number) => string;
  formatSec: (sec: number) => string;
  liveColorMap: Record<string, string>;
  liveIndexMap: Record<string, string>;
}

export function useLiveMeetingFlow(meetingTitle: string): UseLiveMeetingFlowReturn {
  const [startedAt] = useState<Date | null>(() => new Date());
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [hasConversation, setHasConversation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
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
        const aborted = isAxiosError(err) && err.code === 'ERR_CANCELED';
        if (!aborted) setSummaryError(getSummarizeErrorMessage(err));
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

  const handleRecordingToggle = async () => {
    if (recordingState === 'idle') {
      setRecordingState('recording'); // 즉시 상태 전환 → 중복 클릭 차단
      try {
        await liveStart(meetingTitle);
      } catch {
        setRecordingState('idle'); // 실패 시 롤백
      }
    } else if (recordingState === 'recording') {
      liveStop(); // {"type":"end"} 전송 — server가 session_ended 보내면 'finished'로 전환
      setRecordingState('stopping');
    }
  };

  const uniqueLiveSpeakers = [...new Set(segments.map(s => s.speaker_label))];
  const liveColorMap: Record<string, string> = Object.fromEntries(
    uniqueLiveSpeakers.map((label, i) => [label, SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]])
  );
  const liveIndexMap: Record<string, string> = Object.fromEntries(
    uniqueLiveSpeakers.map((label, i) => [label, String.fromCharCode(65 + i)])
  );

  return {
    meetingTitle,
    startedAt,
    recordingState,
    elapsedSeconds,
    hasConversation,
    showSummary,
    isLoadingSummary,
    liveMeetingId,
    segments,
    liveError,
    summaryData,
    summaryError,
    handleRecordingToggle,
    formatTime,
    formatSec,
    liveColorMap,
    liveIndexMap,
  };
}
