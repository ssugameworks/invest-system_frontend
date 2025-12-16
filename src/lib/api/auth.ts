import axiosInstance from '../axios';
import { cookieManager } from '../cookies';
import type { SignUpRequest, SignUpResponse, SignInRequest, SignInResponse } from './types';

export const checkUserExists = async (schoolNumber: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.post<{ exists: boolean }>('/api/auth/check-user', {
      schoolNumber,
    });
    return response.data.exists;
  } catch {
    return false;
  }
};

export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await axiosInstance.post<SignUpResponse>('/api/auth/signup', data);
  return response.data;
};

export const signIn = async (data: SignInRequest): Promise<SignInResponse> => {
  const response = await axiosInstance.post<SignInResponse>('/api/auth/signin', data);
  return response.data;
};

export const logout = (): void => {
  cookieManager.removeToken();
  
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const isAuthenticated = (): boolean => {
  return cookieManager.isTokenValid();
};

