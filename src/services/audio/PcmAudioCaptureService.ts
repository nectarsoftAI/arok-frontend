export const PCM_SAMPLE_RATE = 16000;
export const PCM_CHUNK_DURATION_MS = 250;

interface PcmAudioCaptureCallbacks {
  onPcmChunk: (chunk: ArrayBuffer) => void; // Int16 PCM, 16kHz, mono, little-endian
  onError: (message: string) => void;
}

export class PcmAudioCaptureService {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private readonly callbacks: PcmAudioCaptureCallbacks;

  constructor(callbacks: PcmAudioCaptureCallbacks) {
    this.callbacks = callbacks;
  }

  // track은 외부(useMicStream)가 소유 — 여기선 AudioContext/워클릿 연결만 관리하고
  // stop()에서 track.stop()은 절대 호출하지 않음 (LiveKit이 같은 트랙을 계속 publish 중일 수 있음)
  async start(track: MediaStreamTrack): Promise<void> {
    // 중복 호출 시 기존 캡처를 먼저 정리 — OnlineMeetingService의 기존 startRecording()과 동일한 방어
    this.stop();

    if (typeof AudioWorkletNode === 'undefined') {
      throw new Error('AUDIO_WORKLET_UNSUPPORTED');
    }

    this.audioContext = new AudioContext({ sampleRate: PCM_SAMPLE_RATE });
    if (this.audioContext.sampleRate !== PCM_SAMPLE_RATE) {
      console.warn(
        `[PcmCapture] 브라우저가 ${PCM_SAMPLE_RATE}Hz 요청을 무시함 — 실제: ${this.audioContext.sampleRate}Hz, worklet에서 리샘플링 처리`,
      );
    }

    const workletUrl = new URL('./pcmCaptureProcessor.js', import.meta.url);
    await this.audioContext.audioWorklet.addModule(workletUrl);

    this.sourceNode = this.audioContext.createMediaStreamSource(new MediaStream([track]));
    this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-capture-processor', {
      processorOptions: { targetSampleRate: PCM_SAMPLE_RATE, frameDurationMs: PCM_CHUNK_DURATION_MS },
    });

    this.workletNode.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
      this.callbacks.onPcmChunk(e.data);
    };
    this.workletNode.onprocessorerror = () => {
      this.callbacks.onError('오디오 처리 중 오류가 발생했습니다.');
    };

    // destination에는 연결하지 않음 — PCM 추출만 목적, 로컬 스피커로 에코 재생 방지
    this.sourceNode.connect(this.workletNode);
  }

  stop(): void {
    if (this.workletNode) {
      this.workletNode.port.onmessage = null;
      this.workletNode.onprocessorerror = null;
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    this.sourceNode?.disconnect();
    this.sourceNode = null;
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}
