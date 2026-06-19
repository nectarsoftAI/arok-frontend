export interface TranscriptSegment {
  speakerLabel: string;
  speakerDisplay: string;
  startSec: number;
  endSec: number;
  content: string;
  confidence: number;
  lowConfidence: boolean;
}

export interface TranscribeResponse {
  meetingId: string;
  engineUsed: string;
  segmentCount: number;
  transcripts: TranscriptSegment[];
}

export interface MeetingResult {
  meetingId: string;
  title: string;
  meetingType: string;
  status: string;
  durationSeconds: number;
  meetingDate: string;
  createdAt: string;
  transcripts: TranscriptSegment[];
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
}
