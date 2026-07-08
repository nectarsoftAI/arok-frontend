import type { OnlineTranscriptMessage } from './types';
import { PcmAudioCaptureService, PCM_CHUNK_DURATION_MS } from '../audio/PcmAudioCaptureService';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const WS_BASE = (import.meta.env.VITE_WS_BASE_URL as string) || API_BASE.replace(/^http/, 'ws');

const RECONNECT_DELAY_MS = 1000;
export const MAX_RECONNECT_ATTEMPTS = 5;
const WS_BUFFERED_AMOUNT_THRESHOLD_BYTES = 1_000_000; // 이 이상 쌓이면 전송 지연으로 간주 (버리지는 않음 — 회의록 손실 방지)

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
  onNetworkCongestion: (congested: boolean) => void;
  onError: (message: string) => void;
}

export class OnlineMeetingService {
  private ws: WebSocket | null = null;
  private pcmCapture: PcmAudioCaptureService | null = null;
  private readonly callbacks: Callbacks;
  private intentionalClose = false;
  private connectParams: ConnectParams | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private meetingStartSent = false;
  private pendingEndMeeting = false;
  private isCongested = false;

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
      if (this.pendingEndMeeting) {
        console.log('[OnlineWS] 🔁 재연결 완료 — 보류 중이던 end_meeting 재전송');
        this.pendingEndMeeting = false;
        this.sendText({ type: 'end_meeting' });
      }
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
          const t: OnlineTranscriptMessage = {
            profileId: msg.profileId as string,
            speakerDisplay: msg.speakerDisplay as string,
            text: msg.text as string,
            startSec: msg.startSec as number | undefined,
            endSec: msg.endSec as number | undefined,
            isFinal: Boolean(msg.isFinal),
          };
          console.log(`[OnlineWS] transcript ▼ [${t.speakerDisplay}] isFinal=${t.isFinal} "${t.text?.substring(0, 40)}"`);
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

  // track은 useMicStream이 소유한 공유 마이크 트랙 — 여기선 PCM 추출(AudioContext/워클릿)만
  // 시작/중단하고 트랙 자체의 생명주기는 건드리지 않음 (LiveKit 음성통화가 같은 트랙을 계속 씀)
  async startRecording(track: MediaStreamTrack): Promise<void> {
    // meeting_started/room_info(LIVE)가 중복 수신되거나 WS 재연결 후 재호출될 수 있음 —
    // 기존 캡처를 먼저 정리하지 않으면 이전 워클릿이 참조를 잃은 채 계속 돌아
    // 청크를 중복 전송하게 됨
    this.stopRecording();
    this.pcmCapture = new PcmAudioCaptureService({
      onPcmChunk: (chunk) => this.sendPcmChunk(chunk),
      onError: (message) => this.callbacks.onError(message),
    });
    await this.pcmCapture.start(track);
    console.log(`[OnlineWS] 🎙️ PCM 녹음 시작 — 16kHz mono Int16, 청크 주기: ${PCM_CHUNK_DURATION_MS}ms`);
  }

  private sendPcmChunk(chunk: ArrayBuffer): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[OnlineWS] WS not OPEN, PCM 청크 드롭 — readyState:', this.ws?.readyState);
      return;
    }
    this.ws.send(chunk);

    // 오디오는 회의록 원본이라 밀린다고 버리지 않음 — 지연 상태만 감지해서 UI에 알림
    const congested = this.ws.bufferedAmount > WS_BUFFERED_AMOUNT_THRESHOLD_BYTES;
    if (congested !== this.isCongested) {
      this.isCongested = congested;
      console.warn(
        congested
          ? `[OnlineWS] ⚠️ 전송 지연 감지 — bufferedAmount: ${this.ws.bufferedAmount}`
          : '[OnlineWS] ✅ 전송 지연 해소',
      );
      this.callbacks.onNetworkCongestion(congested);
    }
  }

  stopRecording(): void {
    this.pcmCapture?.stop();
    this.pcmCapture = null;
    if (this.isCongested) {
      this.isCongested = false;
      this.callbacks.onNetworkCongestion(false);
    }
  }

  startMeeting(): void {
    // 버튼 연타 등으로 여러 번 호출돼도 start_meeting은 한 번만 전송 —
    // 서버가 meeting_started를 매번 재브로드캐스트하면 recording이 중복 시작됨.
    // 단, 소켓이 아직 CONNECTING이라 전송이 실패한 경우엔 플래그를 세우지 않아야
    // 다음 클릭(재시도)에서 정상적으로 나갈 수 있음
    if (this.meetingStartSent) return;
    if (this.sendText({ type: 'start_meeting' })) {
      this.meetingStartSent = true;
    }
  }

  endMeeting(): void {
    // 클릭 시점에 소켓이 재연결 중이라 전송이 실패하면 조용히 사라지지 않도록
    // 보류시켜뒀다가, 재연결(onopen) 성공하는 즉시 자동으로 다시 전송함
    if (!this.sendText({ type: 'end_meeting' })) {
      console.warn('[OnlineWS] end_meeting 전송 실패 — 재연결 시 자동 재전송 예정');
      this.pendingEndMeeting = true;
    }
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

  private sendText(msg: object): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }
}
