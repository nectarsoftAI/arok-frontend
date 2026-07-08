import { Room, RoomEvent, Track, type RemoteTrack, type RemoteParticipant, type Participant } from 'livekit-client';
import { livekitApi } from '../../api/livekit';
import type { LiveKitTokenResponse } from '../../api/types';

interface VoiceCallCallbacks {
  onConnected: () => void;
  onDisconnected: () => void;
  onParticipantConnected: (profileId: string) => void;
  onParticipantDisconnected: (profileId: string) => void;
  onActiveSpeakersChanged: (profileIds: string[]) => void;
  onReconnecting: () => void;
  onReconnected: () => void;
  onError: (message: string) => void;
}

export class VoiceCallService {
  private room: Room | null = null;
  private readonly callbacks: VoiceCallCallbacks;

  constructor(callbacks: VoiceCallCallbacks) {
    this.callbacks = callbacks;
  }

  // micTrack은 useMicStream이 소유한 공유 트랙을 그대로 publish — 음소거 시
  // STT PCM 캡처도 같이 무음 처리되는 게 의도된 동작 (회의록 완전성 우선)
  async connect(meetingId: string, profileId: string, micTrack: MediaStreamTrack, token?: string): Promise<void> {
    let data: LiveKitTokenResponse;
    try {
      const res = await livekitApi.getToken(meetingId, profileId, token);
      data = res.data;
    } catch {
      this.callbacks.onError('음성 통화 연결에 실패했습니다.');
      return;
    }

    const room = new Room();
    room
      .on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => this.callbacks.onParticipantConnected(p.identity))
      .on(RoomEvent.ParticipantDisconnected, (p: RemoteParticipant) => this.callbacks.onParticipantDisconnected(p.identity))
      .on(RoomEvent.TrackSubscribed, (t: RemoteTrack) => this.attachRemoteTrack(t))
      .on(RoomEvent.TrackUnsubscribed, (t: RemoteTrack) => this.detachRemoteTrack(t))
      .on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) =>
        this.callbacks.onActiveSpeakersChanged(speakers.map((s) => s.identity)),
      )
      .on(RoomEvent.Disconnected, () => this.callbacks.onDisconnected())
      .on(RoomEvent.Reconnecting, () => this.callbacks.onReconnecting())
      .on(RoomEvent.Reconnected, () => this.callbacks.onReconnected());

    try {
      await room.connect(data.url, data.token);
      await room.localParticipant.publishTrack(micTrack, { source: Track.Source.Microphone });
    } catch {
      room.disconnect();
      this.callbacks.onError('음성 통화 연결에 실패했습니다.');
      return;
    }

    this.room = room;
    this.callbacks.onConnected();
  }

  setMuted(muted: boolean): void {
    const track = this.room?.localParticipant.getTrackPublication(Track.Source.Microphone)?.track;
    if (!track) return;
    if (muted) track.mute();
    else track.unmute();
  }

  disconnect(): void {
    this.room?.disconnect();
    this.room = null;
  }

  private attachRemoteTrack(track: RemoteTrack): void {
    if (track.kind !== Track.Kind.Audio) return;
    const el = track.attach();
    el.dataset.livekitTrackSid = track.sid;
    document.body.appendChild(el);
  }

  private detachRemoteTrack(track: RemoteTrack): void {
    track.detach().forEach((el) => el.remove());
  }
}
