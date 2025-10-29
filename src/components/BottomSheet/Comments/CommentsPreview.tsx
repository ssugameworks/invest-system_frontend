import { Comment } from '@/types/bottomSheet';
import CommentItem from './CommentItem';

interface CommentsPreviewProps {
  comments: Comment[];
  onShowAll: () => void;
  maxDisplay?: number;
}

export default function CommentsPreview({
  comments,
  onShowAll,
  maxDisplay = 3,
}: CommentsPreviewProps) {
  const displayedComments = comments.slice(0, maxDisplay);

  return (
    <div className="mb-8">
      <div className="mb-2 flex w-full items-center justify-between font-pretendard text-base text-text-secondary">
        <p className="font-light">실시간 댓글</p>
        {comments.length > maxDisplay && (
          <button
            onClick={onShowAll}
            className="font-medium hover:text-white transition-colors"
          >
            더보기 &gt;
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {displayedComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
