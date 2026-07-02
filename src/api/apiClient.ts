import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { AuthResponse } from './types';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// refresh 중 들어오는 요청들을 쌓아뒀다가 새 토큰으로 일괄 재시도
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

  // apiClient를 거치지 않는 raw 요청 — 인터셉터 재귀 방지
  const { data } = await axios.post<AuthResponse>(
    `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    { refresh_token: refreshToken },
    { headers: { apikey: SUPABASE_ANON, 'Content-Type': 'application/json' } },
  );
  useAuthStore.getState().setAuth(data);
  return data.access_token;
}

apiClient.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (user?.id) config.headers['X-User-Id'] = user.id;
  return config;
});

apiClient.interceptors.response.use(
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
        // 이미 refresh 중이면 큐에 넣고 대기
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      isRefreshing = true;
      try {
        const newToken = await attemptRefresh();
        isRefreshing = false;
        flushPending(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
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

export default apiClient;
