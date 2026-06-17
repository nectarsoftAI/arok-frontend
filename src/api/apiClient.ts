import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: 로그인 구현 후 아래 주석 해제
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('sb-access-token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default apiClient;