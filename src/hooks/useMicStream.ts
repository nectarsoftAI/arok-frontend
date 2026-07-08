import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseMicStreamReturn {
  track: MediaStreamTrack | null;
  error: string | null;
  // 멱등 — 이미 트랙이 있거나 획득 중이면 그 Promise를 그대로 반환.
  // getUserMedia가 실제로는 딱 한 번만 호출되도록 보장하는 게 이 함수의 핵심 역할
  ensureTrack: () => Promise<MediaStreamTrack>;
}

export function useMicStream(): UseMicStreamReturn {
  const [track, setTrack] = useState<MediaStreamTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const trackPromiseRef = useRef<Promise<MediaStreamTrack> | null>(null);

  const ensureTrack = useCallback((): Promise<MediaStreamTrack> => {
    if (trackPromiseRef.current) return trackPromiseRef.current;

    const promise = navigator.mediaDevices
      .getUserMedia({ audio: { channelCount: 1 } })
      .then((stream) => {
        const micTrack = stream.getAudioTracks()[0];
        setTrack(micTrack);
        return micTrack;
      })
      .catch((err: unknown) => {
        trackPromiseRef.current = null; // 실패 시 캐시 비워서 다음 호출에서 재시도 가능하게
        setError('마이크 접근 권한이 필요합니다.');
        throw err;
      });

    trackPromiseRef.current = promise;
    return promise;
  }, []);

  // 회의방을 완전히 나갈 때(언마운트)만 마이크를 실제로 끔 — PCM/LiveKit 각각의
  // 재연결/재시작 사이클에서는 이 트랙을 건드리지 않음 (그게 이번 리팩토링의 목적)
  useEffect(() => {
    return () => {
      track?.stop();
    };
  }, [track]);

  return { track, error, ensureTrack };
}
