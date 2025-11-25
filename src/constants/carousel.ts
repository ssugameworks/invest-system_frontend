import { CarouselState } from '@/types/carousel';

export const STATE_LABELS: Record<CarouselState, string> = {
  invested: '보유 주식',
  market: '시장',
};

export const STATE_ORDER: CarouselState[] = Object.keys(STATE_LABELS) as CarouselState[];

