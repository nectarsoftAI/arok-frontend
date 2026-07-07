import { useState, useRef, useCallback, useEffect } from 'react';
import { OnlineMeetingService, MAX_RECONNECT_ATTEMPTS } from '../services/online/OnlineMeetingService';
import type { OnlineTranscriptMessage } from '../services/online/types';
import { useAuthStore } from '../store/authStore';
import { meetingsApi } from '../api/meetings';

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
  const serviceRef = useRef<OnlineMeetingService | null>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!meetingId || !user?.id) return;

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

    return () => {
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
    startMeeting,
    endMeeting,
  };
}
