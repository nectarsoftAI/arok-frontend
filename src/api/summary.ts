import axios from 'axios';
import type { SummaryDto } from './types';

const summaryClient = axios.create({
  baseURL: import.meta.env.VITE_API_LLM_URL,
  headers: { 'Content-Type': 'application/json' },
});


export interface ActionItem {
  assignee: string;
  task: string;
  due_date: string;
}

export interface SummaryResponse {
  summary: string[];
  decisions: string[];
  action_items: ActionItem[];
  keywords: string[];
}

// 백엔드 SummaryDto(JSON 문자열 필드) → 프론트 SummaryResponse(배열) 변환
export function parseSummaryDto(dto: SummaryDto | null): SummaryResponse | null {
  if (!dto) return null;
  try {
    return {
      summary: JSON.parse(dto.keyPoints || '[]'),
      decisions: JSON.parse(dto.decisions || '[]'),
      action_items: JSON.parse(dto.actionItems || '[]'),
      keywords: JSON.parse(dto.keywords || '[]'),
    };
  } catch {
    return null;
  }
}

export async function exportSummaryDocx(meetingId: string): Promise<void> {
  console.log('[exportSummaryDocx] 요청 시작 meetingId:', meetingId);
  const response = await summaryClient.get(`/api/summary/${meetingId}/export`, {
    responseType: 'blob',
  });
  console.log('[exportSummaryDocx] 응답 수신 status:', response.status, 'data:', response.data);
  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `summary_${meetingId}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}