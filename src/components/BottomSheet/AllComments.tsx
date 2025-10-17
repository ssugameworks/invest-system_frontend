'use client';

import { useState } from 'react';
import { Comment } from '@/types/bottomSheet';
import CommentItem from './CommentItem';
import BackButton from './BackButton';
import CommentInput from './CommentInput';

interface AllCommentsProps {
  comments: Comment[];
  onBack: () => void;
}

export default function AllComments({ comments, onBack }: AllCommentsProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = () => {
    // TODO: 댓글 제출 로직 구현
    console.log('Submit comment:', newComment);
    setNewComment('');
  };

  return (
    <>
      <BackButton onClick={onBack} />

      <div className="mb-[5.8rem] mt-[6.2rem]">
        <div className="flex flex-col gap-2">
          {comments.map((comment, index) => (
            <CommentItem key={index} comment={comment} size="small" />
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5">
        <CommentInput
          value={newComment}
          onChange={setNewComment}
          onSubmit={handleSubmitComment}
        />
      </div>
    </>
  );
}
