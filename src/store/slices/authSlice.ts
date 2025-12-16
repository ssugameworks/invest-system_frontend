import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { cookieManager, type UserInfo } from '@/lib/cookies';

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

// 서버 사이드에서는 항상 빈 상태로 시작
// 클라이언트 사이드에서 ReduxProvider의 AuthHydration이 쿠키를 읽어서 복원함
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; user?: User }>
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user || null;
      
      cookieManager.setToken(action.payload.accessToken);
      
      if (action.payload.user) {
        cookieManager.setUserInfo(action.payload.user);
      }
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      cookieManager.setUserInfo(action.payload);
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      
      cookieManager.removeToken();
      cookieManager.removeUserInfo();
    },

    refreshToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      cookieManager.setToken(action.payload);
    },
  },
});

export const { loginSuccess, setUser, logout, refreshToken } = authSlice.actions;
export default authSlice.reducer;

