import apiClient from '../../lib/apiClient';
import type {
  DispatchOrder,
  DispatchQuery,
  PaginatedResponse,
  CreateDispatchRequest,
  CreateDispatchBatchRequest,
  UpdateDispatchRequest,
  DispatchHistory,
} from '../../lib/types';

// ============ 배차지시서 API ============

/** 목록 조회 */
export async function fetchDispatches(query: DispatchQuery): Promise<PaginatedResponse<DispatchOrder>> {
  const { data } = await apiClient.get('/dispatch', { params: query });
  return data;
}

/** 단건 조회 */
export async function fetchDispatch(id: string): Promise<DispatchOrder> {
  const { data } = await apiClient.get(`/dispatch/${id}`);
  return data;
}

/** 생성 */
export async function createDispatch(payload: CreateDispatchRequest): Promise<DispatchOrder> {
  const { data } = await apiClient.post('/dispatch', payload);
  return data;
}

export async function createDispatchBatch(
  payload: CreateDispatchBatchRequest,
): Promise<DispatchOrder[]> {
  const { data } = await apiClient.post('/dispatch/batch', payload);
  return data;
}

/** 수정 */
export async function updateDispatch(id: string, payload: UpdateDispatchRequest): Promise<DispatchOrder> {
  const { data } = await apiClient.patch(`/dispatch/${id}`, payload);
  return data;
}

/** 삭제 (소프트) */
export async function deleteDispatch(id: string): Promise<void> {
  await apiClient.delete(`/dispatch/${id}`);
}

/** 상태 변경 */
export async function updateDispatchStatus(
  id: string,
  status: string,
): Promise<DispatchOrder> {
  const { data } = await apiClient.patch(`/dispatch/${id}/status`, { status });
  return data;
}

/** 변경 이력 조회 */
export async function fetchDispatchHistory(id: string): Promise<DispatchHistory[]> {
  const { data } = await apiClient.get(`/dispatch/${id}/history`);
  return data;
}

/** 단건 엑셀 다운로드 */
export async function downloadSingleExcel(id: string, dispatchNo: string): Promise<void> {
  const response = await apiClient.get(`/dispatch/${id}/export`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `배차지시서_${dispatchNo}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

async function downloadExcelBlob(
  query: Omit<DispatchQuery, 'page' | 'limit'>,
  filename: string,
): Promise<void> {
  const response = await apiClient.get('/dispatch/export/list', {
    params: query,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/** 목록 엑셀 다운로드 (현재 필터 기준) */
export async function downloadListExcel(query: Omit<DispatchQuery, 'page' | 'limit'>): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  await downloadExcelBlob(query, `배차지시서_목록_${today}.xlsx`);
}

/** 기간별 엑셀 다운로드 */
export async function downloadListExcelByPeriod(
  query: Omit<DispatchQuery, 'page' | 'limit' | 'month'> & { dateFrom: string; dateTo: string },
): Promise<void> {
  await downloadExcelBlob(query, `배차지시서_기간_${query.dateFrom}_${query.dateTo}.xlsx`);
}

/** 월별 엑셀 다운로드 */
export async function downloadListExcelByMonth(
  query: Omit<DispatchQuery, 'page' | 'limit' | 'dateFrom' | 'dateTo'> & { month: string },
): Promise<void> {
  await downloadExcelBlob(query, `배차지시서_${query.month}.xlsx`);
}

// ============ 인증 API ============

export async function login(loginId: string, password: string) {
  const { data } = await apiClient.post('/auth/login', { loginId, password });
  return data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function getMe() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

// ============ 사용자 API ============

export async function fetchUsers() {
  const { data } = await apiClient.get('/users');
  return data;
}

export async function createUser(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/users', payload);
  return data;
}

export async function updateUser(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string) {
  await apiClient.delete(`/users/${id}`);
}
