import Cookies from 'js-cookie';

// 🔒 보안 설정
const ACCESS_TOKEN_KEY = 'access_token';
const TOKEN_EXPIRES_DAYS = 1; // 1일 (보안 강화)

export const cookieManager = {
  /**
   * 🔒 액세스 토큰 저장 (보안 강화)
   */
  setToken: (token: string): void => {
    // 토큰 유효성 검증
    if (!token || typeof token !== 'string' || token.length < 10) {
      console.error('⚠️ Invalid token format');
      return;
    }

    Cookies.set(ACCESS_TOKEN_KEY, token, {
      expires: TOKEN_EXPIRES_DAYS, // 1일 (짧은 만료 시간으로 보안 강화)
      secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송 (운영 환경)
      sameSite: 'strict', // CSRF 공격 방지 (Strict 모드)
      path: '/', // 모든 경로에서 접근 가능
      // HttpOnly는 서버에서만 설정 가능 (XSS 공격 방지)
    });

    // 개발 환경에서만 로그
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Token saved to cookie (secure)');
    }
  },

  /**
   * 🔒 액세스 토큰 가져오기
   */
  getToken: (): string | undefined => {
    const token = Cookies.get(ACCESS_TOKEN_KEY);
    
    // 토큰이 없거나 유효하지 않으면 undefined 반환
    if (!token || token.length < 10) {
      return undefined;
    }

    return token;
  },

  /**
   * 🔒 액세스 토큰 삭제 (안전한 로그아웃)
   */
  removeToken: (): void => {
    Cookies.remove(ACCESS_TOKEN_KEY, {
      path: '/',
    });

    // 개발 환경에서만 로그
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Token removed from cookie');
    }
  },

  /**
   * 🔒 토큰 유효성 확인 (JWT 디코딩 및 만료 시간 확인)
   */
  isTokenValid: (): boolean => {
    const token = Cookies.get(ACCESS_TOKEN_KEY);
    
    if (!token || token.length < 10) {
      return false;
    }

    try {
      // JWT 토큰 디코딩 (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Payload 디코딩
      const payload = JSON.parse(atob(parts[1]));
      
      // 만료 시간 확인
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        const isExpired = now >= payload.exp;
        
        if (isExpired) {
          // 만료된 토큰은 자동 삭제
          cookieManager.removeToken();
          return false;
        }
      }

      return true;
    } catch (error) {
      // 디코딩 실패 시 유효하지 않은 토큰으로 간주
      console.error('⚠️ Token decode failed:', error);
      cookieManager.removeToken();
      return false;
    }
  },

  /**
   * 🔒 토큰 디코딩 (payload 정보 가져오기)
   */
  decodeToken: (): any | null => {
    const token = cookieManager.getToken();
    
    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('⚠️ Token decode failed:', error);
      return null;
    }
  },

  /**
   * 🔒 토큰 만료까지 남은 시간 (초)
   */
  getTokenExpiresIn: (): number | null => {
    const payload = cookieManager.decodeToken();
    
    if (!payload || !payload.exp) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = payload.exp - now;

    return expiresIn > 0 ? expiresIn : 0;
  },
};

