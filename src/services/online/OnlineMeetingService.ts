import type { OnlineTranscriptMessage } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const WS_BASE = (import.meta.env.VITE_WS_BASE_URL as string) || API_BASE.replace(/^http/, 'ws');

const CHUNK_INTERVAL_MS = 5000;
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'] as const;
const RECONNECT_DELAY_MS = 1000;
export const MAX_RECONNECT_ATTEMPTS = 5;

interface ConnectParams {
  meetingId: string;
  profileId: string;
  token?: string;
}

interface Callbacks {
  onRoomInfo: (status: string, participants: string[]) => void;
  onParticipantJoined: (profileId: string, role: string) => void;
  onParticipantLeft: (profileId: string) => void;
  onMeetingStarted: () => void;
  onMeetingEnded: () => void;
  onKicked: () => void;
  onTranscript: (msg: OnlineTranscriptMessage) => void;
  onReconnecting: (attempt: number, maxAttempts: number) => void;
  onError: (message: string) => void;
}

export class OnlineMeetingService {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private readonly callbacks: Callbacks;
  private intentionalClose = false;
  private connectParams: ConnectParams | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(callbacks: Callbacks) {
    this.callbacks = callbacks;
  }

  connect(meetingId: string, profileId: string, token?: string): void {
    this.connectParams = { meetingId, profileId, token };
    this.intentionalClose = false;
    this.reconnectAttempt = 0;
    this.openWs();
  }

  private openWs(): void {
    const { meetingId, profileId, token } = this.connectParams!;
    const params = new URLSearchParams({ profileId });
    if (token) params.set('token', token);

    const url = `${WS_BASE}/api/v1/online/ws/${meetingId}?${params}`;
    console.log('[OnlineWS] 연결 시도:', url);
    const ws = new WebSocket(url);
    ws.onopen = () => {
      console.log('[OnlineWS] ✅ 연결됨 — meetingId:', meetingId, '/ profileId:', profileId);
      this.reconnectAttempt = 0;
    };
    ws.onmessage = (e) => this.handleMessage(e);
    ws.onerror = (e) => {
      // 재시도 여부는 onclose에서 일괄 처리 — 여기서 콜백 호출 시 재연결 전에 에러 UI가 먼저 뜸
      console.error('[OnlineWS] ❌ 연결 오류:', e);
    };
    ws.onclose = (e) => {
      if (this.intentionalClose) {
        console.log('[OnlineWS] 🔌 정상 종료 — code:', e.code);
        return;
      }
      console.warn('[OnlineWS] ⚠️ 비정상 종료 — code:', e.code, '/ reason:', e.reason);
      this.stopRecording();
      this.scheduleReconnect();
    };
    this.ws = ws;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
      this.callbacks.onError('서버 연결이 끊어졌습니다.');
      return;
    }
    this.reconnectAttempt++;
    console.log(`[OnlineWS] 🔁 재연결 시도 ${this.reconnectAttempt}/${MAX_RECONNECT_ATTEMPTS} — ${RECONNECT_DELAY_MS}ms 후`);
    this.callbacks.onReconnecting(this.reconnectAttempt, MAX_RECONNECT_ATTEMPTS);
    this.reconnectTimer = setTimeout(() => this.openWs(), RECONNECT_DELAY_MS);
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
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
          }
          this.stopRecording();
          this.callbacks.onMeetingEnded();
          this.closeSocket();
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
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopRecording();
    this.closeSocket();
  }

  // CONNECTING 상태의 소켓도 핸들러를 먼저 떼고 무조건 닫음 —
  // StrictMode 이중 mount나 재연결 타이머가 언마운트와 겹칠 때 소켓이
  // 안 닫힌 채 남아 room_info를 또 받고 녹음을 중복 시작하는 걸 방지
  private closeSocket(): void {
    if (!this.ws) return;
    const ws = this.ws;
    this.ws = null;
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
    if (ws.readyState !== WebSocket.CLOSED) {
      ws.close();
    }
  }

  private sendText(msg: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}
