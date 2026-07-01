import apiClient from './apiClient';
import supabaseClient from './supabaseClient';
import {
  mapSupabaseRow,
  type MeetingListItem,
  type MeetingListResponse,
  type MeetingResult,
  type SummaryDto,
  type SupabaseMeetingRow,
  type TranscriptUpdate,
} from './types';

export type { MeetingListItem };
export type MeetingDetail = MeetingResult;

function parseTotalCount(header: string | undefined): number {
  if (!header) return 0;
  return parseInt(header.split('/')[1], 10) || 0;
}

export const meetingsApi = {
  // 회의 목록 — Supabase REST 직접 호출 (RLS 자동 필터링)
  getAll: async (page = 0, size = 6): Promise<{ data: MeetingListResponse }> => {
    const res = await supabaseClient.get<SupabaseMeetingRow[]>('/meetings', {
      params: {
        select: '*',
        order: 'created_at.desc',
        limit: size,
        offset: page * size,
      },
      headers: { Prefer: 'count=exact' },
    });
    const totalCount = parseTotalCount(res.headers['content-range']);
    const meetings: MeetingListItem[] = res.data.map(mapSupabaseRow);
    return {
      data: {
        meetings,
        totalCount,
        page,
        size,
        totalPages: Math.ceil(totalCount / size) || 1,
      },
    };
  },

  // 회의 상세 — 백엔드 (트랜스크립트 + 요약 조인)
  getById: (meetingId: string) =>
    apiClient.get<MeetingDetail>(`/api/v1/meetings/${meetingId}`),

  summarize: (meetingId: string, signal?: AbortSignal) =>
    apiClient.post<SummaryDto>(`/api/v1/meetings/${meetingId}/summarize`, null, { signal }),

  updateTranscripts: (meetingId: string, updates: TranscriptUpdate[]) =>
    apiClient.put(`/api/v1/meetings/${meetingId}/transcripts`, updates),

  delete: (meetingId: string) =>
    apiClient.delete(`/api/v1/meetings/${meetingId}`),
};
