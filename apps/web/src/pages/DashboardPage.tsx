import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../features/auth/authStore';
import { useDispatches } from '../features/dispatch/dispatchHooks';
import { STATUS_CONFIG } from '../lib/constants';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // 오늘 날짜의 배차 현황을 가져오기 위한 쿼리
  const today = new Date().toISOString().slice(0, 10);
  const { data, isLoading } = useDispatches({ 
    dateFrom: today,
    dateTo: today,
    limit: 100 // 오늘 데이터는 대략 모두 가져온다고 가정
  });

  const stats = useMemo(() => {
    if (!data?.data) return { total: 0, pending: 0, inProgress: 0, completed: 0 };
    
    return data.data.reduce((acc, curr) => {
      acc.total++;
      if (curr.status === 'PENDING') acc.pending++;
      else if (curr.status === 'IN_PROGRESS') acc.inProgress++;
      else if (curr.status === 'COMPLETED') acc.completed++;
      return acc;
    }, { total: 0, pending: 0, inProgress: 0, completed: 0 });
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">대시보드</h1>
          <p className="text-slate-500 mt-1">오늘({today})의 배차 현황을 확인하세요.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-600">환영합니다, {user?.name}님</p>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-md font-semibold mt-1 inline-block">
            {user?.role === 'ADMIN' ? '관리자' : user?.role === 'DISPATCHER' ? '배차 담당자' : '기사'}
          </span>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-slate-400">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">전체 배차</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {isLoading ? '-' : stats.total}
                <span className="text-sm font-normal text-slate-500 ml-1">건</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">대기 중</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {isLoading ? '-' : stats.pending}
                <span className="text-sm font-normal text-slate-500 ml-1">건</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">진행 중</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {isLoading ? '-' : stats.inProgress}
                <span className="text-sm font-normal text-slate-500 ml-1">건</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-500">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">완료</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {isLoading ? '-' : stats.completed}
                <span className="text-sm font-normal text-slate-500 ml-1">건</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 대기 목록 */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-500" />
            최근 대기 중인 배차 (오늘)
          </h3>
          <Link to="/dispatch?status=PENDING" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium">
            전체 보기 <ArrowRight size={16} />
          </Link>
        </div>
        <div className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">로딩 중...</div>
          ) : data?.data && data.data.filter(d => d.status === 'PENDING').length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.data
                .filter(d => d.status === 'PENDING')
                .slice(0, 5)
                .map(order => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {order.dispatchNo}
                        </span>
                        <span className="font-medium text-slate-800">{order.item}</span>
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <span className="font-medium text-slate-700">{order.origin}</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span className="font-medium text-slate-700">{order.destination}</span>
                        <span className="text-slate-300">|</span>
                        <span>{order.weightTon}TON</span>
                        <span className="text-slate-300">|</span>
                        <span>수량: {order.quantity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={STATUS_CONFIG[order.status].badgeClass}>
                        {STATUS_CONFIG[order.status].label}
                      </span>
                      {(user?.role === 'ADMIN' || user?.role === 'DISPATCHER') && (
                        <Link to={`/dispatch/${order.id}`} className="btn-secondary btn-sm">
                          상세 보기
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 size={24} className="text-slate-400" />
              </div>
              <p>대기 중인 배차가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 퀵 액션 */}
      {(user?.role === 'ADMIN' || user?.role === 'DISPATCHER') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            to="/dispatch/new" 
            className="flex items-center gap-4 p-5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl text-white shadow-lg shadow-primary-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <div className="p-3 bg-white/20 rounded-lg">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">새 배차지시서 작성</h3>
              <p className="text-primary-100 text-sm mt-0.5">빠르게 새로운 배차를 등록하세요.</p>
            </div>
            <ArrowRight size={24} className="ml-auto opacity-70" />
          </Link>
        </div>
      )}
    </div>
  );
}
