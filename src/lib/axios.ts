import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { cookieManager } from './cookies';

// 환경 변수에서 백엔드 URL 가져오기
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CORS 인증 정보 포함 (쿠키 전송)
});

// 🔒 Request 인터셉터: 모든 요청에 토큰 자동 추가 (쿠키에서)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = cookieManager.getToken();

    // 쿠키에서 가져온 토큰을 Authorization 헤더에 추가
    if (token && cookieManager.isTokenValid()) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 개발 환경에서 요청 로깅 (민감 정보 제외)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        // data는 비밀번호 등이 포함될 수 있으므로 로깅 제외
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 🔒 Response 인터셉터: 에러 처리 및 자동 로그아웃
axiosInstance.interceptors.response.use(
  (response) => {
    // 개발 환경에서 응답 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        // 응답 데이터도 민감 정보가 있을 수 있으므로 로깅 최소화
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // 개발 환경에서 에러 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
      });
    }

    // 🔒 401 Unauthorized: 토큰 만료 또는 인증 실패
    if (error.response?.status === 401) {
      // 쿠키에서 토큰 삭제
      cookieManager.removeToken();

      // Redux store에서 로그아웃 (동적 import로 순환 참조 방지)
      if (typeof window !== 'undefined') {
        import('@/store').then(({ store }) => {
          import('@/store/slices/authSlice').then(({ logout }) => {
            store.dispatch(logout());
          });
        }).catch(err => console.error('Store import failed:', err));

        // 현재 경로가 로그인 페이지가 아니면 로그인 페이지로 이동
        if (!window.location.pathname.includes('/login')) {
          // 원래 페이지로 돌아올 수 있도록 리다이렉트 URL 저장
          const returnUrl = window.location.pathname;
          window.location.href = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
        }
      }
    }

    // 🔒 403 Forbidden: 권한 없음
    if (error.response?.status === 403) {
      console.error('⛔ 접근 권한이 없습니다.');
      
      // 권한 없음 페이지로 리다이렉트 (선택적)
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/403')) {
        // window.location.href = '/403';
      }
    }

    // 404 Not Found
    if (error.response?.status === 404) {
      console.error('❌ 요청한 리소스를 찾을 수 없습니다.');
    }

    // 🔒 500 Internal Server Error
    if (error.response?.status >= 500) {
      console.error('🔥 서버 에러가 발생했습니다.');
      
      // 운영 환경에서는 사용자에게 친절한 에러 메시지 표시
      if (process.env.NODE_ENV === 'production') {
        // Sentry 등 에러 트래킹 서비스에 보고
        // reportErrorToSentry(error);
      }
    }

    // 에러 메시지 추출 (안전하게)
    const errorMessage =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      '알 수 없는 오류가 발생했습니다.';

    return Promise.reject(new Error(errorMessage));
  },
);

export default axiosInstance;

