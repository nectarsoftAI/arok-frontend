import apiClient from './apiClient';
import type { MeetingResult } from './types';

export type MeetingListItem = Omit<MeetingResult, 'transcripts'>;
export type MeetingDetail = MeetingResult;

export const meetingsApi = {
  getAll: () => apiClient.get<{ meetings: MeetingListItem[] }>('/api/v1/meetings'),
  getById: (meetingId: string) => apiClient.get<MeetingDetail>(`/api/v1/meetings/${meetingId}`),
  delete: (meetingId: string) => apiClient.delete(`/api/v1/meetings/${meetingId}`),
};
