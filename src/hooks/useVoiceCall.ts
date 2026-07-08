import { useCallback, useEffect, useRef, useState } from 'react';
import { VoiceCallService } from '../services/webrtc/VoiceCallService';
import type { OnlineRoomStatus } from './useOnlineMeeting';

export interface UseVoiceCallReturn {
  isConnected: boolean;
  isMuted: boolean;
  activeSpeakerIds: string[];
  remoteParticipants: string[];
  error: string | null;
  toggleMute: () => void;
}

export function useVoiceCall(
  meetingId: string | undefined,
  role: 'host' | 'guest',
  profileId: string | undefined,
  roomStatus: OnlineRoomStatus,
  getMicTrack: () => Promise<MediaStreamTrack>,
  token?: string,
): UseVoiceCallReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSpeakerIds, setActiveSpeakerIds] = useState<string[]>([]);
  const [remoteParticipants, setRemoteParticipants] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<VoiceCallService | null>(null);
  const connectedRef = useRef(false); // roomStatus가 LIVE로 여러 번 재평가돼도 connect는 한 번만

  useEffect(() => {
    if (!meetingId || !profileId) return;
    if (roomStatus !== 'LIVE') return;
    if (connectedRef.current) return;
    connectedRef.current = true;

    const service = new VoiceCallService({
      onConnected: () => setIsConnected(true),
      onDisconnected: () => setIsConnected(false),
      onParticipantConnected: (pid) => {
        setRemoteParticipants((prev) => (prev.includes(pid) ? prev : [...prev, pid]));
      },
      onParticipantDisconnected: (pid) => {
        setRemoteParticipants((prev) => prev.filter((p) => p !== pid));
      },
      onActiveSpeakersChanged: (pids) => setActiveSpeakerIds(pids),
      onReconnecting: () => {},
      onReconnected: () => {},
      onError: (message) => setError(message),
    });
    serviceRef.current = service;

    getMicTrack()
      .then((track) => service.connect(meetingId, profileId, track, role === 'guest' ? token : undefined))
      .catch(() => setError('마이크 접근 권한이 필요합니다.'));

    return () => {
      service.disconnect();
      serviceRef.current = null;
      connectedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, profileId, roomStatus]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      serviceRef.current?.setMuted(next);
      return next;
    });
  }, []);

  return { isConnected, isMuted, activeSpeakerIds, remoteParticipants, error, toggleMute };
}
