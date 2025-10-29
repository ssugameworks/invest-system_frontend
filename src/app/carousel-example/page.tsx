'use client';

import { useState } from 'react';
import Carousel, { CarouselCard } from '@/components/Carousel';
import InvestmentBottomSheet from '@/components/BottomSheet/Investment/InvestmentBottomSheet';
import { Comment } from '@/types/bottomSheet';

interface TeamDetail {
  id: string;
  title: string;
  members: string;
  amount: string;
  totalInvestment: string;
  pdfUrls: string[];
  comments: Comment[];
}

const sampleTeams: TeamDetail[] = [
  {
    id: '1',
    title: '일식이 조아',
    members: '정제훈, 김용기, 최효우',
    amount: '₩200,000',
    totalInvestment: '₩150,000',
    pdfUrls: [],
    comments: [
      { id: '1', nickname: '투자왕', studentId: '202418XX', content: '일식 좋아하시는군요!' },
      { id: '2', nickname: '맛집러버', studentId: '202419XX', content: '이거 괜찮을듯' },
    ],
  },
  {
    id: '2',
    title: 'TIO',
    members: '편유나, 김민규',
    amount: '₩200,000',
    totalInvestment: '₩180,000',
    pdfUrls: [],
    comments: [
      { id: '1', nickname: '테크러버', studentId: '202420XX', content: 'TIO 화이팅!' },
      { id: '2', nickname: '개발자', studentId: '202421XX', content: '기대됩니다' },
    ],
  },
  {
    id: '3',
    title: 'TIO',
    members: '정제훈, 김용기, 최효우',
    amount: '₩200,000',
    totalInvestment: '₩100,000',
    pdfUrls: [],
    comments: [
      { id: '1', nickname: '스타트업', studentId: '202422XX', content: '좋은 아이디어네요' },
    ],
  },
  {
    id: '4',
    title: 'Game Studio',
    members: '김철수, 이영희',
    amount: '₩150,000',
    totalInvestment: '₩120,000',
    pdfUrls: [],
    comments: [
      { id: '1', nickname: '게이머', studentId: '202423XX', content: '게임 개발 응원합니다' },
    ],
  },
  {
    id: '5',
    title: 'Design Team',
    members: '박민수, 최지은, 홍길동',
    amount: '₩300,000',
    totalInvestment: '₩250,000',
    pdfUrls: [],
    comments: [
      { id: '1', nickname: '디자이너', studentId: '20242424', content: '디자인팀 최고!' },
      { id: '2', nickname: 'UI러버', studentId: '20242524', content: '멋져요' },
    ],
  },
];

const sampleCards: CarouselCard[] = sampleTeams.map((team) => ({
  id: team.id,
  title: team.title,
  members: team.members,
  amount: team.amount,
}));

export default function CarouselExamplePage() {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamDetail | null>(null);

  const handleCardClick = (teamId: string) => {
    const team = sampleTeams.find((t) => t.id === teamId);
    if (team) {
      setSelectedTeam(team);
      setIsBottomSheetOpen(true);
    }
  };
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-2xl md:text-3xl font-bold mb-8">반응형 캐러셀 컴포넌트</h1>
        <div className="mb-12">
          <h2 className="text-white text-lg md:text-xl mb-4">데스크톱 뷰</h2>
          <div className="bg-gray-900 p-6 rounded-lg"><Carousel cards={sampleCards} onCardClick={handleCardClick} /></div>
        </div>
        <div className="mb-12">
          <h2 className="text-white text-lg md:text-xl mb-4">모바일 화면 미리보기</h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="text-gray-400 text-sm mb-2">iPhone 14 Pro (393x852)</div>
              <div className="bg-gray-800 rounded-[40px] p-4 border-4 border-gray-700 mx-auto" style={{ maxWidth: '393px' }}>
                <div className="bg-black rounded-[30px] overflow-hidden" style={{ height: '600px' }}>
                  <div className="p-6">
                    <div className="text-white text-xl font-bold mb-4">모바일 뷰</div>
                    <Carousel cards={sampleCards} onCardClick={handleCardClick} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-gray-400 text-sm mb-2">iPad (768x1024)</div>
              <div className="bg-gray-800 rounded-[20px] p-3 border-4 border-gray-700 mx-auto" style={{ maxWidth: '500px' }}>
                <div className="bg-black rounded-[15px] overflow-hidden" style={{ height: '600px' }}>
                  <div className="p-8">
                    <div className="text-white text-2xl font-bold mb-6">태블릿 뷰</div>
                    <Carousel cards={sampleCards} onCardClick={handleCardClick} />
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
              <li>➡️ Send 아이콘 클릭 → BottomSheet 열기</li>
            </ul>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-white text-lg mb-4">📱 반응형 브레이크포인트</h3>
            <ul className="text-gray-400 space-y-2">
              <li><span className="text-green-400">Mobile:</span> 163px 카드</li>
              <li><span className="text-blue-400">SM (640px+):</span> 180px 카드</li>
              <li><span className="text-purple-400">MD (768px+):</span> 200px 카드</li>
              <li><span className="text-orange-400">LG (1024px+):</span> 220px 카드</li>
            </ul>
          </div>
        </div>
      </div>
      {selectedTeam && (
        <InvestmentBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          totalInvestment={selectedTeam.totalInvestment}
          pdfUrls={selectedTeam.pdfUrls}
          comments={selectedTeam.comments}
        />
      )}
    </div>
  );
}
