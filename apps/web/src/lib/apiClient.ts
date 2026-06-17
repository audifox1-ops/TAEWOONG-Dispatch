import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { API_BASE_URL } from './constants';

const transport = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

function getBaseUrlCandidates() {
  const explicit = API_BASE_URL.trim();
  if (explicit) {
    return [explicit];
  }

  return [
    '/api',
    'http://127.0.0.1:5123',
    'http://localhost:5123',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
  ];
}

function isLikelyProxyMiss(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  return !error.response || status === 404 || status === 502 || status === 503 || status === 504;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return false;
  }

  for (const baseURL of getBaseUrlCandidates()) {
    try {
      const response = await transport.post<{ accessToken: string }>(
        '/auth/refresh',
        { refreshToken },
        { baseURL },
      );
      localStorage.setItem('accessToken', response.data.accessToken);
      return true;
    } catch {
      // 다음 후보를 시도한다.
    }
  }

  return false;
}

async function requestWithFallback<T>(config: AxiosRequestConfig, attempt = 0): Promise<AxiosResponse<T>> {
  const candidates = getBaseUrlCandidates();
  const baseURL = candidates[attempt] ?? candidates[candidates.length - 1];
  const headers = {
    ...(config.headers || {}),
  } as Record<string, string>;

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    return await transport.request<T>({
      ...config,
      baseURL,
      headers,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401 && config.url !== '/auth/refresh') {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const updatedToken = localStorage.getItem('accessToken');
        return transport.request<T>({
          ...config,
          baseURL,
          headers: {
            ...headers,
            Authorization: updatedToken ? `Bearer ${updatedToken}` : headers.Authorization,
          },
        });
      }
    }

    if (isLikelyProxyMiss(error) && attempt + 1 < candidates.length) {
      return requestWithFallback<T>(config, attempt + 1);
    }

    throw error;
  }
}

const apiClient = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return requestWithFallback<T>({ ...(config || {}), method: 'get', url });
  },
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return requestWithFallback<T>({ ...(config || {}), method: 'post', url, data });
  },
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return requestWithFallback<T>({ ...(config || {}), method: 'patch', url, data });
  },
  delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return requestWithFallback<T>({ ...(config || {}), method: 'delete', url });
  },
};

export default apiClient;
