export interface TranscriptSegment {
  transcriptId?: number;
  speakerLabel: string;
  speakerDisplay: string;
  startSec: number;
  endSec: number;
  content: string;
  confidence: number;
  lowConfidence: boolean;
}

export interface TranscriptUpdate {
  transcriptId: number;
  speakerDisplay?: string;
  content?: string;
}

// 백엔드 SummaryDto — 각 필드는 Python 배열/객체를 JSON 직렬화한 문자열
export interface SummaryDto {
  keyPoints: string;       // JSON string → string[]
  decisions: string;       // JSON string → string[]
  actionItems: string;     // JSON string → ActionItem[]
  keywords: string;        // JSON string → string[]
  processingStatus: string;
  processedAt: string | null;
}

export interface ParticipantDto {
  speakerLabel: string;
  speakerDisplay: string;
}

export interface TranscribeResponse {
  meetingId: string;
  engineUsed: string;
  segmentCount: number;
  transcripts: TranscriptSegment[];
  summary: SummaryDto | null;
}

export interface MeetingListResponse {
  meetings: MeetingListItem[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}

// GET /api/v1/meetings — 목록 아이템 (participants, keywords 포함)
export interface MeetingListItem {
  meetingId: string;
  title: string;
  meetingType: string;
  status: string;
  durationSeconds: number | null;
  meetingDate: string;
  createdAt: string;
  participants: ParticipantDto[];
  keywords: string[];
}

// GET /api/v1/meetings/{id} — 상세 (transcripts, summary 포함)
export interface MeetingResult {
  meetingId: string;
  title: string;
  meetingType: string;
  status: string;
  durationSeconds: number | null;
  meetingDate: string;
  createdAt: string;
  transcripts: TranscriptSegment[];
  summary: SummaryDto | null;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
}
