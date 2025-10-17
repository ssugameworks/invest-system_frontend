import { Comment } from '@/types/bottomSheet';
import CommentItem from './CommentItem';

interface CommentsPreviewProps {
  comments: Comment[];
  onShowAll: () => void;
}

export default function CommentsPreview({
  comments,
  onShowAll,
}: CommentsPreviewProps) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex w-full items-center justify-between font-pretendard text-sm text-text-secondary">
        <p className="font-light">실시간 댓글</p>
        <button onClick={onShowAll} className="font-medium hover:text-white">
          더보기 &gt;
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {comments.slice(0, 3).map((comment, index) => (
          <CommentItem key={index} comment={comment} size="large" />
        ))}
      </div>
    </div>
  );
}
