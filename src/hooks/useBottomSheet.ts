import { useState, useEffect } from 'react';

export function useBottomSheet(isOpen: boolean) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const close = (onClose: () => void) => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return {
    isAnimating,
    close,
  };
}
