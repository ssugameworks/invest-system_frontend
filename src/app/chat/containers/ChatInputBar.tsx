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
      <label className="flex w-full max-w-[353px] items-center gap-3 rounded-[10px] border border-[#434343] bg-[#050d18] px-5 py-2 text-[#888888] focus-within:border-[#efff8f] focus-within:text-white">
        <input
          type="text"
          name="chat-message"
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full bg-transparent text-base text-white placeholder:text-[#88888888] focus:outline-none"
        />
        <SendIcon
          className={`size-10 rounded-full transition-colors duration-150 focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-[#efff8f] ${
            isReadyToSend
              ? ' text-[#efff8f] hover:bg-[#efff8f]/90'
              : ' text-white'
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

