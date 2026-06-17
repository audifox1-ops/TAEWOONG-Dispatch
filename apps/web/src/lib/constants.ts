// In local development we rely on the Vite dev proxy, so no API env var is needed.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
