interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
}: SkeletonProps) {
  const baseClasses = 'bg-white/5 relative overflow-hidden isolate';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-2xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.07] before:to-transparent',
    none: '',
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// 카드 스켈레톤
export function CardSkeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-[24px] border border-white/10 bg-[#151A29] p-6 animate-fade-in ${className}`} style={style}>
      <div className="flex flex-col gap-4">
        <Skeleton variant="rounded" height={120} animation="wave" />
        <div className="space-y-2">
          <Skeleton variant="text" height={20} width="60%" animation="wave" />
          <Skeleton variant="text" height={16} width="40%" animation="wave" />
        </div>
      </div>
    </div>
  );
}

// 채팅 메시지 스켈레톤 - 실제 ChatMessageCard와 동일한 크기
export function ChatMessageSkeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <article className={`rounded-[20px] bg-[#151A29] border border-white/5 px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.25)] animate-fade-in ${className}`} style={style}>
      <div className="flex items-baseline justify-between gap-3 mb-2.5">
        <Skeleton variant="text" height={14} width="40%" animation="wave" />
        <Skeleton variant="text" height={12} width="15%" animation="wave" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" height={15} width="85%" animation="wave" />
        <Skeleton variant="text" height={15} width="65%" animation="wave" />
      </div>
    </article>
  );
}

// 리스트 아이템 스켈레톤
export function ListItemSkeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-white/10 bg-background-card/40 p-4 animate-fade-in ${className}`} style={style}>
      <Skeleton variant="circular" width={48} height={48} animation="wave" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" height={18} width="70%" animation="wave" />
        <Skeleton variant="text" height={14} width="40%" animation="wave" />
      </div>
      <Skeleton variant="text" height={24} width={60} animation="wave" />
    </div>
  );
}

// 캐피탈 섹션 스켈레톤 - 실제 Capital 컴포넌트와 동일한 크기
export function CapitalSkeleton({ className = '' }: { className?: string }) {
  return (
    <section className={`flex w-full flex-col gap-8 pt-2 animate-fade-in ${className}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" height={14} width={80} animation="wave" />
          <Skeleton variant="rounded" height={28} width={110} animation="wave" />
        </div>
        
        <div className="flex flex-col gap-3">
          <Skeleton variant="text" height={48} width="60%" animation="wave" />
        </div>
      </div>

      <div className="flex w-full gap-3">
        <Skeleton variant="rounded" height={56} className="flex-1" animation="wave" />
        <Skeleton variant="rounded" height={56} className="flex-1" animation="wave" />
      </div>
    </section>
  );
}

// 차트 스켈레톤
export function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-[24px] border border-white/10 bg-[#151A29] p-5 animate-fade-in ${className}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" height={24} width="45%" animation="wave" />
          <Skeleton variant="text" height={16} width="20%" animation="wave" />
        </div>
        <Skeleton variant="rounded" height={200} animation="wave" />
        <div className="flex justify-between">
          <Skeleton variant="text" height={12} width="15%" animation="wave" />
          <Skeleton variant="text" height={12} width="15%" animation="wave" />
          <Skeleton variant="text" height={12} width="15%" animation="wave" />
        </div>
      </div>
    </div>
  );
}

// 캐러셀 카드 버튼 스켈레톤 - 실제 CarouselCardButton과 동일한 크기
export function CarouselCardButtonSkeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`flex w-full items-center gap-4 py-4 px-2 rounded-xl animate-fade-in ${className}`} style={style}>
      {/* Icon */}
      <div className="flex-shrink-0">
        <Skeleton variant="circular" width={48} height={48} animation="wave" />
      </div>
      
      {/* Name & Code */}
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <Skeleton variant="text" height={16} width="65%" animation="wave" />
        <Skeleton variant="text" height={14} width="35%" animation="wave" />
      </div>

      {/* Mini Chart */}
      <div className="hidden xs:block w-16 h-8 flex-shrink-0">
        <Skeleton variant="rectangular" width={64} height={32} animation="wave" />
      </div>

      {/* Price & Change */}
      <div className="text-right flex-shrink-0 min-w-[80px]">
        <Skeleton variant="text" height={16} width={70} animation="wave" />
        <Skeleton variant="text" height={14} width={50} animation="wave" />
      </div>
    </div>
  );
}
