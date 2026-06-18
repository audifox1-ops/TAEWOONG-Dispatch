import { Link, useNavigate } from 'react-router-dom';
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { dispatchBatchFormSchema, type DispatchBatchFormData } from '../lib/schemas';
import { LOCATION_OPTIONS, ITEM_OPTIONS } from '../lib/constants';
import { useCreateDispatchBatch } from '../features/dispatch/dispatchHooks';

const DIRECT_INPUT = '직접입력';

function createEmptyRow(): DispatchBatchFormData['items'][number] {
  return {
    originSelect: '',
    originCustom: '',
    destinationSelect: '',
    destinationCustom: '',
    orderRefNo: '',
    itemSelect: '',
    itemCustom: '',
    weightTon: 0,
    quantity: 1,
    note: '',
  };
}

type BatchRowProps = {
  index: number;
  control: Control<DispatchBatchFormData>;
  register: UseFormRegister<DispatchBatchFormData>;
  errors: FieldErrors<DispatchBatchFormData>;
  canRemove: boolean;
  onRemove: () => void;
};

function BatchRow({ index, control, register, errors, canRemove, onRemove }: BatchRowProps) {
  const originSelect = useWatch({ control, name: `items.${index}.originSelect` });
  const destinationSelect = useWatch({ control, name: `items.${index}.destinationSelect` });
  const itemSelect = useWatch({ control, name: `items.${index}.itemSelect` });

  const originVisible = originSelect === DIRECT_INPUT;
  const destinationVisible = destinationSelect === DIRECT_INPUT;
  const itemVisible = itemSelect === DIRECT_INPUT;

  const rowError = errors.items?.[index];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{index + 1}번 배차</h3>
          <p className="text-xs text-slate-500">한 줄이 하나의 배차지시서로 저장됩니다.</p>
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove} className="btn-ghost text-red-600">
            <Trash2 size={16} />
            삭제
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <label className="form-label">
            출발지 <span className="text-red-500">*</span>
          </label>
          <select
            {...register(`items.${index}.originSelect`)}
            className={`form-select ${rowError?.originSelect ? 'form-input-error' : ''}`}
          >
            <option value="">선택해주세요</option>
            {LOCATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {originVisible && (
            <input
              type="text"
              {...register(`items.${index}.originCustom`)}
              className={`form-input ${rowError?.originCustom ? 'form-input-error' : ''}`}
              placeholder="출발지를 직접 입력"
            />
          )}
          {rowError?.originSelect && <p className="form-error">{rowError.originSelect.message}</p>}
          {rowError?.originCustom && <p className="form-error">{rowError.originCustom.message}</p>}
        </div>

        <div className="space-y-3">
          <label className="form-label">
            도착지 <span className="text-red-500">*</span>
          </label>
          <select
            {...register(`items.${index}.destinationSelect`)}
            className={`form-select ${rowError?.destinationSelect ? 'form-input-error' : ''}`}
          >
            <option value="">선택해주세요</option>
            {LOCATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {destinationVisible && (
            <input
              type="text"
              {...register(`items.${index}.destinationCustom`)}
              className={`form-input ${rowError?.destinationCustom ? 'form-input-error' : ''}`}
              placeholder="도착지를 직접 입력"
            />
          )}
          {rowError?.destinationSelect && <p className="form-error">{rowError.destinationSelect.message}</p>}
          {rowError?.destinationCustom && <p className="form-error">{rowError.destinationCustom.message}</p>}
        </div>

        <div className="space-y-3">
          <label className="form-label">
            수주번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register(`items.${index}.orderRefNo`)}
            className={`form-input ${rowError?.orderRefNo ? 'form-input-error' : ''}`}
            placeholder="예: ORD-2026-001"
          />
          {rowError?.orderRefNo && <p className="form-error">{rowError.orderRefNo.message}</p>}
        </div>

        <div className="space-y-3">
          <label className="form-label">
            품명 <span className="text-red-500">*</span>
          </label>
          <select
            {...register(`items.${index}.itemSelect`)}
            className={`form-select ${rowError?.itemSelect ? 'form-input-error' : ''}`}
          >
            <option value="">선택해주세요</option>
            {ITEM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {itemVisible && (
            <input
              type="text"
              {...register(`items.${index}.itemCustom`)}
              className={`form-input ${rowError?.itemCustom ? 'form-input-error' : ''}`}
              placeholder="품명을 직접 입력"
            />
          )}
          {rowError?.itemSelect && <p className="form-error">{rowError.itemSelect.message}</p>}
          {rowError?.itemCustom && <p className="form-error">{rowError.itemCustom.message}</p>}
        </div>

        <div className="space-y-3">
          <label className="form-label">
            중량 (TON) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            {...register(`items.${index}.weightTon`, { valueAsNumber: true })}
            className={`form-input ${rowError?.weightTon ? 'form-input-error' : ''}`}
            placeholder="0.0"
          />
          {rowError?.weightTon && <p className="form-error">{rowError.weightTon.message}</p>}
        </div>

        <div className="space-y-3">
          <label className="form-label">
            수량 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
            className={`form-input ${rowError?.quantity ? 'form-input-error' : ''}`}
            placeholder="1"
          />
          {rowError?.quantity && <p className="form-error">{rowError.quantity.message}</p>}
        </div>

        <div className="space-y-3 md:col-span-2">
          <label className="form-label">비고</label>
          <textarea
            {...register(`items.${index}.note`)}
            className="form-input min-h-[90px] resize-y"
            placeholder="추가 메모가 있으면 입력해주세요."
          />
        </div>
      </div>
    </div>
  );
}

export default function DispatchBatchFormPage() {
  const navigate = useNavigate();
  const createMutation = useCreateDispatchBatch();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DispatchBatchFormData>({
    resolver: zodResolver(dispatchBatchFormSchema),
    defaultValues: {
      dispatchDate: new Date().toISOString().slice(0, 10),
      items: [createEmptyRow()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = (data: DispatchBatchFormData) => {
    const payload = {
      dispatchDate: data.dispatchDate,
      items: data.items.map((item) => ({
        origin: item.originSelect === DIRECT_INPUT ? item.originCustom!.trim() : item.originSelect,
        destination:
          item.destinationSelect === DIRECT_INPUT ? item.destinationCustom!.trim() : item.destinationSelect,
        orderRefNo: item.orderRefNo,
        item: item.itemSelect === DIRECT_INPUT ? item.itemCustom!.trim() : item.itemSelect,
        weightTon: item.weightTon,
        quantity: item.quantity,
        note: item.note?.trim() || undefined,
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: () => navigate('/dispatch'),
    });
  };

  const isSaving = createMutation.isPending;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <Link to="/dispatch" className="btn-ghost p-2 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">배차지시서 일괄 등록</h1>
          <p className="text-slate-500 mt-1">하루 배차를 여러 건 입력한 뒤 한 번에 저장합니다.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card-body space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">
                  배차 날짜 <span className="text-red-500">*</span>
                </label>
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
                      calendarStartDay={0}
                      todayButton="오늘"
                      withPortal={false}
                      isClearable={false}
                      fixedHeight
                    />
                  )}
                />
                {errors.dispatchDate && <p className="form-error">{errors.dispatchDate.message}</p>}
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-700">입력 안내</p>
                <p className="mt-2 text-sm text-slate-500 leading-6">
                  같은 날짜를 기준으로 여러 건을 추가할 수 있습니다. 저장 버튼을 누르면 행 전체가 한 번에 서버에 저장됩니다.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">배차 목록</h2>
                  <p className="text-sm text-slate-500">최소 1건, 필요하면 10건 이상도 추가할 수 있습니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => append(createEmptyRow())}
                  className="btn-secondary"
                >
                  <Plus size={18} />
                  행 추가
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <BatchRow
                    key={field.id}
                    index={index}
                    control={control}
                    register={register}
                    errors={errors}
                    canRemove={fields.length > 1}
                    onRemove={() => remove(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-20 flex justify-end gap-3">
            <Link to="/dispatch" className="btn-secondary">
              등록 취소
            </Link>
            <button type="submit" disabled={isSaving} className="btn-primary min-w-[140px]">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin-slow" />
                  저장 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={18} />
                  한 번에 저장
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
