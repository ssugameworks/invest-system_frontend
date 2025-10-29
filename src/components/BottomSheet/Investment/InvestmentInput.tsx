'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { extractNumbers, formatNumberWithCommas } from '@/utils/formatters';

export default function InvestmentInput() {
  const [investAmount, setInvestAmount] = useState('');

  const handleInvestAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = extractNumbers(e.target.value);
    setInvestAmount(value);
  };

  const isInvestButtonEnabled = investAmount.length > 0;

  const handleInvest = () => {
    // TODO: 투자 로직 구현
    if (investAmount) {
      const amount = parseInt(investAmount, 10);
      // API 호출 등 투자 로직
    }
  };

  return (
    <>
      <div className="mb-3">
        <div className="flex h-11 w-full items-center justify-center rounded-md border border-border-card bg-background px-5 transition-all duration-200">
          <input
            type="text"
            value={formatNumberWithCommas(investAmount)}
            onChange={handleInvestAmountChange}
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
