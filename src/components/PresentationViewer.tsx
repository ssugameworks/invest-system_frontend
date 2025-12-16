'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PresentationViewerProps {
  teamName?: string;
  slides?: string[];
  className?: string;
}

// 팀별 링크 매핑
const TEAM_LINKS: { [key: string]: string } = {
  '벤양': 'https://www.notion.so/Team-2c0e64797b098043b6f6d23392bfa700?source=copy_link',
  '일식이 조아': 'https://didimapp.com',
  '힙72': 'https://avab.shop',
  '불개미': 'https://pb-ai-introduce-page.vercel.app/',
};

export default function PresentationViewer({ 
  teamName = '발표 중인 팀',
  slides = [
    '/api/placeholder/800/600?text=Slide+1',
    '/api/placeholder/800/600?text=Slide+2',
    '/api/placeholder/800/600?text=Slide+3',
  ],
  className = '' 
}: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // 팀 링크 가져오기
  const teamLink = TEAM_LINKS[teamName] || '#';

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className={`flex w-full flex-col gap-4 ${className}`}>
      {/* Header with Live Badge */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Live</span>
          </div>
          <h2 className="text-lg font-bold text-white">{teamName}</h2>
        </div>
      </div>

      {/* Presentation Viewer Card */}
      <div className="relative rounded-[24px] border border-white/10 bg-[#151A29] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        {/* Slide Container */}
        <div className="relative aspect-[16/10] w-full bg-white/5">
          {/* Current Slide - Placeholder for now */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center">
                <svg className="w-12 h-12 text-accent-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-secondary">발표 슬라이드</p>
                <p className="text-xs text-text-tertiary mt-1">API 연동 후 실제 PPT가 표시됩니다</p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white hover:bg-black/50 transition-colors"
            aria-label="이전 슬라이드"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white hover:bg-black/50 transition-colors"
            aria-label="다음 슬라이드"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>

          {/* Slide Counter */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <span className="text-xs font-medium text-white">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-white/5">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs text-text-tertiary">발표 진행 시간</span>
            <span className="text-sm font-medium text-white">12:30 - 12:45</span>
          </div>
          <a 
            href={teamLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 hover:border-accent-yellow/30 transition-all whitespace-nowrap"
          >
            팀 페이지 →
          </a>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-1.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentSlide 
                ? 'w-6 bg-accent-yellow' 
                : 'w-1.5 bg-white/20 hover:bg-white/30'
            }`}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </section>
  );
}

