import axios, { AxiosError } from 'axios';
import { getApiBaseUrl } from './constants';

// Axios 인스턴스 생성
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// 요청 인터셉터: 액세스 토큰과 실제 API 주소를 자동 주입
apiClient.interceptors.request.use(
  async (config) => {
    config.baseURL = await getApiBaseUrl();

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터: 401이면 refresh 토큰으로 재시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const baseUrl = await getApiBaseUrl();
          const { data } = await axios.post(`${baseUrl}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          originalRequest!.headers!.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest!);
        } catch {
          // 리프레시도 실패하면 로그인 화면으로 이동
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
