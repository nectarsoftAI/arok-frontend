import type { SummaryDto } from './types';

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
