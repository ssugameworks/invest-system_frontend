'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getTeamDetail } from '../detailData';
import { useUser, useTeam, useTeamInvestment, useTeamPriceHistory } from '@/hooks/useQueries';
import type { TeamMember } from '../containers/MemberSpotlight';
import type { PresentationDocument } from '../containers/PresentationMaterials';
import type { InvestmentTrendPoint } from '@/api/api';
import { Skeleton } from '@/components/Skeleton';
import ServiceOpenModal from '@/components/ServiceOpenModal';
import { getTeamMemberImage } from '@/utils/teamLogos';
import Header from '@/components/Header';
import { isServiceOpen, isAllowedUser } from '@/utils/serviceUtils';

// 무거운 컴포넌트 동적 import
const StockInsight = dynamic(() => import('../containers/StockInsight'), {
  ssr: false,
  loading: () => <StockInsightSkeleton />,
});

const MemberSpotlight = dynamic(() => import('../containers/MemberSpotlight'), {
  ssr: false,
  loading: () => <MemberSpotlightSkeleton />,
});

const PresentationMaterials = dynamic(() => import('../containers/PresentationMaterials'), {
  ssr: false,
  loading: () => <PresentationMaterialsSkeleton />,
});

const TradePanel = dynamic(() => import('../containers/TradePanel'), {
  ssr: false,
  loading: () => <TradePanelSkeleton />,
});

const POLLING_INTERVAL = 5000; // 5초 간격
const INITIAL_PRICE = 1000;

// 스켈레톤 컴포넌트들
function StockInsightSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-end">
        <Skeleton variant="text" height={14} width={100} animation="wave" />
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Skeleton variant="text" height={16} width={60} animation="wave" />
            <Skeleton variant="text" height={32} width={120} animation="wave" />
          </div>
          <Skeleton variant="rounded" height={24} width={60} animation="wave" />
        </div>
        <div className="flex flex-col gap-1">
          <Skeleton variant="text" height={16} width={60} animation="wave" />
          <Skeleton variant="text" height={24} width={100} animation="wave" />
        </div>
      </div>
      <Skeleton variant="rounded" height={200} className="w-full" animation="wave" />
    </div>
  );
}

function MemberSpotlightSkeleton() {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#151A29] p-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="mb-4">
        <Skeleton variant="text" height={16} width={80} animation="wave" />
        <Skeleton variant="text" height={12} width={40} className="mt-0.5" animation="wave" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2.5">
            <Skeleton variant="circular" width={64} height={64} animation="wave" />
            <div className="flex flex-col gap-0.5 w-full items-center">
              <Skeleton variant="text" height={14} width={50} animation="wave" />
              <Skeleton variant="text" height={12} width={60} animation="wave" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PresentationMaterialsSkeleton() {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#151A29] p-5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Skeleton variant="text" height={16} width={80} animation="wave" />
          <Skeleton variant="text" height={12} width={50} className="mt-0.5" animation="wave" />
        </div>
        <Skeleton variant="rounded" height={28} width={80} animation="wave" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex h-24 min-w-[140px] flex-col justify-between rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent px-4 py-3">
            <Skeleton variant="text" height={14} width={80} animation="wave" />
            <Skeleton variant="text" height={12} width={60} animation="wave" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TradePanelSkeleton() {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#151A29] p-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <Skeleton variant="rounded" height={120} className="w-full" animation="wave" />
    </div>
  );
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamParam = params?.team as string;
  const teamId = teamParam ? parseInt(teamParam, 10) : NaN;

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [refreshSeconds, setRefreshSeconds] = useState(5);

  // React Query hooks - 자동 캐싱 및 폴링
  const { data: userInfo } = useUser();
  // ⭐ 최적화: 팀 정보도 자동 폴링 (주가 실시간 반영)
  const { 
    data: team, 
    isLoading: isTeamLoading,
    error: teamError 
  } = useTeam(teamId, !isNaN(teamId), POLLING_INTERVAL);
  
  // ⭐ 최적화: React Query의 refetchInterval 사용 (수동 폴링 제거)
  const { data: teamInvestment } = useTeamInvestment(teamId, !isNaN(teamId), POLLING_INTERVAL);
  const { data: priceHistory = [] } = useTeamPriceHistory(teamId, !isNaN(teamId), POLLING_INTERVAL);

  // ⭐ 최적화: 카운트다운만 유지 (데이터는 React Query가 자동으로 폴링)
  useEffect(() => {
    if (isNaN(teamId) || isTeamLoading) return;

    const countdown = setInterval(() => {
      setRefreshSeconds((prev) => (prev <= 1 ? POLLING_INTERVAL / 1000 : prev - 1));
    }, 1000);

    return () => clearInterval(countdown);
  }, [teamId, isTeamLoading]);

  // 서비스 오픈 체크
  useEffect(() => {
    if (userInfo && !isServiceOpen() && !isAllowedUser(userInfo.schoolNumber)) {
      setShowServiceModal(true);
    }
  }, [userInfo]);

  // ⭐ 최적화: 트렌드 포인트 메모이제이션 (currentPrice 의존성 추가로 실시간 업데이트)
  const trendPoints = useMemo<InvestmentTrendPoint[]>(() => {
    if (!team || teamError) return [];

    let currentPrice = team.p;
    if (!currentPrice || currentPrice === 0) {
      if (priceHistory.length > 0) {
        currentPrice = priceHistory[priceHistory.length - 1].price;
      } else {
        return [];
      }
    }

    let previousPrice = currentPrice;
    if (priceHistory.length >= 2) {
      previousPrice = priceHistory[priceHistory.length - 2].price;
    } else if (priceHistory.length === 1) {
      previousPrice = priceHistory[0].price;
    }

    // ⭐ 최적화: formatTime 함수를 useCallback으로 최적화 (useMemo 내부에서 재생성 방지)
    // formatTime은 useMemo 내부에서만 사용되므로 여기서 정의
    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    };

    const now = Date.now();
    const twoHoursHalfAgo = now - 2.5 * 60 * 60 * 1000;

    let points: InvestmentTrendPoint[] = [];

    if (priceHistory.length > 0) {
      points = priceHistory
        .filter(h => new Date(h.tickTs).getTime() >= twoHoursHalfAgo)
        .map(h => ({
          label: formatTime(h.tickTs),
          value: h.price,
        }));

      // ⭐ 최적화: 항상 현재 가격을 최신 포인트로 추가 (실시간 반영)
      const lastPoint = points[points.length - 1];
      const currentTimeLabel = formatTime(new Date().toISOString());
      
      if (!lastPoint || lastPoint.value !== currentPrice) {
        // 현재 가격이 마지막 포인트와 다르면 새 포인트 추가
        points.push({
          label: currentTimeLabel,
          value: currentPrice,
        });
      } else {
        // 같은 가격이어도 시간은 업데이트 (실시간 반영)
        points[points.length - 1] = {
          label: currentTimeLabel,
          value: currentPrice,
        };
      }
    } else {
      // 히스토리가 없어도 현재 가격으로 포인트 생성
      points = [
        { label: formatTime(new Date(twoHoursHalfAgo).toISOString()), value: previousPrice },
        { label: formatTime(new Date().toISOString()), value: currentPrice },
      ];
    }

    if (points.length === 0) {
      points = [
        { label: formatTime(new Date(twoHoursHalfAgo).toISOString()), value: previousPrice },
        { label: formatTime(new Date().toISOString()), value: currentPrice },
      ];
    } else if (points.length === 1) {
      points.push({
        label: formatTime(new Date().toISOString()),
        value: currentPrice,
      });
    }

    return points;
  }, [team, teamError, priceHistory, team?.p, team?.id]); // ⭐ 모든 관련 의존성 추가

  const handleModalClose = useCallback(() => {
    setShowServiceModal(false);
    window.location.href = '/login';
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (showServiceModal) {
    return (
      <>
        <ServiceOpenModal isOpen={showServiceModal} onClose={handleModalClose} />
        <div className="min-h-screen w-full bg-background-card" />
      </>
    );
  }

  if (isTeamLoading) {
    return (
      <div className="relative min-h-screen w-full bg-background-card pb-16">
        <div className="flex w-full max-w-[448px] mx-auto flex-col gap-5 px-5 pt-6">
          <StockInsightSkeleton />
          <MemberSpotlightSkeleton />
          <PresentationMaterialsSkeleton />
          <TradePanelSkeleton />
        </div>
      </div>
    );
  }

  if (team && !teamError) {
    let currentPrice = team.p;
    if (!currentPrice || currentPrice === 0) {
      if (priceHistory.length > 0) {
        currentPrice = priceHistory[priceHistory.length - 1].price;
      }
    }

    if (!currentPrice || currentPrice === 0) {
      return (
        <div className="relative min-h-screen w-full bg-background-card pb-16">
          <Header label={team.teamName} onBack={handleBack} />
          <div className="flex w-full max-w-[448px] mx-auto flex-col gap-5 px-5 pt-6">
            <div className="text-center py-20">
              <p className="text-text-secondary">주가 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      );
    }

    const changeRate = currentPrice > 0 ? ((currentPrice - INITIAL_PRICE) / INITIAL_PRICE) * 100 : 0;

    const members: TeamMember[] =
      team.members?.map((member, index) => ({
        id: index + 1,
        name: member.name || `멤버 ${index + 1}`,
        department: member.major || '소속 미정',
        avatar: getTeamMemberImage(team.teamName, member.name),
      })) || [];

    const documents: PresentationDocument[] = team.pitch_url
      ? [
          { id: 1, title: '팀 피치 자료', description: team.teamName },
          { id: 2, title: '비즈니스 모델', description: '핵심 전략 정리' },
          { id: 3, title: '팀 소개', description: '조직 구조 & 역할' },
        ]
      : [
          { id: 1, title: '비즈니스 모델', description: '핵심 전략 정리' },
          { id: 2, title: '팀 소개', description: '조직 구조 & 역할' },
        ];

    return (
      <div className="relative min-h-screen w-full bg-background-card pb-16">
        <Header label={team.teamName} onBack={handleBack} />
        <div className="flex w-full max-w-[448px] mx-auto flex-col gap-5 px-5 pt-6">
          <div className="animate-fade-in">
            <StockInsight
              currentPrice={currentPrice}
              changeRate={changeRate}
              totalInvestment={team.money || 0}
              refreshSeconds={refreshSeconds}
              trendPoints={trendPoints}
              roi={teamInvestment?.profit_rate}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <MemberSpotlight members={members} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <PresentationMaterials
              documents={documents}
              teamName={team.teamName}
              pitchUrl={team.pitch_url}
              teamId={team.id}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <TradePanel
              teamId={teamId}
              currentPrice={currentPrice}
              availableBudget={userInfo?.capital || 0}
              ownedShares={teamInvestment?.shares || 0}
              ownedAmount={teamInvestment?.amount || 0}
            />
          </div>
        </div>
      </div>
    );
  }

  // 폴백: 정적 데이터 사용
  const detail = getTeamDetail(teamParam);

  return (
    <div className="relative min-h-screen w-full bg-background-card pb-16">
      <Header label={detail.name} onBack={handleBack} />
      <div className="flex w-full max-w-[448px] mx-auto flex-col gap-5 px-5 pt-20">
        <StockInsight
          currentPrice={detail.currentPrice}
          changeRate={detail.changeRate}
          totalInvestment={detail.totalInvestment}
          refreshSeconds={detail.refreshSeconds}
          trendPoints={detail.trendPoints}
        />
        <MemberSpotlight members={detail.members} />
        <PresentationMaterials documents={detail.documents} teamName={detail.name} />
        <TradePanel
          currentPrice={detail.currentPrice}
          availableBudget={detail.availableBudget}
          ownedShares={detail.ownedShares}
        />
      </div>
    </div>
  );
}
