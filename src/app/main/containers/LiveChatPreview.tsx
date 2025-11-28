'use client';

import { useEffect, useState } from 'react';
import {
  FALLBACK_RECENT_COMMENTS_RESULT,
  fetchRecentComments,
  type RecentCommentsResult,
} from '@/api/api';
import type { Comment } from '@/types/bottomSheet';
import { useRouter } from 'next/navigation';

type LiveChatPreviewProps = {
  className?: string;
};

const REFRESH_INTERVAL = 30_000;

export default function LiveChatPreview({ className = '' }: LiveChatPreviewProps) {
  const [commentsState, setCommentsState] = useState<RecentCommentsResult>(
    FALLBACK_RECENT_COMMENTS_RESULT,
  );
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const refreshComments = async () => {
      try {
        const next = await fetchRecentComments();
        if (isMounted) {
          setCommentsState(next);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[LiveChatPreview] 댓글 로딩 실패', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    refreshComments();
    const intervalId = setInterval(refreshComments, REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const highlightComment = commentsState.comments[0];
  const totalCount = commentsState.totalCount ?? commentsState.comments.length;
  const message =
    highlightComment?.content ??
    (isLoading ? '실시간 의견을 불러오는 중입니다.' : '등록된 의견이 없습니다.');
  const timestamp = formatCommentTime(highlightComment?.createdAt);

  return (
    <section
      className={`flex w-full flex-col gap-2 rounded-2xl border border-border-card/50 bg-background-card/40 px-4 py-3 ${className}`}
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
        onClick={() => router.push('/chat')}
        aria-label={`${totalCount}개의 의견 페이지로 이동`}
      >
        {`${Math.max(totalCount, commentsState.comments.length)}개의 의견 보기 >`}
      </button>
    </section>
  );
}

function formatAuthor(comment?: Comment): string {
  if (!comment) {
    return '익명의 투자자';
  }

  const maskedId = maskStudentId(comment.studentId);
  return `${comment.nickname} (${maskedId})`;
}

function maskStudentId(studentId: number): string {
  const digits = Math.abs(Math.trunc(studentId)).toString();
  if (digits.length <= 2) {
    return 'XX';
  }

  return `${digits.slice(0, -2)}XX`;
}

function formatCommentTime(value?: string | Date): string {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

