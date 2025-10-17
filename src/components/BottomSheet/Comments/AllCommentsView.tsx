'use client';

import { useState } from 'react';
import { Comment } from '@/types/bottomSheet';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';

interface AllCommentsViewProps {
  comments: Comment[];
  onBack: () => void;
  onSubmitComment?: (comment: string) => void;
}

export default function AllCommentsView({
  comments,
  onBack,
  onSubmitComment,
}: AllCommentsViewProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (newComment.trim() && onSubmitComment) {
      onSubmitComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Back Button */}
      <button onClick={onBack} className="absolute left-5 top-[3.4rem] z-10">
        <ChevronLeftIcon />
      </button>

      {/* Comments List with Scroll */}
      <div className="mt-24 mb-20 overflow-y-auto scrollbar-hide flex-1 px-5">
        <div className="flex flex-col gap-2">
          {comments.map((comment, index) => (
            <CommentItem key={index} comment={comment} />
          ))}
        </div>
      </div>

      {/* Comment Input */}
      <div className="absolute bottom-5 left-5 right-5">
        <CommentInput
          value={newComment}
          onChange={setNewComment}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
