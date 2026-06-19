import axios from 'axios';
import type { TranscribeResponse } from './types';
import type { MeetingDetail } from './meetings';

export interface SummaryResponse {
  summary: string[];
  decisions: string[];
  action_items: {
    assignee: string;
    task: string;
    due_date: string;
  }[];
  keywords: string[];
}

const summaryClient = axios.create({
  baseURL: import.meta.env.VITE_API_LLM_URL,
  headers: { 'Content-Type': 'application/json' },
});

export async function postSummary(body: TranscribeResponse): Promise<SummaryResponse> {
  const { data } = await summaryClient.post<SummaryResponse>('/api/summary', body);
  return data;
}

export async function postSummaryFromDetail(meeting: MeetingDetail): Promise<SummaryResponse> {
  const body = {
    meetingId: meeting.meetingId,
    engineUsed: 'unknown',
    segmentCount: meeting.transcripts.length,
    transcripts: meeting.transcripts,
  };
  const { data } = await summaryClient.post<SummaryResponse>('/api/summary', body);
  return data;
}
