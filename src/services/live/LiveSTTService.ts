import type { ServerMessage, SegmentMessage, EndMessage } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const WS_BASE = (import.meta.env.VITE_WS_BASE_URL as string) || API_BASE.replace(/^http/, 'ws');

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
  private intentionalStop = false;

  constructor(callbacks: Callbacks) {
    this.callbacks = callbacks;
  }

  // 1단계: REST로 세션 생성, 2단계: WS 연결
  async createSessionAndConnect(title: string): Promise<void> {
    const resp = await fetch(`${API_BASE}/api/v1/live/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!resp.ok) throw new Error('라이브 세션 생성에 실패했습니다.');

    const { meetingId } = await resp.json() as { meetingId: string };
    this.meetingId = meetingId;
    this.callbacks.onSessionCreated(meetingId);

    await this.connectWs(meetingId);
  }

  private connectWs(meetingId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WS_BASE}/api/v1/live/ws/${meetingId}`);

      ws.onopen = () => {
        console.log('[WS] 연결됨 — meetingId:', meetingId);
        resolve();
      };

      ws.onerror = (e) => {
        console.error('[WS] 에러:', e);
        reject(new Error('WebSocket 연결에 실패했습니다.'));
      };

      ws.onmessage = (event) => {
        console.log('[WS] 수신:', event.data);
        this.handleMessage(event);
      };

      ws.onclose = (e) => {
        console.log('[WS] 닫힘:', e.code, e.reason);
        ws.onmessage = null; // 버퍼에 남은 메시지 처리 차단
        if (!this.intentionalStop) {
          this.stopMedia();
          this.callbacks.onError('서버 연결이 끊어졌습니다.');
        }
      };

      this.ws = ws;
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const msg: ServerMessage = JSON.parse(event.data as string);
      switch (msg.type) {
        case 'session_ready':
          // 세션은 이미 REST로 생성됨 — 여기선 WS 준비 확인용
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
      // malformed message 무시
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
      console.log('[녹음] 청크:', event.data.size, 'bytes');
      if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(event.data);
      }
    };

    this.mediaRecorder.start(CHUNK_INTERVAL_MS);
  }

  stop(): void {
    this.intentionalStop = true;
    this.stopMedia();

    if (this.ws?.readyState === WebSocket.OPEN) {
      const endMsg: EndMessage = { type: 'end' };
      this.ws.send(JSON.stringify(endMsg));
      // ws.close()는 호출하지 않음 — 서버가 session_ended 후 closeAll() 호출
    }
  }

  // 컴포넌트 언마운트(페이지 이동) 시 강제 정리 — 콜백 차단 후 WS 즉시 닫음
  destroy(): void {
    this.intentionalStop = true;
    this.stopMedia();

    if (this.ws) {
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (this.ws.readyState === WebSocket.OPEN) {
        try { this.ws.send(JSON.stringify({ type: 'end' } as EndMessage)); } catch {}
        this.ws.close();
      }
      this.ws = null;
    }
  }

  private stopMedia(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.ondataavailable = null; // 큐에 남은 이벤트 차단
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  getMeetingId(): string | null {
    return this.meetingId;
  }
}
