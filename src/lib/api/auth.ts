import axiosInstance from '../axios';
import { cookieManager } from '../cookies';
import type { SignUpRequest, SignUpResponse, SignInRequest, SignInResponse } from './types';

/**
 * 학번 존재 여부 확인 API
 * POST /api/auth/check-user
 */
export const checkUserExists = async (schoolNumber: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.post<{ exists: boolean }>('/api/auth/check-user', {
      schoolNumber,
    });
    return response.data.exists;
  } catch (error) {
    console.error('학번 체크 실패:', error);
    return false;
  }
};

/**
 * 회원가입 API
 * POST /api/auth/signup
 * Redux action과 함께 사용
 */
export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await axiosInstance.post<SignUpResponse>('/api/auth/signup', data);
  return response.data;
};

/**
 * 로그인 API
 * POST /api/auth/signin
 * Redux action과 함께 사용
 */
export const signIn = async (data: SignInRequest): Promise<SignInResponse> => {
  const response = await axiosInstance.post<SignInResponse>('/api/auth/signin', data);
  return response.data;
};

/**
 * 로그아웃
 * Redux action과 함께 사용
 */
export const logout = (): void => {
  cookieManager.removeToken();
  
  // 로그인 페이지로 이동
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * 현재 로그인 상태 확인
 */
export const isAuthenticated = (): boolean => {
  return cookieManager.isTokenValid();
};

