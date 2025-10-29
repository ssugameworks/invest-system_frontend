'use client';

import Carousel, { CarouselCard } from '@/components/Carousel';

const sampleCards: CarouselCard[] = [
  {
    id: '1',
    title: '일식이 조아',
    members: '정제훈, 김용기, 최효우',
    amount: '₩200,000',
  },
  {
    id: '2',
    title: 'TIO',
    members: '편유나, 김민규',
    amount: '₩200,000',
  },
  {
    id: '3',
    title: 'TIO',
    members: '정제훈, 김용기, 최효우',
    amount: '₩200,000',
  },
];

export default function CarouselExamplePage() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8">Carousel Component</h1>

        <div className="mb-12">
          <h2 className="text-white text-xl mb-4">Frame 22 스타일 캐러셀</h2>
          <Carousel cards={sampleCards} />
        </div>

        <div className="text-gray-400 mt-12">
          <h3 className="text-white text-lg mb-2">사용 방법:</h3>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`import Carousel, { CarouselCard } from '@/components/Carousel';

const cards: CarouselCard[] = [
  {
    id: '1',
    title: '일식이 조아',
    members: '정제훈, 김용기, 최효우',
    amount: '₩200,000',
  },
  // ... 더 많은 카드
];

<Carousel cards={cards} />`}
          </pre>
        </div>

        <div className="text-gray-400 mt-8">
          <h3 className="text-white text-lg mb-2">기능:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>마우스 드래그로 스크롤</li>
            <li>터치 제스처 지원 (모바일)</li>
            <li>인디케이터로 현재 위치 표시</li>
            <li>스냅 스크롤 (카드 단위로 정렬)</li>
            <li>피그마 Frame 22 디자인과 동일한 스타일</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
