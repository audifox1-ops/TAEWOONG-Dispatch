// API 기본 URL 환경변수 없을 때 개발 환경의 실제 API를 자동 탐지한다.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL_STORAGE_KEY = 'dispatch-api-base-url';

const API_BASE_URL_CANDIDATES = [
  API_BASE_URL,
  import.meta.env.DEV ? 'http://localhost:5123' : '',
  import.meta.env.DEV ? 'http://127.0.0.1:5123' : '',
  import.meta.env.DEV ? 'http://localhost:3000' : '',
  import.meta.env.DEV ? 'http://127.0.0.1:3000' : '',
].filter((value): value is string => Boolean(value));

let resolvedApiBaseUrlPromise: Promise<string> | null = null;

function readCachedApiBaseUrl() {
  try {
    return sessionStorage.getItem(API_BASE_URL_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function writeCachedApiBaseUrl(baseUrl: string) {
  try {
    sessionStorage.setItem(API_BASE_URL_STORAGE_KEY, baseUrl);
  } catch {
    // 세션 스토리지를 못 써도 동작은 계속한다.
  }
}

async function probeApiBaseUrl(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    return response.status !== 404;
  } catch {
    return false;
  }
}

export async function getApiBaseUrl(): Promise<string> {
  if (API_BASE_URL) {
    return API_BASE_URL;
  }

  const cachedBaseUrl = readCachedApiBaseUrl();
  if (cachedBaseUrl) {
    return cachedBaseUrl;
  }

  if (!resolvedApiBaseUrlPromise) {
    resolvedApiBaseUrlPromise = (async () => {
      for (const candidate of API_BASE_URL_CANDIDATES) {
        if (await probeApiBaseUrl(candidate)) {
          writeCachedApiBaseUrl(candidate);
          return candidate;
        }
      }

      const fallback = 'http://localhost:3000';
      writeCachedApiBaseUrl(fallback);
      return fallback;
    })();
  }

  return resolvedApiBaseUrlPromise;
}

// 출발지/도착지 선택지
export const LOCATION_OPTIONS = [
  'P15',
  '절단반',
  '열처리반',
  '150TON CRANE',
  '직접입력',
] as const;

// 품목 선택지
export const ITEM_OPTIONS = [
  '코깅바',
  'SQ 코깅바',
  'P/SHAFT',
  'I/SHAFT',
  'R/STOCK',
  'R/TRUNK',
  'TUBE SHEET',
  'SHAFT',
  'BLIND',
  'SHELL',
  '직접입력',
] as const;

// 배차 상태 정보
export const STATUS_CONFIG = {
  PENDING: {
    label: '대기',
    badgeClass: 'badge-pending',
    color: '#f59e0b',
  },
  IN_PROGRESS: {
    label: '진행 중',
    badgeClass: 'badge-in-progress',
    color: '#3b82f6',
  },
  COMPLETED: {
    label: '완료',
    badgeClass: 'badge-completed',
    color: '#10b981',
  },
  CANCELED: {
    label: '취소',
    badgeClass: 'badge-canceled',
    color: '#94a3b8',
  },
} as const;

// 역할별 정보
export const ROLE_CONFIG = {
  ADMIN: { label: '관리자', color: 'text-purple-600 bg-purple-50' },
  DISPATCHER: { label: '배차 담당자', color: 'text-blue-600 bg-blue-50' },
  DRIVER: { label: '기사', color: 'text-green-600 bg-green-50' },
} as const;
