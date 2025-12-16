import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { cookieManager } from './cookies';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = cookieManager.getToken();

      if (token && cookieManager.isTokenValid()) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // 스토리지 접근 불가 컨텍스트에서 발생할 수 있는 에러 무시
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        cookieManager.removeToken();
      } catch {
        // 스토리지 접근 불가 컨텍스트에서 발생할 수 있는 에러 무시
      }

      if (typeof window !== 'undefined') {
        import('@/store').then(({ store }) => {
          import('@/store/slices/authSlice').then(({ logout }) => {
            store.dispatch(logout());
          });
        }).catch(() => {});

        if (!window.location.pathname.includes('/login')) {
          const returnUrl = window.location.pathname;
          const isValidPath = returnUrl.startsWith('/') && !returnUrl.startsWith('//') && !returnUrl.includes('://');
          if (isValidPath) {
            window.location.href = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
          } else {
            window.location.href = '/login';
          }
        }
      }
    }

    if (error.response?.status === 403) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/403')) {
      }
    }

    const rawMessage = (error.response?.data as { message?: string })?.message || error.message;
    
    let errorMessage = '알 수 없는 오류가 발생했습니다.';
    if (rawMessage && typeof rawMessage === 'string') {
      const sanitized = rawMessage.trim().substring(0, 200);
      if (sanitized && !sanitized.includes('password') && !sanitized.includes('token') && !sanitized.includes('secret')) {
        errorMessage = sanitized;
      }
    }

    return Promise.reject(new Error(errorMessage));
  },
);

export default axiosInstance;

