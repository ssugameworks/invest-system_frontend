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
});

/**
 * 로그인 폼 데이터 타입
 */
export type LoginFormData = z.infer<typeof loginSchema>;
