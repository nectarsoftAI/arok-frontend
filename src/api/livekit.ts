import apiClient from './apiClient';
import type { LiveKitTokenResponse } from './types';

export const livekitApi = {
  // token은 초대 코드로 입장한 guest만 필요 — host는 profileId가 회의 생성자와
  // 일치하는지로 서버가 판별하므로 생략 가능
  getToken: (meetingId: string, profileId: string, token?: string) => {
    const params: Record<string, string> = { meetingId, profileId };
    if (token) params.token = token;
    return apiClient.get<LiveKitTokenResponse>('/api/v1/livekit/token', { params });
  },
};
