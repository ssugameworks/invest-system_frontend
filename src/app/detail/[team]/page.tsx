'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StockInsight from '../containers/StockInsight';
import MemberSpotlight from '../containers/MemberSpotlight';
import PresentationMaterials from '../containers/PresentationMaterials';
import TradePanel from '../containers/TradePanel';
import { getTeamDetail } from '../detailData';
import { getTeam, getMyInfo, getTeamInvestment, getTeamPriceHistory, type PriceHistory } from '@/lib/api';
import type { TeamMember } from '../containers/MemberSpotlight';
import type { PresentationDocument } from '../containers/PresentationMaterials';
import type { Team, UserResponse, TeamInvestmentInfo } from '@/lib/api/types';
import type { InvestmentTrendPoint } from '@/api/api';
import { Skeleton } from '@/components/Skeleton';
import ServiceOpenModal from '@/components/ServiceOpenModal';
import { getTeamMemberImage } from '@/utils/teamLogos';
import Header from '@/components/Header';

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


export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamParam = params?.team as string;
  const teamId = teamParam ? parseInt(teamParam, 10) : NaN;

  const [team, setTeam] = useState<Team | null>(null);
  const [userInfo, setUserInfo] = useState<UserResponse | null>(null);
  const [teamInvestment, setTeamInvestment] = useState<TeamInvestmentInfo | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshSeconds, setRefreshSeconds] = useState(3);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const loadInitialPriceHistory = useCallback(async () => {
    if (isNaN(teamId)) return;

    try {
      // 서버에서 직접 가져오기
      const newHistory = await getTeamPriceHistory(teamId);

      if (newHistory.length > 0) {
        const now = Date.now();
        const twoHoursHalfAgo = now - 2.5 * 60 * 60 * 1000;

        const filtered = newHistory
          .filter(h => new Date(h.tickTs).getTime() >= twoHoursHalfAgo)
          .sort((a, b) => new Date(a.tickTs).getTime() - new Date(b.tickTs).getTime());

        setPriceHistory(filtered);
        
        // priceHistory가 있고 team.p가 null이거나 0이면 최신 가격으로 업데이트
        if (filtered.length > 0) {
          const latestPrice = filtered[filtered.length - 1].price;
          setTeam(prevTeam => {
            if (!prevTeam) return prevTeam;
            // team.p가 null이거나 0인 경우에만 업데이트 (p0 제거)
            if (!prevTeam.p || prevTeam.p === 0) {
              return {
                ...prevTeam,
                p: latestPrice,
              };
            }
            return prevTeam;
          });
        }
      }
    } catch (err) {
    }
  }, [teamId]);

  useEffect(() => {
    const fetchData = async () => {
      if (isNaN(teamId)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [teamData, userInfoData, teamInvestmentData] = await Promise.all([
          getTeam(teamId),
          getMyInfo().catch(() => null),
          getTeamInvestment(teamId).catch(() => null),
        ]);

        if (userInfoData && !isServiceOpen() && !isAllowedUser(userInfoData.schoolNumber)) {
          setShowServiceModal(true);
          setLoading(false);
          return;
        }

        setTeam(teamData);
        setUserInfo(userInfoData);
        setTeamInvestment(teamInvestmentData);

        await loadInitialPriceHistory();
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터 로딩 실패');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, loadInitialPriceHistory]);

  useEffect(() => {
    if (isNaN(teamId) || loading) return;

    const updatePriceData = async () => {
      try {
        // 서버에서 최신 팀 정보, 가격 히스토리, 투자 정보 가져오기
        const [teamData, priceHistoryData, teamInvestmentData] = await Promise.all([
          getTeam(teamId),
          getTeamPriceHistory(teamId),
          getTeamInvestment(teamId).catch(() => null), // ROI 업데이트를 위해 투자 정보도 가져오기
        ]);

        // team 객체 업데이트 (주가 정보 갱신) - p만 사용
        setTeam(prevTeam => {
          if (!prevTeam) return teamData;
          return {
            ...prevTeam,
            p: teamData.p,
            money: teamData.money,
            updated_at: teamData.updated_at,
          };
        });

        // teamInvestment 업데이트 (ROI 갱신)
        if (teamInvestmentData) {
          setTeamInvestment(teamInvestmentData);
        }

        // 가격 히스토리 업데이트
        if (priceHistoryData.length > 0) {
          const now = Date.now();
          const twoHoursHalfAgo = now - 2.5 * 60 * 60 * 1000;

          const filtered = priceHistoryData
            .filter(h => new Date(h.tickTs).getTime() >= twoHoursHalfAgo)
            .sort((a, b) => new Date(a.tickTs).getTime() - new Date(b.tickTs).getTime());

          setPriceHistory(filtered);
          
          // priceHistory가 있으면 team.p가 null이어도 priceHistory의 최신 가격으로 업데이트
          if (filtered.length > 0 && (!teamData.p || teamData.p === 0)) {
            const latestPrice = filtered[filtered.length - 1].price;
            setTeam(prevTeam => {
              if (!prevTeam) return teamData;
              return {
                ...prevTeam,
                p: latestPrice,
              };
            });
          }
        } else {
          // priceHistory가 없으면 team.p만 사용 (p0 제거)
          const currentPrice = teamData.p;
          if (currentPrice && currentPrice > 0) {
            // 히스토리가 없으면 현재 가격만 추가
            setPriceHistory(prev => {
              const newPricePoint: PriceHistory = {
                price: currentPrice,
                tickTs: new Date().toISOString(),
              };

              const now = Date.now();
              const twoHoursHalfAgo = now - 2.5 * 60 * 60 * 1000;

              const updated = [...prev, newPricePoint]
                .filter(h => new Date(h.tickTs).getTime() >= twoHoursHalfAgo)
                .sort((a, b) => new Date(a.tickTs).getTime() - new Date(b.tickTs).getTime());

              return updated;
            });
          }
        }

        setRefreshSeconds(3);
      } catch (error) {
      }
    };

    const interval = setInterval(updatePriceData, 3000); // 3초마다 갱신

    return () => clearInterval(interval);
  }, [teamId, loading]);

  useEffect(() => {
    if (isNaN(teamId) || loading) return;

    const countdown = setInterval(() => {
      setRefreshSeconds((prev) => {
        if (prev <= 1) {
          return 3; // 0이 되면 3으로 리셋
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [teamId, loading]);

  // Memoize trendPoints calculation to prevent flickering and maintain hook order
  const trendPoints: InvestmentTrendPoint[] = useMemo(() => {
    if (!team || error) return [];

    // p 값만 사용 (p0 제거)
    let currentPrice = team.p;
    if (!currentPrice || currentPrice === 0) {
      // p가 없으면 priceHistory에서 최신 가격 사용
      if (priceHistory.length > 0) {
        currentPrice = priceHistory[priceHistory.length - 1].price;
      } else {
        // priceHistory도 없으면 null 반환하여 그래프 표시 안 함
        return [];
      }
    }
    
    // 이전 가격은 priceHistory에서 두 번째로 최신 가격 사용
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

      // 항상 현재 가격을 최신 포인트로 추가 (실시간 반영)
      if (currentPrice) {
        const lastPoint = points[points.length - 1];
        const lastPointValue = lastPoint?.value;
        
        // 마지막 포인트와 현재 가격이 다르거나, 마지막 포인트가 없으면 추가
        if (!lastPoint || lastPointValue !== currentPrice) {
          points.push({
            label: formatTime(new Date().toISOString()),
            value: currentPrice,
          });
        } else {
          // 마지막 포인트의 시간만 업데이트
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
  }, [team, error, priceHistory]);

  const handleModalClose = () => {
    setShowServiceModal(false);
    window.location.href = '/login';
  };

  if (showServiceModal) {
    return (
      <>
        <ServiceOpenModal
          isOpen={showServiceModal}
          onClose={handleModalClose}
        />
        <div className="min-h-screen w-full bg-background-card" />
      </>
    );
  }

  if (loading) {
    return (
      <div className="relative min-h-screen w-full bg-background-card pb-16">
        <div className="flex w-full max-w-[448px] mx-auto flex-col gap-5 px-5 pt-6">
          {/* StockInsight Skeleton */}
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

          {/* MemberSpotlight Skeleton */}
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

          {/* PresentationMaterials Skeleton */}
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
        </div>
      </div>
    );
  }

  if (team && !error) {
    // p 값만 사용 (p0 제거)
    let currentPrice = team.p;
    if (!currentPrice || currentPrice === 0) {
      // p가 없으면 priceHistory에서 최신 가격 사용
      if (priceHistory.length > 0) {
        currentPrice = priceHistory[priceHistory.length - 1].price;
      }
    }
    
    // currentPrice가 여전히 없거나 0이면 표시하지 않음
    if (!currentPrice || currentPrice === 0) {
      return (
        <div className="relative min-h-screen w-full bg-background-card pb-16">
          <Header label={team.teamName} onBack={() => router.back()} />
          <div className="flex w-full max-w-[448px] mx-auto flex-col gap-5 px-5 pt-6">
            <div className="text-center py-20">
              <p className="text-text-secondary">주가 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      );
    }
    
    // 이전 가격은 priceHistory에서 두 번째로 최신 가격 사용
    let previousPrice = currentPrice;
    if (priceHistory.length >= 2) {
      previousPrice = priceHistory[priceHistory.length - 2].price;
    } else if (priceHistory.length === 1) {
      previousPrice = priceHistory[0].price;
    }
    
    const changeRate = previousPrice && previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };



    const members: TeamMember[] =
      team.members?.map((member, index) => {
        const avatarPath = getTeamMemberImage(team.teamName, member.name);

        return {
          id: index + 1,
          name: member.name || `멤버 ${index + 1}`,
          department: member.major || '소속 미정',
          avatar: avatarPath, // 이름 기반으로 이미지 로드
        };
      }) || [];

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
        <Header label={team.teamName} onBack={() => router.back()} />
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
            <PresentationMaterials documents={documents} teamName={team.teamName} />
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

  const detail = getTeamDetail(teamParam);

  return (
    <div className="relative min-h-screen w-full bg-background-card pb-16">
      <Header label={detail.name} onBack={() => router.back()} />
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

