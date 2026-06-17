import type { ServerMessage, SegmentMessage, EndMessage } from './types';

const WS_URL = 'wss://backend-production-894a3.up.railway.app/api/v1/live/ws';
const CHUNK_INTERVAL_MS = 5000;
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'] as const;

interface Callbacks {
  onSessionCreated: (meetingId: string) => void;
  onSegment: (msg: SegmentMessage) => void;
  onEnded: (meetingId: string) => void;
  onError: (message: string) => void;
}

export class LiveSTTService {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private meetingId: string | null = null;
  private readonly callbacks: Callbacks;

  constructor(callbacks: Callbacks) {
    this.callbacks = callbacks;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('WebSocket 연결됨');
        resolve();
      };

      ws.onerror = (e) => {
        console.error('WebSocket 에러:', e);
        reject(new Error('WebSocket 연결에 실패했습니다.'));
      };

      ws.onmessage = (event) => {
        console.log('서버 메시지 raw:', event.data);
        this.handleMessage(event);
      };

      ws.onclose = (e) => {
        console.log('WebSocket 닫힘:', e.code, e.reason);
      };

      this.ws = ws;
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const msg: ServerMessage = JSON.parse(event.data as string);
      switch (msg.type) {
        case 'session_created':
          this.meetingId = msg.meeting_id;
          this.callbacks.onSessionCreated(msg.meeting_id);
          break;
        case 'segment':
          this.callbacks.onSegment(msg);
          break;
        case 'session_ended':
          this.callbacks.onEnded(this.meetingId ?? '');
          break;
        case 'error':
          this.callbacks.onError(msg.message);
          break;
      }
    } catch {
      // ignore malformed messages
    }
  }

  async startRecording(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeType = MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t));
    this.mediaRecorder = new MediaRecorder(
      this.stream,
      mimeType ? { mimeType } : undefined,
    );

    this.mediaRecorder.ondataavailable = (event) => {
      console.log('청크 발생:', event.data.size, 'bytes', new Date().toISOString());
      if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(event.data);
        console.log('청크 전송 완료');
      }
    };

    this.mediaRecorder.start(CHUNK_INTERVAL_MS);
  }

  stop(): void {
    this.mediaRecorder?.stop();
    this.stream?.getTracks().forEach((t) => t.stop());

    if (this.ws?.readyState === WebSocket.OPEN) {
      const endMsg: EndMessage = { type: 'end' };
      this.ws.send(JSON.stringify(endMsg));
    }

    this.mediaRecorder = null;
    this.stream = null;
  }

  getMeetingId(): string | null {
    return this.meetingId;
  }
}
