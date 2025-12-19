'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 기본 staleTime: 30초 (이전 60초에서 조정 - 실시간성 유지)
            staleTime: 30 * 1000,
            // 캐시 유지 시간: 5분
            gcTime: 5 * 60 * 1000,
            // 창 포커스 시 자동 refetch 비활성화 (불필요한 API 호출 방지)
            refetchOnWindowFocus: false,
            // 재연결 시 refetch 비활성화
            refetchOnReconnect: false,
            // ⭐ 최적화: 마운트 시 stale한 데이터만 refetch (캐시 활용)
            refetchOnMount: true, // staleTime 내 데이터는 자동으로 캐시 사용됨
            // 재시도 1회
            retry: 1,
            // 재시도 간격 1초
            retryDelay: 1000,
            // ⭐ 최적화: 네트워크 모드 설정 (오프라인 대응)
            networkMode: 'online',
          },
          mutations: {
            // mutation 재시도 비활성화
            retry: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
