import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import type { AuthResponse } from './types';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/** 재시도 여부를 표시해 401 → refresh → 401 무한 루프를 끊는다. */
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** refreshToken 자체가 없어 갱신을 시도조차 못한 경우 — 호출부에 원래 401을 돌려주기 위한 구분자. */
export class NoRefreshTokenError extends Error {
  constructor() {
    super('no refresh token');
    this.name = 'NoRefreshTokenError';
  }
}

// apiClient(자체 백엔드)와 supabaseClient가 공유하는 단일 in-flight 갱신.
// 두 클라이언트에서 401이 동시에 터져도 토큰 갱신 요청은 한 번만 나간다.
// (예전엔 두 파일이 각자 isRefreshing/pendingQueue를 따로 들고 있어서 refresh가
//  2번 돌고, 늦게 도착한 응답이 먼저 저장된 토큰을 덮어쓰는 문제가 있었음)
let inFlight: Promise<string> | null = null;

async function requestNewToken(): Promise<string> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) {
    useAuthStore.getState().logout();
    throw new NoRefreshTokenError();
  }

  try {
    // apiClient/supabaseClient를 거치지 않는 raw 요청 — 인터셉터 재귀 방지
    const { data } = await axios.post<AuthResponse>(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      { refresh_token: refreshToken },
      { headers: { apikey: SUPABASE_ANON, 'Content-Type': 'application/json' } },
    );
    useAuthStore.getState().setAuth(data);
    return data.access_token;
  } catch (err) {
    useAuthStore.getState().logout();
    throw err;
  }
}

/**
 * 액세스 토큰을 갱신하고 새 토큰을 반환한다.
 * 갱신이 진행 중이면 새 요청을 보내지 않고 진행 중인 Promise를 그대로 돌려주므로,
 * 동시에 몇 개가 호출하든 실제 네트워크 요청은 한 번이다.
 */
export function refreshAccessToken(): Promise<string> {
  if (!inFlight) {
    // 성공/실패 여부와 무관하게 슬롯을 비워 다음 401에서 다시 시도할 수 있게 한다
    inFlight = requestNewToken().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/**
 * 401 응답을 받으면 토큰을 갱신하고 원래 요청을 한 번만 재시도하는 인터셉터를 붙인다.
 * 갱신은 refreshAccessToken()이 전역에서 직렬화하므로 클라이언트를 몇 개 붙여도 안전하다.
 */
export function attachAuthRefresh(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetriableConfig | undefined;

      if (error.response?.status !== 401 || !original || original._retry) {
        return Promise.reject(error);
      }
      original._retry = true;

      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return await client(original);
      } catch (refreshError) {
        // 갱신을 시도조차 못한 경우엔 원래 401을 그대로 넘겨야 호출부가 서버 에러 본문을 읽을 수 있다
        return Promise.reject(refreshError instanceof NoRefreshTokenError ? error : refreshError);
      }
    },
  );
}
