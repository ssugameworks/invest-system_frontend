'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { formatNumberWithCommas } from '@/utils/formatters';
import { debounce } from '@/utils/debounce';
import { useCarouselDrag } from '@/hooks/useCarouselDrag';

// 캐러셀 설정 상수 (Tailwind 클래스와 동일하게 유지)
const CAROUSEL_GAP = 10; // gap-2.5 (0.625rem = 10px)와 동기화 필요
const SCROLL_DEBOUNCE_MS = 50;

type GlowVariant = 'bright' | 'muted';

const AVATAR_GLOW_STYLES: Record<GlowVariant, React.CSSProperties> = {
  bright: {
    background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 55%, transparent 75%)',
  },
  muted: {
    background: 'radial-gradient(circle, rgba(143,150,168,0.45) 0%, rgba(143,150,168,0.06) 55%, transparent 75%)',
  },
};

const formatWon = (amount: number) => `${formatNumberWithCommas(Math.round(amount))}원`;

const buildChangeLabel = (
  amount?: number,
  rate?: number,
  direction: 'up' | 'down' = 'up'
): string => {
  const symbol = direction === 'down' ? '-' : '+';
  const parts: string[] = [];

  if (typeof amount === 'number') {
    parts.push(`${symbol}${formatNumberWithCommas(Math.abs(Math.round(amount)))}`);
  }

  if (typeof rate === 'number') {
    const rateValue = Math.abs(rate);
    const rateText = Number.isInteger(rateValue) ? rateValue.toString() : rateValue.toFixed(1);
    parts.push(`(${rateText}%)`);
  }

  return parts.join(' ').trim();
};

export interface CarouselCard {
  id: number;
  title: string;
  members?: string;
  subtitle?: string;
  isInvested?: boolean;
  totalInvestment: number;
  changeAmount?: number;
  changeRate?: number;
  changeLabel?: string;
  trendDirection?: 'up' | 'down';
  avatar?: string;
  avatarLabel?: string;
  avatarBackground?: string;
  glowVariant?: GlowVariant;
}

interface CarouselProps {
  cards: CarouselCard[];
  className?: string;
  onCardClick?: (cardId: number) => void;
}

export default function Carousel({ cards, className = '', onCardClick }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 드래그 및 터치 인터랙션
  const dragHandlers = useCarouselDrag(containerRef);

  const groupedCards = useMemo(() => {
    if (!cards.length) return [];

    const groups: Array<{ id: string; isInvested: boolean; items: CarouselCard[] }> = [];

    cards.forEach((card, idx) => {
      const invested = Boolean(card.isInvested);
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.isInvested === invested) {
        lastGroup.items.push(card);
      } else {
        groups.push({
          id: `group-${idx}-${card.id}`,
          isInvested: invested,
          items: [card],
        });
      }
    });

    return groups;
  }, [cards]);

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
          <div
            key={group.id}
            data-carousel-item
            className="flex-shrink-0 min-w-[19rem] sm:min-w-[21rem] md:min-w-[23rem] lg:min-w-[24.5rem]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="h-full w-full rounded-[32px] border border-white/10 bg-[#0C0D10]/80 px-6 py-6 flex flex-col gap-6">
              {group.items.map((card) => {
                const isInvested = Boolean(card.isInvested);
                const subtitle = isInvested ? card.subtitle ?? card.members ?? '' : '';
                const avatarLabel = card.avatarLabel ?? (card.title?.[0] ?? '').toUpperCase();
                const glowVariant = card.glowVariant ?? 'bright';
                const changeDirection =
                  card.trendDirection ??
                  ((typeof card.changeAmount === 'number' ? card.changeAmount : card.changeRate ?? 0) >= 0 ? 'up' : 'down');
                const changeText = card.changeLabel ?? buildChangeLabel(card.changeAmount, card.changeRate, changeDirection);
                const showChange = Boolean(changeText);
                const changeColor = changeDirection === 'down' ? 'text-[#d34250]' : 'text-[#5F79FB]';
                const isInteractive = typeof onCardClick === 'function';

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onCardClick?.(card.id)}
                    disabled={!isInteractive}
                    aria-disabled={!isInteractive}
                    className="relative flex w-full items-center gap-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6F631] disabled:cursor-default"
                    aria-label={`${card.title} 카드`}
                  >
                    <div className="relative flex items-center justify-center">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -inset-3 -z-10 blur-[22px]"
                        style={AVATAR_GLOW_STYLES[glowVariant]}
                      />
                      <div
                        className="flex size-12 items-center justify-center rounded-full text-xl font-bold text-black"
                        style={{ backgroundColor: card.avatarBackground ?? '#FFFFFF' }}
                      >
                        {avatarLabel}
                      </div>
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-6 min-w-0">
                      <div
                        className={`min-w-0 flex flex-col ${
                          isInvested ? 'items-start' : 'items-center text-center justify-center'
                        } gap-0.5`}
                      >
                        <p
                          className={`${
                            isInvested ? 'text-sm font-medium' : 'text-base font-semibold'
                          } text-[#d2d2d2] truncate`}
                        >
                          {card.title}
                        </p>
                        {subtitle && (
                          <p className="text-lg font-semibold text-white truncate" aria-label="기간">
                            {subtitle}
                          </p>
                        )}
                      </div>
                      <div className="text-right min-w-[120px]">
                        <p className="text-lg font-semibold leading-tight text-white">{formatWon(card.totalInvestment)}</p>
                        {showChange && (
                          <p className={`text-sm leading-tight ${changeColor}`} aria-label="변동 정보">
                            {changeText}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {groupedCards.length > 1 && (
        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="캐러셀 인디케이터">
          {groupedCards.map((group, index) => (
            <button
              key={group.id}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-gray-500 w-2'
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
