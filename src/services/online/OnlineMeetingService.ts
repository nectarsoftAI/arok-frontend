const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const WS_BASE = (import.meta.env.VITE_WS_BASE_URL as string) || API_BASE.replace(/^http/, 'ws');

const CHUNK_INTERVAL_MS = 5000;
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'] as const;

export interface OnlineTranscriptMessage {
  profileId: string;
  speakerDisplay: string;
  text: string;
  startSec: number;
  endSec: number;
}

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

    const ws = new WebSocket(`${WS_BASE}/api/v1/online/ws/${meetingId}?${params}`);
    ws.onopen = () => console.log('[OnlineWS] 연결됨 — meetingId:', meetingId);
    ws.onmessage = (e) => this.handleMessage(e);
    ws.onerror = () => this.callbacks.onError('WebSocket 연결에 실패했습니다.');
    ws.onclose = (e) => {
      if (!this.intentionalClose) {
        this.callbacks.onError('서버 연결이 끊어졌습니다.');
        console.warn('[OnlineWS] 비정상 종료:', e.code, e.reason);
      }
    };
    this.ws = ws;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const msg = JSON.parse(event.data as string) as Record<string, unknown>;
      switch (msg.type) {
        case 'room_info':
          this.callbacks.onRoomInfo(
            msg.status as string,
            (msg.participants as string[]) ?? [],
          );
          break;
        case 'participant_joined':
          this.callbacks.onParticipantJoined(msg.profileId as string, msg.role as string);
          break;
        case 'participant_left':
          this.callbacks.onParticipantLeft(msg.profileId as string);
          break;
        case 'meeting_started':
          this.callbacks.onMeetingStarted();
          break;
        case 'meeting_ended':
          this.intentionalClose = true;
          this.stopRecording(); // 마이크 트랙 즉시 해제 → Chrome 녹음 표시 제거
          this.callbacks.onMeetingEnded();
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.close(); // WS 명시적 종료 (서버 종료 대기 불필요)
          }
          break;
        case 'kicked':
          this.callbacks.onKicked();
          break;
        case 'transcript':
          this.callbacks.onTranscript({
            profileId: msg.profileId as string,
            speakerDisplay: msg.speakerDisplay as string,
            text: msg.text as string,
            startSec: msg.startSec as number,
            endSec: msg.endSec as number,
          });
          break;
        case 'error':
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
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(e.data);
      }
    };
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
