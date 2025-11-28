'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/Button';
import { extractNumbers, formatCurrency, formatNumberWithCommas } from '@/utils/formatters';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

type TradePanelProps = {
  availableBudget: number;
  ownedShares?: number;
};

type TradeMode = 'buy' | 'sell' | null;

export default function TradePanel({ availableBudget, ownedShares = 0 }: TradePanelProps) {
  const [rawAmount, setRawAmount] = useState('');
  const [mode, setMode] = useState<TradeMode>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedBudget = formatCurrency(availableBudget);
  const formattedAmount = rawAmount ? formatNumberWithCommas(rawAmount) : '';
  const numericAmount = rawAmount ? Number(rawAmount) : 0;
  const exceedsBudget = mode === 'buy' && numericAmount > availableBudget;
  const exceedsShares = mode === 'sell' && numericAmount > ownedShares;
  const canTrade = Boolean(mode) && numericAmount > 0 && !exceedsBudget && !exceedsShares;

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRawAmount(extractNumbers(event.target.value).slice(0, 9));
  };

  const handleSelectMode = (nextMode: TradeMode) => {
    setMode(nextMode);
    setRawAmount('');
  };

  useEffect(() => {
    if (mode) {
      inputRef.current?.focus();
    }
  }, [mode]);

  const helperMessage = (() => {
    if (!mode) {
      return '매수 또는 매도를 선택하세요';
    }

    if (mode === 'buy') {
      return exceedsBudget ? '투자 가능 금액을 초과했어요' : `현재 ${formattedBudget} 투자 가능해요`;
    }

    return exceedsShares ? '보유 수량을 초과했어요' : `현재 ${ownedShares.toLocaleString()}주 보유 중이에요`;
  })();

  const helperClass =
    (mode === 'buy' && exceedsBudget) || (mode === 'sell' && exceedsShares)
      ? 'text-[#d34250]'
      : 'text-text-secondary';

  const placeholder = mode === 'sell' ? '얼마나 매도할까요?' : '얼마나 구매할까요?';
  const prefix = mode === 'sell' ? '주' : '₩';

  return (
    <>
      <div aria-hidden="true" className="h-[12.5rem] w-full" />
      <section className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="flex w-full max-w-[24.5625rem] flex-col gap-4 rounded-2xl border border-white/10 bg-[rgba(5,13,24,0.65)] px-4 py-5 shadow-[0_-20px_45px_rgba(0,0,0,0.7)] backdrop-blur-[20px]">
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-black/30 to-[#1e222d] px-4 py-4">
            <p className="text-xs font-semibold text-white">수량</p>
            {mode && (
              <label className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white focus-within:border-accent-yellow/60">
                <span className="text-sm text-text-secondary">{prefix}</span>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={formattedAmount}
                  onChange={handleAmountChange}
                  placeholder={placeholder}
                  className="w-full bg-transparent text-right text-lg font-semibold tracking-wide placeholder:text-text-secondary focus:outline-none"
                  aria-label="거래 수량 입력"
                />
              </label>
            )}
            <p className={`mt-2 text-sm ${helperClass}`} aria-live="polite">
              {helperMessage}
            </p>
          </div>

          {!mode ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                size="md"
                variant="sell"
                className="h-11 rounded-[0.625rem] px-0 text-base"
                onClick={() => handleSelectMode('sell')}
                aria-label="현재 팀 지분 매도하기"
              >
                매도하기
              </Button>
              <Button
                type="button"
                size="md"
                variant="buy"
                className="h-11 rounded-[0.625rem] px-0 text-base"
                onClick={() => handleSelectMode('buy')}
                aria-label="현재 팀 지분 매수하기"
              >
                매수하기
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Button
                type="button"
                variant={canTrade ? 'primary' : 'disabled'}
                size="md"
                disabled={!canTrade}
                className="h-11 rounded-[0.625rem] px-0 text-base"
              >
                {mode === 'buy' ? '매수 확정' : '매도 확정'}
              </Button>
              <button
                type="button"
                onClick={() => handleSelectMode(null)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent-yellow"
                aria-label="되돌아가기"
              >
                <ArrowUturnLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

