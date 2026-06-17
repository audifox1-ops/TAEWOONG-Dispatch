import { useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import {
  ArrowLeft, Edit, Trash2, Printer, Download,
  CheckCircle2, Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../features/auth/authStore';
import {
  useDispatch,
  useDeleteDispatch,
  useUpdateDispatchStatus,
} from '../../features/dispatch/dispatchHooks';
import { downloadSingleExcel } from '../../features/dispatch/dispatchApi';
import { STATUS_CONFIG } from '../../lib/constants';
import type { DispatchStatus } from '../../lib/types';

export default function DispatchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: order, isLoading } = useDispatch(id || '');
  const deleteMutation = useDeleteDispatch();
  const statusMutation = useUpdateDispatchStatus(id || '');

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `배차지시서_${order?.dispatchNo}`,
  });

  const handleDelete = () => {
    if (window.confirm('정말 이 배차지시서를 삭제하시겠습니까?')) {
      deleteMutation.mutate(id || '', {
        onSuccess: () => navigate('/dispatch'),
      });
    }
  };

  const handleStatusChange = (status: DispatchStatus) => {
    statusMutation.mutate(status);
  };

  const handleExcelExport = async () => {
    if (!order) return;
    try {
      toast.loading('엑셀 파일을 생성 중입니다...', { id: 'excel-export' });
      await downloadSingleExcel(order.id, order.dispatchNo);
      toast.success('엑셀 다운로드가 완료되었습니다.', { id: 'excel-export' });
    } catch {
      toast.error('엑셀 다운로드에 실패했습니다.', { id: 'excel-export' });
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">불러오는 중...</div>;
  }

  if (!order) {
    return <div className="p-12 text-center text-slate-500">배차지시서를 찾을 수 없습니다.</div>;
  }

  const isEditable = user?.role === 'ADMIN' || (user?.role === 'DISPATCHER' && order.status !== 'COMPLETED' && order.status !== 'CANCELED');

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* 액션 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Link to="/dispatch" className="btn-ghost p-2 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">배차지시서 상세</h1>
              <span className={STATUS_CONFIG[order.status].badgeClass}>
                {STATUS_CONFIG[order.status].label}
              </span>
            </div>
            <p className="text-slate-500 font-mono text-sm mt-1">{order.dispatchNo}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditable && (
            <>
              <button onClick={() => handleStatusChange('IN_PROGRESS')} disabled={order.status === 'IN_PROGRESS'} className="btn-secondary btn-sm text-blue-600">
                <RefreshCw size={16} /> 진행 중 처리
              </button>
              <button onClick={() => handleStatusChange('COMPLETED')} disabled={order.status === 'COMPLETED'} className="btn-secondary btn-sm text-emerald-600">
                <CheckCircle2 size={16} /> 완료 처리
              </button>
              <button onClick={() => handleStatusChange('CANCELED')} disabled={order.status === 'CANCELED'} className="btn-secondary btn-sm text-slate-600">
                <AlertCircle size={16} /> 취소 처리
              </button>
              <span className="w-px h-6 bg-slate-200 mx-1"></span>
              <Link to={`/dispatch/${id}/edit`} className="btn-secondary btn-sm">
                <Edit size={16} /> 수정
              </Link>
              <button onClick={handleDelete} className="btn-danger btn-sm">
                <Trash2 size={16} /> 삭제
              </button>
            </>
          )}
          {(user?.role === 'ADMIN' || user?.role === 'DISPATCHER') && (
            <>
              <span className="w-px h-6 bg-slate-200 mx-1"></span>
              <button onClick={handleExcelExport} className="btn-secondary btn-sm">
                <Download size={16} /> 엑셀 다운로드
              </button>
              <button onClick={handlePrint} className="btn-primary btn-sm">
                <Printer size={16} /> 인쇄 / PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* 출력용 템플릿 영역 */}
      <div className="bg-slate-200 p-8 rounded-xl overflow-x-auto shadow-inner no-print flex justify-center">
        <div ref={printRef} className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-lg print:shadow-none print:p-0 print:w-full print:h-auto mx-auto font-sans">
          
          {/* 인쇄 헤더 */}
          <div className="text-center mb-10 pb-6 border-b-2 border-slate-800">
            <h1 className="text-4xl font-bold tracking-widest text-slate-900 mb-2">배 차 지 시 서</h1>
            <p className="text-slate-500 font-medium">DISPATCH ORDER</p>
          </div>

          <div className="flex justify-between items-end mb-6">
            <div className="space-y-1 text-sm font-medium">
              <p>배차일자 : <span className="ml-2 font-normal">{order.dispatchDate.slice(0, 10)}</span></p>
              <p>배차번호 : <span className="ml-2 font-mono font-normal">{order.dispatchNo}</span></p>
            </div>
            <div className="text-right text-sm">
              <table className="border-collapse text-center inline-table">
                <tbody>
                  <tr>
                    <td rowSpan={2} className="border border-slate-800 bg-slate-100 px-3 py-2 font-bold w-12 writing-vertical text-slate-800">결<br/>재</td>
                    <td className="border border-slate-800 bg-slate-50 px-6 py-1 text-xs">작 성</td>
                    <td className="border border-slate-800 bg-slate-50 px-6 py-1 text-xs">검 토</td>
                    <td className="border border-slate-800 bg-slate-50 px-6 py-1 text-xs">승 인</td>
                  </tr>
                  <tr className="h-16">
                    <td className="border border-slate-800 relative">
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">{order.createdBy.name}</span>
                    </td>
                    <td className="border border-slate-800"></td>
                    <td className="border border-slate-800"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 메인 정보 테이블 */}
          <table className="w-full border-collapse border-2 border-slate-800 text-sm mb-8">
            <tbody>
              <tr>
                <th className="border border-slate-800 bg-slate-100 py-3 px-4 w-1/4 text-left">수주번호</th>
                <td className="border border-slate-800 py-3 px-4 w-3/4 font-mono font-medium" colSpan={3}>{order.orderRefNo}</td>
              </tr>
              <tr>
                <th className="border border-slate-800 bg-slate-100 py-3 px-4 w-1/4 text-left">출 발 지</th>
                <td className="border border-slate-800 py-3 px-4 w-1/4 font-bold">{order.origin}</td>
                <th className="border border-slate-800 bg-slate-100 py-3 px-4 w-1/4 text-left">도 착 지</th>
                <td className="border border-slate-800 py-3 px-4 w-1/4 font-bold">{order.destination}</td>
              </tr>
              <tr>
                <th className="border border-slate-800 bg-slate-100 py-3 px-4 text-left">품 명</th>
                <td className="border border-slate-800 py-3 px-4 font-bold" colSpan={3}>{order.item}</td>
              </tr>
              <tr>
                <th className="border border-slate-800 bg-slate-100 py-3 px-4 text-left">중 량</th>
                <td className="border border-slate-800 py-3 px-4">{order.weightTon} TON</td>
                <th className="border border-slate-800 bg-slate-100 py-3 px-4 text-left">수 량</th>
                <td className="border border-slate-800 py-3 px-4">{order.quantity} EA</td>
              </tr>
              <tr>
                <th className="border border-slate-800 bg-slate-100 py-4 px-4 text-left align-top">비 고</th>
                <td className="border border-slate-800 py-4 px-4 whitespace-pre-wrap min-h-[100px] align-top" colSpan={3}>
                  {order.note || '특이사항 없음'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* 하단 푸터 */}
          <div className="mt-16 text-center text-slate-400 font-bold tracking-widest print:absolute print:bottom-8 print:w-full">
            <p>태 웅 (TAEWOONG)</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
