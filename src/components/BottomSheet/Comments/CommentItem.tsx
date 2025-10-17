import { Comment } from '@/types/bottomSheet';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex w-full flex-col justify-center gap-0 rounded-md bg-black px-3.5 py-1.5">
      <p className="font-pretendard text-xs font-regular text-accent-yellow">
        {comment.nickname} ({comment.studentId})
      </p>
      <p className="font-pretendard text-sm font-medium text-white">
        {comment.content}
      </p>
    </div>
  );
}
