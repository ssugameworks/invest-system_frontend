'use client';

import React, { useState, useMemo, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatNumberWithCommas } from '@/utils/formatters';
import { CarouselCard, GlowVariant } from '@/types/carousel';
import { useTeamPriceHistory } from '@/hooks/useQueries';
import { getTeamLogoConfig } from '@/utils/teamLogos';
import Image from 'next/image';
import type { InvestmentTrendPoint } from '@/api/api';

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

interface CarouselCardButtonProps {
  card: CarouselCard;
  onClick?: (cardId: number) => void;
  isInvestedState?: boolean;
}

// 미니 차트 컴포넌트 분리 및 메모이제이션
const MiniChart = memo(function MiniChart({ 
  cardId, 
  chartPath, 
  chartColor 
}: { 
  cardId: number; 
  chartPath: string; 
  chartColor: string;
}) {
  return (
    <svg viewBox="0 0 60 30" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={`gradient-${cardId}-yellow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#EFFF8F" stopOpacity={0.4} />
          <stop offset="50%" stopColor="#F2FFA2" stopOpacity={0.2} />
          <stop offset="95%" stopColor="#E7FA4F" stopOpacity={0} />
        </linearGradient>
        <filter id={`glow-${cardId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={`${chartPath} L60 30 L0 30 Z`}
        fill={`url(#gradient-${cardId}-yellow)`}
        opacity={0.9}
      />
      <path
        d={chartPath}
        fill="none"
        stroke={chartColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#glow-${cardId})`}
      />
    </svg>
  );
});

function CarouselCardButtonInner({ card, onClick, isInvestedState }: CarouselCardButtonProps) {
  const router = useRouter();
  const isInvested = typeof isInvestedState === 'boolean' ? isInvestedState : Boolean(card.isInvested);
  const avatarLabel = card.avatarLabel ?? (card.title?.[0] ?? '').toUpperCase();
  const glowVariant = card.glowVariant ?? 'bright';

  // React Query로 가격 히스토리 가져오기 (캐싱 및 자동 재시도)
  const { data: priceHistory = [], isLoading: isLoadingChart } = useTeamPriceHistory(card.id);

  // 팀 로고 설정
  const teamLogoConfig = useMemo(() => getTeamLogoConfig(card.title), [card.title]);
  const teamLogo = card.avatar || teamLogoConfig?.logoUrl;
  const logoBackgroundColor = teamLogoConfig?.backgroundColor || card.avatarBackground || '#FFFFFF';
  const showLogo = Boolean(teamLogo);

  const changeDirection = useMemo(() =>
    card.trendDirection ??
    ((typeof card.changeAmount === 'number' ? card.changeAmount : card.changeRate ?? 0) >= 0 ? 'up' : 'down'),
    [card.trendDirection, card.changeAmount, card.changeRate]
  );

  // 현재 가격 계산
  const currentPrice = useMemo(() => {
    if (card.currentPrice && card.currentPrice > 0) return card.currentPrice;
    if (priceHistory.length > 0) {
      return priceHistory[priceHistory.length - 1].price;
    }
    return null;
  }, [card.currentPrice, priceHistory]);

  // trendPoints 계산 최적화
  const trendPoints = useMemo<InvestmentTrendPoint[]>(() => {
    const currentPriceValue = currentPrice;
    if (!currentPriceValue || currentPriceValue === 0) return [];

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    };

    const now = Date.now();
    const twoHoursHalfAgo = now - 2.5 * 60 * 60 * 1000;

    if (priceHistory.length === 0) {
      return [
        { label: formatTime(new Date(twoHoursHalfAgo).toISOString()), value: currentPriceValue },
        { label: formatTime(new Date().toISOString()), value: currentPriceValue },
      ];
    }

    const points = priceHistory
      .filter(h => new Date(h.tickTs).getTime() >= twoHoursHalfAgo)
      .map(h => ({
        label: formatTime(h.tickTs),
        value: h.price,
      }));

    if (points.length === 0) {
      return [
        { label: formatTime(new Date(twoHoursHalfAgo).toISOString()), value: currentPriceValue },
        { label: formatTime(new Date().toISOString()), value: currentPriceValue },
      ];
    }

    const lastPoint = points[points.length - 1];
    if (lastPoint.value !== currentPriceValue) {
      points.push({
        label: formatTime(new Date().toISOString()),
        value: currentPriceValue,
      });
    }

    return points;
  }, [priceHistory, currentPrice]);

  // 차트 데이터 계산 최적화
  const chartData = useMemo(() => {
    if (!trendPoints || trendPoints.length === 0) return null;

    const parseTimeToMinutes = (timeStr: string): number => {
      const parts = timeStr.split(':').map(Number);
      return parts.length >= 2 ? parts[0] * 60 + parts[1] : 0;
    };

    const rawCurrentTimeLabel = trendPoints[trendPoints.length - 1]?.label || '';
    const timeParts = rawCurrentTimeLabel.split(':').map(Number);
    const currentTotalMinutes = timeParts[0] * 60 + timeParts[1];
    const firstTimeTotalMinutes = currentTotalMinutes - 20;
    const lastTimeTotalMinutes = currentTotalMinutes + 10;
    const totalRangeMinutes = 30;

    const dataMap = new Map<number, number>();
    trendPoints.forEach((point) => {
      const pointMinutes = parseTimeToMinutes(point.label);
      let adjustedMinutes = pointMinutes;
      if (pointMinutes < currentTotalMinutes - 12 * 60) adjustedMinutes = pointMinutes + 24 * 60;
      else if (pointMinutes > currentTotalMinutes + 12 * 60) adjustedMinutes = pointMinutes - 24 * 60;

      if (adjustedMinutes >= firstTimeTotalMinutes && adjustedMinutes <= lastTimeTotalMinutes) {
        dataMap.set(adjustedMinutes, point.value);
      }
    });

    const chartDataPoints: Array<{ value: number | null; _timeMinutes: number }> = [];
    for (let i = 0; i <= totalRangeMinutes; i++) {
      const timeMinutes = firstTimeTotalMinutes + i;
      const value = timeMinutes > currentTotalMinutes ? null : (dataMap.get(timeMinutes) ?? null);
      chartDataPoints.push({ value, _timeMinutes: timeMinutes });
    }

    // 보간 처리
    const processedPoints = chartDataPoints.map((point, index) => {
      if (index === 0 || point._timeMinutes > currentTotalMinutes) return point;
      if (point.value === null) {
        for (let i = index - 1; i >= 0; i--) {
          if (chartDataPoints[i].value !== null) {
            return { ...point, value: chartDataPoints[i].value };
          }
        }
      }
      return point;
    });

    const currentTimeIndex = processedPoints.findIndex(point => point._timeMinutes > currentTotalMinutes);
    const validPoints = currentTimeIndex >= 0 ? processedPoints.slice(0, currentTimeIndex) : processedPoints;
    const values = validPoints.map(point => point.value).filter((v): v is number => v !== null);

    return values.length > 0 ? values : null;
  }, [trendPoints]);

  const chartColor = '#EFFF8F';

  // SVG path 계산 최적화
  const chartPath = useMemo(() => {
    if (!chartData || chartData.length < 2) {
      return changeDirection === 'up'
        ? "M0 25 L15 20 L30 22 L45 10 L60 5"
        : "M0 5 L15 15 L30 10 L45 22 L60 25";
    }

    const prices = chartData;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * 60;
      const y = 25 - ((price - minPrice) / priceRange) * 20;
      return `${x.toFixed(1)} ${y.toFixed(1)}`;
    });

    return `M${points.join(' L')}`;
  }, [chartData, changeDirection]);

  const handleClick = useCallback(() => {
    onClick?.(card.id);
    router.push(`/detail/${card.id}`);
  }, [card.id, onClick, router]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex w-full items-center gap-3 xs:gap-4 py-3 xs:py-4 px-2 text-left transition-colors hover:bg-white/5 rounded-xl"
      aria-label={`${card.title} 카드`}
    >
      {/* Icon */}
      <div className="relative flex-shrink-0">
        {showLogo && teamLogo ? (
          <div
            className="flex size-10 xs:size-12 items-center justify-center rounded-full overflow-hidden"
            style={{ backgroundColor: logoBackgroundColor }}
          >
            <Image
              src={teamLogo}
              alt={`${card.title} 로고`}
              width={52}
              height={52}
              className="object-contain"
            />
          </div>
        ) : (
          <div
            className="flex size-9 xs:size-10 items-center justify-center rounded-full text-base xs:text-lg font-bold text-black"
            style={{ backgroundColor: card.avatarBackground ?? '#FFFFFF' }}
          >
            {avatarLabel}
          </div>
        )}
      </div>

      {/* Name & Code */}
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <p className="text-sm xs:text-base font-semibold text-white truncate">
          {card.title}
        </p>
        <p className="text-xs xs:text-sm text-text-tertiary truncate">
          {isInvested ? '보유중' : card.subtitle?.split('현재가: ')[1] || '005930'}
        </p>
      </div>

      {/* Mini Chart */}
      <div className="w-10 xs:w-12 sm:w-14 h-6 xs:h-7 sm:h-8 flex-shrink-0">
        {isLoadingChart ? (
          <div className="w-full h-full bg-white/5 rounded animate-pulse" />
        ) : (
          <MiniChart cardId={card.id} chartPath={chartPath} chartColor={chartColor} />
        )}
      </div>

      {/* Price & ROI */}
      <div className="text-right flex-shrink-0 w-[80px] xs:w-[90px] max-w-[80px] xs:max-w-[90px] overflow-hidden">
        <p className="text-sm xs:text-base font-semibold text-white truncate">
          {currentPrice ? formatWon(currentPrice) : formatWon(card.currentPrice || card.totalInvestment)}
        </p>
        {typeof card.changeRate === 'number' && !isNaN(card.changeRate) && isFinite(card.changeRate) ? (
          <p className={`text-xs xs:text-sm font-medium ${card.changeRate >= 0 ? 'text-accent-green' : 'text-[#ff3b30]'}`}>
            {card.changeRate >= 0 ? '+' : ''}{card.changeRate.toFixed(1)}%
          </p>
        ) : null}
      </div>
    </button>
  );
}

export const CarouselCardButton = memo(CarouselCardButtonInner);
