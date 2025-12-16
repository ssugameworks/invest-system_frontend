'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedPercentProps {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

const percentFormatter = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

export default function AnimatedPercent({
  value,
  duration = 600,
  className = '',
  style,
}: AnimatedPercentProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValueRef = useRef(value);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (previousValueRef.current === value) return;

    const startValue = previousValueRef.current;
    const endValue = value;
    const difference = endValue - startValue;

    // 값이 변경되면 애니메이션 시작
    setIsAnimating(true);
    startTimeRef.current = null;

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic 함수 사용 (머니슬롯 느낌)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + difference * easeOutCubic;

      // 소숫점 제거: 정수로만 표시 (퍼센트는 소숫점 첫째자리까지 허용하되, 애니메이션 중에는 정수로)
      setDisplayValue(Math.round(currentValue * 10) / 10);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
        previousValueRef.current = endValue;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span
      className={`transition-opacity duration-200 ${isAnimating ? 'opacity-90' : 'opacity-100'} ${className}`}
      style={style}
    >
      {percentFormatter.format(displayValue)}%
    </span>
  );
}

