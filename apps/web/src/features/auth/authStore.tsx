import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { AuthUser } from '../../lib/types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_ADMIN: AuthUser = {
  id: 'auto-admin-id',
  loginId: 'admin',
  name: '통합 관리자',
  role: 'ADMIN',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // 항상 최고 관리자로 로그인되어 있도록 강제 설정
  const user = MOCK_ADMIN;
  const isAuthenticated = true;

  const login = () => {};
  const logout = () => {
    // 로그아웃 기능 제거 시 브라우저 새로고침 효과만 줌
    window.location.href = '/dashboard';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
