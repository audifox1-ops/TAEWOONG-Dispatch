import { useQuery } from '@tanstack/react-query';
import { Shield, ShieldAlert, UserCog } from 'lucide-react';
import * as api from '../features/dispatch/dispatchApi';
import { ROLE_CONFIG } from '../../lib/constants';

export default function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: api.fetchUsers,
  });

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">사용자 목록을 불러오는 중...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">사용자 관리</h1>
        <p className="text-slate-500 mt-1">시스템에 접근 가능한 사용자를 관리합니다.</p>
      </div>

      <div className="card">
        <div className="card-header bg-slate-50">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <UserCog size={18} /> 전체 사용자
          </h2>
        </div>
        <div className="table-container border-0 shadow-none rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>이름</th>
                <th>로그인 ID</th>
                <th>역할</th>
                <th>연락처</th>
                <th>상태</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user: any) => (
                <tr key={user.id}>
                  <td className="font-medium text-slate-800">{user.name}</td>
                  <td className="text-slate-500">{user.loginId}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG].color}`}>
                      {ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG].label}
                    </span>
                  </td>
                  <td className="text-slate-500">{user.phone || '-'}</td>
                  <td>
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <Shield size={14} /> 활성
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                        <ShieldAlert size={14} /> 비활성
                      </span>
                    )}
                  </td>
                  <td className="text-slate-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
