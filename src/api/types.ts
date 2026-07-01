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

export interface SupabaseMeetingRow {
  meeting_id: string;
  user_id: string;
  title: string;
  meeting_type: string;
  status: string;
  duration_seconds: number | null;
  meeting_date: string;
  meeting_token: string | null;
  created_at: string;
  updated_at: string;
  transcripts?: Array<{ speaker_label: string; speaker_display: string }>;
  meeting_summaries?: Array<{ keywords: string | null }>;
}

export function mapSupabaseRow(row: SupabaseMeetingRow): MeetingListItem {
  const seen = new Set<string>();
  const participants: ParticipantDto[] = (row.transcripts ?? [])
    .filter(t => { if (seen.has(t.speaker_label)) return false; seen.add(t.speaker_label); return true; })
    .map(t => ({ speakerLabel: t.speaker_label, speakerDisplay: t.speaker_display }));

  let keywords: string[] = [];
  const kwRaw = row.meeting_summaries?.[0]?.keywords;
  if (kwRaw) {
    try { keywords = JSON.parse(kwRaw); } catch { keywords = []; }
  }

  return {
    meetingId: row.meeting_id,
    title: row.title,
    meetingType: row.meeting_type,
    status: row.status,
    durationSeconds: row.duration_seconds,
    meetingDate: row.meeting_date,
    createdAt: row.created_at,
    participants,
    keywords,
  };
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: { display_name?: string };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: AuthUser;
}
