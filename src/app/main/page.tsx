'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Capital from './containers/Capital';
import InvestmentTrendSection from './containers/InvestmentTrendSection';
import Carousel from '@/components/Carousel';
import dynamic from 'next/dynamic';
import type { Team } from '@/lib/api/types';

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-black/40 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '450px' }}>
      <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />
    </div>
  ),
});
import { getTeams, getMyPortfolio, getMyInfo, getOngoingTeam, getCurrentSlide } from '@/lib/api';
import { identifyUser, isPostHogReady } from '@/lib/posthog';
import type { CarouselCard } from '@/types/carousel';
import { CarouselCardButton } from '@/components/carousel/CarouselCardButton';
import BottomNavigation from '@/components/BottomNavigation';
import { CapitalSkeleton, CarouselCardButtonSkeleton, Skeleton } from '@/components/Skeleton';
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
      const [ongoingTeam, setOngoingTeam] = useState<Team | null>(null);
      const [currentSlide, setCurrentSlide] = useState(1);
      const [userControlled, setUserControlled] = useState(false); // 수동 모드 여부

  // 초기 데이터 로드 (마운트 시 한 번만)
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

        const [teams, portfolio, ongoingTeamData] = await Promise.all([
          getTeams(),
          getMyPortfolio().catch(() => null),
          getOngoingTeam().catch(() => null),
        ]);

        // 발표 중인 팀이 있으면 슬라이드 번호도 가져오기
        if (ongoingTeamData) {
          setOngoingTeam(ongoingTeamData);
          try {
            const slideData = await getCurrentSlide(ongoingTeamData.id);
            setCurrentSlide(slideData.currentSlide);
          } catch {
            setCurrentSlide(1);
          }
        }

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
  }, []); // 마운트 시 한 번만 실행

  // 발표 중인 팀 상태와 슬라이드 번호를 주기적으로 확인 (별도 useEffect로 분리)
  useEffect(() => {
    let isMounted = true;
    let lastCheckTime = 0;
    let checkInterval: NodeJS.Timeout | null = null;
    
    const checkOngoingTeam = async () => {
      if (!isMounted) return;
      
      try {
        // 발표 중인 팀 확인
        const ongoingTeamData = await getOngoingTeam().catch(() => null);
        
        if (!isMounted) return;
        
        if (ongoingTeamData) {
          // 팀이 변경되었는지 확인 (함수형 업데이트로 최신 상태 참조)
          setOngoingTeam((prev) => {
            if (!prev || prev.id !== ongoingTeamData.id) {
              return ongoingTeamData;
            }
            return prev;
          });
          
          // 슬라이드 번호 확인 (함수형 업데이트로 최신 상태 참조)
          try {
            const slideData = await getCurrentSlide(ongoingTeamData.id);
            if (!isMounted) return;
            
            setCurrentSlide((prev) => {
              if (prev !== slideData.currentSlide) {
                return slideData.currentSlide;
              }
              return prev;
            });
          } catch {
            // 에러 무시
          }
        } else {
          // 발표 중인 팀이 없으면 null로 설정
          setOngoingTeam((prev) => {
            if (prev) {
              return null;
            }
            return prev;
          });
        }
        
        lastCheckTime = Date.now();
      } catch {
        // 에러 무시
      }
    };
    
    // 초기 체크
    checkOngoingTeam();
    
    // 3초마다 정기적으로 체크
    checkInterval = setInterval(() => {
      checkOngoingTeam();
    }, 3000);
    
    // BroadcastChannel을 사용하여 DB internal에서 변경 시 즉시 반영
    const channel = new BroadcastChannel('db-internal-updates');
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'slide-changed' || event.data?.type === 'status-changed') {
        // DB internal에서 변경이 감지되면 즉시 체크
        checkOngoingTeam();
      }
    };
    channel.addEventListener('message', handleMessage);
    
    // 페이지 포커스 시 즉시 체크 (DB internal에서 변경했을 때 다른 탭에서 즉시 반영)
    const handleFocus = () => {
      const now = Date.now();
      // 마지막 체크로부터 500ms 이상 경과했을 때만 체크 (너무 자주 체크 방지)
      if (now - lastCheckTime >= 500) {
        checkOngoingTeam();
      }
    };
    
    // 페이지 가시성 변경 시 체크 (탭 전환 시)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        if (now - lastCheckTime >= 500) {
          checkOngoingTeam();
        }
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      channel.removeEventListener('message', handleMessage);
      channel.close();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // 마운트 시 한 번만 설정

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

          {ongoingTeam && ongoingTeam.pitch_url ? (
            <section className="flex w-full flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Live</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{ongoingTeam.teamName}</h2>
                </div>
                <button
                  onClick={() => setUserControlled(!userControlled)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    userControlled
                      ? 'bg-accent-yellow/20 border-accent-yellow/50 text-accent-yellow hover:bg-accent-yellow/30'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                  title={userControlled ? '자동 모드로 변경' : '수동 모드로 변경'}
                >
                  {userControlled ? '자동으로 변경' : '수동으로 변경'}
                </button>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-[#151A29] p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                <PdfViewer 
                  url={`/api/teams/${ongoingTeam.id}/pitch`} 
                  externalPageNumber={currentSlide}
                  userControlled={userControlled}
                  onUserControlledChange={setUserControlled}
                />
              </div>
            </section>
          ) : null}

          <LiveChatPreview />

          <div className="h-20" />
        </div>
        
        <BottomNavigation />
      </div>
    </>
  );
}
