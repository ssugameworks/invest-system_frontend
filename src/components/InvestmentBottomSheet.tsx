'use client';

import { useState, useRef } from 'react';
import BottomSheetBase from './BottomSheetBase';
import CommentsSection from './CommentsSection';
import InvestmentForm from './InvestmentForm';
import { useBottomSheet } from '@/hooks/useBottomSheet';

interface Comment {
  nickname: string;
  studentId: string;
  content: string;
}

interface InvestmentBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  totalInvestment?: string;
  pdfUrls?: string[];
  comments?: Comment[];
  onInvest?: (amount: number) => void;
}

export default function InvestmentBottomSheet({
  isOpen,
  onClose,
  totalInvestment = '₩23,450,000',
  pdfUrls = [],
  comments = [
    { nickname: '멋진 댕댕이', studentId: '202418XX', content: '이건 좀 괜찮은듯' },
    { nickname: '동작구 까불이', studentId: '202418XX', content: '음 좀 별론데' },
    { nickname: '상도동 콩콩이', studentId: '202418XX', content: '요호 좋은데 좋은데' },
  ],
  onInvest,
}: InvestmentBottomSheetProps) {
  const { isAnimating, close } = useBottomSheet(isOpen);
  const [showAllComments, setShowAllComments] = useState(false);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const pdfScrollRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    close(onClose);
  };

  const handlePdfScroll = () => {
    if (pdfScrollRef.current && pdfUrls.length > 0) {
      const scrollLeft = pdfScrollRef.current.scrollLeft;
      const itemWidth = 188 + 3; // width + gap
      const index = Math.round(scrollLeft / itemWidth);
      setCurrentPdfIndex(index);
    }
  };

  return (
    <BottomSheetBase
      isOpen={isOpen}
      isAnimating={isAnimating}
      onClose={handleClose}
    >
      {/* Total Investment Section - Hide when showing all comments */}
      {!showAllComments && (
        <>
          <div className="mb-8 mt-[53px]">
            <p className="mb-[3px] font-pretendard text-[18px] font-medium text-white">
              총 투자금
            </p>
            <p
              className="font-pretendard text-[32px] font-semibold text-accent-yellow"
              style={{ textShadow: '0 0 20px #efff8f' }}
            >
              {totalInvestment}
            </p>
          </div>

          {/* PDF Section */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-pretendard text-[16px] font-light text-text-secondary">
                발표자료
              </p>
              {pdfUrls.length > 0 && (
                <p className="font-pretendard text-[12px] font-light text-text-secondary">
                  {currentPdfIndex + 1} / {pdfUrls.length}
                </p>
              )}
            </div>
            <div
              ref={pdfScrollRef}
              onScroll={handlePdfScroll}
              className="flex gap-[3px] overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            >
              {pdfUrls.length > 0 ? (
                pdfUrls.map((url, index) => (
                  <div
                    key={index}
                    className="h-[115px] w-[188px] flex-shrink-0 snap-start overflow-hidden rounded-[5px] bg-background-placeholder"
                  >
                    <iframe
                      src={url}
                      className="h-full w-full pointer-events-none"
                      title={`PDF ${index + 1}`}
                    />
                  </div>
                ))
              ) : (
                <>
                  <div className="h-[115px] w-[188px] flex-shrink-0 rounded-[5px] bg-background-placeholder" />
                  <div className="h-[115px] w-[188px] flex-shrink-0 rounded-[5px] bg-background-placeholder" />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Comments Section */}
      <CommentsSection
        comments={comments}
        showAll={showAllComments}
        onToggleShowAll={setShowAllComments}
      />

      {/* Investment Form - Only show when not showing all comments */}
      {!showAllComments && <InvestmentForm onInvest={onInvest} />}
    </BottomSheetBase>
  );
}
