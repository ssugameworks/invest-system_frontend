'use client';

import { useState } from 'react';

interface Comment {
  nickname: string;
  studentId: string;
  content: string;
}

interface CommentsSectionProps {
  comments: Comment[];
  showAll?: boolean;
  onToggleShowAll?: (show: boolean) => void;
}

export default function CommentsSection({
  comments,
  showAll = false,
  onToggleShowAll,
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');

  const displayedComments = showAll ? comments : comments.slice(0, 3);

  if (showAll) {
    return (
      <div className="absolute inset-0 flex flex-col">
        {/* Back Button */}
        <button
          onClick={() => onToggleShowAll?.(false)}
          className="absolute left-5 top-[54px] z-10"
        >
          <svg
            width="12"
            height="23"
            viewBox="0 0 12 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 1.5L1 11.5L11 21.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* All Comments List with Scroll */}
        <div className="mt-24 mb-20 overflow-y-auto scrollbar-hide flex-1 px-5">
          <div className="flex flex-col gap-2">
            {comments.map((comment, index) => (
              <CommentItem key={index} comment={comment} />
            ))}
          </div>
        </div>

        {/* Comment Input */}
        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-border-card bg-background px-5 py-2.5">
            <div className="flex w-full items-center justify-between">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="텍스트를 입력해주세요"
                className="w-full bg-transparent font-pretendard text-sm font-light text-white placeholder:text-[rgba(136,136,136,0.53)] focus:outline-none"
              />
              <button className="shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-2 flex w-full items-center justify-between font-pretendard text-base text-text-secondary">
        <p className="font-light">실시간 댓글</p>
        <button
          onClick={() => onToggleShowAll?.(true)}
          className="font-medium hover:text-white"
        >
          더보기 &gt;
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {displayedComments.map((comment, index) => (
          <CommentItem key={index} comment={comment} />
        ))}
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
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
