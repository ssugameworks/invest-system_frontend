'use client';

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'disabled' | 'sell' | 'buy';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-pretendard font-semibold transition-all duration-200 active:scale-95 active:shadow-none';

  const variantStyles = {
    primary: 'bg-accent-yellow text-background-card shadow-[0px_0px_15px_0px_#efff8f] hover:opacity-90 hover:shadow-[0px_0px_20px_0px_#efff8f]',
    secondary: 'bg-accent-green text-[#282828] hover:opacity-90 shadow-md active:shadow-sm',
    disabled: 'cursor-not-allowed bg-[#c4c4c4] text-white active:scale-100',
    sell: 'bg-[#d34250] text-white shadow-[0_8px_18px_rgba(211,66,80,0.35)] hover:brightness-110 hover:shadow-[0_10px_20px_rgba(211,66,80,0.45)]',
    buy: 'bg-[#5f79fb] text-white shadow-[0_8px_18px_rgba(95,121,251,0.35)] hover:brightness-110 hover:shadow-[0_10px_20px_rgba(95,121,251,0.45)]',
  };

  const sizeStyles = {
    sm: 'h-10 text-sm px-4',
    md: 'h-12 text-base px-6',
    lg: 'h-14 text-lg px-8',
  };

  const currentVariant = disabled ? 'disabled' : variant;

  return (
    <button
      disabled={disabled}
      aria-disabled={disabled}
      className={`${baseStyles} ${variantStyles[currentVariant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
