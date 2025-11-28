'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import StockInsight from '../containers/StockInsight';
import MemberSpotlight from '../containers/MemberSpotlight';
import PresentationMaterials from '../containers/PresentationMaterials';
import TradePanel from '../containers/TradePanel';
import { getTeamDetail } from '../detailData';
import { getTeam, getMyInfo, getTeamInvestment } from '@/lib/api';
import type { TeamMember } from '../containers/MemberSpotlight';
import type { PresentationDocument } from '../containers/PresentationMaterials';
import type { Team, UserResponse, TeamInvestmentInfo } from '@/lib/api/types';

export default function TeamDetailPage() {
  const params = useParams();
  const teamParam = params?.team as string;
  const teamId = teamParam ? parseInt(teamParam, 10) : NaN;

  const [team, setTeam] = useState<Team | null>(null);
  const [userInfo, setUserInfo] = useState<UserResponse | null>(null);
  const [teamInvestment, setTeamInvestment] = useState<TeamInvestmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        console.log('팀 데이터:', teamData);
        console.log('사용자 정보:', userInfoData);
        console.log('보유 주식:', teamInvestmentData);

        setTeam(teamData);
        setUserInfo(userInfoData);
        setTeamInvestment(teamInvestmentData);
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        setError(err instanceof Error ? err.message : '데이터 로딩 실패');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background-card flex items-center justify-center">
        <p className="text-white">로딩 중...</p>
      </div>
    );
  }

  // 실제 데이터가 있으면 사용
  if (team && !error) {
    const currentPrice = team.p || team.p0;
    const previousPrice = team.p0;
    const changeRate = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

    // 주가 그래프 데이터 생성 (임시 시뮬레이션)
    // TODO: 백엔드에 가격 히스토리 API 추가 시 실제 데이터로 대체
    const now = Date.now();
    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };
    
    const trendPoints = [
      { label: formatTime(now - 3600000 * 5), value: Math.round(previousPrice * 0.98) },
      { label: formatTime(now - 3600000 * 4), value: Math.round(previousPrice * 0.99) },
      { label: formatTime(now - 3600000 * 3), value: Math.round(previousPrice * 1.0) },
      { label: formatTime(now - 3600000 * 2), value: Math.round((previousPrice + currentPrice) * 0.49) },
      { label: formatTime(now - 3600000), value: Math.round((previousPrice + currentPrice) * 0.5) },
      { label: formatTime(now), value: Math.round(currentPrice) },
    ];

    // 멤버 정보 변환
    const members: TeamMember[] =
      team.members?.map((member, index) => ({
        id: index + 1,
        name: member[0] || `멤버 ${index + 1}`,
        department: member[1] || '소속 미정',
      })) || [];

    // 문서 정보 (pitch_url이 있으면 추가)
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
      <div className="min-h-screen w-full bg-background-card pb-16">
        <div className="mx-auto flex w-full max-w-[24.5625rem] flex-col gap-5 px-5 pt-8">
          <StockInsight
            teamName={team.teamName}
            currentPrice={currentPrice}
            changeRate={changeRate}
            totalInvestment={team.money || 0}
            refreshSeconds={10}
            trendPoints={trendPoints}
          />
          <MemberSpotlight members={members} />
          <PresentationMaterials documents={documents} />
          <TradePanel
            teamId={teamId}
            currentPrice={currentPrice}
            availableBudget={userInfo?.capital || 0}
            ownedShares={teamInvestment?.shares || 0}
            ownedAmount={teamInvestment?.amount || 0}
          />
        </div>
      </div>
    );
  }

  // 폴백: 기존 더미 데이터 사용
  const detail = getTeamDetail(teamParam);

  return (
    <div className="min-h-screen w-full bg-background-card pb-16">
      <div className="mx-auto flex w-full max-w-[24.5625rem] flex-col gap-5 px-5 pt-8">
        <StockInsight
          teamName={detail.name}
          currentPrice={detail.currentPrice}
          changeRate={detail.changeRate}
          totalInvestment={detail.totalInvestment}
          refreshSeconds={detail.refreshSeconds}
          trendPoints={detail.trendPoints}
        />
        <MemberSpotlight members={detail.members} />
        <PresentationMaterials documents={detail.documents} />
        <TradePanel
          currentPrice={detail.currentPrice}
          availableBudget={detail.availableBudget}
          ownedShares={detail.ownedShares}
        />
      </div>
    </div>
  );
}

