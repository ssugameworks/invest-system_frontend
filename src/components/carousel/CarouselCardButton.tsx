import React from 'react';
import { useRouter } from 'next/navigation';
import { formatNumberWithCommas } from '@/utils/formatters';
import { CarouselCard, GlowVariant } from '@/types/carousel';

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
  const isInvested = typeof isInvestedState === 'boolean' ? isInvestedState : Boolean(card.isInvested);
  const avatarLabel = card.avatarLabel ?? (card.title?.[0] ?? '').toUpperCase();
  const glowVariant = card.glowVariant ?? 'bright';
  const changeDirection =
    card.trendDirection ??
    ((typeof card.changeAmount === 'number' ? card.changeAmount : card.changeRate ?? 0) >= 0 ? 'up' : 'down');
  const changeText = card.changeLabel ?? buildChangeLabel(card.changeAmount, card.changeRate, changeDirection);
  const showChange = Boolean(changeText);
  const changeColor = changeDirection === 'down' ? 'text-[#d34250]' : 'text-[#5F79FB]';

  const handleClick = () => {
    onClick?.(card.id);
    router.push(`/detail/${card.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left  bg-[#050D18] transition duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_15px_40px_rgba(0,0,0,0.45)] active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#F6F631]"
      aria-label={`${card.title} 카드`}
    >
      <div className="relative flex items-center justify-center">
        <span aria-hidden className="pointer-events-none absolute -inset-3 -z-10 blur-[22px]" style={AVATAR_GLOW_STYLES[glowVariant]} />
        <div
          className="flex size-11 items-center justify-center rounded-full text-xl font-bold text-black"
          style={{ backgroundColor: card.avatarBackground ?? '#FFFFFF' }}
        >
          {avatarLabel}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-between gap-6 min-w-0">
        <div
          className={`min-w-0 flex flex-col ${isInvested ? 'items-start' : 'items-center text-center justify-center'} `}
        >
          <p
            className={`${
              isInvested ? 'text-base font-semibold text-[#d2d2d2] ' : 'ml-auto text-xl xs:text-lg font-semibold text-white'
            } truncate`}
          >
            {card.title}
          </p>
          {isInvested && card.subtitle && (
            <p className="text-xl font-semibold text-white truncate " aria-label="투자양">
              {card.subtitle}
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
}

