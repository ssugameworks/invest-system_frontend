'use client';

import { useState } from 'react';
import InvestmentBottomSheet from '@/components/InvestmentBottomSheet';

export default function BottomSheetExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background p-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 font-pretendard text-[32px] font-bold text-white">
          ㅁㄴㅇㄹ
        </h1>

        <button
          onClick={() => setIsOpen(true)}
          className="mb-4 rounded-[15px] bg-accent-yellow px-6 py-3 font-pretendard text-[16px] font-semibold text-background transition-opacity hover:opacity-90"
        >
          열기
        </button>

        <div className="rounded-[15px] bg-background-card p-6">
          <h2 className="mb-4 font-pretendard text-[20px] font-semibold text-white">
            사용 방법
          </h2>
          <ul className="space-y-2 font-pretendard text-[14px] text-text-secondary">
            <li>• 위 버튼을 클릭하면 바텀 시트가 올라옵니다</li>
            <li>• 투자할 금액을 입력하면 투자하기 버튼이 활성화됩니다</li>
            <li>• 배경을 클릭하거나 아래로 드래그하면 닫힙니다</li>
            <li>• 부드러운 애니메이션이 적용됩니다</li>
          </ul>
        </div>
      </div>

      <InvestmentBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        totalInvestment="₩23,450,000"
        comments={[
          {
            nickname: '멋진 댕댕이',
            studentId: '202418XX',
            content: '이건 좀 괜찮은듯',
          },
          {
            nickname: '동작구 까불이',
            studentId: '202418XX',
            content: '음 좋음 별론데',
          },
          {
            nickname: '상도동 콩콩이',
            studentId: '202418XX',
            content: '요호 좋은데 좋은데',
          },
        ]}
      />
    </div>
  );
}
