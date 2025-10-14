'use client';

import { useState } from 'react';

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
      <div className="mb-[13px]">
        <div
          className={`flex h-[45px] w-full items-center justify-center border bg-background px-[19px] transition-all ${
            investAmount
              ? 'rounded-[10px] border-border-card'
              : 'rounded-[5px]'
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
                ? 'text-[20px] text-accent-yellow'
                : 'text-[16px] text-white placeholder:text-text-secondary'
            }`}
          />
        </div>
      </div>

      {/* Investment Button */}
      <div className="flex justify-center">
        <button
          disabled={!isInvestButtonEnabled}
          onClick={handleInvest}
          className={`h-[50px] w-full rounded-[10px] font-pretendard text-[16px] font-semibold transition-colors ${
            isInvestButtonEnabled
              ? 'bg-accent-green text-[#282828] hover:opacity-90'
              : 'cursor-not-allowed bg-[#c4c4c4] text-white'
          }`}
        >
          투자하기
        </button>
      </div>
    </>
  );
}
