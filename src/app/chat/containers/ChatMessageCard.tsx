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
      className={`rounded-[20px] bg-[#151A29] border border-white/5 px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-white/10 transition-all ${className}`}
      aria-label={`${sender}의 메시지`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-accent-yellow truncate">{sender}</span>
        <time className="text-xs text-text-tertiary whitespace-nowrap">{time}</time>
      </div>
      <p className="mt-2.5 text-[15px] font-normal leading-relaxed text-white/90 whitespace-pre-line">{content}</p>
    </article>
  );
}

