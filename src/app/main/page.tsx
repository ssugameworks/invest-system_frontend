'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Capital from './containers/Capital';
import InvestmentTrendSection from './containers/InvestmentTrendSection';
import Carousel from '@/components/Carousel';
import PresentationViewer from '@/components/PresentationViewer';
import { getTeams, getMyPortfolio, getMyInfo } from '@/lib/api';
import { identifyUser, isPostHogReady } from '@/lib/posthog';
import type { CarouselCard } from '@/types/carousel';
import { CarouselCardButton } from '@/components/carousel/CarouselCardButton';
import BottomNavigation from '@/components/BottomNavigation';
import { CapitalSkeleton, CarouselCardButtonSkeleton } from '@/components/Skeleton';
import ServiceOpenModal from '@/components/ServiceOpenModal';
import BuySuccessModal from '@/components/BuySuccessModal';
import LiveChatPreview from './containers/LiveChatPreview';
import type { UserResponse } from '@/lib/api/types';

const SERVICE_OPEN_DATE = new Date('2025-12-19T19:00:00+09:00');

const getAllowedSchoolNumbers = (): number[] => {
  const envValue = process.env.NEXT_PUBLIC_ALLOWED_SCHOOL_NUMBERS;
  if (!envValue) {
    return [];
  }
  return envValue
    .split(',')
    .map(num => parseInt(num.trim(), 10))
    .filter(num => !isNaN(num));
};

function isServiceOpen(): boolean {
  const now = new Date();
  return now >= SERVICE_OPEN_DATE;
}

function isAllowedUser(schoolNumber: number): boolean {
  const allowedNumbers = getAllowedSchoolNumbers();
  return allowedNumbers.includes(schoolNumber);
}

export default function MainPage() {
  const [cards, setCards] = useState<CarouselCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBuySuccessModal, setShowBuySuccessModal] = useState(false);
  const [buySuccessData, setBuySuccessData] = useState<{ shares: number; amount: number } | null>(null);
  const [userInfo, setUserInfo] = useState<UserResponse | null>(null);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        try {
          const userInfoData = await getMyInfo();
          setUserInfo(userInfoData);
          
          if (!isServiceOpen() && !isAllowedUser(userInfoData.schoolNumber)) {
            setShowServiceModal(true);
            return;
          }
          
          if (isPostHogReady()) {
            identifyUser(userInfoData.id, {
              name: userInfoData.name,
              nickname: userInfoData.name,
              schoolNumber: userInfoData.schoolNumber,
              department: userInfoData.department,
            });
          }
        } catch (error) {
        }

        const [teams, portfolio] = await Promise.all([
          getTeams(),
          getMyPortfolio().catch(() => null),
        ]);

        const investedTeamIds = new Set(
          portfolio?.items.map((item) => item.team_id) || []
        );

        const carouselCards: CarouselCard[] = teams.map((team) => {
          const isInvested = investedTeamIds.has(team.id);
          const portfolioItem = portfolio?.items.find((item) => item.team_id === team.id);
          // p만 사용 (p0 제거)
          const currentPrice = team.p || 0;
          
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
          };
        });

        setCards(carouselCards);
      } catch {
        const { sampleCards } = await import('@/constants/carouselSampleCards');
        setCards(sampleCards);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, []);

  // 매수 성공 모달 표시 확인
  useEffect(() => {
    const buySuccessDataStr = sessionStorage.getItem('buySuccess');
    if (buySuccessDataStr) {
      try {
        const data = JSON.parse(buySuccessDataStr);
        setBuySuccessData(data);
        setShowBuySuccessModal(true);
        sessionStorage.removeItem('buySuccess');
      } catch (error) {
        sessionStorage.removeItem('buySuccess');
      }
    }
  }, []);

  const myCards = cards.filter((card) => card.isInvested);

  const handleModalClose = () => {
    setShowServiceModal(false);
    window.location.href = '/login';
  };

  return (
    <>
      <ServiceOpenModal 
        isOpen={showServiceModal} 
        onClose={handleModalClose}
      />
      <BuySuccessModal
        isOpen={showBuySuccessModal}
        onClose={() => {
          setShowBuySuccessModal(false);
          setBuySuccessData(null);
        }}
        shares={buySuccessData?.shares}
        amount={buySuccessData?.amount}
      />
      <div className="relative min-h-screen w-full bg-background-card pb-20 pt-4">
        <div className="flex flex-col w-full max-w-[448px] mx-auto px-4 gap-8">
          <Header />
          
          {isLoading || !userInfo ? (
            <CapitalSkeleton />
          ) : (
            <div className="animate-fade-in">
              <Capital initialCapital={userInfo.capital} />
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="h-px bg-white/5 w-full my-2" />
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-white tracking-tight">내 투자 자산</h2>
              {!isLoading && myCards.length > 0 && (
                <span className="text-sm text-text-tertiary">{myCards.length}개 종목</span>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <CarouselCardButtonSkeleton key={i} />
                ))}
              </div>
            ) : myCards.length > 0 ? (
              <div className="flex flex-col gap-2 animate-fade-in">
                {myCards.map((card) => (
                  <div key={card.id} className="w-full">
                    <CarouselCardButton card={card} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-text-secondary text-sm">아직 투자한 종목이 없습니다</p>
                <p className="text-text-tertiary text-xs mt-2">매수하기 버튼을 눌러 투자를 시작해보세요</p>
              </div>
            )}
          </div>

          <PresentationViewer teamName="불개미" />

          <LiveChatPreview />

          <div className="h-20" />
        </div>
        
        <BottomNavigation />
      </div>
    </>
  );
}
