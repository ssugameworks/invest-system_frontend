'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { extractNumbers, formatCurrency, formatNumberWithCommas } from '@/utils/formatters';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { useInvest, useSell } from '@/hooks/useQueries';

type TradePanelProps = {
  teamId?: number;
  currentPrice: number;
  availableBudget: number;
  ownedShares?: number;
  ownedAmount?: number;
};

type TradeMode = 'buy' | 'sell' | null;

function TradePanel({ teamId, currentPrice, availableBudget, ownedShares = 0, ownedAmount = 0 }: TradePanelProps) {
  const router = useRouter();
  const [rawAmount, setRawAmount] = useState('');
  const [mode, setMode] = useState<TradeMode>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // React Query mutations 사용
  const investMutation = useInvest();
  const sellMutation = useSell();
  const isSubmitting = investMutation.isPending || sellMutation.isPending;

  const formattedBudget = formatCurrency(availableBudget);
  const formattedAmount = rawAmount ? formatNumberWithCommas(rawAmount) : '';
  const numericAmount = rawAmount ? Number(rawAmount) : 0;
  
  const buyAmount = mode === 'buy' ? Math.round(numericAmount * currentPrice) : 0;
  const exceedsBudget = mode === 'buy' && buyAmount > availableBudget;
  const exceedsShares = mode === 'sell' && numericAmount > ownedShares;
  const canTrade = Boolean(mode) && numericAmount > 0 && !exceedsBudget && !exceedsShares;

  const handleAmountChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRawAmount(extractNumbers(event.target.value).slice(0, 9));
  }, []);

  const handleSelectMode = useCallback((nextMode: TradeMode) => {
    setMode(nextMode);
    setRawAmount('');
  }, []);

  const handleSetMaxAmount = useCallback(() => {
    if (mode === 'sell' && ownedShares > 0) {
      setRawAmount(String(Math.round(ownedShares)));
    } else if (mode === 'buy' && availableBudget > 0 && currentPrice > 0) {
      const maxShares = Math.floor(availableBudget / currentPrice);
      setRawAmount(String(maxShares));
    }
  }, [mode, ownedShares, availableBudget, currentPrice]);

  const handleConfirmTrade = useCallback(async () => {
    if (!canTrade || !teamId) return;

    const shares = Math.round(numericAmount);
    const amount = Math.round(shares * currentPrice);

    try {
      if (mode === 'buy') {
        await investMutation.mutateAsync({ teamId, amount });
        sessionStorage.setItem('buySuccess', JSON.stringify({ shares, amount }));
        router.push('/main');
      } else {
        await sellMutation.mutateAsync({ teamId, amount });
        router.push('/main');
      }
    } catch (error) {
      // ⭐ 최적화: 에러 처리 개선
      const errorMessage = error instanceof Error ? error.message : '거래 실패';
      console.error('거래 실패:', error);
      alert(errorMessage);
    } finally {
      setMode(null);
      setRawAmount('');
    }
  }, [canTrade, teamId, numericAmount, currentPrice, mode, investMutation, sellMutation, router]);

  useEffect(() => {
    if (mode) {
      inputRef.current?.focus();
    }
  }, [mode]);

  const helperMessage = (() => {
    if (!mode) return '매수 또는 매도를 선택하세요';

    if (mode === 'buy') {
      const maxShares = currentPrice > 0 ? Math.floor(availableBudget / currentPrice) : 0;
      return exceedsBudget 
        ? '투자 가능 금액을 초과했어요' 
        : `최대 ${maxShares}주 구매 가능해요 (${formattedBudget})`;
    }

    return exceedsShares 
      ? '보유 수량을 초과했어요' 
      : `현재 ${Math.round(ownedShares)}주 보유 중이에요`;
  })();

  const helperClass =
    (mode === 'buy' && exceedsBudget) || (mode === 'sell' && exceedsShares)
      ? 'text-[#d34250]'
      : 'text-text-secondary';

  const placeholder = mode === 'sell' ? '몇 주 매도할까요?' : '몇 주 구매할까요?';
  const prefix = '주';

  return (
    <>
      <div aria-hidden="true" className="h-[12.5rem] w-full" />
      <section className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="flex w-full max-w-[448px] flex-col gap-4 rounded-[24px] border border-white/10 bg-[#151A29]/95 px-5 py-5 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-sm font-bold text-white">거래 수량</p>
            {mode && (
              <div className="mt-3 flex items-center gap-2">
                <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus-within:border-accent-yellow/50 focus-within:shadow-[0_0_15px_rgba(239,255,143,0.15)] transition-all">
                  <span className="text-sm font-medium text-text-tertiary">{prefix}</span>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={formattedAmount}
                    onChange={handleAmountChange}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-right text-lg font-bold tracking-wide placeholder:text-text-tertiary focus:outline-none"
                    aria-label="거래 수량 입력"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSetMaxAmount}
                  className="whitespace-nowrap rounded-xl border border-accent-yellow/40 bg-accent-yellow/15 px-4 py-3 text-xs font-bold text-accent-yellow hover:bg-accent-yellow/25 hover:scale-105 transition-all"
                  aria-label={mode === 'sell' ? '전체 매도' : '전체 매수'}
                >
                  {mode === 'sell' ? '전체 매도' : '전체 매수'}
                </button>
              </div>
            )}
            <p className={`mt-3 text-xs ${helperClass}`} aria-live="polite">
              {helperMessage}
            </p>
          </div>

          {!mode ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                size="md"
                variant="sell"
                className="h-12 rounded-xl px-0 text-base font-bold hover:scale-[1.02] transition-transform"
                onClick={() => handleSelectMode('sell')}
                aria-label="현재 팀 지분 매도하기"
              >
                매도하기
              </Button>
              <Button
                type="button"
                size="md"
                variant="buy"
                className="h-12 rounded-xl px-0 text-base font-bold hover:scale-[1.02] transition-transform shadow-[0_0_15px_rgba(239,255,143,0.2)]"
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
                disabled={!canTrade || isSubmitting}
                className="h-12 rounded-xl px-0 text-base font-bold"
                onClick={handleConfirmTrade}
              >
                {isSubmitting
                  ? '처리 중...'
                  : mode === 'buy'
                    ? '매수 확정'
                    : '매도 확정'}
              </Button>
              <button
                type="button"
                onClick={() => handleSelectMode(null)}
                disabled={isSubmitting}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/10 hover:scale-110 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent-yellow disabled:opacity-50"
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

export default memo(TradePanel);
