import apiClient from './apiClient';
import type { MeetingListItem, MeetingListResponse, MeetingResult, SummaryDto, TranscriptUpdate } from './types';

export type { MeetingListItem };
export type MeetingDetail = MeetingResult;

export const meetingsApi = {
  getAll: (page = 0, size = 6) =>
    apiClient.get<MeetingListResponse>('/api/v1/meetings', { params: { page, size } }),
  getById: (meetingId: string) => apiClient.get<MeetingDetail>(`/api/v1/meetings/${meetingId}`),
  summarize: (meetingId: string, signal?: AbortSignal) =>
    apiClient.post<SummaryDto>(`/api/v1/meetings/${meetingId}/summarize`, null, { signal }),
  updateTranscripts: (meetingId: string, updates: TranscriptUpdate[]) =>
    apiClient.put(`/api/v1/meetings/${meetingId}/transcripts`, updates),
  delete: (meetingId: string) => apiClient.delete(`/api/v1/meetings/${meetingId}`),
};
