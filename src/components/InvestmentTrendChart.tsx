'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { InvestmentTrendPoint } from '@/api/api';

type InvestmentTrendChartProps = {
  points: InvestmentTrendPoint[];
  className?: string;
  changeRate?: number; // 주가 변화율 (양수면 상승, 음수면 하락)
};

const valueFormatter = new Intl.NumberFormat('ko-KR');
const formatValue = (value: number) => valueFormatter.format(Math.round(value));

export default function InvestmentTrendChart({
  points,
  className = '',
  changeRate = 0,
}: InvestmentTrendChartProps) {
  if (!points || points.length === 0) {
    return (
      <div
        className={`relative flex w-full flex-col gap-4 overflow-hidden rounded-[1.5rem] bg-[#151A29] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] ${className}`}
      >
        <div className="flex h-[154px] w-full items-center justify-center text-sm text-text-tertiary">
          표시할 데이터가 없습니다
        </div>
      </div>
    );
  }

  // X축: 20분 전 ~ 10분 후 (전체 30분 범위)
  // X축 전체를 채우기 위해 30분 범위를 균등하게 나눠서 데이터 생성
  // 떨어지는 구간(값이 급격히 감소하는 부분)을 감지하여 null로 처리
  const chartData = useMemo(() => {
    // 시간 문자열을 분 단위로 변환하는 함수
    const parseTimeToMinutes = (timeStr: string): number => {
      const parts = timeStr.split(':').map(Number);
      if (parts.length >= 2) {
        return parts[0] * 60 + parts[1];
      }
      return 0;
    };

    // 분을 시간 문자열로 변환
    const formatMinutesToTime = (totalMinutes: number): string => {
      const adjusted = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
      const hour = Math.floor(adjusted / 60);
      const minute = adjusted % 60;
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    // 현재 시간 파싱
    const rawCurrentTimeLabel = points[points.length - 1]?.label || '';
    const timeParts = rawCurrentTimeLabel.split(':').map(Number);
    const [currentHour, currentMinute] = timeParts;
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    // 시간 범위 계산: 현재 시간 기준 20분 전 ~ 10분 후 (여백 유지)
    const firstTimeTotalMinutes = currentTotalMinutes - 20;
    const lastTimeTotalMinutes = currentTotalMinutes + 10;
    const totalRangeMinutes = 30; // 20분 + 10분

    // 실제 데이터를 시간에 맞게 맵핑
    const dataMap = new Map<number, number>();
    points.forEach((point) => {
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
    const chartDataPoints: Array<{ label: string; value: number | null; _timeMinutes: number }> = [];
    
    for (let i = 0; i <= totalRangeMinutes; i++) {
      const timeMinutes = firstTimeTotalMinutes + i;
      const adjustedTimeMinutes = ((timeMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
      
      // 현재 시간 이후의 포인트는 null로 처리 (선이 그려지지 않음)
      const value = timeMinutes > currentTotalMinutes ? null : (dataMap.get(timeMinutes) ?? null);
      
      chartDataPoints.push({
        label: formatMinutesToTime(adjustedTimeMinutes),
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

    // _timeMinutes 제거하고 반환
    return processedPoints.map(({ _timeMinutes, ...point }) => point);
  }, [points]);

  // 그래프 색상: 항상 노란색으로 표시
  const chartColor = '#EFFF8F'; // 노란색
  const chartGradientId = 'colorValue';
  const lineGradientId = 'lineGradient';

  // 현재 시간이 차트의 2/3 지점(20분/30분)에 위치
  // chartData는 0~30분(총 31개 포인트), 현재 시간은 20번째 포인트(인덱스 20)
  const currentTimeIndex = 20; // 20분 전부터 시작하므로 인덱스 20이 현재 시간
  const chartWidthRatio = (chartData.length - 1) > 0 ? currentTimeIndex / (chartData.length - 1) : 0;

  // 차트 영역 내에서의 실제 위치 (padding 16px 고려)
  // 전체 너비 기준으로: 16px + (차트 영역 너비 * 비율)
  // 차트 영역이 대략 96% 정도이므로 이를 고려
  const currentLabelLeft = `calc(16px + ${chartWidthRatio * 96}%)`;

  // 현재 시간 기준으로 시간 레이블 계산
  const rawCurrentTimeLabel = points[points.length - 1].label; // 마지막 포인트가 현재 시간
  const timeParts = rawCurrentTimeLabel.split(':').map(Number);
  
  // 초 단위 제거, 시:분만 사용
  const [currentHour, currentMinute] = timeParts;
  const currentTimeLabel = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

  // 첫 시간: 현재 시간의 20분 전
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const firstTimeTotalMinutes = currentTotalMinutes - 20; // 20분 전

  // 음수 처리 (하루 전으로 넘어가는 경우)
  const adjustedFirstTotalMinutes = firstTimeTotalMinutes < 0 ? firstTimeTotalMinutes + 24 * 60 : firstTimeTotalMinutes;

  const firstHour = Math.floor(adjustedFirstTotalMinutes / 60) % 24;
  const firstMinute = adjustedFirstTotalMinutes % 60;

  const firstLabel = `${firstHour.toString().padStart(2, '0')}:${firstMinute.toString().padStart(2, '0')}`;

  // 마지막 시간: 현재 시간의 10분 뒤
  const lastTimeTotalMinutes = currentTotalMinutes + 10;
  const adjustedLastTotalMinutes = lastTimeTotalMinutes % (24 * 60);

  const lastHour = Math.floor(adjustedLastTotalMinutes / 60);
  const lastMinute = adjustedLastTotalMinutes % 60;

  const endLabel = `${lastHour.toString().padStart(2, '0')}:${lastMinute.toString().padStart(2, '0')}`;

  // dot 렌더링 함수를 메모이제이션
  const renderDot = useMemo(() => {
    return (props: any) => {
      const { cx, cy, index } = props;

      // 현재 시간 지점(인덱스 20)에만 점 표시
      if (index === 20 && cx != null && cy != null) {
        const dotColor = '#EFFF8F'; // 항상 노란색
        return (
          <g key={`dot-${index}`}>
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={150}
              stroke={dotColor}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.8}
            />
            <circle cx={cx} cy={cy} r={8} fill={dotColor} fillOpacity={0.3} />
            <circle cx={cx} cy={cy} r={5} fill={dotColor} fillOpacity={0.5} />
            <circle cx={cx} cy={cy} r={3} fill="#FFFFFF" stroke={dotColor} strokeWidth={1.5} />
          </g>
        );
      }
      return null;
    };
  }, [points.length, changeRate]);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [canRenderChart, setCanRenderChart] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const element = chartContainerRef.current;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setCanRenderChart(rect.width > 0 && rect.height > 0);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={chartContainerRef}
      className={`relative flex w-full flex-col gap-4 overflow-hidden rounded-[1.5rem] bg-[#0D1525] border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] focus:border-white/5 active:border-white/5 ${className}`}
      tabIndex={-1}
      style={{ outline: 'none' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="h-[154px] w-full px-4 pt-4">
        {canRenderChart && (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                {/* 노란색 그래디언트 (상승) */}
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EFFF8F" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#F2FFA2" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#E7FA4F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#E7FA4F" stopOpacity={1} />
                  <stop offset="30%" stopColor="#F2FFA2" stopOpacity={1} />
                  <stop offset="60%" stopColor="#EFFF8F" stopOpacity={1} />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity={1} />
                </linearGradient>
                {/* 빨간색 그래디언트 (하락) */}
                <linearGradient id="colorValueRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#fca5a5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lineGradientRed" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                  <stop offset="30%" stopColor="#f87171" stopOpacity={1} />
                  <stop offset="60%" stopColor="#fca5a5" stopOpacity={1} />
                  <stop offset="100%" stopColor="#fecaca" stopOpacity={1} />
                </linearGradient>
                {/* 초록색 그래디언트 (0일 때) */}
                <linearGradient id="colorValueGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#34d399" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lineGradientGreen" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#059669" stopOpacity={1} />
                  <stop offset="30%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="60%" stopColor="#34d399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6ee7b7" stopOpacity={1} />
                </linearGradient>
                <filter id="lineGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="strongGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <XAxis dataKey="label" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    if (!data.value) return null;

                    return (
                      <div className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg bg-[#1a1f2e]/95 backdrop-blur-sm border border-white/20 shadow-[0_4px_20px_rgba(176,224,255,0.3)]">
                        <span className="text-sm font-bold text-white whitespace-nowrap">
                          {formatValue(data.value)}원
                        </span>
                        {/* 말풍선 꼬리 */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#1a1f2e]/95 border-l border-b border-white/20 rotate-45"></div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={false}
              />
              <Area
                type="monotoneX"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${chartGradientId})`}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
                connectNulls={true}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={renderDot}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="relative h-6 w-full px-4 text-xs font-medium text-text-tertiary">
        <span className="absolute left-4">
          {firstLabel}
        </span>
        <span
          className="absolute transform -translate-x-11/12 text-white font-semibold"
          style={{
            left: currentLabelLeft
          }}
        >
          {currentTimeLabel}
        </span>
        <span className="absolute right-4 text-text-tertiary">
          {endLabel}
        </span>
      </div>
    </div>
  );
}

