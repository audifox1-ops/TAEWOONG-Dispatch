// 공통 타입 정의

export type Role = 'ADMIN' | 'DISPATCHER' | 'DRIVER';
export type DispatchStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
export type ChangeType = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';

// ============ 사용자 ============
export interface User {
  id: string;
  loginId: string;
  name: string;
  role: Role;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  loginId: string;
  name: string;
  role: Role;
  phone?: string;
}

// ============ 배차지시서 ============
export interface DispatchOrder {
  id: string;
  dispatchNo: string;
  dispatchDate: string;
  origin: string;
  destination: string;
  orderRefNo: string;
  item: string;
  weightTon: number;
  quantity: number;
  status: DispatchStatus;
  note?: string;
  deletedAt?: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    loginId: string;
    role?: Role;
  };
  createdAt: string;
  updatedAt: string;
}

// ============ 배차 이력 ============
export interface DispatchHistory {
  id: string;
  dispatchOrderId: string;
  changedById: string;
  changeType: ChangeType;
  beforeJson?: Record<string, unknown>;
  afterJson?: Record<string, unknown>;
  createdAt: string;
  changedBy: {
    id: string;
    name: string;
    loginId: string;
    role: Role;
  };
}

// ============ API 응답 ============
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: string[];
}

// ============ 필터 쿼리 ============
export interface DispatchQuery {
  status?: DispatchStatus;
  dateFrom?: string;
  dateTo?: string;
  origin?: string;
  destination?: string;
  item?: string;
  orderRefNo?: string;
  q?: string;
  page?: number;
  limit?: number;
}

// ============ 배차지시서 생성/수정 요청 ============
export interface CreateDispatchRequest {
  dispatchDate: string;
  origin: string;
  destination: string;
  orderRefNo: string;
  item: string;
  weightTon: number;
  quantity: number;
  note?: string;
}

export type UpdateDispatchRequest = Partial<CreateDispatchRequest>;
