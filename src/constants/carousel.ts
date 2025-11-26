import { CarouselState } from '@/types/carousel';

export const STATE_LABELS: Record<CarouselState, string> = {
  invested: '보유 주식',
  market: '시장',
};

export const STATE_ORDER: CarouselState[] = Object.keys(STATE_LABELS) as CarouselState[];

export const EMPTY_STATE_MESSAGES: Record<CarouselState, string> = {
  invested: '아직 투자한 기업이 없어요',
  market: '모든 기업에 투자했어요',
};

