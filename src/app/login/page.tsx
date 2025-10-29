'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import GameworksLogo from '@/assets/icons/gameworks-logo.svg';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields, touchedFields },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const formValues = watch();

  // 개별 필드 유효성 검사 (강조색 표시용)
  const isStudentIdValid = dirtyFields.studentId && !errors.studentId && formValues.studentId?.length === 8;
  const isPasswordValid = dirtyFields.password && !errors.password && formValues.password?.length > 0;

  // 에러는 blur된 필드만 표시 (UX 개선)
  const showStudentIdError = touchedFields.studentId ? errors.studentId?.message : undefined;
  const showPasswordError = touchedFields.password ? errors.password?.message : undefined;

  const onSubmit = (data: LoginFormData) => {
    console.log('로그인 데이터:', data);
    // TODO: 로그인 API 호출
  };

  return (
    <div className="relative w-full h-screen bg-background-card overflow-hidden">
      {/* GAMEWORKS Logo */}
      <div className="absolute left-7 top-9 flex items-center gap-1">
        <GameworksLogo className="w-[1.125rem] h-[1.0625rem]" />
        <p className="font-pretendard font-semibold text-14 text-white leading-none">
          GAMEWORKS
        </p>
      </div>

      {/* Title Section */}
      <div className="absolute left-1/2 top-36 -translate-x-1/2 w-[19.75rem] flex flex-col gap-2.5 items-center text-center">
        <h1 className="font-pretendard font-semibold text-[1.75rem] text-accent-yellow leading-normal animate-neon-glow">
          FLOW : Startup Bridge
        </h1>
        <p className="font-pretendard font-light text-18 text-text-secondary leading-normal">
          The more you explore, the smarter your
          <br />
          dashboard becomes
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} aria-label="로그인 폼">
        {/* Input Fields */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[20.25rem] w-[19.6875rem] flex flex-col gap-6">
          <TextField
            label="학번"
            type="text"
            inputMode="numeric"
            maxLength={8}
            autoComplete="username"
            aria-label="학번 8자리를 입력하세요"
            aria-required="true"
            aria-invalid={!!showStudentIdError}
            aria-describedby={showStudentIdError ? 'studentId-error' : undefined}
            error={showStudentIdError}
            isValid={isStudentIdValid}
            {...register('studentId')}
          />
          <TextField
            label="비밀번호"
            type="password"
            autoComplete="current-password"
            aria-label="비밀번호를 입력하세요"
            aria-required="true"
            aria-invalid={!!showPasswordError}
            aria-describedby={showPasswordError ? 'password-error' : undefined}
            error={showPasswordError}
            isValid={isPasswordValid}
            {...register('password')}
          />
        </div>

        {/* Submit Button */}
        <div className="absolute left-1/2 bottom-[2.5625rem] -translate-x-1/2 w-[21.25rem]">
          <Button
            type="submit"
            variant={isValid ? 'primary' : 'disabled'}
            disabled={!isValid}
            className="w-full h-[3.125rem] rounded-[0.625rem] text-16"
            aria-label={isValid ? '로그인하기' : '학번과 비밀번호를 모두 입력해주세요'}
          >
            투자시작하기
          </Button>
        </div>
      </form>
    </div>
  );
}
