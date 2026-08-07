import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { attachAuthRefresh } from './authRefresh';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (user?.id) config.headers['X-User-Id'] = user.id;
  return config;
});

// 401 시 토큰 자동 갱신 후 재시도 — 갱신 자체는 supabaseClient와 공유하는 단일 큐가 처리
attachAuthRefresh(apiClient);

export default apiClient;
