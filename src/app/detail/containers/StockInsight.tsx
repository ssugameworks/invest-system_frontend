'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import AnimatedNumber from '@/components/AnimatedNumber';
import AnimatedPercent from '@/components/AnimatedPercent';
import type { InvestmentTrendPoint } from '@/api/api';
import { formatCurrency } from '@/utils/formatters';
import { Skeleton } from '@/components/Skeleton';

// 차트 컴포넌트 동적 import (무거운 recharts 라이브러리 지연 로딩)
const InvestmentTrendChart = dynamic(
  () => import('@/components/InvestmentTrendChart'),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex w-full flex-col gap-4 overflow-hidden rounded-[1.5rem] bg-[#0D1525] border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        <div className="h-[154px] w-full px-4 pt-4">
          <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />
        </div>
        <div className="h-6 w-full px-4">
          <Skeleton variant="text" height={16} width="100%" animation="wave" />
        </div>
      </div>
    ),
  }
);

type StockInsightProps = {
  currentPrice: number;
  changeRate: number;
  totalInvestment: number;
  refreshSeconds: number;
  trendPoints: InvestmentTrendPoint[];
  roi?: number;
};

function StockInsight({
  currentPrice,
  changeRate,
  totalInvestment,
  refreshSeconds,
  trendPoints,
  roi,
}: StockInsightProps) {
  const hasROI = typeof roi === 'number' && !isNaN(roi) && isFinite(roi);
  const displayValue = hasROI ? roi : changeRate;
  
  const isPositiveChange = displayValue > 0;
  const isNegativeChange = displayValue < 0;
  const TrendIcon = isPositiveChange ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const changeColor = isPositiveChange ? '#efff8f' : (isNegativeChange ? '#f87171' : '#9ca3af');

  return (
    <section className="flex flex-col gap-5" style={{ position: 'relative', zIndex: 10 }}>
      <div className="flex items-center">
        <p className="ml-auto flex items-center gap-1 text-right text-sm text-text-secondary">
          주가 갱신까지{' '}
          <span className="font-semibold text-accent-yellow" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {refreshSeconds}초
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium text-text-secondary">현재 주가</p>
            <div className="flex items-baseline gap-2">
              <AnimatedNumber
                value={currentPrice}
                formatter={formatCurrency}
                className="text-[2rem] font-semibold leading-tight text-white"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              />
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
            style={{
              color: changeColor,
              borderColor: `${changeColor}66`,
              backgroundColor: `${changeColor}1A`,
            }}
          >
            {displayValue !== 0 && <TrendIcon aria-hidden="true" className="h-3 w-3" strokeWidth={2} />}
            <AnimatedPercent value={displayValue} />
          </span>
        </div>
        <div>
          <p className="text-base font-medium text-text-secondary">총 투자금</p>
          <AnimatedNumber
            value={totalInvestment}
            formatter={formatCurrency}
            className="text-[1.5rem] font-semibold text-white"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          />
        </div>
      </div>

      <InvestmentTrendChart points={trendPoints} className="shadow-none" changeRate={changeRate} />
    </section>
  );
}

// ⭐ 최적화: memo 제거 (trendPoints가 실시간으로 변경되므로 항상 리렌더링 필요)
export default StockInsight;
