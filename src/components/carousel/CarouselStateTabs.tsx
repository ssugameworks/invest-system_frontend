import { STATE_LABELS, STATE_ORDER } from '@/constants/carousel';
import { CarouselState } from '@/types/carousel';

interface CarouselStateTabsProps {
  activeState: CarouselState | null;
  onStateSelect: (state: CarouselState) => void;
  tabs: Array<{ state: CarouselState; hasItems: boolean }>;
}

export function CarouselStateTabs({ activeState, onStateSelect, tabs }: CarouselStateTabsProps) {
  const tabMap = new Map(tabs.map((tab) => [tab.state, tab]));

  return (
    <div className="flex items-center gap-2 " role="tablist" aria-label="캐러셀 상태">
      {STATE_ORDER.map((state) => {
        const isActive = activeState ? activeState === state : state === 'invested';
        const hasItems = tabMap.get(state)?.hasItems ?? false;

        return (
          <button
            key={state}
            type="button"
            onClick={() => onStateSelect(state)}
            role="tab"
            aria-selected={isActive}
            className={`bg-transparent border-0 p-0 text-base font-semibold transition-colors ${
              isActive ? 'text-white font-bold' : 'text-[#888888]'
            } ${hasItems ? '' : 'opacity-70'}`}
          >
            {STATE_LABELS[state]}
          </button>
        );
      })}
    </div>
  );
}

