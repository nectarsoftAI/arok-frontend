import { isAxiosError } from 'axios';
import llmClient from './llmClient';
import type { AuthResponse } from './types';

export async function signup(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResponse> {
  const res = await llmClient.post<AuthResponse>('/api/auth/signup', {
    email,
    password,
    display_name: displayName,
  });
  return res.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await llmClient.post<AuthResponse>('/api/auth/login', { email, password });
  return res.data;
}

// FastAPI 422 Unprocessable Entity의 detail 배열을 { [field]: message } 로 변환
export function extractFieldErrors(err: unknown): Record<string, string> {
  if (!isAxiosError(err)) return {};
  const detail = err.response?.data?.detail;
  if (!Array.isArray(detail)) return {};
  const result: Record<string, string> = {};
  for (const item of detail) {
    const field = item.loc?.[item.loc.length - 1];
    if (field && item.msg) result[String(field)] = String(item.msg);
  }
  return result;
}

// 401, 409, 500 등 비-422 에러에서 사람이 읽을 메시지 추출
export function extractErrorMessage(err: unknown): string {
  if (!isAxiosError(err)) return '알 수 없는 오류가 발생했습니다.';
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  return '서버 오류가 발생했습니다.';
}
