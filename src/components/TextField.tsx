'use client';

import { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function TextField({
  label,
  placeholder,
  type = 'text',
  className = '',
  ...props
}: TextFieldProps) {
  return (
    <div className="relative w-full group">
      <input
        type={type}
        placeholder=" "
        className={`peer w-full bg-transparent font-pretendard font-light text-16 text-white border-none outline-none pt-5 pb-1 transition-all placeholder:opacity-0 focus:text-20 focus:font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] ${className}`}
        {...props}
      />
      {label && (
        <label className="absolute left-0 top-5 font-pretendard font-light text-16 text-text-secondary pointer-events-none transition-all peer-focus:top-0 peer-focus:text-14 peer-focus:text-accent-yellow peer-focus:font-jost peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-14 peer-[:not(:placeholder-shown)]:text-accent-yellow peer-[:not(:placeholder-shown)]:font-jost">
          {label}
        </label>
      )}
      <div className="w-full h-px bg-text-secondary" />
    </div>
  );
}
