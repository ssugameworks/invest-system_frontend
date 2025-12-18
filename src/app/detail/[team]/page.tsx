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

const SERVICE_OPEN_DATE = new Date('2025-12-19T19:00:00+09:00');
const POLLING_INTERVAL = 5000; // 5초 간격
const INITIAL_PRICE = 1000;

const getAllowedSchoolNumbers = (): number[] => {
  const envValue = process.env.NEXT_PUBLIC_ALLOWED_SCHOOL_NUMBERS;
  if (!envValue) return [];
  return envValue
    .split(',')
    .map(num => parseInt(num.trim(), 10))
    .filter(num => !isNaN(num));
};

function isServiceOpen(): boolean {
  return new Date() >= SERVICE_OPEN_DATE;
}

function isAllowedUser(schoolNumber: number): boolean {
  return getAllowedSchoolNumbers().includes(schoolNumber);
}

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
  const { 
    data: team, 
    isLoading: isTeamLoading,
    error: teamError 
  } = useTeam(teamId, !isNaN(teamId));
  
  const { data: teamInvestment, refetch: refetchInvestment } = useTeamInvestment(teamId, !isNaN(teamId));
  const { data: priceHistory = [], refetch: refetchPriceHistory } = useTeamPriceHistory(teamId, !isNaN(teamId));

  // 5초마다 데이터 갱신 (폴링)
  useEffect(() => {
    if (isNaN(teamId) || isTeamLoading) return;

    const interval = setInterval(() => {
      refetchInvestment();
      refetchPriceHistory();
      setRefreshSeconds(5);
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [teamId, isTeamLoading, refetchInvestment, refetchPriceHistory]);

  // 카운트다운
  useEffect(() => {
    if (isNaN(teamId) || isTeamLoading) return;

    const countdown = setInterval(() => {
      setRefreshSeconds((prev) => (prev <= 1 ? 5 : prev - 1));
    }, 1000);

    return () => clearInterval(countdown);
  }, [teamId, isTeamLoading]);

  // 서비스 오픈 체크
  useEffect(() => {
    if (userInfo && !isServiceOpen() && !isAllowedUser(userInfo.schoolNumber)) {
      setShowServiceModal(true);
    }
  }, [userInfo]);

  // 트렌드 포인트 메모이제이션
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

      if (currentPrice) {
        const lastPoint = points[points.length - 1];
        if (!lastPoint || lastPoint.value !== currentPrice) {
          points.push({
            label: formatTime(new Date().toISOString()),
            value: currentPrice,
          });
        } else {
          points[points.length - 1] = {
            label: formatTime(new Date().toISOString()),
            value: currentPrice,
          };
        }
      }
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
  }, [team, teamError, priceHistory]);

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
