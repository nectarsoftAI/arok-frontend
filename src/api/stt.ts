import apiClient from './apiClient';
import { AxiosError } from 'axios';

// ---- Types ----

export interface TranscriptSegment {
  speakerLabel: string;
  speakerDisplay: string;
  startSec: number;
  endSec: number;
  content: string;
  confidence: number;
  lowConfidence: boolean;
}

export interface TranscribeResponse {
  meetingId: string;
  engineUsed: string;
  segmentCount: number;
  transcripts: TranscriptSegment[];
}

export interface MeetingResult {
  meetingId: string;
  title: string;
  meetingType: string;
  status: string;
  durationSeconds: number;
  meetingDate: string;
  createdAt: string;
  transcripts: TranscriptSegment[];
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
}

// ---- Helpers ----

function extractApiError(err: unknown): ApiError {
  if (err instanceof AxiosError && err.response?.data) {
    return err.response.data as ApiError;
  }
  throw err;
}

// ---- API ----

export async function transcribeFile(file: File): Promise<TranscribeResponse> {
  const form = new FormData();
  form.append('file', file);

  try {
    const { data } = await apiClient.post<TranscribeResponse>(
      '/api/v1/stt/transcribe',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
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
