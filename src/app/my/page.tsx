'use client';

import { useEffect, useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { CarouselCardButton } from '@/components/carousel/CarouselCardButton';
import { getMyInfo, getMyPortfolio, getTeams } from '@/lib/api';
import type { CarouselCard } from '@/types/carousel';
import type { UserResponse } from '@/lib/api/types';
import { formatCurrency } from '@/utils/formatters';
import { CardSkeleton, CarouselCardButtonSkeleton } from '@/components/Skeleton';

const ANIMAL_EMOJIS: Record<string, string> = {
  참새: '🐦',
  독수리: '🦅',
  부엉이: '🦉',
  사자: '🦁',
  호랑이: '🐯',
  표범: '🐆',
  고양이: '🐱',
  강아지: '🐶',
  곰: '🐻',
  판다: '🐼',
  토끼: '🐰',
  여우: '🦊',
  늑대: '🐺',
  펭귄: '🐧',
  돌고래: '🐬',
  상어: '🦈',
  고래: '🐋',
  용: '🐉',
  말: '🐴',
  기린: '🦒',
  코끼리: '🐘',
  원숭이: '🐵',
  치타: '🐆',
  뱀: '🐍',
  악어: '🐊',
  거북이: '🐢',
  개구리: '🐸',
  나비: '🦋',
  벌: '🐝',
};

function getAnimalEmoji(name: string): string | null {
  for (const [animal, emoji] of Object.entries(ANIMAL_EMOJIS)) {
    if (name.includes(animal)) {
      return emoji;
    }
  }
  return null;
}

export default function MyPage() {
  const [userInfo, setUserInfo] = useState<UserResponse | null>(null);
  const [myCards, setMyCards] = useState<CarouselCard[]>([]);
  const [stockValue, setStockValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [user, portfolio, teams] = await Promise.all([
          getMyInfo(),
          getMyPortfolio().catch(() => null),
          getTeams(),
        ]);

        setUserInfo(user);

        if (portfolio) {
          // 포트폴리오의 current_value를 주식 평가액으로 사용
          if (Number.isFinite(portfolio.current_value)) {
            setStockValue(portfolio.current_value);
          }

          if (portfolio.items) {
            const portfolioCards = portfolio.items
              .map((item) => {
                const team = teams.find((t) => t.id === item.team_id);
                if (!team) return null;

                return {
                  id: team.id,
                  image: team.pitch_url,
                  title: team.teamName,
                  subtitle: `${Math.round(item.shares)}주`,
                  totalInvestment: team.money || 0,
                  isInvested: true,
                } as CarouselCard;
              })
              .filter((card) => card !== null) as CarouselCard[];

            setMyCards(portfolioCards);
          }
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const cash = userInfo?.capital || 0;
  const totalAssets = cash + stockValue;
  const animalEmoji = userInfo?.name ? getAnimalEmoji(userInfo.name) : null;

  return (
    <div className="relative min-h-screen w-full bg-background-card pb-20 pt-6">
      <div className="flex flex-col w-full max-w-[448px] mx-auto px-4 gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white">내 정보</h1>
          <p className="text-sm text-text-secondary">투자 현황과 계정 정보를 확인하세요</p>
        </div>

        {isLoading ? (
          <>
            <CardSkeleton className="min-h-[280px]" />
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <CarouselCardButtonSkeleton key={i} style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="rounded-[24px] border border-white/10 bg-[#151A29] px-6 py-6 animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-accent-yellow/20 to-accent-green/10 flex items-center justify-center shadow-[0_0_20px_rgba(178,245,82,0.15)]">
                  {animalEmoji ? (
                    <span className="text-4xl leading-none">
                      {animalEmoji}
                    </span>
                  ) : (
                    <span className="text-2xl font-bold text-accent-yellow">
                      {userInfo?.name?.charAt(0) || 'U'}
                    </span>
                  )}
                  <div className="absolute inset-0 rounded-full border-2 border-accent-green/30" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-white">{userInfo?.name || '사용자'}</h2>
                  <p className="text-sm text-text-secondary">{userInfo?.department || '학과 정보 없음'}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{userInfo?.schoolNumber || ''}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">총 자산</span>
                  <span className="text-lg font-bold text-white">{formatCurrency(totalAssets, false)}원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">보유 현금</span>
                  <span className="text-base font-medium text-text-secondary">{formatCurrency(cash, false)}원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">주식 평가액</span>
                  <span className="text-base font-medium text-text-secondary">{formatCurrency(stockValue, false)}원</span>
                </div>
              </div>
            </div>

            {myCards.length > 0 && (
              <div className="flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">내 투자 내역</h2>
                  <span className="text-sm text-text-tertiary">{myCards.length}개 종목</span>
                </div>
                <div className="flex flex-col gap-2">
                  {myCards.map((card) => (
                    <div key={card.id} className="w-full">
                      <CarouselCardButton card={card} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myCards.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-text-secondary text-sm">아직 투자한 종목이 없습니다</p>
                <p className="text-text-tertiary text-xs mt-1">투자 페이지에서 종목을 둘러보세요</p>
              </div>
            )}
          </>
        )}

        <div className="h-20" />
      </div>
      
      <BottomNavigation />
    </div>
  );
}

