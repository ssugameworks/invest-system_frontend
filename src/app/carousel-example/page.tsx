'use client';

import { useEffect, useState } from 'react';
import Carousel from '@/components/Carousel';
import { getTeams } from '@/lib/api';
import type { Team } from '@/lib/api/types';
import type { CarouselCard } from '@/types/carousel';

export default function CarouselExamplePage() {
  const [cards, setCards] = useState<CarouselCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teams = await getTeams();
        const carouselCards: CarouselCard[] = teams.map((team) => ({
          id: team.id,
          image: team.pitch_url || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(team.teamName),
          title: team.teamName,
          subtitle: `현재가: ${team.p?.toLocaleString() || team.p0?.toLocaleString() || '1,000'}원`,
          status: team.status,
          totalInvestment: team.money || 0,
        }));
        setCards(carouselCards);
      } catch (error) {
        console.error('팀 목록 로딩 실패:', error);
        // 폴백 데이터 사용 (기존 sampleCards)
        const { sampleCards } = await import('@/constants/carouselSampleCards');
        setCards(sampleCards);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-4 md:p-8 flex items-center justify-center">
        <p className="text-white text-xl">팀 목록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-2xl md:text-3xl font-bold mb-8">
          팀 목록 ({cards.length}개)
        </h1>
        <div className="mb-12">
          <h2 className="text-white text-lg md:text-xl mb-4">데스크톱 뷰</h2>
          <div className="bg-gray-900 p-6 rounded-lg">
            <Carousel cards={cards} />
          </div>
        </div>
        <div className="mb-12">
          <h2 className="text-white text-lg md:text-xl mb-4">모바일 화면 미리보기</h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="text-gray-400 text-sm mb-2">iPhone 14 Pro (393x852)</div>
              <div
                className="bg-gray-800 rounded-[40px] p-4 border-4 border-gray-700 mx-auto"
                style={{ maxWidth: '393px' }}
              >
                <div className="bg-black rounded-[30px] overflow-hidden" style={{ height: '600px' }}>
                  <div className="p-6">
                    <div className="text-white text-xl font-bold mb-4">모바일 뷰</div>
                    <Carousel cards={cards} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-gray-400 text-sm mb-2">iPad (768x1024)</div>
              <div
                className="bg-gray-800 rounded-[20px] p-3 border-4 border-gray-700 mx-auto"
                style={{ maxWidth: '500px' }}
              >
                <div className="bg-black rounded-[15px] overflow-hidden" style={{ height: '600px' }}>
                  <div className="p-8">
                    <div className="text-white text-2xl font-bold mb-6">태블릿 뷰</div>
                    <Carousel cards={cards} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-white text-lg mb-4">✨ 주요 기능</h3>
            <ul className="text-gray-400 space-y-2">
              <li>🖱️ 마우스 드래그 스크롤</li>
              <li>📱 터치 제스처 지원</li>
              <li>🎯 스냅 스크롤 (카드 단위)</li>
              <li>🔘 인디케이터 (현재 위치 표시)</li>
              <li>📐 반응형 레이아웃</li>
              <li>♿ 접근성 향상 (ARIA)</li>
              <li>➡️ 카드 스냅 스크롤 및 상태 표현</li>
              <li>🔥 실시간 백엔드 데이터 연동</li>
            </ul>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-white text-lg mb-4">📱 반응형 브레이크포인트</h3>
            <ul className="text-gray-400 space-y-2">
              <li>
                <span className="text-green-400">XS (~640px):</span> 168×148px 카드
              </li>
              <li>
                <span className="text-blue-400">SM (640px+):</span> 180×160px 카드
              </li>
              <li>
                <span className="text-purple-400">MD (768px+):</span> 200×180px 카드
              </li>
              <li>
                <span className="text-orange-400">LG (1024px+):</span> 220×200px 카드
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
