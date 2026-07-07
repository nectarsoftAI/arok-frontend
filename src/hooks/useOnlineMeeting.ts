import { useState, useRef, useCallback, useEffect } from 'react';
import { OnlineMeetingService, MAX_RECONNECT_ATTEMPTS } from '../services/online/OnlineMeetingService';
import type { OnlineTranscriptMessage } from '../services/online/types';
import { useAuthStore } from '../store/authStore';
import { meetingsApi } from '../api/meetings';
import type { TranscriptSegment } from '../api/types';

function toOnlineTranscript(seg: TranscriptSegment): OnlineTranscriptMessage {
  return {
    profileId: seg.speakerLabel,
    speakerDisplay: seg.speakerDisplay,
    text: seg.content,
    startSec: seg.startSec,
    endSec: seg.endSec,
  };
}

export type OnlineRoomStatus = 'PROCESSING' | 'LIVE' | 'COMPLETED';

export interface OnlineParticipant {
  profileId: string;
  role: string;
}

export interface UseOnlineMeetingReturn {
  participants: OnlineParticipant[];
  transcripts: OnlineTranscriptMessage[];
  roomStatus: OnlineRoomStatus;
  error: string | null;
  isRecording: boolean;
  isReconnecting: boolean;
  reconnectAttempt: number;
  maxReconnectAttempts: number;
  isNetworkOffline: boolean;
  startMeeting: () => void;
  endMeeting: () => void;
}

export function useOnlineMeeting(
  meetingId: string | undefined,
  role: 'host' | 'guest',
  token?: string,
): UseOnlineMeetingReturn {
  const [participants, setParticipants] = useState<OnlineParticipant[]>([]);
  const [transcripts, setTranscripts] = useState<OnlineTranscriptMessage[]>([]);
  const [roomStatus, setRoomStatus] = useState<OnlineRoomStatus>('PROCESSING');
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [isNetworkOffline, setIsNetworkOffline] = useState(!navigator.onLine);
  const serviceRef = useRef<OnlineMeetingService | null>(null);
  const user = useAuthStore((state) => state.user);

  // WS의 onclose는 네트워크가 완전히 끊기면 회선이 복구될 때까지 감지가 안 될 수 있어서,
  // OS가 즉시 알려주는 온라인/오프라인 상태를 별도로 감지해 더 빠르게 사용자에게 알림
  useEffect(() => {
    const handleOffline = () => setIsNetworkOffline(true);
    const handleOnline = () => setIsNetworkOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!meetingId || !user?.id) return;

    // StrictMode 이중 mount 시 REST 응답이 늦게 도착해 history가 중복 반영되는 것 방지
    let cancelled = false;

    const tryStartRecording = (service: OnlineMeetingService) => {
      service
        .startRecording()
        .then(() => setIsRecording(true))
        .catch(() => setError('마이크 접근 권한이 필요합니다.'));
    };

    const dedup = (list: OnlineParticipant[]): OnlineParticipant[] => {
      const seen = new Set<string>();
      return list.filter((p) => {
        if (seen.has(p.profileId)) return false;
        seen.add(p.profileId);
        return true;
      });
    };

    const service = new OnlineMeetingService({
      onRoomInfo: (status, pids) => {
        const s = status as OnlineRoomStatus;
        setIsReconnecting(false);
        setRoomStatus(s);
        setParticipants(dedup(pids.map((pid) => ({ profileId: pid, role: 'GUEST' }))));
        if (s === 'LIVE') tryStartRecording(service);

        // REST API로 role만 업데이트 — 참여자 목록은 WS 기준 유지 (미접속자 추가 방지)
        meetingsApi.getParticipants(meetingId).then(({ data }) => {
          const roleMap = new Map(data.map((p) => [p.profileId, p.role] as const));
          setParticipants((prev) =>
            dedup(prev.map((p) => ({ ...p, role: roleMap.get(p.profileId) ?? p.role }))),
          );
        }).catch(() => {});
      },
      onParticipantJoined: (profileId, participantRole) => {
        setParticipants((prev) => {
          if (prev.find((p) => p.profileId === profileId)) return prev;
          return [...prev, { profileId, role: participantRole }];
        });
      },
      onParticipantLeft: (profileId) => {
        setParticipants((prev) => prev.filter((p) => p.profileId !== profileId));
      },
      onMeetingStarted: () => {
        setRoomStatus('LIVE');
        tryStartRecording(service);
      },
      onMeetingEnded: () => {
        // stopRecording + WS close는 OnlineMeetingService 내부에서 처리됨
        setRoomStatus('COMPLETED');
        setIsRecording(false);
      },
      onKicked: () => {
        setError('회의에서 강퇴되었습니다.');
        service.disconnect();
      },
      onTranscript: (msg) => setTranscripts((prev) => [...prev, msg]),
      onReconnecting: (attempt) => {
        setIsReconnecting(true);
        setReconnectAttempt(attempt);
      },
      onError: (msg) => {
        setIsReconnecting(false);
        setError(msg);
      },
    });

    serviceRef.current = service;
    service.connect(meetingId, user.id, role === 'guest' ? token : undefined);

    // 재입장 시 이전 대화 내용 복원 — WS는 이 연결 이후의 발화만 보내주므로
    // 지금까지 쌓인 transcript를 REST로 가져와 맨 앞에 이어붙임
    meetingsApi.getById(meetingId).then(({ data }) => {
      if (cancelled) return;
      console.log('[OnlineHistory] GET /meetings/{id} 응답 — status:', data.status, '/ transcripts:', data.transcripts?.length ?? 0, '개');
      console.log('[OnlineHistory] transcripts 원본:', data.transcripts);
      const history = (data.transcripts ?? []).map(toOnlineTranscript);
      if (history.length > 0) {
        setTranscripts((prev) => [...history, ...prev]);
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
      service.disconnect();
      serviceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, user?.id]);

  const startMeeting = useCallback(() => {
    serviceRef.current?.startMeeting();
    // 회의 시작 브로드캐스트가 오면 onMeetingStarted에서 자동 녹음 시작
  }, []);

  const endMeeting = useCallback(() => {
    serviceRef.current?.stopRecording();
    serviceRef.current?.endMeeting();
    setIsRecording(false);
  }, []);

  return {
    participants,
    transcripts,
    roomStatus,
    error,
    isRecording,
    isReconnecting,
    reconnectAttempt,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    isNetworkOffline,
    startMeeting,
    endMeeting,
  };
}
