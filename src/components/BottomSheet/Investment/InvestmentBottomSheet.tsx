'use client';

import { useState, useRef } from 'react';
import BottomSheetBase from '../Base';
import CommentsSection from '../Comments/CommentsSection';
import InvestmentForm from './InvestmentForm';
import TotalInvestment from './TotalInvestment';
import PDFSection from './PDFSection';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { Comment } from '@/types/bottomSheet';

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
    { nickname: '숭구리 당당', studentId: '202432XX', content: '🤯' },
    { nickname: '화난 무지', studentId: '202432XX', content: '우앙' },
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
      ariaLabel="투자 정보 및 댓글"
    >
      {/* Investment Info - Hide when showing all comments */}
      {!showAllComments && (
        <>
          <TotalInvestment amount={totalInvestment} />
          <PDFSection
            pdfUrls={pdfUrls}
            currentIndex={currentPdfIndex}
            onScroll={handlePdfScroll}
            scrollRef={pdfScrollRef}
          />
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
