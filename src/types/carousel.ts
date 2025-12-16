export type CarouselState = 'invested' | 'market';

export type GlowVariant = 'bright' | 'muted';

export interface CarouselCard {
  id: number;
  title: string;
  members?: string;
  subtitle?: string;
  isInvested?: boolean;
  totalInvestment: number;
  currentPrice?: number;
  changeAmount?: number;
  changeRate?: number;
  changeLabel?: string;
  trendDirection?: 'up' | 'down';
  avatar?: string;
  avatarLabel?: string;
  avatarBackground?: string;
  glowVariant?: GlowVariant;
}

export interface CarouselGroup {
  id: string;
  isInvested: boolean;
  items: CarouselCard[];
}

