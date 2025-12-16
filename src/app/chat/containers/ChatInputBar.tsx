'use client';

import { FormEvent, KeyboardEvent, useMemo, useState } from 'react';

type ChatInputBarProps = {
  placeholder?: string;
  onSubmit?: (message: string) => void;
  className?: string;
};

export default function ChatInputBar({
  placeholder = '텍스트를 입력해주세요',
  onSubmit,
  className = '',
}: ChatInputBarProps) {
  const [value, setValue] = useState('');
  const isReadyToSend = useMemo(() => value.trim().length > 0, [value]);

  const sendMessage = () => {
    if (!isReadyToSend) {
      return;
    }
    onSubmit?.(value.trim());
    setValue('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <form className={`flex w-full justify-center ${className}`} onSubmit={handleSubmit}>
      <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#151A29] px-5 py-3.5 text-text-secondary backdrop-blur-sm focus-within:border-accent-yellow/40 focus-within:shadow-[0_0_15px_rgba(239,255,143,0.15)] transition-all">
        <input
          type="text"
          name="chat-message"
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full bg-transparent text-[15px] text-white placeholder:text-text-tertiary focus:outline-none"
        />
        <SendIcon
          className={`size-9 rounded-full transition-all duration-200 ${
            isReadyToSend
              ? 'text-accent-yellow hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(239,255,143,0.6)]'
              : 'text-text-tertiary opacity-50'
          } flex items-center justify-center`}
          disabled={!isReadyToSend}
          onClick={sendMessage}
        />
      </label>
    </form>
  );
}

type SendIconProps = {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
};

function SendIcon({ className = 'size-6', disabled = false, onClick }: SendIconProps) {
  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={`${className} ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="메시지 전송"
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

