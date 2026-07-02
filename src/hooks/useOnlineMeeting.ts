import { useState, useRef, useCallback, useEffect } from 'react';
import { OnlineMeetingService, type OnlineTranscriptMessage } from '../services/online/OnlineMeetingService';
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

    const service = new OnlineMeetingService({
      onRoomInfo: (status, pids) => {
        const s = status as OnlineRoomStatus;
        setRoomStatus(s);
        setParticipants(pids.map((pid) => ({ profileId: pid, role: 'GUEST' })));
        if (s === 'LIVE') tryStartRecording(service);

        // REST API로 실제 role(ADMIN/GUEST) 조회하여 방장 뱃지 반영
        meetingsApi.getParticipants(meetingId).then(({ data }) => {
          setParticipants(data.map((p) => ({ profileId: p.profileId, role: p.role })));
        }).catch(() => {}); // 실패 시 초기값(GUEST) 유지
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
      onError: (msg) => setError(msg),
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

  return { participants, transcripts, roomStatus, error, isRecording, startMeeting, endMeeting };
}
