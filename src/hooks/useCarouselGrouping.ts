import { useMemo } from 'react';
import { CarouselCard, CarouselGroup, CarouselState } from '@/types/carousel';

export const useCarouselGroups = (cards: CarouselCard[]): CarouselGroup[] =>
  useMemo(() => {
    if (!cards.length) return [];

    return cards.reduce<CarouselGroup[]>((groups, card, idx) => {
      const invested = Boolean(card.isInvested);
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.isInvested === invested) {
        lastGroup.items.push(card);
        return groups;
      }

      return [
        ...groups,
        {
          id: `group-${idx}-${card.id}`,
          isInvested: invested,
          items: [card],
        },
      ];
    }, []);
  }, [cards]);

export const useStateGroupIndices = (groups: CarouselGroup[]) =>
  useMemo(() => {
    const indices: Partial<Record<CarouselState, number>> = {};

    groups.forEach((group, index) => {
      const state: CarouselState = group.isInvested ? 'invested' : 'market';
      if (indices[state] === undefined) {
        indices[state] = index;
      }
    });

    return indices;
  }, [groups]);

export const getActiveState = (groups: CarouselGroup[], currentIndex: number): CarouselState | null => {
  const currentGroup = groups[currentIndex];
  if (!currentGroup) return null;
  return currentGroup.isInvested ? 'invested' : 'market';
};

