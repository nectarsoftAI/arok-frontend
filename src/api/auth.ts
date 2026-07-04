import axios, { isAxiosError } from 'axios';
import type { AuthResponse } from './types';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const authHeaders = {
  apikey: SUPABASE_ANON,
  'Content-Type': 'application/json',
};

export async function signup(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(
    `${SUPABASE_URL}/auth/v1/signup`,
    { email, password, data: { display_name: displayName } },
    { headers: authHeaders },
  );
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    { email, password },
    { headers: authHeaders },
  );
  return data;
}

export async function logout(accessToken: string): Promise<void> {
  await axios.post(
    `${SUPABASE_URL}/auth/v1/logout`,
    {},
    { headers: { ...authHeaders, Authorization: `Bearer ${accessToken}` } },
  );
}

// Supabase auth 에러에서 사람이 읽을 메시지 추출
export function extractErrorMessage(err: unknown): string {
  if (!isAxiosError(err)) return '알 수 없는 오류가 발생했습니다.';
  const data = err.response?.data;
  if (typeof data?.msg === 'string') return data.msg;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error_description === 'string') return data.error_description;
  return '서버 오류가 발생했습니다.';
}
