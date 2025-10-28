'use client';

import { useState } from 'react';
import Button from '@/components/Button';

interface InvestmentFormProps {
  onInvest?: (amount: number) => void;
}

export default function InvestmentForm({ onInvest }: InvestmentFormProps) {
  const [investAmount, setInvestAmount] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleInvestAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setInvestAmount(value);
  };

  const formatNumberWithCommas = (value: string) => {
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
          className={`flex h-11 w-full items-center justify-center border bg-background px-5 transition-all ${
            investAmount
              ? 'rounded-lg border-border-card'
              : 'rounded-md'
          } ${
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
            className={`w-full bg-transparent text-center font-pretendard font-medium placeholder:text-center focus:outline-none ${
              investAmount
                ? 'text-xl text-accent-yellow'
                : 'text-base text-white placeholder:text-text-secondary'
            }`}
          />
        </div>
      </div>

      {/* Investment Button */}
      <div className="flex justify-center">
        <Button
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
