'use client';

import { useEffect, useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import GameworksLogo from '@/assets/icons/gameworks-logo.svg';
import gameworksLogo from '@/assets/icons/gameworks-logo.webp';

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
        className={`fixed top-0 left-0 right-0 z-50 flex items-center gap-1 px-4 py-3 text-white transition-all duration-300 ${
          isScrolled ? 'backdrop-blur-xl bg-white/10 shadow-lg' : ''
        } ${className}`}
        aria-label={`${displayTitle} 헤더`}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label={backAriaLabel}
          className="flex size-10 items-center justify-center rounded-full text-white transition hover:border-white/20 hover:bg-white/10"
        >
          <ChevronLeftIcon aria-hidden="true" className="size-7" strokeWidth={1.8} />
        </button>
        <h1 className="text-xl font-semibold tracking-tight">{displayTitle}</h1>
      </header>
    );
  }

  return (
    <header
      className={`flex w-full items-center justify-center gap-1  text-white ${className}`}
      aria-label={`${label} 헤더`}
      data-node-id="4595:326"
    >
        <img src={gameworksLogo.src} alt="Gameworks Logo" className="w-[1.375rem]"></img>
      
    </header>
  );
}

