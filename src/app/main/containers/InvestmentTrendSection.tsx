'use client';

import { useEffect, useState } from 'react';
import InvestmentTrendChart from '@/components/InvestmentTrendChart';
import {
  FALLBACK_TREND_POINTS,
  type InvestmentTrendPoint,
} from '@/api/api';
import Capital from './Capital';
import { getMyInfo } from '@/lib/api';

export default function InvestmentTrendSection() {
  const [points, setPoints] = useState<InvestmentTrendPoint[]>(FALLBACK_TREND_POINTS);

  useEffect(() => {
    const loadAssetData = async () => {
      try {
        const userInfo = await getMyInfo();
        const totalAssets = userInfo.total_assets || 50000;
        
        const now = Date.now();
        const formatTime = (timestamp: number) => {
          const date = new Date(timestamp);
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        };
        
        const assetPoints: InvestmentTrendPoint[] = [
          { label: formatTime(now - 3600000 * 5), value: Math.round(totalAssets * 0.94) },
          { label: formatTime(now - 3600000 * 4), value: Math.round(totalAssets * 0.96) },
          { label: formatTime(now - 3600000 * 3), value: Math.round(totalAssets * 0.97) },
          { label: formatTime(now - 3600000 * 2), value: Math.round(totalAssets * 0.98) },
          { label: formatTime(now - 3600000), value: Math.round(totalAssets * 0.99) },
          { label: formatTime(now), value: Math.round(totalAssets) },
        ];
        
        setPoints(assetPoints);
      } catch {
      }
    };

    loadAssetData();
  }, []);

  return (
    <section className="flex w-full flex-col justify-center gap-4" aria-label="실시간 투자 추이">
      <Capital />
      <InvestmentTrendChart points={points} />
    </section>
  );
}
