'use client';

type ChatMessageCardProps = {
  sender: string;
  time: string;
  content: string;
  className?: string;
};

export default function ChatMessageCard({ sender, time, content, className = '' }: ChatMessageCardProps) {
  return (
    <article
      className={`rounded-[19px] bg-[#151820] px-6 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.4)] ${className}`}
      aria-label={`${sender}의 메시지`}
    >
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-[16px] font-medium text-[#efff8f]">{sender}</span>
        <time className="text-xs text-[#828282]">{time}</time>
      </div>
      <p className="mt-3 text-base font-semibold leading-relaxed text-white whitespace-pre-line">{content}</p>
    </article>
  );
}

