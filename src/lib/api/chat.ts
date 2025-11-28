/**
 * 실시간 채팅/댓글 관련 API
 */

import axiosInstance from '../axios';

export interface RecentComment {
  id: number;
  nickname: string;
  studentId: number;
  department: string;
  content: string;
  createdAt?: string | Date;
}

export interface RecentCommentsResult {
  comments: RecentComment[];
  totalCount: number;
  hasMore?: boolean;
  nextCursor?: number | null;
}

interface BackendComment {
  id: number;
  author_id: number;
  author_name: string;
  author_department: string;
  body: string;
  created_at: string;
  updated_at: string;
}

/**
 * 전체 댓글 조회 (커서 페이지네이션)
 * GET /api/comments?limit=10&cursor=123
 */
export const fetchRecentComments = async (
  limit: number = 10,
  cursor?: number,
): Promise<RecentCommentsResult> => {
  const params: any = { limit };
  if (cursor) {
    params.cursor = cursor;
  }

  const response = await axiosInstance.get<{
    comments: BackendComment[];
    totalCount: number;
    hasMore: boolean;
    nextCursor: number | null;
  }>('/api/comments', {
    params,
  });

  // 백엔드 데이터를 프론트엔드 형식으로 변환
  const comments: RecentComment[] = response.data.comments.map((comment) => ({
    id: comment.id,
    nickname: comment.author_name,
    studentId: comment.author_id,
    department: comment.author_department,
    content: comment.body,
    createdAt: comment.created_at,
  }));

  return {
    comments,
    totalCount: response.data.totalCount,
    hasMore: response.data.hasMore,
    nextCursor: response.data.nextCursor,
  };
};

/**
 * 댓글 작성
 * POST /api/comments
 * 인증 필요 (Bearer Token) - author_id는 토큰에서 자동 추출
 */
export const createComment = async (body: string): Promise<BackendComment> => {
  const response = await axiosInstance.post<BackendComment>('/api/comments', {
    body,
  });

  return response.data;
};

