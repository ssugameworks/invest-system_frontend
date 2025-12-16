'use client';

import { ReactNode, useEffect } from 'react';

interface BottomSheetBaseProps {
  isOpen: boolean;
  isAnimating: boolean;
  onClose: () => void;
  children: ReactNode;
  height?: string;
  ariaLabel?: string;
}

export default function BottomSheetBase({
  isOpen,
  isAnimating,
  onClose,
  children,
  height = 'h-[43.75rem]',
  ariaLabel = '바텀시트',
}: BottomSheetBaseProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isAnimating) {
        onClose();
      }
    };

    if (isAnimating) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isAnimating, onClose]);

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`fixed bottom-0 left-1/2 z-50 ${height} w-full max-w-[24.5rem] -translate-x-1/2 rounded-tl-[2.5rem] rounded-tr-[2.5rem] border border-border-card bg-background-bottom-sheet transition-transform duration-300 ease-in-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle Bar */}
        <div
          className="absolute left-1/2 top-2 h-1 w-20 -translate-x-1/2 rounded-full bg-white"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative h-full overflow-y-hidden px-5 pb-5">
          {children}
        </div>
      </div>
    </>
  );
}
