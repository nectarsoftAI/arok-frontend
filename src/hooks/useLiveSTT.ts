import { useState, useRef, useCallback, useEffect } from 'react';
import { LiveSTTService } from '../services/live/LiveSTTService';
import type { SegmentMessage } from '../services/live/types';

export interface UseLiveSTTReturn {
  meetingId: string | null;
  segments: SegmentMessage[];
  isConnected: boolean;
  isRecording: boolean;
  isEnded: boolean;
  error: string | null;
  start: (title: string) => Promise<void>;
  stop: () => void;
}

export function useLiveSTT(): UseLiveSTTReturn {
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [segments, setSegments] = useState<SegmentMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceRef = useRef<LiveSTTService | null>(null);

  useEffect(() => {
    return () => {
      serviceRef.current?.destroy(); // 페이지 이동 등 언마운트 시 강제 정리
    };
  }, []);

  const start = useCallback(async (title: string) => {
    serviceRef.current?.stop(); // 이전 서비스 잔존 시 정리
    serviceRef.current = null;

    setError(null);
    setSegments([]);
    setMeetingId(null);
    setIsEnded(false);

    const service = new LiveSTTService({
      onSessionCreated: (id) => {
        setMeetingId(id);
        setIsConnected(true);
      },
      onSegment: (msg) => {
        setSegments((prev) => [...prev, msg]);
      },
      onEnded: (id) => {
        setMeetingId(id);
        setIsConnected(false);
        setIsRecording(false);
        setIsEnded(true); // 서버가 session_ended 전송 → UI 전환 트리거
      },
      onError: (message) => {
        setError(message);
        setIsConnected(false);
        setIsRecording(false);
      },
    });

    serviceRef.current = service;

    await service.createSessionAndConnect(title);
    await service.startRecording();
    setIsRecording(true);
  }, []);

  const stop = useCallback(() => {
    // MediaRecorder 중단 + {"type":"end"} 전송만 — isRecording은 서버 session_ended 후 변경
    serviceRef.current?.stop();
  }, []);

  return { meetingId, segments, isConnected, isRecording, isEnded, error, start, stop };
}
