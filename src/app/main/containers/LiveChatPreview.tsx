'use client';

import { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRecentComments } from '@/hooks/useQueries';
import type { RecentCommentsResult } from '@/lib/api/chat';

type LiveChatPreviewProps = {
  className?: string;
};

const REFRESH_INTERVAL = 45_000; // 45초 간격
const ROTATE_INTERVAL = 5_000;

function formatAuthor(comment?: { nickname: string; department: string }): string {
  if (!comment) return '익명의 투자자';
  return `${comment.nickname} · ${comment.department}`;
}

function formatCommentTime(value?: string | Date): string {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

function LiveChatPreview({ className = '' }: LiveChatPreviewProps) {
  // ⭐ 최적화: React Query 사용 (자동 캐싱 및 폴링)
  const { data: commentsResult, isLoading } = useRecentComments(REFRESH_INTERVAL);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // ⭐ 최적화: commentsState를 useMemo로 최적화하여 불필요한 재계산 방지
  const commentsState: RecentCommentsResult = useMemo(() => {
    return commentsResult || {
      comments: [],
      totalCount: 0,
    };
  }, [commentsResult]);

  useEffect(() => {
    if (commentsState.comments.length <= 1) {
      setCurrentIndex(0);
      return;
    }

    const rotateIntervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % commentsState.comments.length);
    }, ROTATE_INTERVAL);

    return () => clearInterval(rotateIntervalId);
  }, [commentsState.comments.length]);

  const handleNavigate = useCallback(() => {
    router.push('/chat');
  }, [router]);

  // ⭐ 최적화: 댓글 로테이션 (메모이제이션)
  const highlightComment = commentsState.comments[currentIndex];
  const totalCount = commentsState.totalCount ?? commentsState.comments.length;
  const message =
    highlightComment?.content ??
    (isLoading ? '실시간 의견을 불러오는 중입니다.' : '등록된 의견이 없습니다.');
  const timestamp = formatCommentTime(highlightComment?.createdAt);

  return (
    <section
      className={`flex w-full flex-col gap-2 rounded-2xl border border-border-card/50 bg-background-card/40 px-4 py-3 mb-2 ${className}`}
      aria-label="실시간 채팅"
      aria-live="polite"
      data-node-id="4377:2096"
    >
      <p className="font-pretendard text-base font-medium text-text-secondary">실시간 채팅</p>
      <div
        className="flex flex-col gap-2 rounded-xl px-2 py-2"
        data-node-id="4377:2101"
      >
        <div className="flex items-start justify-between">
          <p className="font-pretendard text-sm font-medium text-accent-yellow">
            {formatAuthor(highlightComment)}
          </p>
          <span className="font-pretendard text-xs font-light text-text-secondary">
            {timestamp || '--:--'}
          </span>
        </div>
        <p className="font-pretendard text-base font-medium text-white">{message}</p>
      </div>
      <button
        type="button"
        data-node-id="4377:2106"
        className="w-full text-center font-pretendard text-sm font-light text-text-secondary transition-colors hover:text-white"
        onClick={handleNavigate}
        aria-label={`${totalCount}개의 의견 페이지로 이동`}
      >
        {`${Math.max(totalCount, commentsState.comments.length)}개의 의견 보기 >`}
      </button>
    </section>
  );
}

export default memo(LiveChatPreview);
