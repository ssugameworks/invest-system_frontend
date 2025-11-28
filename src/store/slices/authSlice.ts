import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { cookieManager } from '@/lib/cookies';

interface User {
  id: number;
  nickname: string;
  schoolNumber: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
}

// 초기 상태 - 쿠키에서 토큰 확인
const initialState: AuthState = {
  isAuthenticated: cookieManager.isTokenValid(),
  user: null,
  accessToken: cookieManager.getToken() || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 로그인 성공
    loginSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; user?: User }>
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user || null;
      
      // 쿠키에 토큰 저장
      cookieManager.setToken(action.payload.accessToken);
    },

    // 사용자 정보 설정
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    // 로그아웃
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      
      // 쿠키에서 토큰 삭제
      cookieManager.removeToken();
    },

    // 토큰 갱신
    refreshToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      cookieManager.setToken(action.payload);
    },
  },
});

export const { loginSuccess, setUser, logout, refreshToken } = authSlice.actions;
export default authSlice.reducer;

