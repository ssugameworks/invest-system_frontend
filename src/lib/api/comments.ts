import axiosInstance from '../axios';
import type {
  TeamCommentsResponse,
  GetTeamCommentsParams,
  CreateCommentRequest,
  CommentEntity,
} from './types';

/**
 * 팀 댓글 조회 API
 * GET /teams/:teamId/comments
 * 
 * @param params.teamId - 팀 ID
 * @param params.limit - 조회할 댓글 수 (기본: 7, 프리뷰: 3, 최대: 50)
 * @param params.cursor - 페이지네이션 커서 (ISO 8601 날짜 문자열)
 * @param params.mode - 'preview' (3개) 또는 'default' (7개)
 */
export const getTeamComments = async (
  params: GetTeamCommentsParams,
): Promise<TeamCommentsResponse> => {
  const { teamId, ...queryParams } = params;

  const response = await axiosInstance.get<TeamCommentsResponse>(
    `/teams/${teamId}/comments`,
    {
      params: queryParams,
    },
  );

  return response.data;
};

/**
 * 팀 댓글 작성 API
 * POST /teams/:teamId/comments
 * 인증 필요 (Bearer Token)
 * 
 * @param teamId - 팀 ID
 * @param data.author_id - 작성자 ID
 * @param data.body - 댓글 내용
 */
export const createTeamComment = async (
  teamId: number,
  data: CreateCommentRequest,
): Promise<CommentEntity> => {
  const response = await axiosInstance.post<CommentEntity>(
    `/teams/${teamId}/comments`,
    data,
  );

  return response.data;
};

