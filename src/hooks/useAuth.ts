import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginSuccess, setUser, logout } from '@/store/slices/authSlice';
import { signIn as signInAPI, signUp as signUpAPI } from '@/lib/api';
import type { SignInRequest, SignUpRequest } from '@/lib/api/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const signIn = async (data: SignInRequest) => {
    try {
      const response = await signInAPI(data);
      
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
      throw error;
    }
  };

  const signUp = async (data: SignUpRequest) => {
    try {
      const response = await signUpAPI(data);
      
      dispatch(loginSuccess({
        accessToken: response.accessToken,
        user: {
          id: 0,
          nickname: '',
          schoolNumber: data.schoolNumber,
        },
      }));

      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const updateUser = (user: { id: number; nickname: string; schoolNumber: number }) => {
    dispatch(setUser(user));
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    accessToken: authState.accessToken,
    signIn,
    signUp,
    logout: handleLogout,
    updateUser,
  };
};

