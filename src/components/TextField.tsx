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
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="font-jost font-light text-14 text-background-card">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`bg-transparent font-pretendard font-light text-16 text-text-secondary placeholder:text-text-secondary border-none outline-none pb-1 ${className}`}
        {...props}
      />
      <div className="w-full h-px bg-text-secondary" />
    </div>
  );
}
