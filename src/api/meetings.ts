import apiClient from './apiClient';
import supabaseClient from './supabaseClient';
import {
  type MeetingListItem,
  type MeetingListResponse,
  type MeetingSearchFilters,
  type MeetingResult,
  type SummaryDto,
  type TranscriptUpdate,
  type SpeakerRename,
} from './types';

export type { MeetingListItem, MeetingSearchFilters };
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

/** keywords 가 JSON 문자열로 내려오는 경우가 있어 배열로 정규화한다. */
const toKeywords = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
};

/** 빈 문자열/undefined 는 null 로 — RPC 는 null 인 파라미터의 필터를 무시한다. */
const orNull = (v?: string) => (v && v.trim() ? v.trim() : null);

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
      keywords: toKeywords(row.keywords),
    }));

    return {
      data: { meetings, totalCount, page, size, totalPages: Math.ceil(totalCount / size) },
    };
  },

  /**
   * 회의 검색 — Supabase RPC(search_meetings) 직접 호출.
   * SECURITY INVOKER 라 RLS 가 auth.uid() 기준으로 알아서 필터링한다.
   * 모든 필터가 비어 있으면 전체 목록과 동일한 결과가 나온다.
   */
  search: async (
    filters: MeetingSearchFilters = {},
    page = 0,
    size = 9,
    signal?: AbortSignal,
  ): Promise<{ data: MeetingListResponse }> => {
    const res = await supabaseClient.post(
      '/rpc/search_meetings',
      {
        p_keyword: orNull(filters.keyword),
        p_meeting_type: orNull(filters.meetingType),
        p_status: orNull(filters.status),
        p_date_from: orNull(filters.dateFrom),
        p_date_to: orNull(filters.dateTo),
        p_page: page,
        p_page_size: size,
      },
      { signal },
    );

    const body = res.data ?? {};
    const meetings: MeetingListItem[] = (body.meetings ?? []).map((row: any) => ({
      meetingId: row.meetingId,
      title: row.title,
      meetingType: row.meetingType,
      status: row.status,
      durationSeconds: row.durationSeconds,
      meetingDate: row.meetingDate,
      createdAt: row.createdAt,
      participants: (row.participants ?? []).map((p: any) => ({
        speakerLabel: p.speakerLabel,
        speakerDisplay: p.speakerDisplay,
      })),
      keywords: toKeywords(row.keywords),
    }));

    return {
      data: {
        meetings,
        totalCount: body.total ?? 0,
        page: body.page ?? page,
        size: body.pageSize ?? size,
        totalPages: body.totalPages ?? 0,
      },
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

  /** 화자 이름 일괄 변경 — speakerLabel 기준으로 해당 화자의 모든 발언에 적용. 204 No Content. */
  renameSpeakers: (meetingId: string, renames: SpeakerRename[]) =>
    apiClient.put<void>(`/api/v1/meetings/${meetingId}/speakers`, renames),

  delete: (meetingId: string) =>
    apiClient.delete(`/api/v1/meetings/${meetingId}`),
};
