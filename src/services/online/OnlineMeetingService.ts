import type { OnlineTranscriptMessage } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const WS_BASE = (import.meta.env.VITE_WS_BASE_URL as string) || API_BASE.replace(/^http/, 'ws');

const CHUNK_INTERVAL_MS = 5000;
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'] as const;

interface Callbacks {
  onRoomInfo: (status: string, participants: string[]) => void;
  onParticipantJoined: (profileId: string, role: string) => void;
  onParticipantLeft: (profileId: string) => void;
  onMeetingStarted: () => void;
  onMeetingEnded: () => void;
  onKicked: () => void;
  onTranscript: (msg: OnlineTranscriptMessage) => void;
  onError: (message: string) => void;
}

export class OnlineMeetingService {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private readonly callbacks: Callbacks;
  private intentionalClose = false;

  constructor(callbacks: Callbacks) {
    this.callbacks = callbacks;
  }

  connect(meetingId: string, profileId: string, token?: string): void {
    const params = new URLSearchParams({ profileId });
    if (token) params.set('token', token);

    const url = `${WS_BASE}/api/v1/online/ws/${meetingId}?${params}`;
    console.log('[OnlineWS] 연결 시도:', url);
    const ws = new WebSocket(url);
    ws.onopen = () => console.log('[OnlineWS] ✅ 연결됨 — meetingId:', meetingId, '/ profileId:', profileId);
    ws.onmessage = (e) => this.handleMessage(e);
    ws.onerror = (e) => {
      console.error('[OnlineWS] ❌ 연결 오류:', e);
      this.callbacks.onError('WebSocket 연결에 실패했습니다.');
    };
    ws.onclose = (e) => {
      if (!this.intentionalClose) {
        this.callbacks.onError('서버 연결이 끊어졌습니다.');
        console.warn('[OnlineWS] ⚠️ 비정상 종료 — code:', e.code, '/ reason:', e.reason);
      } else {
        console.log('[OnlineWS] 🔌 정상 종료 — code:', e.code);
      }
    };
    this.ws = ws;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const msg = JSON.parse(event.data as string) as Record<string, unknown>;
      console.log('[OnlineWS] ▼ 수신:', msg.type, msg);
      switch (msg.type) {
        case 'room_info':
          console.log('[OnlineWS] room_info — status:', msg.status, '/ participants:', msg.participants);
          this.callbacks.onRoomInfo(
            msg.status as string,
            (msg.participants as string[]) ?? [],
          );
          break;
        case 'participant_joined':
          console.log('[OnlineWS] participant_joined —', msg.profileId, '/', msg.role);
          this.callbacks.onParticipantJoined(msg.profileId as string, msg.role as string);
          break;
        case 'participant_left':
          console.log('[OnlineWS] participant_left —', msg.profileId);
          this.callbacks.onParticipantLeft(msg.profileId as string);
          break;
        case 'meeting_started':
          console.log('[OnlineWS] meeting_started → 녹음 시작');
          this.callbacks.onMeetingStarted();
          break;
        case 'meeting_ended':
          console.log('[OnlineWS] meeting_ended → 녹음 종료 + WS close');
          this.intentionalClose = true;
          this.stopRecording();
          this.callbacks.onMeetingEnded();
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.close();
          }
          break;
        case 'kicked':
          console.warn('[OnlineWS] kicked');
          this.callbacks.onKicked();
          break;
        case 'transcript': {
          const t = {
            profileId: msg.profileId as string,
            speakerDisplay: msg.speakerDisplay as string,
            text: msg.text as string,
            startSec: msg.startSec as number,
            endSec: msg.endSec as number,
          };
          console.log(`[OnlineWS] transcript ▼ [${t.speakerDisplay}] "${t.text?.substring(0, 40)}" (${t.startSec}s~${t.endSec}s)`);
          this.callbacks.onTranscript(t);
          break;
        }
        case 'error':
          console.error('[OnlineWS] error:', msg.message);
          this.callbacks.onError(msg.message as string);
          break;
      }
    } catch {
      // malformed message 무시
    }
  }

  async startRecording(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t));
    this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    let chunkIndex = 0;
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
        chunkIndex++;
        console.log(`[OnlineWS] ▲ 청크 전송 #${chunkIndex} — ${e.data.size} bytes @ ${new Date().toLocaleTimeString('ko-KR')}`);
        this.ws.send(e.data);
      } else if (e.data.size === 0) {
        console.log('[OnlineWS] 청크 스킵 — size 0');
      } else {
        console.warn('[OnlineWS] WS not OPEN, 청크 드롭 — readyState:', this.ws?.readyState);
      }
    };
    console.log(`[OnlineWS] 🎙️ 녹음 시작 — mimeType: ${this.mediaRecorder.mimeType}, 청크 주기: ${CHUNK_INTERVAL_MS}ms`);
    this.mediaRecorder.start(CHUNK_INTERVAL_MS);
  }

  stopRecording(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.ondataavailable = null;
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  startMeeting(): void {
    this.sendText({ type: 'start_meeting' });
  }

  endMeeting(): void {
    this.sendText({ type: 'end_meeting' });
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.stopRecording();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.ws = null;
  }

  private sendText(msg: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}
