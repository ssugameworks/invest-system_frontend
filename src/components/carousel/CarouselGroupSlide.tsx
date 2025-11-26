import type { CSSProperties } from 'react';
import { CarouselGroup } from '@/types/carousel';
import { CarouselCardButton } from '@/components/carousel/CarouselCardButton';

const MAX_VISIBLE_CARDS = 4;
const MAX_LIST_HEIGHT_PX = 320;

interface CarouselGroupSlideProps {
  group: CarouselGroup;
  onCardClick?: (cardId: number) => void;
  emptyMessage?: string;
}

export function CarouselGroupSlide({ group, onCardClick, emptyMessage }: CarouselGroupSlideProps) {
  const enableOverflow = group.items.length > MAX_VISIBLE_CARDS;
  const listStyle: CSSProperties = { maxHeight: `${MAX_LIST_HEIGHT_PX}px` };

  return (
    <div data-carousel-item className="flex-none w-full max-w-[840px]" style={{ scrollSnapAlign: 'start' }}>
      <div
        className={`h-full w-full py-6 flex flex-col gap-6 ${
          enableOverflow ? 'overflow-y-auto pr-2 scrollbar-hide' : ''
        }`}
        style={listStyle}
      >
        {group.items.length === 0 && emptyMessage ? (
          <div className="flex flex-1 items-center justify-center rounded-lg   px-4 py-10 text-center text-sm text-[#9ca0ab]">
            {emptyMessage}
          </div>
        ) : (
          group.items.map((card) => (
            <CarouselCardButton key={card.id} card={card} onClick={onCardClick} isInvestedState={group.isInvested} />
          ))
        )}
      </div>
    </div>
  );
}

