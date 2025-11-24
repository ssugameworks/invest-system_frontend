import { z } from 'zod';

/**
 * 로그인 폼 검증 스키마
 */
export const loginSchema = z.object({
  studentId: z
    .string()
    .min(1, '학번을 입력해주세요')
    .regex(/^\d+$/, '학번은 숫자만 입력 가능합니다')
    .length(8, '학번은 8자리여야 합니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
  department: z.string().min(1, '학부를 입력해주세요'),
  phoneNumber: z
    .string()
    .min(1, '전화번호를 입력해주세요')
    .regex(/^\d+$/, '전화번호는 숫자만 입력 가능합니다')
    .length(11, '전화번호는 11자리 숫자여야 합니다'),
});

/**
 * 로그인 폼 데이터 타입
 */
export type LoginFormData = z.infer<typeof loginSchema>;
