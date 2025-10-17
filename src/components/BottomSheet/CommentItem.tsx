import { Comment } from '@/types/bottomSheet';

interface CommentItemProps {
  comment: Comment;
  size?: 'small' | 'large';
}

export default function CommentItem({
  comment,
  size = 'large',
}: CommentItemProps) {
  const isSmall = size === 'small';

  return (
    <div className="flex h-10 w-full flex-col justify-center rounded-md bg-black px-3.5 py-0.5">
      <p
        className={`mb-0.5 font-pretendard font-regular text-accent-yellow ${
          isSmall ? 'text-[0.625rem]' : 'text-xs'
        }`}
      >
        {comment.nickname} ({comment.studentId})
      </p>
      <p
        className={`font-pretendard font-medium text-white ${
          isSmall ? 'text-xs' : 'text-sm'
        }`}
      >
        {comment.content}
      </p>
    </div>
  );
}
