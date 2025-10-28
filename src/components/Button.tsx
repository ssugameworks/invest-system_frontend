'use client';

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'disabled';
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
  const baseStyles = 'rounded-lg font-pretendard font-semibold transition-colors';

  const variantStyles = {
    primary: 'bg-accent-yellow text-background-card shadow-[0px_0px_15px_0px_#efff8f] hover:opacity-90',
    secondary: 'bg-accent-green text-[#282828] hover:opacity-90',
    disabled: 'cursor-not-allowed bg-[#c4c4c4] text-white',
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
      className={`${baseStyles} ${variantStyles[currentVariant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
