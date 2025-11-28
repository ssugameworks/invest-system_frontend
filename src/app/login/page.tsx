'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { signUpSchema, type SignUpFormData } from '@/schemas/auth.schema';
import { checkUserExists } from '@/lib/api';

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, touchedFields },
    watch,
    clearErrors,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const studentId = watch('studentId');
  const password = watch('password');
  const department = watch('department');
  const phoneNumber = watch('phoneNumber');

  // React Query로 학번 체크
  const { data: userExists, isLoading: isCheckingUser } = useQuery({
    queryKey: ['checkUser', studentId],
    queryFn: () => checkUserExists(parseInt(studentId!, 10)),
    enabled: studentId?.length === 8, // 8자리 완성 시에만 실행
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });

  // 학번 체크 결과에 따라 로그인 모드 설정
  useEffect(() => {
    if (studentId?.length === 8 && userExists !== undefined) {
      setIsLoginMode(userExists);
      
      // 로그인 모드면 학부/전화번호 에러 제거
      if (userExists) {
        clearErrors(['department', 'phoneNumber']);
      }
    } else if (studentId?.length !== 8) {
      setIsLoginMode(null);
    }
  }, [studentId, userExists, clearErrors]);

  const isStudentIdValid = dirtyFields.studentId && !errors.studentId && studentId?.length === 8;
  const isPasswordValid = dirtyFields.password && !errors.password && password?.length >= 6;
  const isDepartmentValid = isLoginMode === false ? (dirtyFields.department && !errors.department && !!department?.length) : undefined;
  const isPhoneNumberValid = isLoginMode === false ? (dirtyFields.phoneNumber && !errors.phoneNumber && !!phoneNumber?.length) : undefined;

  // 로그인 모드일 때는 학번과 비밀번호만 체크
  const isFormValid = isLoginMode === true
    ? isStudentIdValid && isPasswordValid
    : isLoginMode === false
    ? isStudentIdValid && isPasswordValid && isDepartmentValid && isPhoneNumberValid
    : false;

  const showStudentIdError = touchedFields.studentId ? errors.studentId?.message : undefined;
  const showPasswordError = touchedFields.password ? errors.password?.message : undefined;
  const showDepartmentError = isLoginMode === false && touchedFields.department ? errors.department?.message : undefined;
  const showPhoneNumberError = isLoginMode === false && touchedFields.phoneNumber ? errors.phoneNumber?.message : undefined;

  const onSubmit = async (data: SignUpFormData) => {
    try {
      if (isLoginMode === true) {
        // 로그인
        const { useAuth } = await import('@/hooks/useAuth');
        const { store } = await import('@/store');
        const { loginSuccess } = await import('@/store/slices/authSlice');
        const { signIn } = await import('@/lib/api');
        
        const response = await signIn({
          schoolNumber: parseInt(data.studentId, 10),
          password: data.password,
        });
        
        // Redux store에 로그인 상태 저장 (쿠키 자동 저장)
        store.dispatch(loginSuccess({
          accessToken: response.accessToken,
          user: {
            id: response.userId,
            nickname: response.nickname,
            schoolNumber: parseInt(data.studentId, 10),
          },
        }));
        
        console.log('✅ 로그인 성공:', response.nickname);
        window.location.href = '/main';
      } else if (isLoginMode === false) {
        // 회원가입 - 학부와 전화번호 검증
        if (!data.department || !data.phoneNumber) {
          alert('학부와 전화번호를 모두 입력해주세요.');
          return;
        }
        
        const { store } = await import('@/store');
        const { loginSuccess } = await import('@/store/slices/authSlice');
        const { signUp } = await import('@/lib/api');
        
        const response = await signUp({
          schoolNumber: parseInt(data.studentId, 10),
          department: data.department,
          password: data.password,
          phoneNumber: data.phoneNumber,
        });
        
        // Redux store에 로그인 상태 저장 (쿠키 자동 저장)
        store.dispatch(loginSuccess({
          accessToken: response.accessToken,
        }));
        
        console.log('✅ 회원가입 성공 (초기 자본: 50,000원)');
        window.location.href = '/main';
      } else {
        alert('학번을 먼저 입력해주세요.');
      }
    } catch (error) {
      console.error('❌', isLoginMode ? '로그인 실패:' : '회원가입 실패:', error);
      alert(error instanceof Error ? error.message : (isLoginMode ? '로그인에 실패했습니다.' : '회원가입에 실패했습니다.'));
    }
  };

  return (
    <div className="relative w-full h-screen bg-background-card overflow-hidden">
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

      <form onSubmit={handleSubmit(onSubmit)} aria-label={isLoginMode ? '로그인 폼' : '회원가입 폼'}>
        {/* Input Fields */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[20.25rem] w-[19.6875rem] flex flex-col gap-4 sm:gap-5">
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
            autoComplete={isLoginMode ? 'current-password' : 'new-password'}
            aria-label="비밀번호를 입력하세요"
            aria-required="true"
            aria-invalid={!!showPasswordError}
            aria-describedby={showPasswordError ? 'password-error' : undefined}
            error={showPasswordError}
            isValid={isPasswordValid}
            {...register('password')}
          />

          <div 
            className={`transition-all duration-300 ease-in-out ${
              isLoginMode === true 
                ? 'opacity-0 max-h-0 overflow-hidden translate-y-[-10px]' 
                : 'opacity-100 max-h-[100px] translate-y-0'
            }`}
          >
            <TextField
              label="학부"
              type="text"
              autoComplete="organization"
              aria-label="학부를 입력하세요"
              aria-required={!isLoginMode}
              aria-invalid={!!showDepartmentError}
              aria-describedby={showDepartmentError ? 'department-error' : undefined}
              error={showDepartmentError}
              isValid={isDepartmentValid}
              {...register('department')}
            />
          </div>

          <div 
            className={`transition-all duration-300 ease-in-out ${
              isLoginMode === true 
                ? 'opacity-0 max-h-0 overflow-hidden translate-y-[-10px]' 
                : 'opacity-100 max-h-[100px] translate-y-0'
            }`}
          >
            <TextField
              label="전화번호"
              type="tel"
              inputMode="tel"
              placeholder="010-1234-5678"
              autoComplete="tel"
              aria-label="전화번호를 입력하세요"
              aria-required="true"
              aria-invalid={!!showPhoneNumberError}
              aria-describedby={showPhoneNumberError ? 'phoneNumber-error' : undefined}
              error={showPhoneNumberError}
              isValid={isPhoneNumberValid}
              {...register('phoneNumber')}
            />
          </div>
        </div>

        {/* Submit Button - 항상 하단 고정 */}
        <div className="absolute left-1/2 bottom-[2.5625rem] -translate-x-1/2 w-[21.25rem]">
          <Button
            type="submit"
            variant={isFormValid ? 'primary' : 'disabled'}
            disabled={!isFormValid}
            className="w-full h-[3.125rem] rounded-[0.625rem] text-16"
            aria-label={isFormValid ? (isLoginMode ? '로그인하기' : '회원가입하기') : '필수 항목을 모두 입력해주세요'}
          >
            {isLoginMode ? '로그인' : '회원가입'}
          </Button>
        </div>
      </form>
    </div>
  );
}
