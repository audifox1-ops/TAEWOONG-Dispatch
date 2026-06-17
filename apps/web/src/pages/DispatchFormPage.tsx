import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Save, X, ArrowLeft } from 'lucide-react';
import { dispatchFormSchema, type DispatchFormData } from '../../lib/schemas';
import { LOCATION_OPTIONS, ITEM_OPTIONS } from '../../lib/constants';
import {
  useCreateDispatch,
  useUpdateDispatch,
  useDispatch,
} from '../../features/dispatch/dispatchHooks';

export default function DispatchFormPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const { data: existingData, isLoading: isLoadingData } = useDispatch(id || '');
  const createMutation = useCreateDispatch();
  const updateMutation = useUpdateDispatch(id || '');

  const [originCustomVisible, setOriginCustomVisible] = useState(false);
  const [destCustomVisible, setDestCustomVisible] = useState(false);
  const [itemCustomVisible, setItemCustomVisible] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DispatchFormData>({
    resolver: zodResolver(dispatchFormSchema),
    defaultValues: {
      dispatchDate: new Date().toISOString().slice(0, 10),
      originSelect: '',
      destinationSelect: '',
      itemSelect: '',
      quantity: 1,
    },
  });

  // 수정 모드일 때 데이터 세팅
  useEffect(() => {
    if (isEditMode && existingData) {
      setValue('dispatchDate', existingData.dispatchDate.slice(0, 10));
      setValue('orderRefNo', existingData.orderRefNo);
      setValue('weightTon', existingData.weightTon);
      setValue('quantity', existingData.quantity);
      if (existingData.note) setValue('note', existingData.note);

      // 출발지 처리
      if (LOCATION_OPTIONS.includes(existingData.origin as any)) {
        setValue('originSelect', existingData.origin);
      } else {
        setValue('originSelect', '직접입력');
        setValue('originCustom', existingData.origin);
        setOriginCustomVisible(true);
      }

      // 도착지 처리
      if (LOCATION_OPTIONS.includes(existingData.destination as any)) {
        setValue('destinationSelect', existingData.destination);
      } else {
        setValue('destinationSelect', '직접입력');
        setValue('destinationCustom', existingData.destination);
        setDestCustomVisible(true);
      }

      // 품명 처리
      if (ITEM_OPTIONS.includes(existingData.item as any)) {
        setValue('itemSelect', existingData.item);
      } else {
        setValue('itemSelect', '직접입력');
        setValue('itemCustom', existingData.item);
        setItemCustomVisible(true);
      }
    }
  }, [isEditMode, existingData, setValue]);

  // 직접입력 드롭다운 감지
  const originSelectValue = watch('originSelect');
  useEffect(() => {
    setOriginCustomVisible(originSelectValue === '직접입력');
  }, [originSelectValue]);

  const destSelectValue = watch('destinationSelect');
  useEffect(() => {
    setDestCustomVisible(destSelectValue === '직접입력');
  }, [destSelectValue]);

  const itemSelectValue = watch('itemSelect');
  useEffect(() => {
    setItemCustomVisible(itemSelectValue === '직접입력');
  }, [itemSelectValue]);

  const onSubmit = (data: DispatchFormData) => {
    const payload = {
      dispatchDate: data.dispatchDate,
      origin: data.originSelect === '직접입력' ? data.originCustom! : data.originSelect,
      destination: data.destinationSelect === '직접입력' ? data.destinationCustom! : data.destinationSelect,
      orderRefNo: data.orderRefNo,
      item: data.itemSelect === '직접입력' ? data.itemCustom! : data.itemSelect,
      weightTon: data.weightTon,
      quantity: data.quantity,
      note: data.note,
    };

    if (isEditMode) {
      updateMutation.mutate(payload, {
        onSuccess: () => navigate(`/dispatch/${id}`),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: (res) => navigate(`/dispatch/${res.id}`),
      });
    }
  };

  if (isEditMode && isLoadingData) {
    return <div className="p-8 text-center text-slate-500">데이터를 불러오는 중입니다...</div>;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <Link to="/dispatch" className="btn-ghost p-2 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditMode ? '배차지시서 수정' : '새 배차지시서 작성'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEditMode ? '기존 배차 정보를 수정합니다.' : '새로운 배차지시서를 등록합니다.'}
          </p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card-body space-y-8">
            {/* 섹션 1: 기본 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                1. 기본 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">배차 날짜 <span className="text-red-500">*</span></label>
                  <Controller
                    control={control}
                    name="dispatchDate"
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value ? new Date(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.toISOString().slice(0, 10) : '')}
                        dateFormat="yyyy-MM-dd"
                        className={`form-input ${errors.dispatchDate ? 'form-input-error' : ''}`}
                        placeholderText="YYYY-MM-DD"
                      />
                    )}
                  />
                  {errors.dispatchDate && <p className="form-error">{errors.dispatchDate.message}</p>}
                </div>

                <div>
                  <label className="form-label">수주번호 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    {...register('orderRefNo')}
                    className={`form-input ${errors.orderRefNo ? 'form-input-error' : ''}`}
                    placeholder="수주번호 입력 (예: ORD-2026-001)"
                  />
                  {errors.orderRefNo && <p className="form-error">{errors.orderRefNo.message}</p>}
                </div>
              </div>
            </div>

            {/* 섹션 2: 이동 경로 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                2. 이동 경로
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="form-label">출발지 <span className="text-red-500">*</span></label>
                  <select
                    {...register('originSelect')}
                    className={`form-select ${errors.originSelect ? 'form-input-error' : ''}`}
                  >
                    <option value="">선택하세요</option>
                    {LOCATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {originCustomVisible && (
                    <input
                      type="text"
                      {...register('originCustom')}
                      className={`form-input ${errors.originCustom ? 'form-input-error' : ''} animate-fade-in`}
                      placeholder="출발지 직접 입력"
                    />
                  )}
                  {errors.originSelect && <p className="form-error">{errors.originSelect.message}</p>}
                  {errors.originCustom && <p className="form-error">{errors.originCustom.message}</p>}
                </div>

                <div className="space-y-3">
                  <label className="form-label">도착지 <span className="text-red-500">*</span></label>
                  <select
                    {...register('destinationSelect')}
                    className={`form-select ${errors.destinationSelect ? 'form-input-error' : ''}`}
                  >
                    <option value="">선택하세요</option>
                    {LOCATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {destCustomVisible && (
                    <input
                      type="text"
                      {...register('destinationCustom')}
                      className={`form-input ${errors.destinationCustom ? 'form-input-error' : ''} animate-fade-in`}
                      placeholder="도착지 직접 입력"
                    />
                  )}
                  {errors.destinationSelect && <p className="form-error">{errors.destinationSelect.message}</p>}
                  {errors.destinationCustom && <p className="form-error">{errors.destinationCustom.message}</p>}
                </div>
              </div>
            </div>

            {/* 섹션 3: 품목 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                3. 품목 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 md:col-span-1">
                  <label className="form-label">품명 <span className="text-red-500">*</span></label>
                  <select
                    {...register('itemSelect')}
                    className={`form-select ${errors.itemSelect ? 'form-input-error' : ''}`}
                  >
                    <option value="">선택하세요</option>
                    {ITEM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {itemCustomVisible && (
                    <input
                      type="text"
                      {...register('itemCustom')}
                      className={`form-input ${errors.itemCustom ? 'form-input-error' : ''} animate-fade-in`}
                      placeholder="품명 직접 입력"
                    />
                  )}
                  {errors.itemSelect && <p className="form-error">{errors.itemSelect.message}</p>}
                  {errors.itemCustom && <p className="form-error">{errors.itemCustom.message}</p>}
                </div>

                <div>
                  <label className="form-label">중량 (TON) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      {...register('weightTon', { valueAsNumber: true })}
                      className={`form-input pr-12 ${errors.weightTon ? 'form-input-error' : ''}`}
                      placeholder="0.0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 sm:text-sm">TON</span>
                    </div>
                  </div>
                  {errors.weightTon && <p className="form-error">{errors.weightTon.message}</p>}
                </div>

                <div>
                  <label className="form-label">수량 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    {...register('quantity', { valueAsNumber: true })}
                    className={`form-input ${errors.quantity ? 'form-input-error' : ''}`}
                    min="1"
                  />
                  {errors.quantity && <p className="form-error">{errors.quantity.message}</p>}
                </div>
              </div>
            </div>

            {/* 섹션 4: 기타 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                4. 기타
              </h3>
              <div>
                <label className="form-label">비고</label>
                <textarea
                  {...register('note')}
                  className="form-input min-h-[100px] resize-y"
                  placeholder="특이사항이나 전달사항을 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 고정 액션 바 */}
          <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-20 flex justify-end gap-3">
            <Link to="/dispatch" className="btn-secondary">
              <X size={18} />
              취소
            </Link>
            <button type="submit" disabled={isSaving} className="btn-primary min-w-[120px]">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin-slow" />
                  저장 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={18} />
                  {isEditMode ? '수정 내용 저장' : '등록하기'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
