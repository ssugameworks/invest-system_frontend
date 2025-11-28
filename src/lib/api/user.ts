import axiosInstance from '../axios';
import type { UserResponse, LeaderboardItem, LeaderboardParams, PortfolioSummary } from './types';

/**
 * 내 정보 조회 API
 * GET /api/user
 * 인증 필요 (Bearer Token)
 */
export const getMyInfo = async (): Promise<UserResponse> => {
  const response = await axiosInstance.get<UserResponse>('/api/user');
  return response.data;
};

/**
 * 리더보드 조회 API
 * GET /api/leaderboard
 * @param params.page - 페이지 번호 (기본: 1)
 * @param params.pageSize - 페이지 크기 (기본: 20, 최대: 100)
 */
export const getLeaderboard = async (
  params: LeaderboardParams = {},
): Promise<LeaderboardItem[]> => {
  const response = await axiosInstance.get<LeaderboardItem[]>('/api/leaderboard', {
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    },
  });
  return response.data;
};

/**
 * 내 포트폴리오 조회 API
 * GET /api/user/portfolio
 * 인증 필요 (Bearer Token)
 */
export const getMyPortfolio = async (): Promise<PortfolioSummary> => {
  const response = await axiosInstance.get<PortfolioSummary>('/api/user/portfolio');
  return response.data;
};

