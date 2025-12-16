'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { CarouselCardButton } from '@/components/carousel/CarouselCardButton';
import { getTeams, getMyPortfolio, getTeamPriceHistory } from '@/lib/api';
import type { CarouselCard } from '@/types/carousel';
import { CarouselCardButtonSkeleton } from '@/components/Skeleton';

function InvestPageContent() {
  const searchParams = useSearchParams();
  const [cards, setCards] = useState<CarouselCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'my' | 'rising' | 'falling'>('all');
  const uninvestedSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam && ['all', 'my', 'rising', 'falling'].includes(filterParam)) {
      setFilter(filterParam as 'all' | 'my' | 'rising' | 'falling');
    }
  }, [searchParams]);

  // 매수하기 버튼으로 진입 시 투자 가능 종목으로 스크롤
  useEffect(() => {
    if (!isLoading && filter === 'all' && uninvestedSectionRef.current) {
      const filterParam = searchParams.get('filter');
      if (filterParam === 'all') {
        setTimeout(() => {
          uninvestedSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 300);
      }
    }
  }, [isLoading, filter, searchParams]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const [teams, portfolio] = await Promise.all([
          getTeams(),
          getMyPortfolio().catch(() => null),
        ]);

        const investedTeamIds = new Set(
          portfolio?.items.map((item) => item.team_id) || []
        );

        // 각 팀의 가격 히스토리를 가져와서 그래프 기울기 계산
        const carouselCards: CarouselCard[] = await Promise.all(
          teams.map(async (team) => {
            const isInvested = investedTeamIds.has(team.id);
            const portfolioItem = portfolio?.items.find((item) => item.team_id === team.id);
            // p만 사용 (p0 제거)
            const currentPrice = team.p || 0;
            
            // 가격 히스토리를 가져와서 그래프 기울기 계산
            let trendDirection: 'up' | 'down' = 'up';
            try {
              const priceHistory = await getTeamPriceHistory(team.id);
              if (priceHistory.length >= 2) {
                const firstPrice = priceHistory[0].price;
                const lastPrice = priceHistory[priceHistory.length - 1].price;
                // 음의 기울기면 하락, 양의 기울기면 상승
                trendDirection = lastPrice < firstPrice ? 'down' : 'up';
              }
            } catch {
              // 에러 시 기본값 사용
            }
            
            // ROI 정보 가져오기 (투자한 경우에만)
            let roi: number | undefined = undefined;
            if (isInvested && portfolioItem) {
              roi = portfolioItem.profit_rate;
            }
            
            return {
              id: team.id,
              image: team.pitch_url || undefined,
              title: team.teamName,
              subtitle: isInvested && portfolioItem
                ? `${Math.round(portfolioItem.shares)}주`
                : currentPrice > 0
                  ? `현재가: ${currentPrice.toLocaleString()}원`
                  : '가격 정보 없음',
              totalInvestment: team.money || 0,
              currentPrice: currentPrice > 0 ? currentPrice : undefined,
              isInvested,
              trendDirection,
              changeRate: roi, // ROI를 changeRate에 저장하여 필터링에 사용
            };
          })
        );

        setCards(carouselCards);
      } catch {
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, []);

  const filteredCards = cards
    .filter((card) => {
      if (filter === 'rising') {
        // 상승중: 그래프 기울기가 양수이고, ROI가 0%가 아닌 경우만
        return card.trendDirection === 'up' && (card.changeRate === undefined || card.changeRate > 0);
      }
      if (filter === 'falling') return card.trendDirection === 'down';
      if (filter === 'my') return card.isInvested;
      return true;
    })
    .sort((a, b) => {
      if (filter === 'rising') {
        // 상승중: 총 투자금 내림차순
        return b.totalInvestment - a.totalInvestment;
      }
      if (filter === 'falling') {
        // 하락중: 총 투자금 오름차순
        return a.totalInvestment - b.totalInvestment;
      }
      return 0;
    });

  const investedCards = filteredCards.filter((card) => card.isInvested);
  const uninvestedCards = filteredCards.filter((card) => !card.isInvested);

  return (
    <div className="relative min-h-screen w-full bg-background-card pb-20 pt-6">
      <div className="flex flex-col w-full max-w-[448px] mx-auto px-4 gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-white">투자하기</h1>
          <p className="text-sm text-text-secondary">스타트업에 투자하고 수익을 창출하세요</p>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-accent-yellow text-background-card'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('my')}
              className={`flex-1 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'my'
                  ? 'bg-accent-yellow text-background-card'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              💼 보유중
            </button>
            <button
              onClick={() => setFilter('rising')}
              className={`flex-1 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'rising'
                  ? 'bg-accent-yellow text-background-card'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              📈 상승중
            </button>
            <button
              onClick={() => setFilter('falling')}
              className={`flex-1 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'falling'
                  ? 'bg-accent-yellow text-background-card'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              📉 하락중
            </button>
          </div>
        </div>

        {/* Team List */}
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <CarouselCardButtonSkeleton key={i} style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="py-20 text-center text-text-secondary text-sm">팀이 없습니다</div>
          ) : filter === 'all' ? (
            <>
              {/* 투자한 종목 섹션 */}
              {investedCards.length > 0 && (
                <div className="flex flex-col gap-3 animate-fade-in">
                  <h3 className="text-base font-semibold text-white px-2">보유 종목</h3>
                  <div className="flex flex-col gap-2">
                    {investedCards.map((card) => (
                      <div key={card.id} className="w-full">
                        <CarouselCardButton card={card} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 투자하지 않은 종목 섹션 */}
              {uninvestedCards.length > 0 && (
                <div ref={uninvestedSectionRef} className="flex flex-col gap-3 scroll-mt-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <h3 className="text-base font-semibold text-white px-2">투자 가능 종목</h3>
                  <div className="flex flex-col gap-2">
                    {uninvestedCards.map((card) => (
                      <div key={card.id} className="w-full">
                        <CarouselCardButton card={card} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2 animate-fade-in">
              {filteredCards.map((card) => (
                <div key={card.id} className="w-full">
                  <CarouselCardButton card={card} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation Spacer */}
        <div className="h-20" />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default function InvestPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen w-full bg-background-card pb-20 pt-6">
        <div className="flex flex-col w-full max-w-[448px] mx-auto px-4 gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-white">투자하기</h1>
            <p className="text-sm text-text-secondary">스타트업에 투자하고 수익을 창출하세요</p>
          </div>
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <CarouselCardButtonSkeleton key={i} style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    }>
      <InvestPageContent />
    </Suspense>
  );
}

