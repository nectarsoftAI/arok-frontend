import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { AuthResponse } from './types';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabaseClient = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    apikey: SUPABASE_ANON,
    'Content-Type': 'application/json',
  },
});

// refresh 중 동시 요청이 들어오면 큐에 쌓아뒀다가 새 토큰으로 일괄 재시도
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function flushPending(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
}

async function attemptRefresh(): Promise<string> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) throw new Error('no refresh token');

  const { data } = await axios.post<AuthResponse>(
    `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    { refresh_token: refreshToken },
    { headers: { apikey: SUPABASE_ANON, 'Content-Type': 'application/json' } },
  );
  useAuthStore.getState().setAuth(data);
  return data.access_token;
}

// 요청마다 JWT 자동 첨부
supabaseClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 시 토큰 자동 갱신 후 재시도, 실패 시 인증 상태 초기화
supabaseClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return supabaseClient(original);
        });
      }

      isRefreshing = true;
      try {
        const newToken = await attemptRefresh();
        isRefreshing = false;
        flushPending(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return supabaseClient(original);
      } catch (refreshError) {
        isRefreshing = false;
        flushPending(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default supabaseClient;
