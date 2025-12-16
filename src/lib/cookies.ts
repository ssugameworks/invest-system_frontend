import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'access_token';
const USER_INFO_KEY = 'user_info';
const TOKEN_EXPIRES_DAYS = 7;

export interface UserInfo {
  id: number;
  nickname: string;
  schoolNumber: number;
}

export const cookieManager = {
  setToken: (token: string): void => {
    if (typeof window === 'undefined') {
      return;
    }
    
    if (!token || typeof token !== 'string' || token.length < 10) {
      return;
    }

    try {
      // 스토리지 접근이 허용되지 않는 컨텍스트에서 발생할 수 있는 에러 방지
      Cookies.set(ACCESS_TOKEN_KEY, token, {
        expires: TOKEN_EXPIRES_DAYS,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // 'strict'에서 'lax'로 변경하여 새로고침 시에도 쿠키가 유지되도록 함
        path: '/',
      });
    } catch (error) {
      // 에러를 조용히 무시 (스토리지 접근 불가 컨텍스트 등)
    }
  },

  getToken: (): string | undefined => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    try {
      const token = Cookies.get(ACCESS_TOKEN_KEY);
      
      if (!token || token.length < 10) {
        return undefined;
      }

      return token;
    } catch (error) {
      // 에러를 조용히 무시 (스토리지 접근 불가 컨텍스트 등)
      return undefined;
    }
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      Cookies.remove(ACCESS_TOKEN_KEY, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    } catch (error) {
      // 에러를 조용히 무시 (스토리지 접근 불가 컨텍스트 등)
    }
  },

  setUserInfo: (user: UserInfo): void => {
    if (typeof window === 'undefined') {
      return;
    }
    
    if (!user || typeof user !== 'object') {
      return;
    }

    try {
      const userJson = JSON.stringify(user);
      Cookies.set(USER_INFO_KEY, userJson, {
        expires: TOKEN_EXPIRES_DAYS,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // 'strict'에서 'lax'로 변경하여 새로고침 시에도 쿠키가 유지되도록 함
        path: '/',
      });
    } catch (error) {
      // 에러를 조용히 무시 (스토리지 접근 불가 컨텍스트 등)
    }
  },

  getUserInfo: (): UserInfo | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const userJson = Cookies.get(USER_INFO_KEY);
      if (!userJson) {
        return null;
      }
      
      const user = JSON.parse(userJson) as UserInfo;
      if (!user || typeof user.id !== 'number' || typeof user.schoolNumber !== 'number') {
        return null;
      }
      
      return user;
    } catch (error) {
      // 에러를 조용히 무시 (스토리지 접근 불가 컨텍스트 등)
      return null;
    }
  },

  removeUserInfo: (): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      Cookies.remove(USER_INFO_KEY, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    } catch (error) {
      // 에러를 조용히 무시 (스토리지 접근 불가 컨텍스트 등)
    }
  },

  isTokenValid: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const token = Cookies.get(ACCESS_TOKEN_KEY);
      
      if (!token || token.length < 10) {
        return false;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      const payload = JSON.parse(atob(parts[1]));
      
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        const isExpired = now >= payload.exp;
        
        if (isExpired) {
          try {
            cookieManager.removeToken();
          } catch {
            // 에러 무시
          }
          return false;
        }
      }

      return true;
    } catch (error) {
      // 에러를 조용히 무시 (스토리지 접근 불가 컨텍스트 등)
      try {
        cookieManager.removeToken();
      } catch {
        // 에러 무시
      }
      return false;
    }
  },

  decodeToken: (): Record<string, unknown> | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const token = cookieManager.getToken();
      
      if (!token) {
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      // 에러를 조용히 무시 (스토리지 접근 불가 컨텍스트 등)
      return null;
    }
  },

  getTokenExpiresIn: (): number | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const payload = cookieManager.decodeToken();
      
      if (!payload || !payload.exp || typeof payload.exp !== 'number') {
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - now;

      return expiresIn > 0 ? expiresIn : 0;
    } catch (error) {
      // 에러를 조용히 무시 (스토리지 접근 불가 컨텍스트 등)
      return null;
    }
  },
};

