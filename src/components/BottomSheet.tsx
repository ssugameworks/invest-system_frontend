'use client';

import { useState, useEffect } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  totalInvestment?: string;
  pdfUrls?: string[];
  comments?: Array<{
    nickname: string;
    studentId: string;
    content: string;
  }>;
}

export default function BottomSheet({
  isOpen,
  onClose,
  totalInvestment = '₩23,450,000',
  pdfUrls = [],
  comments = [
    { nickname: '멋진 댕댕이', studentId: '202418XX', content: '이건 좀 괜찮은듯' },
    { nickname: '동작구 까불이', studentId: '202418XX', content: '음 좀 별론데' },
    { nickname: '상도동 콩콩이', studentId: '202418XX', content: '요호 좋은데 좋은데' },
  ],
}: BottomSheetProps) {
  const [investAmount, setInvestAmount] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleInvestAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setInvestAmount(value);
  };

  const isInvestButtonEnabled = investAmount.length > 0;

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-1/2 z-50 h-[624px] w-full max-w-[393px] -translate-x-1/2 rounded-tl-[40px] rounded-tr-[40px] border border-border-card bg-background-bottom-sheet transition-transform duration-300 ease-in-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle Bar */}
        <div className="absolute left-1/2 top-[9px] h-1 w-20 -translate-x-1/2 rounded-[100px] bg-white" />

        {/* Content */}
        <div className="h-full overflow-y-auto px-5 pb-5 scrollbar-hide">
          {/* Total Investment Section */}
          <div className="mb-8 mt-[53px]">
            <p className="mb-[3px] font-pretendard text-[18px] font-medium text-white">
              총 투자금
            </p>
            <p className="font-pretendard text-[32px] font-semibold text-accent-yellow" style={{ textShadow: '0 0 20px #efff8f' }}>
              {totalInvestment}
            </p>
          </div>

          {/* PDF Section */}
          <div className="mb-8">
            <p className="mb-2 font-pretendard text-[14px] font-light text-text-secondary">
              발표자료
            </p>
            <div className="flex gap-[3px]">
              {pdfUrls.length > 0 ? (
                pdfUrls.slice(0, 2).map((url, index) => (
                  <div
                    key={index}
                    className="h-[115px] w-[188px] overflow-hidden rounded-[5px] bg-background-placeholder"
                  >
                    <iframe
                      src={url}
                      className="h-full w-full"
                      title={`PDF ${index + 1}`}
                    />
                  </div>
                ))
              ) : (
                <>
                  <div className="h-[115px] w-[188px] rounded-[5px] bg-background-placeholder" />
                  <div className="h-[115px] w-[188px] rounded-[5px] bg-background-placeholder" />
                </>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-8">
            <div className="mb-2 flex w-full items-center justify-between font-pretendard text-[14px] text-text-secondary">
              <p className="font-light">실시간 댓글</p>
              <p className="font-medium">더보기 &gt;</p>
            </div>
            <div className="flex flex-col gap-[5px]">
              {comments.map((comment, index) => (
                <div
                  key={index}
                  className="flex h-[38px] w-full flex-col justify-center rounded-[5px] bg-black px-[14px] py-[2px]"
                >
                  <p className="mb-[2px] font-pretendard text-[10px] font-regular text-accent-yellow">
                    {comment.nickname} ({comment.studentId})
                  </p>
                  <p className="font-pretendard text-[12px] font-medium text-white">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Input */}
          <div className="mb-[13px]">
            <div
              className={`flex h-[45px] w-full items-center border bg-background px-[19px] transition-all ${
                investAmount
                  ? 'rounded-[10px] border-border-card'
                  : 'rounded-[5px] border-border-card'
              }`}
            >
              <input
                type="text"
                value={investAmount}
                onChange={handleInvestAmountChange}
                placeholder="투자할 금액을 입력해주세요"
                className={`w-full bg-transparent font-pretendard font-medium focus:outline-none ${
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
              className={`h-[50px] w-full rounded-[10px] font-pretendard text-[16px] font-semibold transition-colors ${
                isInvestButtonEnabled
                  ? 'bg-accent-green text-[#282828] hover:opacity-90'
                  : 'cursor-not-allowed bg-[#c4c4c4] text-white'
              }`}
            >
              투자하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
