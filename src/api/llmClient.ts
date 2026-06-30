import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const llmClient = axios.create({
  baseURL: import.meta.env.VITE_API_LLM_URL,
  headers: { 'Content-Type': 'application/json' },
});

llmClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default llmClient;
