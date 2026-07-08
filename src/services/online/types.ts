// Server → Client

export interface OnlineTranscriptMessage {
  profileId: string;
  speakerDisplay: string;
  text: string; // profileId별 누적 전문 — append 아닌 replace
  startSec?: number; // partial(isFinal:false)에는 없음
  endSec?: number;
  isFinal: boolean;
}
