// AudioWorkletProcessor는 AudioWorkletGlobalScope에서 실행되며 registerProcessor,
// sampleRate 같은 전역이 DOM lib과 충돌해서 TS로 작성하지 않고 순수 JS로 둠
// (PcmAudioCaptureService.ts에서 new URL(...)로 참조).
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const { targetSampleRate, frameDurationMs } = options.processorOptions;
    this.resampleRatio = targetSampleRate / sampleRate; // sampleRate = 실제 컨텍스트 샘플레이트 (전역)
    this.frameSampleCount = Math.round((frameDurationMs / 1000) * targetSampleRate);
    this.buffer = [];
  }

  process(inputs) {
    const channelData = inputs[0]?.[0];
    if (!channelData) return true;

    // AudioContext에 16kHz를 요청해도 일부 브라우저는 무시하고 하드웨어 기본값을 줄 수 있어서,
    // 그런 경우에만 선형보간으로 target sampleRate에 맞춰 리샘플링
    const samples = this.resampleRatio === 1 ? channelData : this.resample(channelData);
    for (let i = 0; i < samples.length; i++) {
      this.buffer.push(samples[i]);
    }

    while (this.buffer.length >= this.frameSampleCount) {
      const frame = this.buffer.splice(0, this.frameSampleCount);
      const pcm16 = new Int16Array(frame.length);
      for (let i = 0; i < frame.length; i++) {
        const s = Math.max(-1, Math.min(1, frame[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    }

    return true;
  }

  resample(input) {
    const outLength = Math.round(input.length * this.resampleRatio);
    const output = new Float32Array(outLength);
    for (let i = 0; i < outLength; i++) {
      const srcPos = i / this.resampleRatio;
      const idx = Math.floor(srcPos);
      const frac = srcPos - idx;
      const s0 = input[idx] ?? 0;
      const s1 = input[idx + 1] ?? s0;
      output[i] = s0 + (s1 - s0) * frac;
    }
    return output;
  }
}

registerProcessor('pcm-capture-processor', PcmCaptureProcessor);
