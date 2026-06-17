import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/authStore';
import MainLayout from '../layout/MainLayout';
import type { Role } from '../../lib/types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트 (원래 가려던 경로 기억)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // 권한이 없는 경우 대시보드로 리다이렉트
    return <Navigate to="/dashboard" replace />;
  }

  // 인증된 사용자는 MainLayout 안에 자식 라우트 렌더링
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
