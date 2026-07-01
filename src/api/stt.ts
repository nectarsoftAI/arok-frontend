import apiClient from './apiClient';
import { AxiosError } from 'axios';
import type { TranscribeResponse, MeetingResult, ApiError } from './types';
import { useAuthStore } from '../store/authStore';

export type { TranscribeResponse, MeetingResult, ApiError } from './types';
export type { TranscriptSegment } from './types';

// ---- Helpers ----

function extractApiError(err: unknown): ApiError {
  if (err instanceof AxiosError && err.response?.data) {
    return err.response.data as ApiError;
  }
  throw err;
}

// ---- API ----

export async function transcribeFile(file: File, title?: string): Promise<TranscribeResponse> {
  const form = new FormData();
  form.append('file', file);
  if (title && title.trim()) form.append('title', title.trim());

  const userId = useAuthStore.getState().user?.id;
  try {
    const { data } = await apiClient.post<TranscribeResponse>(
      '/api/v1/stt/transcribe',
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(userId && { 'X-User-Id': userId }),
        },
      },
    );
    console.log('STT 응답:', data);
    return data;
  } catch (err) {
    throw extractApiError(err);
  }
}

export async function getMeetingResult(meetingId: string): Promise<MeetingResult> {
  try {
    const { data } = await apiClient.get<MeetingResult>(
      `/api/v1/meetings/${meetingId}`,
    );
    return data;
  } catch (err) {
    throw extractApiError(err);
  }
}
