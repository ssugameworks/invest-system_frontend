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
        <div
          className={`flex h-11 w-full items-center justify-center border bg-background px-5 transition-all ${
            investAmount
              ? 'rounded-lg border-border-card'
              : 'rounded-md border-border-card'
          }`}
        >
          <input
            type="text"
            value={formatNumberWithCommas(investAmount)}
            onChange={handleInvestAmountChange}
            placeholder="투자할 금액을 입력해주세요"
            className={`w-full bg-transparent text-center font-pretendard font-medium placeholder:text-center focus:outline-none ${
              investAmount
                ? 'text-xl text-accent-yellow'
                : 'text-base text-white placeholder:text-text-secondary'
            }`}
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
