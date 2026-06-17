import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, PlusCircle,
  Users, LogOut, Truck, ChevronRight
} from 'lucide-react';
import { useAuth } from '../features/auth/authStore';
import * as api from '../features/dispatch/dispatchApi';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { to: '/dispatch', icon: ClipboardList, label: '배차 현황' },
  { to: '/dispatch/new', icon: PlusCircle, label: '배차지시서 작성' },
];

const adminNavItems = [
  { to: '/admin/users', icon: Users, label: '사용자 관리' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // 무시
    }
    logout();
    navigate('/login');
    toast.success('로그아웃 되었습니다.');
  };

  return (
    <aside className="sidebar shadow-2xl">
      {/* 로고 */}
      <div className="px-6 py-5 border-b border-navy-light">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg">
            <Truck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">배차지시서</h1>
            <p className="text-slate-400 text-xs">통합 관리 시스템</p>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">메뉴</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
              ${isActive
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-navy-light hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
            <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}

        {/* 관리자 전용 메뉴 */}
        {user?.role === 'ADMIN' && (
          <>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mt-6 mb-3">관리</p>
            {adminNavItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-navy-light hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* 사용자 정보 + 로그아웃 */}
      <div className="px-4 py-4 border-t border-navy-light">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-slate-400 text-xs truncate">{user?.loginId}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={16} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
