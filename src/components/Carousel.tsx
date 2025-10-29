'use client';

import React, { useState, useRef, useEffect } from 'react';
import SendIcon from '@/assets/icons/send.svg';

export interface CarouselCard {
  id: string;
  title: string;
  members: string;
  amount: string;
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
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartX(touch.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const touch = e.touches[0];
    const x = touch.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollTo = (index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const firstCard = container.querySelector('[data-carousel-item]') as HTMLElement;
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = 10;

    container.scrollTo({
      left: index * (cardWidth + gap),
      behavior: 'smooth',
    });
    setCurrentIndex(index);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const firstCard = container.querySelector('[data-carousel-item]') as HTMLElement;
      if (!firstCard) return;

      const cardWidth = firstCard.offsetWidth;
      const gap = 10;
      const newIndex = Math.round(container.scrollLeft / (cardWidth + gap));
      setCurrentIndex(newIndex);
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={containerRef}
        className="flex gap-[10px] overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-4 md:px-0"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            data-carousel-item
            className="flex-shrink-0 w-[168px] sm:w-[180px] md:w-[200px] lg:w-[220px] h-[148px] sm:h-[160px] md:h-[180px] bg-[#1A1A1A] rounded-[15px] px-[15px] py-[30px] sm:py-[30px] flex flex-col items-center justify-between border-[1.5px] border-[#434343]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="flex items-start justify-start w-full">
              <div
                className="text-[#EFFF8F] text-lg sm:text-xl md:text-2xl font-semibold"
                style={{
                  filter: 'drop-shadow(0 0 5px #EFFF8F)',
                }}
              >
                {card.amount}
              </div>
            </div>
            <div className="flex items-end gap-[12px] sm:gap-[15px] w-full pb-1">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="text-white font-semibold text-base sm:text-lg leading-none truncate">
                  {card.title}
                </div>
                <div className="text-[#EFFF8F] text-xs sm:text-sm leading-none truncate">
                  {card.members}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCardClick?.(card.id);
                }}
                className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] flex items-center justify-center flex-shrink-0 -mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                aria-label={`${card.title} 상세 정보 보기`}
              >
                <SendIcon className="w-full h-full text-[#EFFF8F]" style={{ display: 'block' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {cards.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-gray-500 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
