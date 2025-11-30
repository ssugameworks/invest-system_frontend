'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Capital from './containers/Capital';
import InvestmentTrendSection from './containers/InvestmentTrendSection';
import Carousel from '@/components/Carousel';
import LiveChatPreview from './containers/LiveChatPreview';
import { getTeams, getMyPortfolio } from '@/lib/api';
import type { CarouselCard } from '@/types/carousel';

export default function MainPage() {
  const [cards, setCards] = useState<CarouselCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        // 팀 목록과 포트폴리오를 병렬로 가져오기
        const [teams, portfolio] = await Promise.all([
          getTeams(),
          getMyPortfolio().catch(() => null), // 로그인하지 않은 경우 null
        ]);

        // 보유 주식 팀 ID 목록
        const investedTeamIds = new Set(
          portfolio?.items.map((item) => item.team_id) || []
        );

        const carouselCards: CarouselCard[] = teams.map((team) => {
          const isInvested = investedTeamIds.has(team.id);
          const portfolioItem = portfolio?.items.find((item) => item.team_id === team.id);
          
          return {
            id: team.id,
            image: team.pitch_url || undefined,
            title: team.teamName,
            subtitle: isInvested && portfolioItem
              ? `${Math.round(portfolioItem.shares)}주`
              : `현재가: ${team.p?.toLocaleString() || team.p0?.toLocaleString() || '1,000'}원`,
            totalInvestment: team.money || 0,
            isInvested,
          };
        });

        setCards(carouselCards);
      } catch (error) {
        console.error('팀 목록 로딩 실패:', error);
        // 폴백 데이터 사용
        const { sampleCards } = await import('@/constants/carouselSampleCards');
        setCards(sampleCards);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, []);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background-card px-3">
      <div className="flex flex-col gap-4 justify-center items-center w-full">
        <InvestmentTrendSection />
        {isLoading ? ( 
          <div className="text-text-secondary text-sm">팀 목록을 불러오는 중...</div>
        ) : (
          <Carousel cards={cards} />
        )}
        <LiveChatPreview />
        <Header />
        <div></div>
      </div>
    </div>
  );
}
