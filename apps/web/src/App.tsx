import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';

// 페이지 컴포넌트 임포트
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DispatchListPage from './pages/DispatchListPage';
import DispatchFormPage from './pages/DispatchFormPage';
import DispatchDetailPage from './pages/DispatchDetailPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 보호된 라우트 (모든 인증된 사용자) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dispatch" element={<DispatchListPage />} />
            <Route path="/dispatch/:id" element={<DispatchDetailPage />} />
          </Route>

          {/* 보호된 라우트 (관리자/담당자만) */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DISPATCHER']} />}>
            <Route path="/dispatch/new" element={<DispatchFormPage />} />
            <Route path="/dispatch/:id/edit" element={<DispatchFormPage />} />
          </Route>

          {/* 보호된 라우트 (관리자 전용) */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>

          {/* 404 처리 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
