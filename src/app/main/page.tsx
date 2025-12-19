'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import Header from '@/components/Header';
import Capital from './containers/Capital';
import dynamic from 'next/dynamic';
import type { Team } from '@/lib/api/types';
import { useUser, useTeams, usePortfolio, useOngoingTeam, useCurrentSlide } from '@/hooks/useQueries';
import { identifyUser, isPostHogReady } from '@/lib/posthog';
import type { CarouselCard } from '@/types/carousel';
import { CarouselCardButton } from '@/components/carousel/CarouselCardButton';
import BottomNavigation from '@/components/BottomNavigation';
import { CapitalSkeleton, CarouselCardButtonSkeleton, Skeleton } from '@/components/Skeleton';
import ServiceOpenModal from '@/components/ServiceOpenModal';
import BuySuccessModal from '@/components/BuySuccessModal';
import LiveChatPreview from './containers/LiveChatPreview';
import { isServiceOpen, isAllowedUser } from '@/utils/serviceUtils';

// 무거운 컴포넌트는 동적 import로 지연 로딩
const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-black/40 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '450px' }}>
      <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />
    </div>
  ),
});

// 상수는 컴포넌트 외부로
const POLLING_INTERVAL = 5000; // 5초로 조정 (기존 3초에서 변경)

// CarouselCardButton을 메모이제이션
const MemoizedCarouselCardButton = memo(CarouselCardButton);

export default function MainPage() {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBuySuccessModal, setShowBuySuccessModal] = useState(false);
  const [buySuccessData, setBuySuccessData] = useState<{ shares: number; amount: number } | null>(null);
  const [userControlled, setUserControlled] = useState(false);

  // React Query hooks 사용 - 자동 캐싱 및 재시도
  const { data: userInfo, isLoading: isUserLoading } = useUser();
  // ⭐ 최적화: 팀 목록도 자동 폴링 (주가 실시간 반영)
  const { data: teams = [], isLoading: isTeamsLoading } = useTeams(POLLING_INTERVAL);
  const { data: portfolio } = usePortfolio();
  
  // 발표 중인 팀 폴링 (5초 간격, 화면이 보일 때만)
  const { data: ongoingTeam } = useOngoingTeam(POLLING_INTERVAL);
  
  // 슬라이드 번호 폴링 (발표 중인 팀이 있고, 수동 모드가 아닐 때만)
  const shouldPollSlide = ongoingTeam?.id && !userControlled;
  const { data: slideData } = useCurrentSlide(
    ongoingTeam?.id ?? null,
    shouldPollSlide ? POLLING_INTERVAL : false
  );
  const currentSlide = slideData?.currentSlide ?? 1;

  const isLoading = isUserLoading || isTeamsLoading;

  // 서비스 오픈 체크 및 PostHog 식별
  useEffect(() => {
    if (!userInfo) return;

    if (!isServiceOpen() && !isAllowedUser(userInfo.schoolNumber)) {
      setShowServiceModal(true);
      return;
    }

    if (isPostHogReady()) {
      identifyUser(userInfo.id, {
        name: userInfo.name,
        nickname: userInfo.name,
        schoolNumber: userInfo.schoolNumber,
        department: userInfo.department,
      });
    }
  }, [userInfo]);

  // ⭐ 최적화: 매수 성공 모달 표시 확인 (cleanup 개선)
  useEffect(() => {
    let buySuccessDataStr: string | null = null;
    try {
      buySuccessDataStr = sessionStorage.getItem('buySuccess');
      if (buySuccessDataStr) {
        try {
          const data = JSON.parse(buySuccessDataStr);
          setBuySuccessData(data);
          setShowBuySuccessModal(true);
        } catch (parseError) {
          console.error('Failed to parse buySuccess data:', parseError);
        } finally {
          // 항상 cleanup 수행
          try {
            sessionStorage.removeItem('buySuccess');
          } catch (storageError) {
            console.error('Failed to remove buySuccess from sessionStorage:', storageError);
          }
        }
      }
    } catch (storageError) {
      // sessionStorage 접근 불가 시 무시
      console.error('Failed to access sessionStorage:', storageError);
    }

    // cleanup: 컴포넌트 언마운트 시에도 정리
    return () => {
      try {
        if (sessionStorage.getItem('buySuccess')) {
          sessionStorage.removeItem('buySuccess');
        }
      } catch {
        // 무시
      }
    };
  }, []);

  // 카드 데이터 메모이제이션
  const cards = useMemo<CarouselCard[]>(() => {
    const investedTeamIds = new Set(portfolio?.items.map((item) => item.team_id) || []);

    return teams.map((team) => {
      const isInvested = investedTeamIds.has(team.id);
      const portfolioItem = portfolio?.items.find((item) => item.team_id === team.id);
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
  }, [teams, portfolio]);

  const myCards = useMemo(() => cards.filter((card) => card.isInvested), [cards]);

  const handleModalClose = useCallback(() => {
    setShowServiceModal(false);
    window.location.href = '/login';
  }, []);

  const handleBuySuccessClose = useCallback(() => {
    setShowBuySuccessModal(false);
    setBuySuccessData(null);
  }, []);

  const handleUserControlledToggle = useCallback(() => {
    setUserControlled(prev => !prev);
  }, []);

  return (
    <>
      <ServiceOpenModal 
        isOpen={showServiceModal} 
        onClose={handleModalClose}
      />
      <BuySuccessModal
        isOpen={showBuySuccessModal}
        onClose={handleBuySuccessClose}
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
                    <MemoizedCarouselCardButton card={card} />
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
                  onClick={handleUserControlledToggle}
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
