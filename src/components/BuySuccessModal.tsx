'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface BuySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  shares?: number;
  amount?: number;
}

export default function BuySuccessModal({ isOpen, onClose, shares, amount }: BuySuccessModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isAnimating ? 0.5 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black"
            onClick={handleClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: isAnimating ? 1 : 0, 
              scale: isAnimating ? 1 : 0.9,
              y: isAnimating ? 0 : 20
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="매수 성공"
            className="fixed left-1/2 top-1/2 z-50 w-[21.25rem] -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] border border-border-card bg-background-card p-6 shadow-lg"
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-accent-yellow">
                  매수 완료!
                </h2>
                <div className="flex flex-col gap-2">
                  {shares && (
                    <p className="text-white text-base">
                      {shares}주 매수 완료
                    </p>
                  )}
                  {amount && (
                    <p className="text-text-secondary text-sm">
                      투자 금액: {amount.toLocaleString()}원
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                onClick={handleClose}
                variant="primary"
                className="w-full h-[3.125rem] rounded-[0.625rem] text-16"
                aria-label="확인"
              >
                확인
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

