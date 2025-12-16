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

export const fetchRecentComments = async (
  limit: number = 10,
  cursor?: number,
): Promise<RecentCommentsResult> => {
  const params: Record<string, number> = { limit };
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

export const createComment = async (body: string): Promise<BackendComment> => {
  const response = await axiosInstance.post<BackendComment>('/api/comments', {
    body,
  });

  return response.data;
};

