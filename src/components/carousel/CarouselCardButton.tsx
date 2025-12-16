'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatNumberWithCommas } from '@/utils/formatters';
import { CarouselCard, GlowVariant } from '@/types/carousel';
import { getTeamPriceHistory, type PriceHistory } from '@/lib/api';
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

export function CarouselCardButton({ card, onClick, isInvestedState }: CarouselCardButtonProps) {
  const router = useRouter();
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const isInvested = typeof isInvestedState === 'boolean' ? isInvestedState : Boolean(card.isInvested);
  const avatarLabel = card.avatarLabel ?? (card.title?.[0] ?? '').toUpperCase();
  const glowVariant = card.glowVariant ?? 'bright';

  // 팀 로고 설정 가져오기
  const teamLogoConfig = getTeamLogoConfig(card.title);
  const teamLogo = card.avatar || teamLogoConfig?.logoUrl;
  const logoBackgroundColor = teamLogoConfig?.backgroundColor || card.avatarBackground || '#FFFFFF';
  const showLogo = Boolean(teamLogo);
  const changeDirection =
    card.trendDirection ??
    ((typeof card.changeAmount === 'number' ? card.changeAmount : card.changeRate ?? 0) >= 0 ? 'up' : 'down');
  const changeText = card.changeLabel ?? buildChangeLabel(card.changeAmount, card.changeRate, changeDirection);
  const showChange = Boolean(changeText);
  const changeColor = changeDirection === 'down' ? 'text-[#d34250]' : 'text-[#5F79FB]';

  // 초기 가격 히스토리 데이터 로드 (detail 페이지와 동일한 로직: 최근 2.5시간 데이터)
  useEffect(() => {
    const loadPriceHistory = async () => {
      setIsLoadingChart(true);

      try {
        // 서버에서 직접 가져오기
        const history = await getTeamPriceHistory(card.id);

        if (history.length > 0) {
          const now = Date.now();
          const twoHoursHalfAgo = now - 2.5 * 60 * 60 * 1000;

          const filtered = history
            .filter(h => new Date(h.tickTs).getTime() >= twoHoursHalfAgo)
            .sort((a, b) => new Date(a.tickTs).getTime() - new Date(b.tickTs).getTime());

          setPriceHistory(filtered);
        } else {
          setPriceHistory([]);
        }
        setIsLoadingChart(false);
      } catch (error) {
        // 에러 시 빈 배열 유지
        setIsLoadingChart(false);
      }
    };

    loadPriceHistory();
  }, [card.id]);

  const [currentPrice, setCurrentPrice] = useState<number | null>(card.currentPrice || null);

  // 10초마다 서버에서 최신 가격 히스토리 가져오기 (detail 페이지와 동일한 로직)
  useEffect(() => {
    const updatePriceData = async () => {
      try {
        // 현재 가격은 항상 getTeam API로 가져오기 (price-history는 그래프용으로만 사용)
        const { getTeam } = await import('@/lib/api');
        const teamData = await getTeam(card.id);
        const newCurrentPrice = teamData.p;
        
        if (newCurrentPrice && newCurrentPrice > 0) {
          setCurrentPrice(newCurrentPrice);
        }

        // 서버에서 최신 가격 히스토리 가져오기 (그래프 데이터용)
        const history = await getTeamPriceHistory(card.id);

        if (history.length > 0) {
          const now = Date.now();
          const twoHoursHalfAgo = now - 2.5 * 60 * 60 * 1000;

          const filtered = history
            .filter(h => new Date(h.tickTs).getTime() >= twoHoursHalfAgo)
            .sort((a, b) => new Date(a.tickTs).getTime() - new Date(b.tickTs).getTime());

          // 가격 히스토리 업데이트 (그래프용)
          if (filtered.length > 0) {
            setPriceHistory(filtered);
          }
        }
      } catch (error) {
        // 에러 시 무시
      }
    };

    // 초기 가격 설정
    if (!currentPrice && card.currentPrice) {
      setCurrentPrice(card.currentPrice);
    }

    // 10초마다 실행
    const interval = setInterval(updatePriceData, 10000);

    return () => clearInterval(interval);
  }, [card.id, card.currentPrice]);

  // detail 페이지와 동일한 trendPoints 계산 로직
  const trendPoints: InvestmentTrendPoint[] = useMemo(() => {
    let currentPriceValue = currentPrice;
    if (!currentPriceValue || currentPriceValue === 0) {
      if (priceHistory.length > 0) {
        currentPriceValue = priceHistory[priceHistory.length - 1].price;
        if (!currentPriceValue || currentPriceValue === 0) {
          return [];
        }
      } else {
        return [];
      }
    }

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    };

    const now = Date.now();
    const twoHoursHalfAgo = now - 2.5 * 60 * 60 * 1000;

    let points: InvestmentTrendPoint[] = [];

    if (priceHistory.length > 0) {
      points = priceHistory
        .filter(h => new Date(h.tickTs).getTime() >= twoHoursHalfAgo)
        .map(h => ({
          label: formatTime(h.tickTs),
          value: h.price,
        }));

      // 항상 현재 가격을 최신 포인트로 추가 (실시간 반영)
      if (currentPriceValue) {
        const lastPoint = points[points.length - 1];
        const lastPointValue = lastPoint?.value;
        
        if (!lastPoint || lastPointValue !== currentPriceValue) {
          points.push({
            label: formatTime(new Date().toISOString()),
            value: currentPriceValue,
          });
        } else {
          points[points.length - 1] = {
            label: formatTime(new Date().toISOString()),
            value: currentPriceValue,
          };
        }
      }
    }

    if (points.length === 0) {
      const previousPrice = priceHistory.length >= 2
        ? priceHistory[priceHistory.length - 2].price
        : priceHistory.length === 1
        ? priceHistory[0].price
        : currentPriceValue;
      
      points = [
        { label: formatTime(new Date(twoHoursHalfAgo).toISOString()), value: previousPrice },
        { label: formatTime(new Date().toISOString()), value: currentPriceValue },
      ];
    } else if (points.length === 1) {
      points.push({
        label: formatTime(new Date().toISOString()),
        value: currentPriceValue,
      });
    }

    return points;
  }, [priceHistory, currentPrice]);

  // changeRate 계산 (detail 페이지와 동일한 로직)
  const changeRate = useMemo(() => {
    if (!currentPrice || currentPrice === 0) return 0;
    
    let previousPrice = currentPrice;
    if (priceHistory.length >= 2) {
      previousPrice = priceHistory[priceHistory.length - 2].price;
    } else if (priceHistory.length === 1) {
      previousPrice = priceHistory[0].price;
    }
    
    if (previousPrice && previousPrice > 0) {
      return ((currentPrice - previousPrice) / previousPrice) * 100;
    }
    return 0;
  }, [priceHistory, currentPrice]);

  // detail 페이지의 InvestmentTrendChart와 동일한 스타일로 작은 SVG 그래프 생성
  const chartData = useMemo(() => {
    if (!trendPoints || trendPoints.length === 0) {
      return null;
    }

    // 시간 문자열을 분 단위로 변환하는 함수
    const parseTimeToMinutes = (timeStr: string): number => {
      const parts = timeStr.split(':').map(Number);
      if (parts.length >= 2) {
        return parts[0] * 60 + parts[1];
      }
      return 0;
    };

    // 현재 시간 파싱
    const rawCurrentTimeLabel = trendPoints[trendPoints.length - 1]?.label || '';
    const timeParts = rawCurrentTimeLabel.split(':').map(Number);
    const [currentHour, currentMinute] = timeParts;
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    // 시간 범위 계산: 현재 시간 기준 20분 전 ~ 10분 후 (여백 유지)
    const firstTimeTotalMinutes = currentTotalMinutes - 20;
    const lastTimeTotalMinutes = currentTotalMinutes + 10;
    const totalRangeMinutes = 30; // 20분 + 10분

    // 실제 데이터를 시간에 맞게 맵핑
    const dataMap = new Map<number, number>();
    trendPoints.forEach((point) => {
      const pointMinutes = parseTimeToMinutes(point.label);
      // 하루 경계 처리
      let adjustedMinutes = pointMinutes;
      if (pointMinutes < currentTotalMinutes - 12 * 60) {
        adjustedMinutes = pointMinutes + 24 * 60;
      } else if (pointMinutes > currentTotalMinutes + 12 * 60) {
        adjustedMinutes = pointMinutes - 24 * 60;
      }

      // 20분 전 ~ 10분 후 범위의 데이터만 포함
      if (adjustedMinutes >= firstTimeTotalMinutes && adjustedMinutes <= lastTimeTotalMinutes) {
        dataMap.set(adjustedMinutes, point.value);
      }
    });

    // 30분 범위를 1분 간격으로 나눠서 데이터 생성 (총 31개 포인트: 20분 전 ~ 10분 후)
    const chartDataPoints: Array<{ value: number | null; _timeMinutes: number }> = [];
    
    for (let i = 0; i <= totalRangeMinutes; i++) {
      const timeMinutes = firstTimeTotalMinutes + i;
      
      // 현재 시간 이후의 포인트는 null로 처리 (선이 그려지지 않음)
      const value = timeMinutes > currentTotalMinutes ? null : (dataMap.get(timeMinutes) ?? null);
      
      chartDataPoints.push({
        value,
        _timeMinutes: timeMinutes,
      });
    }

    // null 값을 이전 유효한 값으로 보간하여 그래프가 끊기지 않도록 처리
    // 단, 현재 시간 이후의 포인트는 보간하지 않음 (null 유지)
    const processedPoints = chartDataPoints.map((point, index) => {
      // 첫 번째 포인트는 그대로 반환
      if (index === 0) {
        return point;
      }
      
      // 현재 시간 이후의 포인트는 null 유지 (선이 그려지지 않음)
      if (point._timeMinutes > currentTotalMinutes) {
        return {
          ...point,
          value: null
        };
      }
      
      // 값이 null이면 이전 유효한 값으로 보간
      if (point.value === null) {
        // 이전 유효한 값을 찾기
        let prevValue: number | null = null;
        for (let i = index - 1; i >= 0; i--) {
          if (chartDataPoints[i].value !== null) {
            prevValue = chartDataPoints[i].value;
            break;
          }
        }
        
        // 이전 값이 있으면 사용, 없으면 다음 유효한 값으로 보간
        if (prevValue !== null) {
          return {
            ...point,
            value: prevValue
          };
        } else {
          // 다음 유효한 값을 찾아서 보간
          let nextValue: number | null = null;
          for (let i = index + 1; i < chartDataPoints.length; i++) {
            if (chartDataPoints[i].value !== null) {
              nextValue = chartDataPoints[i].value;
              break;
            }
          }
          
          if (nextValue !== null) {
            return {
              ...point,
              value: nextValue
            };
          }
        }
      }
      
      // 하락 구간도 정상적으로 표시하도록 수정 (하락 방지 로직 제거)
      
      return point;
    });

    // 현재 시간까지의 값만 반환 (현재 시간 이후는 null이므로 제외)
    const currentTimeIndex = processedPoints.findIndex(
      point => point._timeMinutes > currentTotalMinutes
    );
    const validPoints = currentTimeIndex >= 0 
      ? processedPoints.slice(0, currentTimeIndex)
      : processedPoints;
    
    const values = validPoints
      .map(point => point.value)
      .filter((v): v is number => v !== null);
    
    return values.length > 0 ? values : null;
  }, [trendPoints]);

  // 그래프 색상: 항상 노란색으로 표시
  const chartColor = '#EFFF8F'; // 노란색

  // SVG path 생성 (detail 페이지와 동일한 스타일, 작은 버전)
  const chartPath = useMemo(() => {
    if (!chartData || chartData.length < 2) {
      // 데이터가 없으면 기본 패턴 사용
      return changeDirection === 'up'
        ? "M0 25 L15 20 L30 22 L45 10 L60 5"
        : "M0 5 L15 15 L30 10 L45 22 L60 25";
    }

    const prices = chartData;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1; // 0으로 나누기 방지

    // SVG 좌표로 변환 (60x30 크기)
    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * 60;
      // Y축 반전 (SVG는 위가 0)
      const y = 25 - ((price - minPrice) / priceRange) * 20;
      return `${x.toFixed(1)} ${y.toFixed(1)}`;
    });

    return `M${points.join(' L')}`;
  }, [chartData, changeDirection]);

  const handleClick = () => {
    onClick?.(card.id);
    router.push(`/detail/${card.id}`);
  };

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

      {/* Mini Chart (Real Data) - detail 페이지와 동일한 스타일 */}
      <div className="w-10 xs:w-12 sm:w-14 h-6 xs:h-7 sm:h-8 flex-shrink-0">
        {isLoadingChart ? (
          <div className="w-full h-full bg-white/5 rounded animate-pulse" />
        ) : (
          <svg viewBox="0 0 60 30" className="w-full h-full overflow-visible">
            <defs>
              {/* 노란색 그래디언트 (상승) */}
              <linearGradient id={`gradient-${card.id}-yellow`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EFFF8F" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#F2FFA2" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#E7FA4F" stopOpacity={0} />
              </linearGradient>
              {/* 빨간색 그래디언트 (하락) */}
              <linearGradient id={`gradient-${card.id}-red`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#fca5a5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              {/* 초록색 그래디언트 (0일 때) */}
              <linearGradient id={`gradient-${card.id}-green`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#34d399" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0} />
              </linearGradient>
              <filter id={`glow-${card.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Area fill (gradient) */}
            <path
              d={`${chartPath} L60 30 L0 30 Z`}
              fill={`url(#gradient-${card.id}-yellow)`}
              opacity={0.9}
            />
            {/* Line stroke */}
            <path
              d={chartPath}
              fill="none"
              stroke={chartColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#glow-${card.id})`}
            />
          </svg>
        )}
      </div>

      {/* Price & Change */}
      <div className="text-right flex-shrink-0 w-[80px] xs:w-[90px] max-w-[80px] xs:max-w-[90px] overflow-hidden">
        <p className="text-sm xs:text-base font-semibold text-white truncate">
          {currentPrice ? formatWon(currentPrice) : formatWon(card.currentPrice || card.totalInvestment)}
        </p>
        {showChange && (
          <p className={`text-xs xs:text-sm font-medium ${changeDirection === 'up' ? 'text-accent-green' : 'text-[#ff3b30]'}`}>
            {changeText.replace('(', '').replace(')', '')}
          </p>
        )}
      </div>
    </button>
  );
}
