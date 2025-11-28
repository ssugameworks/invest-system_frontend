import { z } from 'zod';

/**
 * 회원가입 폼 검증 스키마
 * 백엔드 API와 매핑: studentId -> schoolNumber
 */
export const signUpSchema = z.object({
  studentId: z
    .string()
    .min(1, '학번을 입력해주세요')
    .regex(/^\d+$/, '학번은 숫자만 입력 가능합니다')
    .length(8, '학번은 8자리여야 합니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  department: z.string().min(1, '학부를 입력해주세요').optional().or(z.literal('')),
  phoneNumber: z
    .string()
    .min(1, '전화번호를 입력해주세요')
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)')
    .optional()
    .or(z.literal('')),
});

/**
 * 로그인 폼 검증 스키마
 */
export const signInSchema = z.object({
  studentId: z
    .string()
    .min(1, '학번을 입력해주세요')
    .regex(/^\d+$/, '학번은 숫자만 입력 가능합니다')
    .length(8, '학번은 8자리여야 합니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

/**
 * 회원가입 폼 데이터 타입
 */
export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * 로그인 폼 데이터 타입
 */
export type SignInFormData = z.infer<typeof signInSchema>;
