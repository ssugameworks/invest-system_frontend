'use client';

import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/hooks/useQueries';
import { formatCurrency } from '@/utils/formatters';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';

type CapitalProps = {
  className?: string;
  initialCapital?: number;
};

function Capital({ className = '', initialCapital }: CapitalProps) {
  const router = useRouter();
  const [showTotal, setShowTotal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // React Query로 포트폴리오 데이터 가져오기 (캐싱 및 자동 업데이트)
  const { data: portfolio, isLoading } = usePortfolio();

  const cash = initialCapital ?? 0;
  const stockValue = portfolio?.current_value ?? 0;

  const toggleView = useCallback(() => {
    setIsAnimating(true);
    setShowTotal(prev => !prev);
    setTimeout(() => setIsAnimating(false), 500);
  }, []);

  const handleSell = useCallback(() => {
    router.push('/invest?filter=my');
  }, [router]);

  const handleBuy = useCallback(() => {
    router.push('/invest?filter=all');
  }, [router]);

  const totalAssets = cash + stockValue;
  const displayAmount = showTotal ? totalAssets : cash;
  const label = showTotal ? '총 자산' : '보유 현금';

  // 로딩 중이면 아무것도 표시하지 않음 (상위에서 스켈레톤 표시)
  if (isLoading && cash === 0) {
    return null;
  }

  return (
    <section
      className={`flex w-full flex-col gap-8 pt-2 ${className}`}
      aria-label={label}
      aria-live="polite"
    >
      {/* 자산 정보 영역 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-pretendard text-sm font-medium text-text-tertiary uppercase tracking-wider">
            {label}
          </p>
          <button
            onClick={toggleView}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent border border-white/10 text-xs font-medium text-text-secondary hover:border-accent-yellow/50 hover:text-accent-yellow transition-all"
          >
            <ArrowPathRoundedSquareIcon className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            {showTotal ? '현금만' : '전체'}
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          <p
            className={`font-pretendard text-[3rem] leading-none font-bold text-white tracking-tight transition-all duration-300 ${
              isAnimating ? 'opacity-50 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'
            }`}
            style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
          >
            {formatCurrency(displayAmount)}
          </p>
          
          {showTotal && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-xs text-text-tertiary">현금</span>
                <span className="text-sm font-semibold text-white">{formatCurrency(cash)}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-xs text-text-tertiary">주식</span>
                <span className="text-sm font-semibold text-accent-yellow">{formatCurrency(stockValue)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 영역 */}
      <div className="flex w-full gap-3">
        <button 
          className="group relative flex-1 min-w-0 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] py-4 text-base font-bold text-white border border-white/10 hover:border-white/20 hover:from-white/[0.12] hover:to-white/[0.04] transition-all duration-300 overflow-hidden"
          onClick={handleSell}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="relative">매도하기</span>
        </button>
        <button 
          className="group relative flex-1 min-w-0 rounded-2xl bg-gradient-to-br from-accent-yellow to-accent-yellow/80 py-4 text-base font-bold text-background-card hover:from-accent-yellow hover:to-accent-yellow transition-all duration-300 shadow-[0_0_20px_rgba(239,255,143,0.15)] hover:shadow-[0_0_30px_rgba(239,255,143,0.3)] overflow-hidden"
          onClick={handleBuy}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="relative">매수하기</span>
        </button>
      </div>
    </section>
  );
}

export default memo(Capital);
