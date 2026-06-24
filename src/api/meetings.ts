import apiClient from './apiClient';
import type { MeetingListItem, MeetingResult } from './types';

export type { MeetingListItem };
export type MeetingDetail = MeetingResult;

export const meetingsApi = {
  getAll: () => apiClient.get<{ meetings: MeetingListItem[] }>('/api/v1/meetings'),
  getById: (meetingId: string) => apiClient.get<MeetingDetail>(`/api/v1/meetings/${meetingId}`),
  delete: (meetingId: string) => apiClient.delete(`/api/v1/meetings/${meetingId}`),
};
