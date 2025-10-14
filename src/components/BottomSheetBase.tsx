'use client';

import { ReactNode } from 'react';

interface BottomSheetBaseProps {
  isOpen: boolean;
  isAnimating: boolean;
  onClose: () => void;
  children: ReactNode;
  height?: string;
}

export default function BottomSheetBase({
  isOpen,
  isAnimating,
  onClose,
  children,
  height = 'h-[700px]',
}: BottomSheetBaseProps) {
  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-1/2 z-50 ${height} w-full max-w-[393px] -translate-x-1/2 rounded-tl-[40px] rounded-tr-[40px] border border-border-card bg-background-bottom-sheet transition-transform duration-300 ease-in-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle Bar */}
        <div className="absolute left-1/2 top-[9px] h-1 w-20 -translate-x-1/2 rounded-[100px] bg-white" />

        {/* Content */}
        <div className="relative h-full overflow-y-hidden px-5 pb-5">
          {children}
        </div>
      </div>
    </>
  );
}
