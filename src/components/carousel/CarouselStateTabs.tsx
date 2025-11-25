import { STATE_LABELS, STATE_ORDER } from '@/constants/carousel';
import { CarouselState } from '@/types/carousel';

interface CarouselStateTabsProps {
  activeState: CarouselState | null;
  stateGroupIndices: Partial<Record<CarouselState, number>>;
  onStateSelect: (state: CarouselState) => void;
}

export function CarouselStateTabs({ activeState, stateGroupIndices, onStateSelect }: CarouselStateTabsProps) {
  return (
    <div className="flex items-center gap-2 mb-3" role="tablist" aria-label="캐러셀 상태">
      {STATE_ORDER.map((state) => {
        const isActive = activeState ? activeState === state : state === 'invested';
        const isAvailable = typeof stateGroupIndices[state] === 'number';

        return (
          <button
            key={state}
            type="button"
            onClick={() => isAvailable && onStateSelect(state)}
            disabled={!isAvailable}
            role="tab"
            aria-selected={isActive}
            className={`bg-transparent border-0 p-0 text-base font-semibold transition-colors ${
              isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
            } ${isActive ? 'text-white font-bold' : 'text-[#888888]'}`}
          >
            {STATE_LABELS[state]}
          </button>
        );
      })}
    </div>
  );
}

