'use client';

import { useEffect, useState } from 'react';
import { getMyInfo, getMyPortfolio } from '@/lib/api';
import { formatCurrency } from '@/utils/formatters';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';

type CapitalProps = {
  className?: string;
};

const FALLBACK_CAPITAL_AMOUNT = 50_000;

export default function Capital({ className = '' }: CapitalProps) {
  const [cash, setCash] = useState(FALLBACK_CAPITAL_AMOUNT);
  const [stockValue, setStockValue] = useState(0);
  const [showTotal, setShowTotal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const loadCapitalData = async () => {
      try {
        // 보유 현금 가져오기
        const userInfo = await getMyInfo();
        if (Number.isFinite(userInfo.capital)) {
          setCash(userInfo.capital);
        }

        // 보유 주식 평가액 가져오기
        const portfolio = await getMyPortfolio();
        if (Number.isFinite(portfolio.current_value)) {
          setStockValue(portfolio.current_value);
        }
      } catch (error) {
        console.error('[Capital] 자산 데이터 로딩 실패', error);
      }
    };

    loadCapitalData();
  }, []);

  const toggleView = () => {
    setIsAnimating(true);
    setShowTotal(!showTotal);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const totalAssets = cash + stockValue;
  const displayAmount = showTotal ? totalAssets : cash;
  const label = showTotal ? '총 자산' : '보유 현금';

  return (
    <section
      className={`flex w-full flex-col items-left justify-center  text-start transform translate-y-[50px] z-100 ${className}`}
      aria-label={label}
      aria-live="polite"
      data-node-id="4377:2167"
    >
      <p
        className="font-pretendard text-lg font-medium text-text-secondary"
        data-node-id="4377:2168"
      >
        {label}
      </p>
      <div className="flex items-center gap-3">
        <p
          className={`font-pretendard text-3xl font-bold text-white transition-transform duration-300 ${
            isAnimating ? 'scale-95' : 'scale-100'
          }`}
          data-node-id="4377:2171"
          style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
        >
          {formatCurrency(displayAmount)}
        </p>
        <button
          onClick={toggleView}
          className="flex items-center justify-center p-1 rounded-lg hover:bg-white/10 transition-colors duration-200"
          aria-label={showTotal ? '보유 현금 보기' : '총 자산 보기'}
        >
          <ArrowPathRoundedSquareIcon 
            className="w-6 h-6 text-white/70 hover:text-white transition-colors"
          />
        </button>
      </div>
    </section>
  );
}

