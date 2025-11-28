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
        
        // 현재 총자산으로 그래프 포인트 생성 (임시 시뮬레이션)
        // TODO: 백엔드에 자산 히스토리 API 추가 시 실제 시계열 데이터로 대체
        const now = Date.now();
        const formatTime = (timestamp: number) => {
          const date = new Date(timestamp);
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        };
        
        // 6개 포인트로 그래프 생성 (가로축이 깔끔하게 보이도록)
        const assetPoints: InvestmentTrendPoint[] = [
          { label: formatTime(now - 3600000 * 5), value: Math.round(totalAssets * 0.94) },
          { label: formatTime(now - 3600000 * 4), value: Math.round(totalAssets * 0.96) },
          { label: formatTime(now - 3600000 * 3), value: Math.round(totalAssets * 0.97) },
          { label: formatTime(now - 3600000 * 2), value: Math.round(totalAssets * 0.98) },
          { label: formatTime(now - 3600000), value: Math.round(totalAssets * 0.99) },
          { label: formatTime(now), value: Math.round(totalAssets) },
        ];
        
        setPoints(assetPoints);
      } catch (error) {
        console.error('[InvestmentTrendSection] 자산 데이터 로딩 실패', error);
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

