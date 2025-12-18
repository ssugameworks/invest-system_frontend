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
            // 마운트 시 refetch 비활성화 (캐시된 데이터 사용)
            refetchOnMount: false,
            // 재시도 1회
            retry: 1,
            // 재시도 간격 1초
            retryDelay: 1000,
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
