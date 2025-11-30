'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      placeholder,
      type = 'text',
      className = '',
      error,
      isValid,
      name,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

    const getBorderColor = () => {
      if (error) return 'bg-red-500';
      if (isValid) return 'bg-accent-yellow';
      return 'bg-text-secondary';
    };

    const errorId = name ? `${name}-error` : undefined;

    return (
      <div className={`group relative w-full ${error ? 'mb-5' : ''}`}>
        <input
          ref={ref}
          type={inputType}
          name={name}
          placeholder=" "
          className={`peer font-pretendard text-16 focus:text-20 w-full border-none bg-transparent pt-5 pb-1 ${isPasswordField ? 'pr-10' : ''} font-light text-white transition-all outline-none [-moz-appearance:textfield] placeholder:opacity-0 focus:font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className}`}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-accent-yellow transition-colors z-10"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}
        {label && (
          <label className="font-pretendard text-16 text-text-secondary peer-focus:text-14 peer-focus:text-accent-yellow peer-focus:font-jost peer-[:not(:placeholder-shown)]:text-14 peer-[:not(:placeholder-shown)]:text-accent-yellow peer-[:not(:placeholder-shown)]:font-jost pointer-events-none absolute top-5 left-0 font-light transition-all peer-focus:top-0 peer-[:not(:placeholder-shown)]:top-0">
            {label}
          </label>
        )}
        <div className={`h-px w-full transition-colors duration-200 ${getBorderColor()}`} />
        {error && (
          <p
            id={errorId}
            className="font-pretendard text-12 absolute top-full left-0 mt-1 text-red-500 animate-fade-in-up"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
