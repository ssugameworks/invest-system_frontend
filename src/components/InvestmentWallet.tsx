'use client';

import React from 'react';
import SendIcon from '@/assets/icons/send.svg';

interface InvestmentWalletProps {
  balance: string;
  userName?: string;
  profitRate?: string;
  rank?: number;
  onInvestClick?: () => void;
  className?: string;
}

export default function InvestmentWallet({
  balance = '₩50,000',
  userName = '사용자',
  profitRate = '+30%',
  rank = 31,
  onInvestClick,
  className = '',
}: InvestmentWalletProps) {
  return (
    <div
      className={`w-full max-w-[352px] rounded-[20px] bg-gradient-to-r from-[#E7FA4F] to-[#83F055] py-[30px] px-5 ${className}`}
      style={{ minHeight: '215px' }}
    >
      {/* Top Section: Balance and Send Icon */}
      <div className="mb-2.5">
        <div className="flex items-end justify-between gap-4">
          {/* Balance Info */}
          <div className="flex flex-col gap-0.5">
            <div className="text-[#282828] text-lg font-medium leading-tight">
              내 자금
            </div>
            <div className="text-black text-[32px] font-bold leading-tight">
              {balance}
            </div>
          </div>

          {/* Send Icon - aligned with balance */}
          <div className="w-[32px] h-[32px] flex-shrink-0 mb-1">
            <SendIcon className="w-full h-full text-[#000000]" style={{ display: 'block' }} />
          </div>
        </div>
      </div>

      {/* Profit Rate Text */}
      <div className="mb-4 text-[#282828] text-xs font-light leading-tight">
        {userName} 님이 투자한 팀의 총 수익률 <span className="font-bold">{profitRate}</span>
        <br />
        수익률로 현재 <span className="font-bold">{rank}위</span>입니다.
      </div>

      {/* Invest Button */}
      <button
        onClick={onInvestClick}
        className="relative w-full h-[40px] rounded-[15px] flex items-center justify-center text-[#282828] text-sm font-semibold overflow-hidden transition-transform active:scale-98"
        style={{
          background: 'linear-gradient(180deg, rgba(252, 255, 245, 0.2) 0%, rgba(234, 255, 132, 0.2) 100%)',
          border: '1px solid transparent',
          backgroundClip: 'padding-box',
        }}
      >
        <div
          className="absolute inset-0 rounded-[15px] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(170, 188, 90, 0.6) 0%, rgba(185, 200, 121, 0.5) 100%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />
        <span className="relative z-10">투자시작하기</span>
      </button>
    </div>
  );
}
