import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginSchema, type LoginFormData } from '../lib/schemas';
import { useAuth } from '../features/auth/authStore';
import * as api from '../features/dispatch/dispatchApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 리다이렉트될 이전 페이지
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const res = await api.login(data.loginId, data.password);
      setAuth(res.user, res.accessToken, res.refreshToken);
      toast.success(`${res.user.name}님 환영합니다!`);
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/20">
            <Truck size={36} className="text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          배차지시서 통합 관리
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          시스템 접근을 위해 로그인해주세요.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="loginId" className="form-label">
                로그인 ID
              </label>
              <div className="mt-1">
                <input
                  id="loginId"
                  type="text"
                  autoComplete="username"
                  className={`form-input ${errors.loginId ? 'form-input-error' : ''}`}
                  placeholder="아이디를 입력하세요"
                  {...register('loginId')}
                />
                {errors.loginId && (
                  <p className="form-error">{errors.loginId.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                  placeholder="비밀번호를 입력하세요"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin-slow" />
                    로그인 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn size={18} />
                    로그인
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* 샘플 계정 안내 (개발용) */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              테스트 계정 안내
            </h3>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-2">
              <div className="flex justify-between">
                <span>관리자: <strong className="text-slate-800">admin</strong></span>
                <span className="text-slate-500">Admin1234!</span>
              </div>
              <div className="flex justify-between">
                <span>담당자1: <strong className="text-slate-800">dispatcher1</strong></span>
                <span className="text-slate-500">Disp1234!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
