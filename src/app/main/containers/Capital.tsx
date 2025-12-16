'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyInfo, getMyPortfolio } from '@/lib/api';
import { formatCurrency } from '@/utils/formatters';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';

type CapitalProps = {
  className?: string;
  initialCapital?: number;
};

export default function Capital({ className = '', initialCapital }: CapitalProps) {
  const router = useRouter();
  const [cash, setCash] = useState<number | null>(initialCapital ?? null);
  const [stockValue, setStockValue] = useState<number | null>(null);
  const [showTotal, setShowTotal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCapitalData = async () => {
      try {
        // initialCapital이 없으면 API에서 가져오기
        if (initialCapital === undefined) {
          const userInfo = await getMyInfo();
          if (Number.isFinite(userInfo.capital)) {
            setCash(userInfo.capital);
          }
        }
        // initialCapital이 있으면 이미 useState에서 설정됨

        const portfolio = await getMyPortfolio();
        if (Number.isFinite(portfolio.current_value)) {
          setStockValue(portfolio.current_value);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    loadCapitalData();
  }, [initialCapital]);

  const toggleView = () => {
    setIsAnimating(true);
    setShowTotal(!showTotal);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const totalAssets = (cash ?? 0) + (stockValue ?? 0);
  const displayAmount = showTotal ? totalAssets : (cash ?? 0);
  const label = showTotal ? '총 자산' : '보유 현금';

  // cash가 없고 로딩 중이면 아무것도 표시하지 않음 (메인 페이지에서 스켈레톤 표시)
  if (isLoading && cash === null) {
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
                <span className="text-sm font-semibold text-white">{formatCurrency(cash ?? 0)}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-xs text-text-tertiary">주식</span>
                <span className="text-sm font-semibold text-accent-yellow">{formatCurrency(stockValue ?? 0)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 영역 */}
      <div className="flex w-full gap-3">
        <button 
          className="group relative flex-1 min-w-0 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] py-4 text-base font-bold text-white border border-white/10 hover:border-white/20 hover:from-white/[0.12] hover:to-white/[0.04] transition-all duration-300 overflow-hidden"
          onClick={() => router.push('/invest?filter=my')}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="relative">매도하기</span>
        </button>
        <button 
          className="group relative flex-1 min-w-0 rounded-2xl bg-gradient-to-br from-accent-yellow to-accent-yellow/80 py-4 text-base font-bold text-background-card hover:from-accent-yellow hover:to-accent-yellow transition-all duration-300 shadow-[0_0_20px_rgba(239,255,143,0.15)] hover:shadow-[0_0_30px_rgba(239,255,143,0.3)] overflow-hidden"
          onClick={() => router.push('/invest?filter=all')}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="relative">매수하기</span>
        </button>
      </div>
    </section>
  );
}
