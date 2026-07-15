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
  // segments state와 별개로 유지하는 소스 오브 트루스 — WS 메시지가 React 렌더 사이클과
  // 무관하게 연달아 들어와도 "지금 열려있는 partial 세그먼트가 몇 번째 원소인지"를 정확히 추적하기 위함.
  const segmentsRef = useRef<SegmentMessage[]>([]);
  const openPartialRef = useRef<Map<string, SegmentMessage>>(new Map()); // speaker_label -> 아직 안 끝난 세그먼트

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
    segmentsRef.current = [];
    openPartialRef.current.clear();
    setMeetingId(null);
    setIsEnded(false);

    const service = new LiveSTTService({
      onSessionCreated: (id) => {
        setMeetingId(id);
        setIsConnected(true);
      },
      onSegment: (msg) => {
        // is_final:false인 동안엔 같은 화자의 미리보기 세그먼트를 새로 추가하지 않고 갱신만 함
        // (final이 오면 그 자리를 확정 텍스트로 교체하고 열린 상태에서 제외)
        const openPartials = openPartialRef.current;
        const openMsg = openPartials.get(msg.speaker_label);
        const idx = openMsg ? segmentsRef.current.indexOf(openMsg) : -1;
        if (idx !== -1) {
          segmentsRef.current[idx] = msg;
        } else {
          segmentsRef.current.push(msg);
        }
        setSegments([...segmentsRef.current]);

        if (msg.is_final) {
          openPartials.delete(msg.speaker_label);
        } else {
          openPartials.set(msg.speaker_label, msg);
        }
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
