'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { extractNumbers, formatNumberWithCommas } from '@/utils/formatters';

interface InvestmentFormProps {
  onInvest?: (amount: number) => void;
}

export default function InvestmentForm({ onInvest }: InvestmentFormProps) {
  const [investAmount, setInvestAmount] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleInvestAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = extractNumbers(e.target.value);
    setInvestAmount(value);
  };

  const handleInvest = () => {
    if (investAmount && onInvest) {
      onInvest(parseInt(investAmount, 10));
    }
  };

  const isInvestButtonEnabled = investAmount.length > 0;

  return (
    <>
      {/* Investment Input */}
      <div className="mb-3">
        <div
          className={`flex h-11 w-full items-center justify-center rounded-md border bg-background px-5 transition-all duration-200 ${
            isFocused && !investAmount
              ? 'border-border-focus'
              : 'border-border-card'
          }`}
        >
          <input
            type="text"
            value={formatNumberWithCommas(investAmount)}
            onChange={handleInvestAmountChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="투자할 금액을 입력해주세요"
            className={`w-full bg-transparent text-center font-pretendard font-medium placeholder:text-center placeholder:text-text-secondary placeholder:opacity-60 focus:outline-none transition-all duration-200 ${
              investAmount
                ? 'text-xl text-accent-yellow'
                : 'text-base text-white'
            }`}
            aria-label="투자 금액 입력"
          />
        </div>
      </div>

      {/* Investment Button */}
      <div className="flex justify-center">
        <Button
          variant="secondary"
          disabled={!isInvestButtonEnabled}
          onClick={handleInvest}
          className="w-full"
        >
          투자하기
        </Button>
      </div>
    </>
  );
}
