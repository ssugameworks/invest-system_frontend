'use client';

import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import InvestmentTrendChart from '@/components/InvestmentTrendChart';
import AnimatedNumber from '@/components/AnimatedNumber';
import AnimatedPercent from '@/components/AnimatedPercent';
import type { InvestmentTrendPoint } from '@/api/api';
import { formatCurrency } from '@/utils/formatters';

type StockInsightProps = {
  currentPrice: number;
  changeRate: number;
  totalInvestment: number;
  refreshSeconds: number;
  trendPoints: InvestmentTrendPoint[];
  roi?: number; // ROI (수익률) - 선택적 prop
};

export default function StockInsight({
  currentPrice,
  changeRate,
  totalInvestment,
  refreshSeconds,
  trendPoints,
  roi,
}: StockInsightProps) {
  // ROI가 있으면 ROI 기준으로, 없으면 changeRate 기준으로 표시
  // ROI가 0이거나 음수, 양수 모두 표시 (null이나 undefined가 아닌 경우)
  // typeof 체크로 숫자 0도 포함하여 확인 (음수도 포함)
  // ROI가 있으면 항상 ROI를 우선 사용 (투자 내역이 없어도 초기 주가 기준 ROI가 계산됨)
  const hasROI = typeof roi === 'number' && !isNaN(roi) && isFinite(roi);
  const displayValue = hasROI ? roi : changeRate;
  
  // ROI가 0이어도 표시 (0은 유효한 값)
  const shouldDisplayROI = hasROI;
  const isPositiveChange = displayValue > 0; // 0은 양수로 처리하지 않음
  const isNegativeChange = displayValue < 0;
  const TrendIcon = isPositiveChange ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const changeColor = isPositiveChange ? '#efff8f' : (isNegativeChange ? '#f87171' : '#9ca3af'); // 0일 때는 회색

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

