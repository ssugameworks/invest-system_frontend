'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { debounce } from '@/utils/debounce';
import { useCarouselDrag } from '@/hooks/useCarouselDrag';
import { CarouselStateTabs } from '@/components/carousel/CarouselStateTabs';
import { CarouselGroupSlide } from '@/components/carousel/CarouselGroupSlide';
import { getActiveState, useCarouselGroups, useStateGroupIndices } from '@/hooks/useCarouselGrouping';
import { CarouselCard, CarouselState } from '@/types/carousel';

// 캐러셀 설정 상수 (Tailwind 클래스와 동일하게 유지)
const CAROUSEL_GAP = 10; // gap-2.5 (0.625rem = 10px)와 동기화 필요
const SCROLL_DEBOUNCE_MS = 50;

export type { CarouselCard } from '@/types/carousel';

interface CarouselProps {
  cards: CarouselCard[];
  className?: string;
  onCardClick?: (cardId: number) => void;
}

export default function Carousel({ cards, className = '', onCardClick }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const dragHandlers = useCarouselDrag(containerRef);
  const groupedCards = useCarouselGroups(cards);
  const stateGroupIndices = useStateGroupIndices(groupedCards);
  const activeState = getActiveState(groupedCards, currentIndex);

  const scrollTo = (index: number) => {
    if (!containerRef.current || !groupedCards.length) return;
    const container = containerRef.current;
    const firstCard = container.querySelector('[data-carousel-item]') as HTMLElement;
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const clampedIndex = Math.max(0, Math.min(index, groupedCards.length - 1));

    container.scrollTo({
      left: clampedIndex * (cardWidth + CAROUSEL_GAP),
      behavior: 'smooth',
    });
    setCurrentIndex(clampedIndex);
  };

  const handleStateClick = (state: CarouselState) => {
    const targetIndex = stateGroupIndices[state];
    if (typeof targetIndex === 'number') {
      scrollTo(targetIndex);
    }
  };

  const debouncedHandleScroll = useMemo(
    () =>
      debounce(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const firstCard = container.querySelector('[data-carousel-item]') as HTMLElement;
        if (!firstCard) return;

        const cardWidth = firstCard.offsetWidth;
        const newIndex = Math.round(container.scrollLeft / (cardWidth + CAROUSEL_GAP));
        setCurrentIndex(newIndex);
      }, SCROLL_DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', debouncedHandleScroll);
    return () => container.removeEventListener('scroll', debouncedHandleScroll);
  }, [debouncedHandleScroll]);

  return (
    <div className={`w-full ${className}`}>
      <CarouselStateTabs
        activeState={activeState}
        stateGroupIndices={stateGroupIndices}
        onStateSelect={handleStateClick}
      />

      <div
        ref={containerRef}
        className="flex gap-2.5 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-4 md:px-0 py-3"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
        role="region"
        aria-label="투자 팀 캐러셀"
        aria-live="polite"
        onMouseDown={dragHandlers.handleMouseDown}
        onMouseMove={dragHandlers.handleMouseMove}
        onMouseUp={dragHandlers.handleMouseUp}
        onMouseLeave={dragHandlers.handleMouseUp}
        onTouchStart={dragHandlers.handleTouchStart}
        onTouchMove={dragHandlers.handleTouchMove}
        onTouchEnd={dragHandlers.handleTouchEnd}
      >
        {groupedCards.map((group) => (
          <CarouselGroupSlide key={group.id} group={group} onCardClick={onCardClick} />
        ))}
      </div>

      {groupedCards.length > 1 && (
        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="캐러셀 인디케이터">
          {groupedCards.map((group, index) => (
            <button
              key={group.id}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-gray-500 w-2'
              }`}
              role="tab"
              aria-label={`${group.items.map((item) => item.title).join(', ') || '그룹'} 슬라이드로 이동`}
              aria-selected={index === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );

}
