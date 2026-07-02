import apiClient from './apiClient';
import {
  type MeetingListItem,
  type MeetingListResponse,
  type MeetingResult,
  type SummaryDto,
  type TranscriptUpdate,
} from './types';

export type { MeetingListItem };
export type MeetingDetail = MeetingResult;

export const meetingsApi = {
  // 회의 목록 — 백엔드 API 조회 (X-User-Id 필터링)
  getAll: async (page = 0, size = 6): Promise<{ data: MeetingListResponse }> => {
    const res = await apiClient.get<MeetingListResponse>('/api/v1/meetings', {
      params: { page, size },
    });
    return { data: res.data };
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
