'use client';

import { useState, useEffect } from 'react';
import { BottomSheetProps } from '@/types/bottomSheet';
import TotalInvestment from './TotalInvestment';
import PDFSection from './PDFSection';
import CommentsPreview from './CommentsPreview';
import AllComments from './AllComments';
import InvestmentInput from './InvestmentInput';

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
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

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
        className={`fixed bottom-0 left-1/2 z-50 h-[39rem] w-full max-w-[24.5rem] -translate-x-1/2 rounded-tl-[2.5rem] rounded-tr-[2.5rem] border border-border-card bg-background-bottom-sheet transition-transform duration-300 ease-in-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle Bar */}
        <div className="absolute left-1/2 top-2 h-1 w-20 -translate-x-1/2 rounded-full bg-white" />

        {/* Content */}
        <div className="relative h-full overflow-y-auto px-5 pb-5 scrollbar-hide">
          {!showAllComments ? (
            <>
              <TotalInvestment amount={totalInvestment} />
              <PDFSection pdfUrls={pdfUrls} />
              <CommentsPreview
                comments={comments}
                onShowAll={() => setShowAllComments(true)}
              />
              <InvestmentInput />
            </>
          ) : (
            <AllComments
              comments={comments}
              onBack={() => setShowAllComments(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}
