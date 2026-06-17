import apiClient from './apiClient';

export const meetingsApi = {
  // 회의 목록 조회
  getAll: () => apiClient.get('/meetings'),

  // 회의 단건 조회
  getById: (meetingId: string) => apiClient.get(`/meetings/${meetingId}`),

  // 회의 생성
  create: (data: { title: string; meeting_type: string; meeting_date: string }) =>
    apiClient.post('/meetings', data),

  // 오디오 파일 업로드
  uploadAudio: (meetingId: string, formData: FormData) =>
    apiClient.post(`/meetings/${meetingId}/audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // 대화록 조회
  getTranscripts: (meetingId: string) =>
    apiClient.get(`/meetings/${meetingId}/transcripts`),

  // 요약 조회
  getSummary: (meetingId: string) =>
    apiClient.get(`/meetings/${meetingId}/summary`),
};