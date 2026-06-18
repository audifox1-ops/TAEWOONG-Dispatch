import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type {
  DispatchQuery,
  CreateDispatchRequest,
  CreateDispatchBatchRequest,
  UpdateDispatchRequest,
} from '../../lib/types';
import * as api from './dispatchApi';

// 쿼리 키 상수
export const DISPATCH_KEYS = {
  all: ['dispatches'] as const,
  list: (query: DispatchQuery) => ['dispatches', 'list', query] as const,
  detail: (id: string) => ['dispatches', 'detail', id] as const,
  history: (id: string) => ['dispatches', 'history', id] as const,
};

/** 배차지시서 목록 조회 훅 */
export function useDispatches(query: DispatchQuery) {
  return useQuery({
    queryKey: DISPATCH_KEYS.list(query),
    queryFn: () => api.fetchDispatches(query),
  });
}

/** 배차지시서 단건 조회 훅 */
export function useDispatch(id: string) {
  return useQuery({
    queryKey: DISPATCH_KEYS.detail(id),
    queryFn: () => api.fetchDispatch(id),
    enabled: !!id,
  });
}

/** 변경 이력 조회 훅 */
export function useDispatchHistory(id: string) {
  return useQuery({
    queryKey: DISPATCH_KEYS.history(id),
    queryFn: () => api.fetchDispatchHistory(id),
    enabled: !!id,
  });
}

/** 배차지시서 생성 뮤테이션 */
export function useCreateDispatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDispatchRequest) => api.createDispatch(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISPATCH_KEYS.all });
      toast.success('배차지시서가 생성되었습니다.');
    },
    onError: () => {
      toast.error('배차지시서 생성에 실패했습니다.');
    },
  });
}

/** 배차지시서 일괄 생성 뮤테이션 */
export function useCreateDispatchBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDispatchBatchRequest) => api.createDispatchBatch(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISPATCH_KEYS.all });
      toast.success('배차지시서가 일괄 생성되었습니다.');
    },
    onError: () => {
      toast.error('배차지시서 일괄 생성에 실패했습니다.');
    },
  });
}

/** 배차지시서 수정 뮤테이션 */
export function useUpdateDispatch(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDispatchRequest) => api.updateDispatch(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISPATCH_KEYS.all });
      qc.invalidateQueries({ queryKey: DISPATCH_KEYS.detail(id) });
      toast.success('배차지시서가 수정되었습니다.');
    },
    onError: () => {
      toast.error('배차지시서 수정에 실패했습니다.');
    },
  });
}

/** 배차지시서 삭제 뮤테이션 */
export function useDeleteDispatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDispatch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISPATCH_KEYS.all });
      toast.success('배차지시서가 삭제되었습니다.');
    },
    onError: () => {
      toast.error('배차지시서 삭제에 실패했습니다.');
    },
  });
}

/** 상태 변경 뮤테이션 */
export function useUpdateDispatchStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => api.updateDispatchStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISPATCH_KEYS.all });
      qc.invalidateQueries({ queryKey: DISPATCH_KEYS.detail(id) });
      toast.success('상태가 변경되었습니다.');
    },
    onError: () => {
      toast.error('상태 변경에 실패했습니다.');
    },
  });
}
