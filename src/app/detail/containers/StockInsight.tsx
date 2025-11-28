'use client';

import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import InvestmentTrendChart from '@/components/InvestmentTrendChart';
import type { InvestmentTrendPoint } from '@/api/api';
import { formatCurrency } from '@/utils/formatters';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

type StockInsightProps = {
  teamName: string;
  currentPrice: number;
  changeRate: number;
  totalInvestment: number;
  refreshSeconds: number;
  trendPoints: InvestmentTrendPoint[];
};

const percentFormatter = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

export default function StockInsight({
  teamName,
  currentPrice,
  changeRate,
  totalInvestment,
  refreshSeconds,
  trendPoints,
}: StockInsightProps) {
  const router = useRouter();

  const isPositiveChange = changeRate >= 0;
  const TrendIcon = isPositiveChange ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const changeColor = isPositiveChange ? '#efff8f' : '#f87171';

  return (
    <section className="flex flex-col gap-5 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
      <header className="flex ml-auto justify-between">
        <Header label={teamName} onBack={() => router.back()} />
        <p className="flex items-center gap-1 text-right text-sm text-text-secondary">
          주가 갱신까지{' '}
          <span className="font-semibold text-accent-yellow" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {refreshSeconds}초
          </span>
        </p>
      </header>

      <div className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-base font-medium text-text-secondary">현재 주가</p>
            <p className="text-[2rem] font-semibold leading-tight text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(currentPrice)}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
            style={{
              color: changeColor,
              borderColor: `${changeColor}66`,
              backgroundColor: `${changeColor}1A`,
            }}
          >
            <TrendIcon aria-hidden="true" className="h-3 w-3" strokeWidth={2} />
            {percentFormatter.format(changeRate)}%
          </span>
        </div>
        <div>
          <p className="text-base font-medium text-text-secondary">총 투자금</p>
          <p className="text-[1.5rem] font-semibold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(totalInvestment)}
          </p>
        </div>
      </div>

      <InvestmentTrendChart points={trendPoints} className="shadow-none" />
    </section>
  );
}

