import { z } from 'zod';

// ============ 로그인 스키마 ============
export const loginSchema = z.object({
  loginId: z.string().min(1, '로그인 ID를 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============ 배차지시서 작성 스키마 ============
export const dispatchFormSchema = z.object({
  dispatchDate: z.string().min(1, '배차 날짜를 선택해주세요.'),
  originSelect: z.string().min(1, '출발지를 선택해주세요.'),
  originCustom: z.string().optional(),
  destinationSelect: z.string().min(1, '도착지를 선택해주세요.'),
  destinationCustom: z.string().optional(),
  orderRefNo: z.string().min(1, '수주번호를 입력해주세요.'),
  itemSelect: z.string().min(1, '품명을 선택해주세요.'),
  itemCustom: z.string().optional(),
  weightTon: z
    .number({ invalid_type_error: '중량을 입력해주세요.' })
    .positive('중량은 0보다 커야 합니다.'),
  quantity: z
    .number({ invalid_type_error: '수량을 입력해주세요.' })
    .int('수량은 정수여야 합니다.')
    .min(1, '수량은 1 이상이어야 합니다.'),
  note: z.string().optional(),
}).superRefine((data, ctx) => {
  // 출발지 직접입력 검증
  if (data.originSelect === '직접입력' && !data.originCustom?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '출발지를 직접 입력해주세요.',
      path: ['originCustom'],
    });
  }
  // 도착지 직접입력 검증
  if (data.destinationSelect === '직접입력' && !data.destinationCustom?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '도착지를 직접 입력해주세요.',
      path: ['destinationCustom'],
    });
  }
  // 품명 직접입력 검증
  if (data.itemSelect === '직접입력' && !data.itemCustom?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '품명을 직접 입력해주세요.',
      path: ['itemCustom'],
    });
  }
});

export type DispatchFormData = z.infer<typeof dispatchFormSchema>;

// ============ 사용자 생성 스키마 ============
export const createUserSchema = z.object({
  loginId: z.string().min(3, '로그인 ID는 최소 3자 이상이어야 합니다.'),
  name: z.string().min(1, '이름을 입력해주세요.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, '영문자와 숫자를 포함해야 합니다.'),
  role: z.enum(['ADMIN', 'DISPATCHER', 'DRIVER']),
  phone: z.string().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
