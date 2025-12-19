'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import ServiceOpenModal from '@/components/ServiceOpenModal';
import { signUpSchema, type SignUpFormData } from '@/schemas/auth.schema';
import { checkUserExists } from '@/lib/api';
import { captureEvent, isPostHogReady, identifyUser } from '@/lib/posthog';
import { isServiceOpen, isAllowedUser } from '@/utils/serviceUtils';

function ModalHandler({ onShowModal }: { onShowModal: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const shouldShowModal = searchParams.get('showModal') === 'true';
    if (shouldShowModal) {
      onShowModal();
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('showModal');
      router.replace(newUrl.pathname, { scroll: false });
    }
    // ⭐ 최적화: onShowModal을 의존성에서 제거 (불필요한 재실행 방지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  return null;
}

function LoginPageContent() {
  const [isLoginMode, setIsLoginMode] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [signupStartTime, setSignupStartTime] = useState<number | null>(null);
  const [studentIdInputStartTime, setStudentIdInputStartTime] = useState<number | null>(null);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');
    const referrer = document.referrer;

    const urlFunnelStartTime = urlParams.get('funnel_start_time');
    if (urlFunnelStartTime && /^\d+$/.test(urlFunnelStartTime)) {
      try {
        localStorage.setItem('funnel_start_time', urlFunnelStartTime);
      } catch (error) {
        // localStorage 접근 불가 시 무시
      }
    }

    if (isPostHogReady()) {
      captureEvent('login_page_view', {
        referrer: referrer || 'direct',
        return_url: returnUrl || null,
        utm_source: urlParams.get('utm_source') || null,
        utm_medium: urlParams.get('utm_medium') || null,
        utm_campaign: urlParams.get('utm_campaign') || null,
        is_from_landing: referrer ? referrer.includes('gameworks') : false,
      });
    }
  }, []);

  const { data: userExists, isLoading: isCheckingUser } = useQuery({
    queryKey: ['checkUser', studentId],
    queryFn: async () => {
      const startTime = Date.now();
      const result = await checkUserExists(parseInt(studentId!, 10));
      const validationTime = Date.now() - startTime;

      if (isPostHogReady()) {
        captureEvent('student_id_validated', {
          user_exists: result,
          validation_time_ms: validationTime,
          student_id_length: studentId?.length || 0,
        });
      }

      return result;
    },
    enabled: studentId?.length === 8,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (studentId && studentId.length > 0 && !studentIdInputStartTime) {
      setStudentIdInputStartTime(Date.now());
      if (isPostHogReady()) {
        captureEvent('student_id_input_start', {
          input_length: studentId.length,
        });
      }
    }
  }, [studentId, studentIdInputStartTime]);

  useEffect(() => {
    if (studentId?.length === 8 && userExists !== undefined) {
      setIsLoginMode(userExists);
      
      if (userExists) {
        clearErrors(['department', 'phoneNumber']);
      } else {
        if (!signupStartTime) {
          setSignupStartTime(Date.now());
          if (isPostHogReady()) {
            captureEvent('signup_form_start', {
              student_id_last4: studentId?.slice(-4) || null,
            });
          }
        }
      }
    } else if (studentId?.length !== 8) {
      setIsLoginMode(null);
    }
  }, [studentId, userExists, clearErrors, signupStartTime]);

  const isStudentIdValid = dirtyFields.studentId && !errors.studentId && studentId?.length === 8;
  const isPasswordValid = dirtyFields.password && !errors.password && password?.length >= 6;
  const isDepartmentValid = isLoginMode === false ? (dirtyFields.department && !errors.department && !!department?.length) : undefined;
  const isPhoneNumberValid = isLoginMode === false ? (dirtyFields.phoneNumber && !errors.phoneNumber && !!phoneNumber?.length) : undefined;

  const isFormValid = isLoginMode === true
    ? isStudentIdValid && isPasswordValid
    : isLoginMode === false
    ? isStudentIdValid && isPasswordValid && isDepartmentValid && isPhoneNumberValid
    : false;

  useEffect(() => {
    if (isLoginMode === false && isPostHogReady()) {
      if (isDepartmentValid && department) {
        captureEvent('signup_field_completed', {
          field_name: 'department',
          is_valid: isDepartmentValid,
        });
      }
      if (isPhoneNumberValid && phoneNumber) {
        captureEvent('signup_field_completed', {
          field_name: 'phone_number',
          is_valid: isPhoneNumberValid,
        });
      }
    }
  }, [isLoginMode, isDepartmentValid, isPhoneNumberValid, department, phoneNumber]);

  const showStudentIdError = touchedFields.studentId ? errors.studentId?.message : undefined;
  const showPasswordError = touchedFields.password ? errors.password?.message : undefined;
  const showDepartmentError = isLoginMode === false && touchedFields.department ? errors.department?.message : undefined;
  const showPhoneNumberError = isLoginMode === false && touchedFields.phoneNumber ? errors.phoneNumber?.message : undefined;

  const onSubmit = async (data: SignUpFormData) => {
    try {
      if (isLoginMode === true) {
        const { useAuth } = await import('@/hooks/useAuth');
        const { store } = await import('@/store');
        const { loginSuccess } = await import('@/store/slices/authSlice');
        const { signIn } = await import('@/lib/api');
        
        const response = await signIn({
          schoolNumber: parseInt(data.studentId, 10),
          password: data.password,
        });
        
        store.dispatch(loginSuccess({
          accessToken: response.accessToken,
          user: {
            id: response.userId,
            nickname: response.nickname,
            schoolNumber: parseInt(data.studentId, 10),
          },
        }));
        
        // PostHog 사용자 식별
        if (isPostHogReady()) {
          identifyUser(response.userId, {
            nickname: response.nickname,
            schoolNumber: parseInt(data.studentId, 10),
            name: response.nickname,
          });
          
          captureEvent('login_complete', {
            user_id: response.userId,
            nickname: response.nickname,
            school_number: parseInt(data.studentId, 10),
          });
        }
        
        const schoolNumber = parseInt(data.studentId, 10);
        if (!isServiceOpen() && !isAllowedUser(schoolNumber)) {
          window.location.href = '/login?showModal=true';
        } else {
          window.location.href = '/main';
        }
      } else if (isLoginMode === false) {
        if (!data.department || !data.phoneNumber) {
          alert('학부와 전화번호를 모두 입력해주세요.');
          return;
        }
        
        const formCompletionTime = signupStartTime 
          ? Math.round((Date.now() - signupStartTime) / 1000) 
          : null;
        
        if (isPostHogReady()) {
          captureEvent('signup_form_submit', {
            form_completion_time_seconds: formCompletionTime,
            has_all_fields: !!(data.department && data.phoneNumber && data.studentId && data.password),
          });
        }

        const signupStartTimestamp = signupStartTime || Date.now();
        
        const { store } = await import('@/store');
        const { loginSuccess } = await import('@/store/slices/authSlice');
        const { signUp } = await import('@/lib/api');
        
        try {
          const response = await signUp({
            schoolNumber: parseInt(data.studentId, 10),
            department: data.department,
            password: data.password,
            phoneNumber: data.phoneNumber,
          });
          
          const signupDuration = Math.round((Date.now() - signupStartTimestamp) / 1000);
          let funnelStartTime: string | null = null;
          try {
            funnelStartTime = localStorage.getItem('funnel_start_time');
          } catch (error) {
            // localStorage 접근 불가 시 무시
          }
          
          store.dispatch(loginSuccess({
            accessToken: response.accessToken,
          }));
          
          if (isPostHogReady()) {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            try {
              const { getMyInfo } = await import('@/lib/api');
              const userInfo = await getMyInfo();
              
              identifyUser(userInfo.id, {
                name: userInfo.name,
                nickname: userInfo.name,
                schoolNumber: userInfo.schoolNumber,
                department: userInfo.department,
              });
              
              captureEvent('signup_complete', {
                signup_duration_seconds: signupDuration,
                total_funnel_duration_seconds: funnelStartTime 
                  ? Math.round((Date.now() - parseInt(funnelStartTime, 10)) / 1000) 
                  : null,
                school_number: userInfo.schoolNumber,
                user_id: userInfo.id,
              });
            } catch (error) {
              identifyUser(parseInt(data.studentId, 10), {
                schoolNumber: parseInt(data.studentId, 10),
                department: data.department,
              });
              
              captureEvent('signup_complete', {
                signup_duration_seconds: signupDuration,
                total_funnel_duration_seconds: funnelStartTime 
                  ? Math.round((Date.now() - parseInt(funnelStartTime, 10)) / 1000) 
                  : null,
                school_number: parseInt(data.studentId, 10),
                identify_fallback: true,
              });
            }
          }
          
          window.location.href = '/login?showModal=true';
        } catch (signupError) {
          if (isPostHogReady()) {
            captureEvent('signup_error', {
              error_type: signupError instanceof Error ? signupError.constructor.name : 'unknown',
              error_message: signupError instanceof Error ? signupError.message : 'Unknown error',
              failed_at_step: 'signup_submit',
            });
          }
          throw signupError;
        }
      } else {
        alert('학번을 먼저 입력해주세요.');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : (isLoginMode ? '로그인에 실패했습니다.' : '회원가입에 실패했습니다.'));
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <ModalHandler onShowModal={() => setShowModal(true)} />
      </Suspense>
      <ServiceOpenModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
      <div className="relative w-full h-screen bg-background-card overflow-hidden">
      <header className="absolute top-0 left-0 right-0 h-[50vh] sm:h-[55vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 space-y-3 sm:space-y-4"
        >
          <motion.p
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="text-accent-yellow text-xs sm:text-sm md:text-sm lg:text-xs font-mono tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-2 sm:mb-4"
          >
            2025.12.19 19:00 KST
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10vw] sm:text-[12vw] md:text-[6vw] lg:text-[5vw] xl:text-[4vw] 2xl:text-[3.5vw] leading-[0.9] font-pretendard font-bold uppercase text-white tracking-tighter relative z-20"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              FLOW : <br/>
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-transparent"
              style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)' }}
            >
              Startup
            </motion.span>
            {' '}
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-accent-yellow"
              style={{ textShadow: '0 0 30px rgba(239, 255, 143, 0.6)' }}
            >
              Bridge
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-base font-light text-text-secondary tracking-widest uppercase mt-4 sm:mt-8 relative z-20 px-2"
          >
                                                The Wave of Innovation

          </motion.p>
        </motion.div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} aria-label={isLoginMode ? '로그인 폼' : '회원가입 폼'}>
        <div className="absolute left-1/2 -translate-x-1/2 top-[42vh] sm:top-[47vh] w-[19.6875rem] flex flex-col gap-4 sm:gap-5">
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
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative w-full h-screen bg-background-card flex items-center justify-center">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
