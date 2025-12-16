'use client';

import { useEffect, useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import gameworksLogo from '@/assets/icons/gameworksLogo.png';
import spartanLogo from '@/assets/icons/spartanLogo.png';

type HeaderProps = {
  label?: string;
  title?: string;
  className?: string;
  onBack?: () => void;
  backAriaLabel?: string;
};

export default function Header({
  label = 'GAMEWORKS',
  title,
  className = '',
  onBack,
  backAriaLabel = '이전 화면으로 이동',
}: HeaderProps) {
  const isBackHeader = typeof onBack === 'function';
  const displayTitle = title ?? label;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isBackHeader) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBackHeader]);

  if (isBackHeader) {
    return (
      <header
        className={`fixed z-100 top-0 left-0 right-0 flex items-center gap-1 px-4 py-3 text-white transition-all duration-300 ${
          isScrolled ? 'bg-background-card/60 backdrop-blur-xl shadow-[0_8px_25px_rgba(0,0,0,0.35)]' : 'bg-transparent'
        } ${className}`}
        aria-label={`${displayTitle} 헤더`}
      >
        {/* Glass Effect Background */}
        {isScrolled && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden border-b border-white/5"
          >
            <div className="absolute inset-0 bg-background-card/95 backdrop-blur-[48px]" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_8s_infinite]" />
            <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-30" />
          </div>
        )}
        
        <button
          type="button"
          onClick={onBack}
          aria-label={backAriaLabel}
          className="relative z-10 flex size-10 items-center justify-center rounded-full text-white transition hover:border-white/20 hover:bg-white/10"
        >
          <ChevronLeftIcon aria-hidden="true" className="size-7" strokeWidth={1.8} />
        </button>
        <h1 className="relative z-10 text-xl font-semibold tracking-tight">{displayTitle}</h1>
      </header>
    );
  }

  return (
    <header
      className={`flex w-full items-center justify-between gap-2 text-white ${className}`}
      aria-label={`${label} 헤더`}
      data-node-id="4595:326"
    >
      <div className="flex items-center gap-3">
        <img 
          src={gameworksLogo.src} 
          alt="GAMEWORKS" 
          className="h-4 w-auto object-contain brightness-0 invert"
        />
        <img 
          src={spartanLogo.src} 
          alt="SPARTAN" 
          className="h-9 w-auto object-contain"
        />
      </div>
      
      <div className="flex items-center gap-2">
        {/* 우측 상단 아이콘 공간 (알림, 설정 등 추후 추가 가능) */}
      </div>
    </header>
  );
}

