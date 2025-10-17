'use client';

import { Comment } from '@/types/bottomSheet';
import CommentsPreview from './CommentsPreview';
import AllCommentsView from './AllCommentsView';

interface CommentsSectionProps {
  comments: Comment[];
  showAll?: boolean;
  onToggleShowAll?: (show: boolean) => void;
  onSubmitComment?: (comment: string) => void;
}

export default function CommentsSection({
  comments,
  showAll = false,
  onToggleShowAll,
  onSubmitComment,
}: CommentsSectionProps) {
  if (showAll) {
    return (
      <AllCommentsView
        comments={comments}
        onBack={() => onToggleShowAll?.(false)}
        onSubmitComment={onSubmitComment}
      />
    );
  }

  return (
    <CommentsPreview
      comments={comments}
      onShowAll={() => onToggleShowAll?.(true)}
    />
  );
}
