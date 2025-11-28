'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { debounce } from '@/utils/debounce';
import { useCarouselDrag } from '@/hooks/useCarouselDrag';
import { CarouselStateTabs } from '@/components/carousel/CarouselStateTabs';
import { CarouselGroupSlide } from '@/components/carousel/CarouselGroupSlide';
import { CarouselCard, CarouselState } from '@/types/carousel';
import { EMPTY_STATE_MESSAGES, STATE_ORDER } from '@/constants/carousel';

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
  const slides = useMemo(
    () =>
      STATE_ORDER.map((state) => {
        const isInvestedState = state === 'invested';
        const items = cards.filter((card) => Boolean(card.isInvested) === isInvestedState);
        return {
          id: `slide-${state}`,
          isInvested: isInvestedState,
          items,
        };
      }),
    [cards]
  );
  const activeState = STATE_ORDER[currentIndex] ?? 'invested';

  const scrollTo = (index: number) => {
    if (!containerRef.current || !slides.length) return;
    const container = containerRef.current;
    const firstCard = container.querySelector('[data-carousel-item]') as HTMLElement;
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const clampedIndex = Math.max(0, Math.min(index, slides.length - 1));

    container.scrollTo({
      left: clampedIndex * (cardWidth + CAROUSEL_GAP),
      behavior: 'smooth',
    });
    setCurrentIndex(clampedIndex);
  };

  const handleStateClick = (state: CarouselState) => {
    const targetIndex = STATE_ORDER.indexOf(state);
    if (targetIndex >= 0) {
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
        setCurrentIndex(Math.max(0, Math.min(newIndex, slides.length - 1)));
      }, SCROLL_DEBOUNCE_MS),
    [slides.length]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', debouncedHandleScroll);
    return () => container.removeEventListener('scroll', debouncedHandleScroll);
  }, [debouncedHandleScroll]);

  const tabs = slides.map((slide, idx) => ({
    state: STATE_ORDER[idx],
    hasItems: slide.items.length > 0,
  }));

  const missingStates = tabs.filter((tab) => !tab.hasItems).map((tab) => tab.state);

  return (
    <div className={`w-full md:px-0 py-3 ${className}`}>
      <CarouselStateTabs activeState={activeState} onStateSelect={handleStateClick} tabs={tabs} />

    

      <div
        ref={containerRef}
        className="flex gap-2.5 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
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
        {slides.map((slide, index) => (
          <CarouselGroupSlide
            key={slide.id}
            group={slide}
            onCardClick={onCardClick}
            emptyMessage={slide.items.length === 0 ? EMPTY_STATE_MESSAGES[STATE_ORDER[index]] : undefined}
          />
        ))}
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="캐러셀 인디케이터">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-gray-500 w-2'
              }`}
              role="tab"
              aria-label={`${slide.items.map((item) => item.title).join(', ') || '그룹'} 슬라이드로 이동`}
              aria-selected={index === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );

}
