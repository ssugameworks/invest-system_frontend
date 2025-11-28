'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import ChatMessageCard from './ChatMessageCard';
import ChatInputBar from './ChatInputBar';
import axiosInstance from '@/lib/axios';

interface Comment {
  id: number;
  author_id: number;
  author_name: string;
  author_department: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface CommentsResponse {
  comments: Comment[];
  hasMore: boolean;
  nextCursor: number | null;
  totalCount: number;
}

export default function ChatContainer() {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  const handleBack = () => {
    router.back();
  };

  // 초기 데이터 로드 및 5초마다 최신 댓글 가져오기
  const loadLatestComments = useCallback(async () => {
    try {
      const response = await axiosInstance.get<CommentsResponse>('/api/comments', {
        params: { limit: 10 },
      });

      // 기존 댓글과 병합 (중복 제거)
      setComments((prev) => {
        const newComments = response.data.comments.filter(
          (newComment) => !prev.some((existing) => existing.id === newComment.id)
        );
        return [...newComments, ...prev];
      });

      setHasMore(response.data.hasMore);
      if (comments.length === 0) {
        setNextCursor(response.data.nextCursor);
      }
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    }
  }, [comments.length]);

  // 더 많은 댓글 로드 (무한 스크롤)
  const loadMoreComments = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMore || !nextCursor) return;

    isLoadingMoreRef.current = true;
    setIsLoading(true);

    try {
      const response = await axiosInstance.get<CommentsResponse>('/api/comments', {
        params: {
          limit: 10,
          cursor: nextCursor,
        },
      });

      setComments((prev) => [...prev, ...response.data.comments]);
      setHasMore(response.data.hasMore);
      setNextCursor(response.data.nextCursor);
    } catch (error) {
      console.error('추가 댓글 로딩 실패:', error);
    } finally {
      setIsLoading(false);
      isLoadingMoreRef.current = false;
    }
  }, [hasMore, nextCursor]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // 80% 스크롤 시 다음 데이터 로드
    if (scrollPercentage > 0.8 && hasMore && !isLoadingMoreRef.current) {
      loadMoreComments();
    }
  }, [hasMore, loadMoreComments]);

  // 초기 로드
  useEffect(() => {
    loadLatestComments();
  }, []);

  // 5초마다 최신 댓글 가져오기
  useEffect(() => {
    const interval = setInterval(() => {
      loadLatestComments();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadLatestComments]);

  // 댓글 작성
  const handleSubmit = async (message: string) => {
    if (!message.trim()) return;

    try {
      // 토큰으로 인증되므로 author_id는 백엔드에서 자동으로 추출
      await axiosInstance.post('/api/comments', {
        body: message.trim(),
      });

      // 댓글 작성 후 즉시 새로고침
      await loadLatestComments();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(date);
  };

  return (
    <div className="flex min-h-screen w-full justify-center bg-[#050d18] px-3 py-6 text-white">
      <div className="relative flex w-full max-w-[420px] flex-col rounded-[28px] pb-6">
        <Header label="채팅" onBack={handleBack} />

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="mt-10 flex flex-1 flex-col gap-4 pb-32 overflow-y-auto"
        >
          {comments.map((comment) => (
            <ChatMessageCard
              key={comment.id}
              sender={`${comment.author_name} · ${comment.author_department}`}
              time={formatTime(comment.created_at)}
              content={comment.body}
            />
          ))}
          {isLoading && (
            <div className="text-center py-4">
              <p className="text-text-secondary text-sm">로딩 중...</p>
            </div>
          )}
          {!hasMore && comments.length > 0 && (
            <div className="text-center py-4">
              <p className="text-text-secondary text-sm">모든 메시지를 불러왔습니다</p>
            </div>
          )}
        </div>

        <div className="sticky w-full bottom-6 z-10 mt-auto flex justify-center bg-[#050d18] pb-2 pt-4">
          <ChatInputBar onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

