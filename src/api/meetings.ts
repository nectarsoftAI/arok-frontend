import apiClient from './apiClient';
import supabaseClient from './supabaseClient';
import {
  type MeetingListItem,
  type MeetingListResponse,
  type MeetingResult,
  type SummaryDto,
  type TranscriptUpdate,
} from './types';

export type { MeetingListItem };
export type MeetingDetail = MeetingResult;

export interface MeetingParticipantInfo {
  participantId: number;
  profileId: string;
  role: 'ADMIN' | 'GUEST';
  canInvite: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRunMeeting: boolean;
  joinedAt: string;
}

export const meetingsApi = {
  // 회의 목록 — Supabase meeting_list_view 직접 조회
  getAll: async (page = 0, size = 6): Promise<{ data: MeetingListResponse }> => {
    const res = await supabaseClient.get('/meeting_list_view', {
      headers: { Prefer: 'count=exact' },
      params: {
        order: 'created_at.desc',
        limit: size,
        offset: page * size,
      },
    });

    const totalCount = parseInt(
      (res.headers['content-range'] as string)?.split('/')[1] ?? '0'
    );

    const meetings: MeetingListItem[] = res.data.map((row: any) => ({
      meetingId: row.meeting_id,
      title: row.title,
      meetingType: row.meeting_type,
      status: row.status,
      durationSeconds: row.duration_seconds,
      meetingDate: row.meeting_date,
      createdAt: row.created_at,
      participants: (row.participants ?? []).map((p: any) => ({
        speakerLabel: p.speakerLabel,
        speakerDisplay: p.speakerDisplay,
      })),
      keywords: typeof row.keywords === 'string'
        ? JSON.parse(row.keywords)
        : (row.keywords ?? []),
    }));

    return {
      data: { meetings, totalCount, page, size, totalPages: Math.ceil(totalCount / size) },
    };
  },

  // 회의 상세 — 백엔드 (트랜스크립트 + 요약 조인)
  getById: (meetingId: string) =>
    apiClient.get<MeetingDetail>(`/api/v1/meetings/${meetingId}`),

  getParticipants: (meetingId: string) =>
    apiClient.get<MeetingParticipantInfo[]>(`/api/v1/meetings/${meetingId}/participants`),

  summarize: (meetingId: string, signal?: AbortSignal) =>
    apiClient.post<SummaryDto>(`/api/v1/meetings/${meetingId}/summarize`, null, { signal }),

  updateTranscripts: (meetingId: string, updates: TranscriptUpdate[]) =>
    apiClient.put(`/api/v1/meetings/${meetingId}/transcripts`, updates),

  delete: (meetingId: string) =>
    apiClient.delete(`/api/v1/meetings/${meetingId}`),
};
