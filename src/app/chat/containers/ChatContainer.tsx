'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ChatMessageCard from './ChatMessageCard';
import ChatInputBar from './ChatInputBar';
import axiosInstance from '@/lib/axios';
import { ChatMessageSkeleton } from '@/components/Skeleton';

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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  const loadLatestComments = useCallback(async () => {
    try {
      const response = await axiosInstance.get<CommentsResponse>('/api/comments', {
        params: { limit: 10 },
      });

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
    } catch {
    } finally {
      setIsInitialLoading(false);
    }
  }, [comments.length]);

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
    } catch {
    } finally {
      setIsLoading(false);
      isLoadingMoreRef.current = false;
    }
  }, [hasMore, nextCursor]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8 && hasMore && !isLoadingMoreRef.current) {
      loadMoreComments();
    }
  }, [hasMore, loadMoreComments]);

  useEffect(() => {
    loadLatestComments();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadLatestComments();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadLatestComments]);

  const handleSubmit = async (message: string) => {
    if (!message.trim()) return;

    try {
      await axiosInstance.post('/api/comments', {
        body: message.trim(),
      });

      await loadLatestComments();
    } catch {
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
    <div className="min-h-screen w-full bg-background-card text-white">
      {/* Header with Back Button */}
      <Header 
        title="실시간 채팅" 
        onBack={() => router.back()}
        backAriaLabel="이전 페이지로 이동"
      />
      
      <div className="relative flex w-full max-w-[420px] mx-auto px-4 flex-col pt-20 pb-24">
        {/* Header Description */}
        <div className="mb-6">
          <p className="text-sm text-text-secondary">투자자들과 자유롭게 대화하세요</p>
        </div>

        {/* Chat Messages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex flex-1 flex-col gap-3 pb-6 overflow-y-auto"
        >
          {isInitialLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <ChatMessageSkeleton key={i} style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          ) : comments.length === 0 && !isLoading ? (
            <div className="py-20 text-center">
              <p className="text-text-secondary text-sm">아직 메시지가 없습니다</p>
              <p className="text-text-tertiary text-xs mt-2">첫 메시지를 보내보세요!</p>
            </div>
          ) : (
            <>
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
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow animate-pulse" />
                    <p className="text-text-secondary text-xs">로딩 중...</p>
                  </div>
                </div>
              )}
              
              {!hasMore && comments.length > 0 && (
                <div className="text-center py-4">
                  <p className="text-text-tertiary text-xs">모든 메시지를 불러왔습니다</p>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Input Bar - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-4 bg-gradient-to-t from-background-card via-background-card to-transparent z-20">
        <div className="max-w-[420px] mx-auto">
          <ChatInputBar onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

