'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { InvestmentTrendPoint } from '@/api/api';

type InvestmentTrendChartProps = {
  points: InvestmentTrendPoint[];
  className?: string;
};

const DEFAULT_VIEWBOX_WIDTH = 394;
const VIEWBOX_HEIGHT = 154;
const PADDING_X = 18;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 18;
const SMOOTHING = 0.2;
const LINE_GRADIENT_ID = 'investment-trend-line-gradient';
const AREA_GRADIENT_ID = 'investment-trend-area-gradient';
const GLOW_FILTER_ID = 'investment-trend-glow-filter';
const MASK_ID = 'investment-trend-mask';
const DRAW_DURATION_MS = 30_000;
const POINT_RADIUS = 4;
const POINT_GLOW_RADIUS = 10;
const VALUE_LABEL_OFFSET_X = 18;
const VALUE_LABEL_OFFSET_Y = -20;

const valueFormatter = new Intl.NumberFormat('ko-KR');
const formatValue = (value: number) => valueFormatter.format(Math.round(value));

type ChartCoordinate = {
  x: number;
  y: number;
};

export default function InvestmentTrendChart({ points, className = '' }: InvestmentTrendChartProps) {
  const uniqueId = useId();
  const lineGradientId = `${LINE_GRADIENT_ID}-${uniqueId}`;
  const areaGradientId = `${AREA_GRADIENT_ID}-${uniqueId}`;
  const glowFilterId = `${GLOW_FILTER_ID}-${uniqueId}`;
  const maskId = `${MASK_ID}-${uniqueId}`;

  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const [viewBoxWidth, setViewBoxWidth] = useState(DEFAULT_VIEWBOX_WIDTH);

  useEffect(() => {
    const element = svgWrapperRef.current;
    if (!element) return;

    const updateWidth = () => {
      const width = element.clientWidth || DEFAULT_VIEWBOX_WIDTH;
      setViewBoxWidth(Math.max(width, DEFAULT_VIEWBOX_WIDTH));
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width || DEFAULT_VIEWBOX_WIDTH;
      setViewBoxWidth(Math.max(width, DEFAULT_VIEWBOX_WIDTH));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const hasEnoughPoints = points.length > 1;
  const coordinates = useMemo(
    () => (hasEnoughPoints ? createCoordinates(points, viewBoxWidth) : []),
    [hasEnoughPoints, points, viewBoxWidth],
  );
  const { linePath, areaPath } = useMemo(
    () => (hasEnoughPoints ? buildPaths(coordinates) : { linePath: '', areaPath: '' }),
    [coordinates, hasEnoughPoints],
  );

  const [progress, setProgress] = useState(hasEnoughPoints ? 0 : 1);

  useEffect(() => {
    if (!hasEnoughPoints) {
      setProgress(1);
      return;
    }

    setProgress(0);
    let rafId: number;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }
      const elapsed = timestamp - startTime;
      const nextProgress = Math.min(elapsed / DRAW_DURATION_MS, 1);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [hasEnoughPoints, linePath]);

  const maskWidth = Math.max(progress * viewBoxWidth, 0);
  const drawableWidth = Math.max(1, viewBoxWidth - PADDING_X * 2);
  const pathProgress = Math.max(0, Math.min(1, (maskWidth - PADDING_X) / drawableWidth));

  const { displayCoordinate, valueLabel } = useMemo(() => {
    if (!coordinates.length || !points.length) {
      return { displayCoordinate: null, valueLabel: '' };
    }

    if (pathProgress >= 1) {
      const lastCoordinate = coordinates[coordinates.length - 1];
      const lastPoint = points[points.length - 1];
      return {
        displayCoordinate: lastCoordinate,
        valueLabel: formatValue(lastPoint.value),
      };
    }

    const scaledIndex = Math.max(0, Math.min((coordinates.length - 1) * pathProgress, coordinates.length - 1));
    const leftIndex = Math.floor(scaledIndex);
    const rightIndex = Math.min(coordinates.length - 1, leftIndex + 1);
    const segmentT = scaledIndex - leftIndex;

    const leftCoordinate = coordinates[leftIndex];
    const rightCoordinate = coordinates[rightIndex];
    const interpolatedCoordinate = {
      x: leftCoordinate.x + (rightCoordinate.x - leftCoordinate.x) * segmentT,
      y: leftCoordinate.y + (rightCoordinate.y - leftCoordinate.y) * segmentT,
    };

    const leftValue = points[leftIndex]?.value ?? 0;
    const rightValue = points[rightIndex]?.value ?? leftValue;
    const interpolatedValue = leftValue + (rightValue - leftValue) * segmentT;

    return {
      displayCoordinate: interpolatedCoordinate,
      valueLabel: formatValue(interpolatedValue),
    };
  }, [coordinates, pathProgress, points]);

  const labelPosition =
    displayCoordinate && valueLabel
      ? {
          x: Math.min(
            Math.max(displayCoordinate.x + VALUE_LABEL_OFFSET_X, VALUE_LABEL_OFFSET_X),
            viewBoxWidth - VALUE_LABEL_OFFSET_X,
          ),
          y: Math.max(displayCoordinate.y + VALUE_LABEL_OFFSET_Y, 16),
        }
      : null;
  const labelAnchor = labelPosition && labelPosition.x > viewBoxWidth - 40 ? 'end' : 'start';

  return (
    <div
      className={`relative mx-auto flex w-full max-w-[30rem] flex-col gap-4 overflow-visible rounded-[1.25rem] bg-[#050D18] shadow-[0_30px_60px_rgba(0,0,0,0.55)] ${className}`}
      aria-live="polite"
    >
      <div ref={svgWrapperRef} className="relative h-[9.625rem] w-full overflow-visible">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="투자 추이 라인 차트"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id={lineGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EFFF8F" stopOpacity="1" />
              <stop offset="100%" stopColor="#8F9956" stopOpacity="1" />
            </linearGradient>

            <linearGradient id={areaGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F8FFCF" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#EFFF8F" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#EFFF8F" stopOpacity="0" />
            </linearGradient>

            <filter id={glowFilterId} x="-20%" y="-30%" width="150%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <mask id={maskId} maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width={maskWidth} height={VIEWBOX_HEIGHT} fill="white" />
            </mask>
          </defs>

          {hasEnoughPoints ? (
            <>
              <g mask={`url(#${maskId})`}>
                {areaPath && (
                  <path d={areaPath} fill={`url(#${areaGradientId})`} opacity="0.85" aria-hidden="true" />
                )}

                <path
                  d={linePath}
                  fill="none"
                  stroke={`url(#${lineGradientId})`}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  opacity={0.9}
                  filter={`url(#${glowFilterId})`}
                  aria-hidden="true"
                />

                <path
                  d={linePath}
                  fill="none"
                  stroke="#EFFF8F"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </g>
            </>
          ) : (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#888888"
              fontSize="14"
              fontFamily="var(--font-pretendard, Pretendard, sans-serif)"
            >
              표시할 데이터가 없습니다
            </text>
          )}
        </svg>
      </div>

      <div className="mx-auto flex w-full max-w-[30rem] items-center justify-between text-[14px] font-medium text-text-secondary">
        {points.map(point => (
          <span
            key={`${point.label}-${point.value}`}
            className="text-center"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function createCoordinates(points: InvestmentTrendPoint[], width: number): ChartCoordinate[] {
  const values = points.map(point => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const usableWidth = width - PADDING_X * 2;
  const usableHeight = VIEWBOX_HEIGHT - (PADDING_TOP + PADDING_BOTTOM);
  const step = points.length > 1 ? usableWidth / (points.length - 1) : 0;

  return points.map((point, index) => {
    const ratio = (point.value - minValue) / range;
    return {
      x: PADDING_X + index * step,
      y: PADDING_TOP + (1 - ratio) * usableHeight,
    };
  });
}

function buildPaths(coordinates: ChartCoordinate[]) {
  if (coordinates.length < 2) {
    return { linePath: '', areaPath: '' };
  }

  const commands = coordinates.map((point, index, array) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = array[index - 1];
    const deltaX = point.x - previous.x;

    const controlPoint1X = previous.x + deltaX * SMOOTHING;
    const controlPoint1Y = previous.y;
    const controlPoint2X = point.x - deltaX * SMOOTHING;
    const controlPoint2Y = point.y;

    return `C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${point.x} ${point.y}`;
  });

  const linePath = commands.join(' ');
  const baseline = VIEWBOX_HEIGHT - PADDING_BOTTOM;
  const firstPoint = coordinates[0];
  const lastPoint = coordinates[coordinates.length - 1];
  const areaPath = `${linePath} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`;

  return {
    linePath,
    areaPath,
  };
}

