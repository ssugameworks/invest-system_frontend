'use client';

import { useMemo } from 'react';
import InvestmentTrendChart from '@/components/InvestmentTrendChart';
import {
  FALLBACK_TREND_POINTS,
  type InvestmentTrendPoint,
} from '@/api/api';
import Capital from './Capital';
import { useUser } from '@/hooks/useQueries';

// ⭐ 최적화: formatTime 함수를 컴포넌트 외부로 이동하여 재생성 방지
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export default function InvestmentTrendSection() {
  // ⭐ 최적화: React Query 사용 (캐싱 및 자동 업데이트)
  const { data: userInfo, isLoading } = useUser();

  // ⭐ 최적화: 메모이제이션으로 불필요한 재계산 방지
  const points = useMemo<InvestmentTrendPoint[]>(() => {
    if (!userInfo) return FALLBACK_TREND_POINTS;
    
    const totalAssets = userInfo.total_assets || 50000;
    const now = Date.now();
    
    return [
      { label: formatTime(now - 3600000 * 5), value: Math.round(totalAssets * 0.94) },
      { label: formatTime(now - 3600000 * 4), value: Math.round(totalAssets * 0.96) },
      { label: formatTime(now - 3600000 * 3), value: Math.round(totalAssets * 0.97) },
      { label: formatTime(now - 3600000 * 2), value: Math.round(totalAssets * 0.98) },
      { label: formatTime(now - 3600000), value: Math.round(totalAssets * 0.99) },
      { label: formatTime(now), value: Math.round(totalAssets) },
    ];
  }, [userInfo]);

  return (
    <section className="flex w-full flex-col justify-center gap-4" aria-label="실시간 투자 추이">
      <Capital />
      <InvestmentTrendChart points={points} />
    </section>
  );
}
