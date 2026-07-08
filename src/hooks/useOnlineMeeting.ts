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
    isFinal: true, // REST로 가져오는 과거 기록은 항상 확정된 발화
  };
}

// isFinal이 정상 동작하지 않는 경우의 최후 방어선 — 이 시간 동안 같은 화자의 partial 갱신이
// 없으면 프론트에서 자체적으로 확정 처리 (서버가 정상적으로 isFinal:true를 보내면 발동 안 함)
const PARTIAL_FINALIZE_TIMEOUT_MS = 4000;

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
  isCongested: boolean;
  startedAt: string | null;
  startMeeting: () => void;
  endMeeting: () => void;
}

export function useOnlineMeeting(
  meetingId: string | undefined,
  role: 'host' | 'guest',
  getMicTrack: () => Promise<MediaStreamTrack>,
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
  const [isCongested, setIsCongested] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const serviceRef = useRef<OnlineMeetingService | null>(null);
  const user = useAuthStore((state) => state.user);

  // transcripts state와 별개로 유지하는 소스 오브 트루스 — WS 메시지가 React 렌더 사이클과
  // 무관하게 연달아 들어와도 "지금 열려있는 partial 라인이 몇 번째 원소인지"를 정확히 추적하기 위함.
  // (setTranscripts 콜백 안에서 직접 추적하면 REST 히스토리가 앞에 prepend될 때 인덱스가 밀리는 문제가 생김)
  const transcriptsRef = useRef<OnlineTranscriptMessage[]>([]);
  const openPartialRef = useRef<Map<string, OnlineTranscriptMessage>>(new Map()); // profileId -> 아직 안 끝난 발화 메시지
  const finalizeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

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

    // ref는 이 effect 동안 재할당되지 않는 동일 Map 인스턴스이므로 로컬 변수로 캡처해서 사용
    // (cleanup에서 ref.current를 직접 참조하면 "effect 실행 시점과 달라질 수 있다"는 린트 경고 발생)
    const openPartials = openPartialRef.current;
    const finalizeTimers = finalizeTimersRef.current;

    const tryStartRecording = (service: OnlineMeetingService) => {
      getMicTrack()
        .then((track) => service.startRecording(track))
        .then(() => setIsRecording(true))
        .catch((err: unknown) => {
          const unsupported = err instanceof Error && err.message === 'AUDIO_WORKLET_UNSUPPORTED';
          setError(unsupported
            ? '이 브라우저는 실시간 회의 기능을 지원하지 않습니다. 최신 브라우저로 접속해주세요.'
            : '마이크 접근 권한이 필요합니다.');
        });
    };

    const dedup = (list: OnlineParticipant[]): OnlineParticipant[] => {
      const seen = new Set<string>();
      return list.filter((p) => {
        if (seen.has(p.profileId)) return false;
        seen.add(p.profileId);
        return true;
      });
    };

    const commitTranscripts = () => setTranscripts([...transcriptsRef.current]);

    const clearFinalizeTimer = (profileId: string) => {
      const timer = finalizeTimers.get(profileId);
      if (timer) {
        clearTimeout(timer);
        finalizeTimers.delete(profileId);
      }
    };

    // isFinal이 안 와도 이 profileId의 라인을 확정 취급하고 열린 상태에서 제외 —
    // 다음 partial부터는 새 라인으로 시작함
    const finalizeOpenPartial = (profileId: string) => {
      const openMsg = openPartials.get(profileId);
      if (openMsg) {
        const idx = transcriptsRef.current.indexOf(openMsg);
        if (idx !== -1) {
          transcriptsRef.current[idx] = { ...openMsg, isFinal: true };
          commitTranscripts();
        }
      }
      openPartials.delete(profileId);
      clearFinalizeTimer(profileId);
    };

    const scheduleFinalizeTimeout = (profileId: string) => {
      clearFinalizeTimer(profileId);
      finalizeTimers.set(
        profileId,
        setTimeout(() => finalizeOpenPartial(profileId), PARTIAL_FINALIZE_TIMEOUT_MS),
      );
    };

    // 같은 profileId의 열린(미확정) 라인이 있으면 그 자리를 replace, 없으면 새 라인 추가.
    // indexOf로 현재 위치를 찾기 때문에 REST 히스토리가 나중에 앞에 prepend돼도 안전함
    const applyTranscript = (msg: OnlineTranscriptMessage) => {
      const openMsg = openPartials.get(msg.profileId);
      const idx = openMsg ? transcriptsRef.current.indexOf(openMsg) : -1;
      if (idx !== -1) {
        transcriptsRef.current[idx] = msg;
      } else {
        transcriptsRef.current.push(msg);
      }
      commitTranscripts();

      if (msg.isFinal) {
        openPartials.delete(msg.profileId);
        clearFinalizeTimer(msg.profileId);
      } else {
        openPartials.set(msg.profileId, msg);
        scheduleFinalizeTimeout(msg.profileId);
      }
    };

    const service = new OnlineMeetingService({
      onRoomInfo: (status, pids, roomStartedAt) => {
        const s = status as OnlineRoomStatus;
        setIsReconnecting(false);
        setRoomStatus(s);
        setParticipants(dedup(pids.map((pid) => ({ profileId: pid, role: 'GUEST' }))));
        setStartedAt(roomStartedAt);
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
      onMeetingStarted: (meetingStartedAt) => {
        setRoomStatus('LIVE');
        setStartedAt(meetingStartedAt);
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
      onTranscript: (msg) => applyTranscript(msg),
      onReconnecting: (attempt) => {
        setIsReconnecting(true);
        setReconnectAttempt(attempt);
      },
      onNetworkCongestion: (congested) => setIsCongested(congested),
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
        transcriptsRef.current = [...history, ...transcriptsRef.current];
        commitTranscripts();
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
      service.disconnect();
      serviceRef.current = null;
      finalizeTimers.forEach((timer) => clearTimeout(timer));
      finalizeTimers.clear();
      openPartials.clear();
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
    isCongested,
    startedAt,
    startMeeting,
    endMeeting,
  };
}
