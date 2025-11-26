import { CarouselCard } from '@/components/Carousel';
import { sampleTeams } from '@/constants/teamData';

/**
 * 캐러셀 데모 페이지용 임시 카드 데이터
 */
export const sampleCards: CarouselCard[] = [
  {
    id: sampleTeams[0].id,
    title: sampleTeams[0].title,
    subtitle: '3주',
    isInvested: false,
    totalInvestment: 20000,
    changeAmount: 5000,
    changeRate: 5.8,
    glowVariant: 'bright',
  },
  {
    id: sampleTeams[1].id,
    title: sampleTeams[1].title,
    subtitle: '2주',
    isInvested: true,
    totalInvestment: 18000,
    changeAmount: -3200,
    changeRate: 3.4,
    glowVariant: 'muted',
  },
  {
    id: sampleTeams[2].id,
    title: sampleTeams[2].title,
    isInvested: false,
    totalInvestment: 42500,
    changeAmount: 2100,
    changeRate: 1.9,
    glowVariant: 'bright',
  },
  {
    id: sampleTeams[3].id,
    title: sampleTeams[3].title,
    isInvested: false,
    totalInvestment: 15200,
    changeAmount: -800,
    changeRate: 0.9,
    glowVariant: 'muted',
  },
  {
    id: sampleTeams[4].id,
    title: sampleTeams[4].title,
    isInvested: false,
    totalInvestment: 9900,
    changeAmount: 1200,
    changeRate: 2.4,
    glowVariant: 'bright',
  },
  {
    id: sampleTeams[0].id + 100,
    title: 'Indie Lab',
    isInvested: false,
    totalInvestment: 18500,
    changeAmount: -2300,
    changeRate: 4.1,
    glowVariant: 'muted',
  },
];

