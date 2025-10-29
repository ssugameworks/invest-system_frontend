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
}

export default function Carousel({ cards, className = '' }: CarouselProps) {
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
    const cardWidth = 163 + 10;
    containerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
    setCurrentIndex(index);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const cardWidth = 163 + 10;
      const newIndex = Math.round(containerRef.current.scrollLeft / cardWidth);
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
        className="flex gap-[10px] overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
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
            className="flex-shrink-0 w-[163px] h-[148px] bg-[#1A1A1A] rounded-[15px] px-[15px] py-[30px] flex flex-col items-center justify-between border-[1.2px] border-[#434343]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="flex items-start justify-start w-full">
              <div
                className="text-[#EFFF8F] text-lg font-semibold"
                style={{
                  filter: 'drop-shadow(0 0 5px #EFFF8F)',
                }}
              >
                {card.amount}
              </div>
            </div>
            <div className="flex items-end gap-[15px] w-full pb-1">
              <div className="flex flex-col gap-1 flex-1">
                <div className="text-white font-semibold text-base leading-none">
                  {card.title}
                </div>
                <div className="text-[#EFFF8F] text-[10px] leading-none">
                  {card.members}
                </div>
              </div>
              <div className="w-[28px] h-[28px] flex items-center justify-center flex-shrink-0 -mb-1">
                <SendIcon className="w-full h-full text-[#EFFF8F]" style={{ display: 'block' }} />
              </div>
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
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
