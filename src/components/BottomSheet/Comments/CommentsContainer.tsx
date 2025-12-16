'use client';

import { useEffect, useState } from 'react';
import CommentsSection from './CommentsSection';
import { getTeamComments, createTeamComment, getMyInfo } from '@/lib/api';
import type { Comment } from '@/types/bottomSheet';

interface CommentsContainerProps {
  teamId: number;
  showAll?: boolean;
  onToggleShowAll?: (show: boolean) => void;
}

export default function CommentsContainer({
  teamId,
  showAll = false,
  onToggleShowAll,
}: CommentsContainerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userInfo = await getMyInfo();
        setUserId(userInfo.id);
      } catch {
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoading(true);
        const response = await getTeamComments({
          teamId,
          mode: showAll ? 'default' : 'preview',
          limit: showAll ? 50 : 3,
        });

        const transformedComments: Comment[] = response.items.map((item) => ({
          id: item.id,
          nickname: `사용자${item.author_id}`,
          studentId: item.author_id,
          content: item.body,
          createdAt: item.created_at,
        }));

        setComments(transformedComments);
      } catch {
        setComments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [teamId, showAll]);

  const handleSubmitComment = async (commentText: string) => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await createTeamComment(teamId, {
        author_id: userId,
        body: commentText,
      });

      const response = await getTeamComments({
        teamId,
        mode: showAll ? 'default' : 'preview',
        limit: showAll ? 50 : 3,
      });

      const transformedComments: Comment[] = response.items.map((item) => ({
        id: item.id,
        nickname: `사용자${item.author_id}`,
        studentId: item.author_id,
        content: item.body,
        createdAt: item.created_at,
      }));

      setComments(transformedComments);
    } catch (error) {
      alert(error instanceof Error ? error.message : '댓글 작성 실패');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-text-secondary">댓글을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <CommentsSection
      comments={comments}
      showAll={showAll}
      onToggleShowAll={onToggleShowAll}
      onSubmitComment={handleSubmitComment}
    />
  );
}

