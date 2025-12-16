'use client';

import { useEffect } from 'react';
import { initPostHog } from '@/lib/posthog';

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      initPostHog();
    } catch (error) {
      // 스토리지 접근 불가 컨텍스트에서 발생할 수 있는 에러 무시
    }
  }, []);

  return <>{children}</>;
}

