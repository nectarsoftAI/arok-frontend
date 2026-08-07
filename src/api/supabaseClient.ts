import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { attachAuthRefresh } from './authRefresh';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabaseClient = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    apikey: SUPABASE_ANON,
    'Content-Type': 'application/json',
  },
});

// 요청마다 JWT 자동 첨부
supabaseClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 시 토큰 자동 갱신 후 재시도 — 갱신 자체는 apiClient와 공유하는 단일 큐가 처리
attachAuthRefresh(supabaseClient);

export default supabaseClient;
