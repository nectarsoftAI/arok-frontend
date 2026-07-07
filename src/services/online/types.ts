// Server → Client

export interface OnlineTranscriptMessage {
  profileId: string;
  speakerDisplay: string;
  text: string;
  startSec: number;
  endSec: number;
}
