'use client';

import { Provider } from 'react-redux';
import { useLayoutEffect, useRef } from 'react';
import { store } from '@/store';
import { cookieManager } from '@/lib/cookies';
import { loginSuccess } from '@/store/slices/authSlice';

function AuthHydration({ children }: { children: React.ReactNode }) {
  const hasHydrated = useRef(false);

  // useLayoutEffect를 사용하여 DOM 업데이트 전에 동기적으로 실행
  // 이렇게 하면 새로고침 시에도 인증 상태가 즉시 복원됨
  useLayoutEffect(() => {
    if (hasHydrated.current) {
      return;
    }

    hasHydrated.current = true;

    // 클라이언트 사이드에서 쿠키로부터 인증 상태 복원
    // 스토리지 접근 에러를 방지하기 위해 try-catch로 감싸기
    try {
      const token = cookieManager.getToken();
      const user = cookieManager.getUserInfo();
      const isValid = cookieManager.isTokenValid();

      if (token && user && isValid) {
        store.dispatch(loginSuccess({ accessToken: token, user }));
      }
    } catch (error) {
      // 스토리지 접근 불가 컨텍스트에서 발생할 수 있는 에러 무시
    }
  }, []);

  return <>{children}</>;
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydration>{children}</AuthHydration>
    </Provider>
  );
}

