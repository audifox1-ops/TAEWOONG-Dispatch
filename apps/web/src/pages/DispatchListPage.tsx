import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { Download, PlusCircle, Search, FilterX, Calendar, CalendarDays } from 'lucide-react';
import { useDispatches } from '../features/dispatch/dispatchHooks';
import {
  downloadListExcel,
  downloadListExcelByMonth,
  downloadListExcelByPeriod,
} from '../features/dispatch/dispatchApi';
import { useAuth } from '../features/auth/authStore';
import { STATUS_CONFIG } from '../lib/constants';
import type { DispatchOrder, DispatchQuery, DispatchStatus } from '../lib/types';
import toast from 'react-hot-toast';

export default function DispatchListPage() {
  const { user } = useAuth();
  
  // 상태 초기화
  const [query, setQuery] = useState<DispatchQuery>({
    page: 1,
    limit: 15,
  });
  const [searchInput, setSearchInput] = useState('');
  const [periodExport, setPeriodExport] = useState({
    dateFrom: '',
    dateTo: '',
  });
  const [monthExport, setMonthExport] = useState(new Date().toISOString().slice(0, 7));

  // 쿼리 페치
  const { data, isLoading } = useDispatches(query);

  // 테이블 컬럼 정의
  const columns = useMemo<ColumnDef<DispatchOrder>[]>(
    () => [
      {
        accessorKey: 'dispatchDate',
        header: '배차 날짜',
        cell: (info) => info.getValue<string>().slice(0, 10),
      },
      {
        accessorKey: 'dispatchNo',
        header: '배차번호',
        cell: (info) => (
          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'orderRefNo',
        header: '수주번호',
      },
      {
        accessorKey: 'origin',
        header: '출발지',
        cell: (info) => <span className="font-medium text-slate-700">{info.getValue<string>()}</span>,
      },
      {
        accessorKey: 'destination',
        header: '도착지',
        cell: (info) => <span className="font-medium text-slate-700">{info.getValue<string>()}</span>,
      },
      {
        accessorKey: 'item',
        header: '품명',
        cell: (info) => <span className="font-semibold text-slate-800">{info.getValue<string>()}</span>,
      },
      {
        accessorKey: 'weightTon',
        header: '중량(TON)',
        cell: (info) => `${info.getValue<number>()} t`,
      },
      {
        accessorKey: 'quantity',
        header: '수량',
      },
      {
        accessorKey: 'status',
        header: '상태',
        cell: (info) => {
          const status = info.getValue<DispatchStatus>();
          const config = STATUS_CONFIG[status];
          return (
            <span className={config.badgeClass}>
              {config.label}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '액션',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/dispatch/${info.row.original.id}`}
              className="text-primary-600 hover:text-primary-800 text-xs font-medium bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded transition-colors"
            >
              상세
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: data?.meta.totalPages || -1,
  });

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, q: searchInput, page: 1 }));
  };

  const getBaseExportQuery = () => {
    const { page, limit, dateFrom, dateTo, month, ...exportQuery } = query;
    return exportQuery;
  };

  // 현재 필터 기준 다운로드
  const handleExcelDownload = async () => {
    try {
      toast.loading('엑셀 파일을 생성 중입니다...', { id: 'excel-export' });
      const exportQuery = getBaseExportQuery();
      await downloadListExcel(exportQuery);
      toast.success('엑셀 다운로드가 완료되었습니다.', { id: 'excel-export' });
    } catch (error) {
      toast.error('엑셀 다운로드에 실패했습니다.', { id: 'excel-export' });
    }
  };

  const handlePeriodDownload = async () => {
    if (!periodExport.dateFrom || !periodExport.dateTo) {
      toast.error('기간 시작일과 종료일을 모두 선택해주세요.');
      return;
    }

    try {
      toast.loading('기간별 엑셀 파일을 생성 중입니다...', { id: 'excel-export' });
      const exportQuery = getBaseExportQuery();
      await downloadListExcelByPeriod({
        ...exportQuery,
        dateFrom: periodExport.dateFrom,
        dateTo: periodExport.dateTo,
      });
      toast.success('기간별 엑셀 다운로드가 완료되었습니다.', { id: 'excel-export' });
    } catch (error) {
      toast.error('기간별 엑셀 다운로드에 실패했습니다.', { id: 'excel-export' });
    }
  };

  const handleMonthDownload = async () => {
    if (!monthExport) {
      toast.error('다운로드할 월을 선택해주세요.');
      return;
    }

    try {
      toast.loading('월별 엑셀 파일을 생성 중입니다...', { id: 'excel-export' });
      const exportQuery = getBaseExportQuery();
      await downloadListExcelByMonth({
        ...exportQuery,
        month: monthExport,
      });
      toast.success('월별 엑셀 다운로드가 완료되었습니다.', { id: 'excel-export' });
    } catch (error) {
      toast.error('월별 엑셀 다운로드에 실패했습니다.', { id: 'excel-export' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">배차 현황</h1>
          <p className="text-slate-500 mt-1">배차지시서를 조회하고 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          {(user?.role === 'ADMIN' || user?.role === 'DISPATCHER') && (
            <>
              <button
                onClick={handleExcelDownload}
                className="btn-secondary"
              >
                <Download size={18} />
                현재 필터 다운로드
              </button>
              <Link to="/dispatch/new" className="btn-primary">
                <PlusCircle size={18} />
                새 배차 등록
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 필터바 */}
      <div className="filter-bar">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full relative">
              <label className="form-label text-xs">통합 검색</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  className="form-input pl-10"
                  placeholder="배차번호, 품명, 수주번호, 출발지..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <label className="form-label text-xs">상태</label>
              <select
                className="form-select"
                value={query.status || ''}
                onChange={(e) => setQuery((prev) => ({ ...prev, status: (e.target.value || undefined) as DispatchStatus, page: 1 }))}
              >
                <option value="">전체 상태</option>
                <option value="PENDING">대기</option>
                <option value="IN_PROGRESS">진행 중</option>
                <option value="COMPLETED">완료</option>
                <option value="CANCELED">취소</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">검색</button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setSearchInput('');
                  setQuery({ page: 1, limit: 15 });
                }}
              >
                <FilterX size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 테이블 */}
      <div className="card">
        <div className="card-body space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-slate-800">엑셀 다운로드</h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="space-y-3">
              <label className="form-label text-xs">기간별 다운로드</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="date"
                  className="form-input"
                  value={periodExport.dateFrom}
                  onChange={(e) => setPeriodExport((prev) => ({ ...prev, dateFrom: e.target.value }))}
                />
                <input
                  type="date"
                  className="form-input"
                  value={periodExport.dateTo}
                  onChange={(e) => setPeriodExport((prev) => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
              <button type="button" className="btn-secondary w-full justify-center" onClick={handlePeriodDownload}>
                <Download size={18} />
                기간별 다운로드
              </button>
            </div>

            <div className="space-y-3">
              <label className="form-label text-xs">월별 다운로드</label>
              <input
                type="month"
                className="form-input"
                value={monthExport}
                onChange={(e) => setMonthExport(e.target.value)}
              />
              <button type="button" className="btn-secondary w-full justify-center" onClick={handleMonthDownload}>
                <Download size={18} />
                월별 다운로드
              </button>
            </div>

            <div className="space-y-3">
              <label className="form-label text-xs">현재 목록 기준 다운로드</label>
              <p className="text-sm text-slate-500 leading-6">
                현재 검색 조건을 그대로 반영합니다. 기간별, 월별 다운로드는 별도 조건을 입력해서 받습니다.
              </p>
              <button type="button" className="btn-primary w-full justify-center" onClick={handleExcelDownload}>
                <Download size={18} />
                현재 필터 다운로드
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container bg-white">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
            <p>데이터를 불러오는 중입니다...</p>
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <>
            <table className="table">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* 페이지네이션 */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                총 <span className="font-semibold text-slate-800">{data.meta.total}</span>건 중 
                {' '}{(data.meta.page - 1) * data.meta.limit + 1}-
                {Math.min(data.meta.page * data.meta.limit, data.meta.total)} 표시
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => setQuery(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                  disabled={query.page === 1}
                >
                  이전
                </button>
                <span className="text-sm font-medium px-2">
                  {data.meta.page} / {data.meta.totalPages}
                </span>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => setQuery(prev => ({ ...prev, page: Math.min(data.meta.totalPages, (prev.page || 1) + 1) }))}
                  disabled={query.page === data.meta.totalPages}
                >
                  다음
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-700">검색 결과가 없습니다.</p>
            <p className="text-sm mt-1">필터 조건을 변경해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
