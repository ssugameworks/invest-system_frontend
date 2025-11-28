import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginSuccess, setUser, logout } from '@/store/slices/authSlice';
import { signIn as signInAPI, signUp as signUpAPI } from '@/lib/api';
import type { SignInRequest, SignUpRequest } from '@/lib/api/types';

/**
 * 🔒 인증 관련 Hook
 * Redux + Cookie를 사용한 안전한 상태 관리
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  /**
   * 로그인
   */
  const signIn = async (data: SignInRequest) => {
    try {
      const response = await signInAPI(data);
      
      // Redux store에 로그인 상태 저장 (+ 쿠키 자동 저장)
      dispatch(loginSuccess({
        accessToken: response.accessToken,
        user: {
          id: response.userId,
          nickname: response.nickname,
          schoolNumber: data.schoolNumber,
        },
      }));

      return response;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  };

  /**
   * 회원가입
   */
  const signUp = async (data: SignUpRequest) => {
    try {
      const response = await signUpAPI(data);
      
      // Redux store에 로그인 상태 저장 (+ 쿠키 자동 저장)
      dispatch(loginSuccess({
        accessToken: response.accessToken,
        user: {
          id: 0, // 회원가입 시에는 ID를 모르므로 나중에 업데이트
          nickname: '', // 나중에 getMyInfo로 업데이트
          schoolNumber: data.schoolNumber,
        },
      }));

      return response;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  };

  /**
   * 로그아웃
   */
  const handleLogout = () => {
    dispatch(logout());
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  /**
   * 사용자 정보 업데이트
   */
  const updateUser = (user: { id: number; nickname: string; schoolNumber: number }) => {
    dispatch(setUser(user));
  };

  return {
    // 상태
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    accessToken: authState.accessToken,
    
    // 메서드
    signIn,
    signUp,
    logout: handleLogout,
    updateUser,
  };
};

