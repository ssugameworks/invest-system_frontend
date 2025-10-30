'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import SendIcon from '@/assets/icons/send.svg';
import { formatCurrency } from '@/utils/formatters';
import { debounce } from '@/utils/debounce';

// 캐러셀 설정 상수 (Tailwind 클래스와 동일하게 유지)
const CAROUSEL_GAP = 10; // gap-2.5 (0.625rem = 10px)와 동기화 필요
const DRAG_SPEED_MULTIPLIER = 1.5;
const SCROLL_DEBOUNCE_MS = 50;

export interface CarouselCard {
  id: string;
  title: string;
  members: string;
  totalInvestment: number;
  avatar?: string;
}

interface CarouselProps {
  cards: CarouselCard[];
  className?: string;
  onCardClick?: (cardId: string) => void;
}

export default function Carousel({ cards, className = '', onCardClick }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * DRAG_SPEED_MULTIPLIER;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setStartX(touch.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const touch = e.touches[0];
    const x = touch.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * DRAG_SPEED_MULTIPLIER;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const scrollTo = (index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const firstCard = container.querySelector('[data-carousel-item]') as HTMLElement;
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;

    container.scrollTo({
      left: index * (cardWidth + CAROUSEL_GAP),
      behavior: 'smooth',
    });
    setCurrentIndex(index);
  };

  // debounced 스크롤 핸들러 (성능 최적화)
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
      <div
        ref={containerRef}
        className="flex gap-2.5 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-4 md:px-0"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
        role="region"
        aria-label="투자 팀 캐러셀"
        aria-live="polite"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            data-carousel-item
            className="flex-shrink-0 w-[10.5rem] sm:w-[11.25rem] md:w-[12.5rem] lg:w-[13.75rem] h-[9.25rem] sm:h-40 md:h-[11.25rem] lg:h-[12.5rem] bg-[#1A1A1A] rounded-2xl px-4 py-8 flex flex-col items-center justify-between border-[1.5px] border-[#434343]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="flex items-start justify-start w-full">
              <div
                className="text-accent-yellow text-lg sm:text-xl md:text-2xl font-semibold"
                style={{
                  filter: 'drop-shadow(0 0 5px #EFFF8F)',
                }}
              >
                {formatCurrency(card.totalInvestment)}
              </div>
            </div>
            <div className="flex items-end gap-3 sm:gap-4 w-full pb-1">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="text-white font-semibold text-base sm:text-lg leading-none truncate">
                  {card.title}
                </div>
                <div className="text-accent-yellow text-xs sm:text-sm leading-none truncate">
                  {card.members}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCardClick?.(card.id);
                }}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center flex-shrink-0 -mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                aria-label={`${card.title} 상세 정보 보기`}
              >
                <SendIcon className="w-full h-full text-accent-yellow" style={{ display: 'block' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {cards.length > 1 && (
        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="캐러셀 인디케이터">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-gray-500 w-2'
              }`}
              role="tab"
              aria-label={`${card.title} 슬라이드로 이동`}
              aria-selected={index === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
