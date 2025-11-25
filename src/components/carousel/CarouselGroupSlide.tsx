import { CarouselGroup } from '@/types/carousel';
import { CarouselCardButton } from '@/components/carousel/CarouselCardButton';

interface CarouselGroupSlideProps {
  group: CarouselGroup;
  onCardClick?: (cardId: number) => void;
}

export function CarouselGroupSlide({ group, onCardClick }: CarouselGroupSlideProps) {
  return (
    <div data-carousel-item className="flex-none w-full max-w-[840px]" style={{ scrollSnapAlign: 'start' }}>
      <div className="h-full w-full px-6 py-6 flex flex-col gap-6">
        {group.items.map((card) => (
          <CarouselCardButton key={card.id} card={card} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
}

